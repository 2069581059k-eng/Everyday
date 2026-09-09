import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import AdmZip from 'adm-zip'

const root = path.resolve(import.meta.dirname, '..')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src', 'manifest.json'), 'utf8'))
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))
const version = manifest.versionName
if (packageJson.version !== version) {
  throw new Error(`版本号不一致：package.json=${packageJson.version}，manifest.json=${version}`)
}
const source = path.join(root, 'dist', `com.dailyquote.band10pro.debug.${version}.rpk`)
const releaseDir = path.join(root, 'release')
const base = `DailyQuote_Band10Pro_v${version}`

if (!fs.existsSync(source)) throw new Error(`未找到构建包：${source}`)
fs.mkdirSync(releaseDir, { recursive: true })

const artifacts = []
for (const extension of ['rpk', 'bin']) {
  const target = path.join(releaseDir, `${base}.${extension}`)
  fs.copyFileSync(source, target)
  artifacts.push(target)
}

fs.copyFileSync(
  path.join(root, 'THIRD_PARTY_NOTICES.md'),
  path.join(releaseDir, `${base}.THIRD_PARTY_NOTICES.md`)
)
fs.copyFileSync(
  path.join(root, 'data', 'hitokoto-source', 'LICENSE'),
  path.join(releaseDir, `${base}.AGPL-3.0.txt`)
)
fs.copyFileSync(
  path.join(root, 'data', 'licenses', 'CMRC2018-CC-BY-SA-4.0.txt'),
  path.join(releaseDir, `${base}.CC-BY-SA-4.0.txt`)
)
fs.copyFileSync(
  path.join(root, 'data', 'licenses', 'Apache-2.0.txt'),
  path.join(releaseDir, `${base}.Apache-2.0.txt`)
)

const sourceArchive = path.join(releaseDir, `${base}_Source_AGPL.zip`)
const zip = new AdmZip()
for (const folder of ['src', 'tools', 'data']) {
  zip.addLocalFolder(path.join(root, folder), folder, (filename) => !/(^|[\\/])(merge-inputs|knowledge-merge-report\.json|riddles\.json|merge-knowledge\.mjs|import-knowledge\.mjs)([\\/]|$)/u.test(filename))
}
for (const filename of ['package.json', 'README.md', 'THIRD_PARTY_NOTICES.md']) {
  zip.addLocalFile(path.join(root, filename))
}
zip.addLocalFile(
  path.join(root, 'data', 'hitokoto-source', 'LICENSE'),
  '',
  'AGPL-3.0.txt'
)
zip.writeZip(sourceArchive)
artifacts.push(sourceArchive)

const lines = artifacts.map((target) => {
  const hash = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex')
  console.log(`${path.basename(target)}\t${fs.statSync(target).size}\t${hash}`)
  return `${hash}  ${path.basename(target)}`
})
const checksum = path.join(releaseDir, `${base}.sha256.txt`)
fs.writeFileSync(checksum, lines.join('\n') + '\n', 'utf8')
console.log(path.basename(checksum))
