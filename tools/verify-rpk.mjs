import AdmZip from 'adm-zip'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function verifyRpk(filename, expectedVersion) {
  const zip = new AdmZip(filename)
  const manifest = JSON.parse(zip.readAsText('manifest-watch.json'))
  if (manifest.package !== 'com.dailyquote.band10pro') throw new Error('安装包包名错误')
  if (expectedVersion && manifest.versionName !== expectedVersion) throw new Error('安装包版本与源码不一致')
  for (const name of ['app.jsc', 'pages/index/index.jsc']) {
    const entry = zip.getEntry(name)
    if (!entry || entry.getData().length < 100) throw new Error(`缺少有效 JSC 字节码：${name}；请使用 --enable-jsc 重新构建`)
  }
  if (zip.getEntry('app.js') || zip.getEntry('pages/index/index.js')) throw new Error('拒绝发布源 JS 启动包')
  if (!zip.getEntry('META-INF/CERT')) throw new Error('缺少签名记录')
  return manifest
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log('JSC 安装包校验通过：' + verifyRpk(process.argv[2], process.argv[3]).versionName)
}
