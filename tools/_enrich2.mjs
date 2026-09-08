import fs from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const riddlesPath = path.join(root, 'data', 'riddles.json')
const riddles = JSON.parse(fs.readFileSync(riddlesPath, 'utf8'))
console.log('原始题数:', riddles.length)

// 现有脑筋急转弯标记为 brain
for (const r of riddles) r.category = 'brain'

// 十万个为什么（why）：原创简明可靠常识，不编引用、不声称抄书
const why = [
  { question: '为什么天空是蓝色的？', answer: '因为阳光里的蓝光波长短，更容易被空气分子散射到四面八方。', explain: '阳光由多种颜色的光组成，空气分子对短波蓝光散射最强，所以天空看起来是蓝色。', knowledge: '这种散射叫瑞利散射，强度与波长的四次方成反比，所以短波蓝光最易被散射。' },
  { question: '为什么先看到闪电后听到雷声？', answer: '因为光的传播速度远快于声音。', explain: '闪电和雷声同时发生，但光速约每秒30万公里，声速约每秒340米，所以光先到、声后到。', knowledge: '看到闪电后数秒差就能粗略估算雷击距离（秒数×340米）。' },
  { question: '为什么冬天能看见嘴里呼出的白气？', answer: '因为呼出的热气里的水蒸气遇冷空气凝结成小水滴。', explain: '人呼出的气体含有水蒸气，遇到冷空气会凝结成许多微小水滴，看起来像白雾。' },
  { question: '为什么海水是咸的？', answer: '因为河流把陆地上的盐分不断带入海洋，水蒸发后盐留了下来。', explain: '雨水冲刷土壤和岩石，把溶解的盐带进河海，亿万年积累使海水变咸。' },
  { question: '为什么铁会生锈？', answer: '因为铁与水和氧气发生化学反应，生成疏松的铁锈。', explain: '在潮湿空气中，铁表面逐渐形成含水氧化铁，也就是铁锈，并持续向内腐蚀。', knowledge: '铁锈主要成分是含水氧化铁，结构疏松，不能像原铁那样保护内部。' },
  { question: '为什么植物大多是绿色的？', answer: '因为叶子里的叶绿素主要反射绿光、吸收红光和蓝光。', explain: '叶绿素靠吸收红光和蓝光进行光合作用，绿光被反射回眼睛，所以叶子呈绿色。' },
  { question: '为什么人运动后心跳会加快？', answer: '因为身体需要更多氧气和养分，心脏加快泵血来满足。', explain: '运动时肌肉耗氧上升，心跳加快能更快把含氧血液送到全身。' },
  { question: '为什么肥皂能去污？', answer: '因为肥皂分子一边亲水一边亲油，能把油污包住带走。', explain: '肥皂降低水的表面张力，让油污分散成小滴随水冲走。', knowledge: '这种“两头亲”的性质叫表面活性，是洗涤剂去污的关键。' },
  { question: '为什么热水瓶能保温？', answer: '因为双层真空胆阻断了传导和对流，瓶塞减少散热。', explain: '真空层几乎没有物质传热，加上镀层反射辐射，所以冷热都难跑掉。' },
  { question: '为什么月亮有阴晴圆缺？', answer: '因为月球绕地球转动，我们每天看到的被照亮部分不同。', explain: '月球本身不发光，靠反射太阳光；位置变化让我们看到不同形状的亮面。', knowledge: '从新月到满月的朔望周期约为29.5天。' },
  { question: '为什么彩虹是弯的？', answer: '因为阳光在水滴里折射反射后，按固定角度射入眼睛，连成圆弧。', explain: '每颗水滴把光偏折约42度，大量水滴形成的光点拼出一段圆弧。' },
  { question: '为什么人要睡觉？', answer: '因为睡眠让大脑整理记忆、修复身体，是必需的恢复过程。', explain: '睡眠时机体积蓄能量、巩固记忆、清除代谢废物，长期缺觉会损害健康。', knowledge: '长期睡眠不足会影响注意力、情绪和免疫力。' },
  { question: '为什么鸡蛋煮熟后蛋白会变白变硬？', answer: '因为加热使蛋白质变性并凝固。', explain: '生蛋白是流动的蛋白质溶液，受热后结构改变，从液态变成固态。', knowledge: '蛋白质遇热“变性”后空间结构展开并相互交织，于是凝固。' },
  { question: '为什么切洋葱会流泪？', answer: '因为洋葱被破坏时释放的物质与泪液反应生成刺激性酸。', explain: '洋葱细胞破裂后，蒜氨酸酶把前体变成刺激物，飘到眼里催泪。' },
  { question: '为什么海拔越高越冷？', answer: '因为高处空气稀薄，保留热量的能力弱。', explain: '对流层里海拔升高，空气密度下降，保温能力差，气温随之降低。', knowledge: '在对流层，气温大致每升高1000米下降约6.5℃。' },
  { question: '为什么指南针指向南北？', answer: '因为地球像一块大磁铁，会吸引指南针的磁针。', explain: '地磁场给磁针一个定向力矩，使它能自由转动的一端指向磁极方向。' },
  { question: '为什么水能灭火？', answer: '因为水能降温并隔绝氧气，让燃烧难以继续。', explain: '大量水迅速降低温度，同时蒸汽把可燃物与空气隔开，火就灭了。', knowledge: '油锅和带电设备着火不能用水，否则会更危险。' },
  { question: '为什么夏天树林里更凉快？', answer: '因为树叶蒸腾吸热，且树荫挡住了阳光。', explain: '植物蒸腾带走热量，树冠又遮住直射阳光，林下温度更低。' },
  { question: '为什么镜子能照出人？', answer: '因为镜子表面光滑，能把光按规律反射回眼睛。', explain: '平面镜让入射光按对称角度反射，形成与实物左右相反的像。' },
  { question: '为什么气球松手会倒飞？', answer: '因为向后喷出的气体产生反作用力推着气球前进。', explain: '充满气的气球放开后，气体向后冲出，反过来把气球往前推。', knowledge: '这叫作用力与反作用力，是牛顿第三定律的体现。' },
  { question: '为什么冬天脱毛衣会有火花和噼啪声？', answer: '因为摩擦让衣物积累静电，放电时发出微光和声响。', explain: '干燥环境下纤维摩擦转移电荷，电荷释放就是可见可闻的静电放电。' },
  { question: '为什么煮熟的虾蟹会变红？', answer: '因为加热破坏了虾青素与蛋白质的结合，露出原本的红色。', explain: '活虾蟹里虾青素被蛋白质包裹显青灰，受热后蛋白变性，红色显现。' },
  { question: '为什么伤口结痂后会发痒？', answer: '因为新组织在生长，刺激了皮肤里的神经末梢。', explain: '结痂下方血管和细胞再生，轻微的牵拉与刺激让人觉得痒。' },
  { question: '为什么星星会“眨眼”？', answer: '因为星光穿过不稳定的大气层时发生抖动。', explain: '高空气流使大气密度不断变化，星光折射方向随之晃动，看起来一闪一闪。' },
  { question: '为什么塑料不容易腐烂？', answer: '因为人工合成的高分子结构稳定，微生物难以分解。', explain: '塑料的分子链很长很牢固，自然界中缺少能快速拆解它的生物。' },
  { question: '为什么喝了汽水会打嗝？', answer: '因为汽水里的二氧化碳在胃里释放，刺激打嗝排出。', explain: '汽水加压溶入二氧化碳，进胃后压力变小气体逸出，身体用打嗝把它排出。' },
  { question: '为什么海边白天吹海风、夜里吹陆风？', answer: '因为海陆吸热放热快慢不同，造成气压差推动风向变化。', explain: '白天陆地升温快、空气上升形成海风；夜晚陆地降温快、空气下沉形成陆风。' },
  { question: '为什么放大镜能聚光点火？', answer: '因为凸透镜把阳光会聚到一点，温度升到可燃程度。', explain: '凸透镜让平行光线向焦点集中，焦点处能量密度很高，足以点燃纸片。' },
  { question: '为什么人会打哈欠？', answer: '打哈欠常与困倦和状态转换有关，确切功能仍没有统一结论。', explain: '低氧并不是已证实原因；改变吸入氧气或二氧化碳不会明显改变打哈欠频率。', knowledge: '研究提出警觉调节、脑温调节等假说，但目前没有公认的单一解释。' },
  { question: '为什么雪看起来是白色的？', answer: '因为雪花由许多冰晶组成，会把各种颜色的光都散射开来。', explain: '冰晶表面把红绿蓝等光均匀反射，混合在一起就呈现白色。' },
  { question: '为什么热水有时比冷水结冰更快？', answer: '在特定的水量、容器和温度条件下，热水可能更早结冰，这叫姆潘巴现象。', explain: '蒸发带走质量、对流加快换热等因素叠加时，热水反而先冻。', knowledge: '日常多数情况下仍是冷水先结冰，姆潘巴现象需要满足特殊条件才出现。' }
]

// 百科知识（encyclopedia）：原创简明可靠常识，不编引用、不声称抄书
const wiki = [
  { question: '蜜蜂靠什么帮助植物传粉？', answer: '蜜蜂在花间采蜜时，身上沾的花粉被带到下一朵花。', explain: '蜜蜂钻进花朵取蜜，体毛沾上花粉，飞到别处时完成传粉，对果实结实很重要。' },
  { question: '大熊猫主要吃什么？', answer: '几乎只吃竹子，偶尔吃其他植物或小动物。', explain: '大熊猫每天要花很长时间啃食竹子来获取足够养分。', knowledge: '大熊猫虽属食肉目，却演化出以竹为主食的习性。' },
  { question: '骆驼为什么能长时间不喝水？', answer: '因为驼峰储存脂肪，而且它能耐受身体脱水。', explain: '脂肪供能减少了对水的需求，红细胞也特殊，缺水时不易破裂。', knowledge: '骆驼的红细胞呈椭圆形，脱水时也不易破裂，补水后能迅速恢复。' },
  { question: '蜜蜂怎样告诉同伴花在哪里？', answer: '通过“摇摆舞”的方向和时长传递信息。', explain: '侦察蜂回巢后跳舞，舞的方向指开花方位，时长表示距离远近。' },
  { question: '闪电的温度大约有多高？', answer: '闪电通道温度可达上万摄氏度，比太阳表面还热。', explain: '强大电流瞬间加热空气，使通道温度远高于日常火焰。' },
  { question: '地球表面约有几成是海洋？', answer: '约七成是海洋，陆地只占约三成。', explain: '从太空看地球，大片蓝色就是海洋，陆地被分隔成各大洲。' },
  { question: '蜂群如何分工？', answer: '有蜂王、工蜂和雄蜂，各司其职。', explain: '蜂王负责产卵，工蜂采蜜筑巢，雄蜂参与繁殖，群体高度协作。' },
  { question: '企鹅为什么不怕冷？', answer: '因为厚厚的脂肪层和密集的羽毛能保温。', explain: '脂肪和羽毛形成隔热层，脚掌血流也能减少散热。', knowledge: '帝企鹅能在零下数十摄氏度的南极孵蛋育雏。' },
  { question: '蜘蛛怎样捕捉昆虫？', answer: '多数蜘蛛用丝织网粘住猎物。', explain: '蜘蛛吐出的丝又韧又粘，织成网后等昆虫撞上再制服。' },
  { question: '人的心脏一天大约跳多少次？', answer: '成年人安静时大约十万次。', explain: '心脏不停地把血液泵向全身，次数随年龄和活动变化。', knowledge: '运动时心率会明显加快，以满足身体需氧。' },
  { question: '彩虹通常有几种颜色？', answer: '红、橙、黄、绿、蓝、靛、紫七种。', explain: '阳光经水滴折射后按波长分开，呈现出这七种顺序的颜色。' },
  { question: '蜗牛用什么爬行？', answer: '用腹部肌肉波浪式收缩，并分泌黏液润滑。', explain: '黏液减少摩擦并保护腹足，让蜗牛能在多种表面缓慢移动。' },
  { question: '蝙蝠靠什么在黑夜里找路？', answer: '靠发出超声波并听回声来定位。', explain: '蝙蝠发出人耳听不到的超声波，根据回声判断障碍和猎物的位置。', knowledge: '这叫回声定位，蝙蝠主要不靠眼睛在夜间导航。' },
  { question: '竹子是草还是树？', answer: '竹子其实是草本植物，不是树木。', explain: '竹子虽高大，却没有树木那样的年轮和次生木质部，属于禾本科。' },
  { question: '萤火虫为什么会发光？', answer: '体内化学反应产生几乎不发热的“冷光”，用来求偶或警示。', explain: '萤火虫体内的荧光素在酶催化下发光，效率很高且基本不产热。' },
  { question: '鲸鱼是鱼吗？', answer: '不是，鲸是哺乳动物，用肺呼吸。', explain: '鲸靠肺呼吸、胎生哺乳，和鱼类用鳃呼吸完全不同。' },
  { question: '工蜂蜇人后会怎样？', answer: '工蜂蜇人后倒钩拔不出，往往会死去。', explain: '蜜蜂的蜇针带倒钩，刺入皮肤后连同内脏被拉出，蜜蜂随之死亡。' },
  { question: '一年中有几个月是31天？', answer: '七个月：一、三、五、七、八、十、十二月。', explain: '记住“一三五七八十腊，三十一天永不差”即可。' },
  { question: '蜘蛛有多少条腿？', answer: '八条腿。', explain: '蜘蛛属于蛛形纲，和六条腿的昆虫不同。' },
  { question: '含羞草为什么一碰就合拢？', answer: '因为叶枕细胞失水，叶片失去支撑而下垂。', explain: '触碰刺激让叶枕水分转移，小叶合拢，是一种自我保护反应。' },
  { question: '沙漠里为什么昼夜温差很大？', answer: '因为沙子吸热快、散热也快，且空气干燥少云。', explain: '白天沙地迅速升温，夜里热量很快散失，所以冷热悬殊。' },
  { question: '人的指纹有什么用？', answer: '增加摩擦便于抓握，而且每个人纹路不同。', explain: '指纹的沟纹能增强手与物体的摩擦力，也用于身份区分。', knowledge: '指纹在胎儿期形成，成年后基本稳定不变。' },
  { question: '萤火虫的光会烫手吗？', answer: '不会，它发的是几乎不产生热的“冷光”。', explain: '荧光素发光把能量主要变成光，很少变成热，所以不烫。' },
  { question: '北斗七星有什么用？', answer: '古时用来辨认方向和季节。', explain: '北斗七星的勺柄指向随季节旋转，连线的延长还能找到北极星。' },
  { question: '章鱼有几颗心脏？', answer: '有三颗心脏。', explain: '两颗负责把血送向鳃，一颗负责把血送向全身。' },
  { question: '雪为什么能保温？', answer: '因为雪花之间充满空气，空气是热的不良导体。', explain: '蓬松的雪层把静止空气困住，减慢热量散失，所以能保温。' },
  { question: '候鸟为什么要迁徙？', answer: '为追随温暖的气候和充足的食物而随季节长途飞行。', explain: '当原栖息地变冷或食物减少，候鸟飞往更适宜的地区。' },
  { question: '成人的骨骼大约有多少块？', answer: '成年人大约有206块骨头。', explain: '骨骼支撑身体、保护内脏并参与造血。', knowledge: '婴儿出生时骨头更多，成长过程中部分会融合减少。' },
  { question: '树叶到了秋天为什么变黄或变红？', answer: '因为天冷后叶绿素减少，露出类胡萝卜素或花青素。', explain: '叶绿素分解后，原本被盖住的其他色素显现，叶子就换了颜色。' },
  { question: '蜜蜂群体里谁负责产卵？', answer: '只有蜂王产卵，工蜂承担采集与筑巢。', explain: '蜂王专职繁殖，工蜂是发育受抑的雌蜂，负责群体劳作。' },
  { question: '人的血液为什么是红色的？', answer: '因为红细胞里的血红蛋白含铁，结合氧后呈红色。', explain: '血红蛋白负责运氧，其中的铁让动脉血显得鲜红。', knowledge: '静脉血含氧较少，颜色偏暗红。' }
]

for (const r of why) {
  r.category = 'why'
  if (!r.question || !r.answer || !r.explain) throw new Error('why 字段缺失: ' + r.question)
  if (riddles.some((x) => x.question === r.question)) throw new Error('why 题目重复: ' + r.question)
  riddles.push(r)
}
for (const r of wiki) {
  r.category = 'encyclopedia'
  if (!r.question || !r.answer || !r.explain) throw new Error('wiki 字段缺失: ' + r.question)
  if (riddles.some((x) => x.question === r.question)) throw new Error('wiki 题目重复: ' + r.question)
  riddles.push(r)
}

const cats = riddles.reduce((m, r) => { m[r.category] = (m[r.category] || 0) + 1; return m }, {})
const uniqueQuestions = new Set(riddles.map((r) => r.question))
if (uniqueQuestions.size !== riddles.length) throw new Error('存在重复题目')
if (cats.brain < 100) throw new Error('brain 不足: ' + cats.brain)
if (cats.why < 30) throw new Error('why 不足30: ' + cats.why)
if (cats.encyclopedia < 30) throw new Error('encyclopedia 不足30: ' + cats.encyclopedia)

fs.writeFileSync(riddlesPath, JSON.stringify(riddles, null, 2) + '\n', 'utf8')
console.log('扩充后题数:', riddles.length, '分类:', JSON.stringify(cats))
