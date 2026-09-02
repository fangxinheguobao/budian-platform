// 布典人生 v6.0 种子数据 —— 依据《系统设计说明书》V2.0 与《系统用例》V2.0
const P = (n) => `img/${n}`

export const IMG = {
  tealDrape: P('fabric-teal-drape.jpg'),
  silkLight: P('fabric-silk-light.jpg'),
  bwJacquard: P('fabric-bw-jacquard.jpg'),
  blueVelvet: P('fabric-blue-velvet.jpg'),
  velvetSwirl: P('fabric-velvet-swirl.jpg'),
  tealSilk: P('fabric-teal-silk.jpg'),
  sceneCurtainSofa: P('scene-curtain-sofa.jpg'),
  sceneLivingRoom: P('scene-living-room.jpg'),
  sceneBeigeCurtain: P('scene-beige-curtain.jpg'),
  sceneGrayCurtain: P('scene-gray-curtain.jpg'),
  sceneShowroomBlue: P('scene-showroom-blue.jpg'),
}

export const CATEGORY_PREFIX = { 窗帘布: 'CL', 沙发布: 'SF', 服装面料: 'FZ', 床品面料: 'CP', 装饰面料: 'ZS' }

export const TAGS = {
  category: ['窗帘布', '沙发布', '服装面料', '床品面料', '装饰面料'],
  style: ['小香风', '新中式', '现代简约', '侘寂风', '轻奢', '北欧', '复古', '日式', '美式', '意式', '田园'],
  scene: ['客厅', '卧室', '书房', '餐厅', '沙发', '窗帘', '床品', '服装', '儿童房'],
  perf: ['遮光', '防污', '防水', '耐磨', '透气', '抗菌', '抗皱', '垂感好', '亲肤', '不起球', '保暖', '高弹'],
  color: ['白色系', '灰色系', '蓝色系', '大地系', '暖色系', '绿色系', '黑色系'],
}

// 角色体系（US-3.5.1：游客/注册客户/VIP/分销商/业务员/管理员/后台美工）
export const ROLES = {
  admin: { label: '管理员', home: '/admin' },
  artist: { label: '后台美工', home: '/admin' },
  sales: { label: '业务员', home: '/admin' },
  vip: { label: 'VIP会员', home: '/shop' },
  dealer_l1: { label: '一级经销商', home: '/shop' },
  dealer_l2: { label: '二级经销商', home: '/shop' },
  registered: { label: '注册客户', home: '/shop' },
}
export const TIER_MAP = {
  vip: { label: 'VIP会员', priceTier: 'A类专属价', discount: 0.78, role: 'vip' },
  l1: { label: '一级经销商', priceTier: 'B类经销价', discount: 0.85, role: 'dealer_l1' },
  l2: { label: '二级经销商', priceTier: 'C类经销价', discount: 0.92, role: 'dealer_l2' },
  normal: { label: '普通客户', priceTier: '标准价', discount: 1, role: 'registered' },
}
// 权限矩阵（US-3.5.1 / UC-3.3.3：库存对游客与注册客户隐藏，仅VIP/分销商/授权人员可见）
export const PERMISSIONS = {
  admin: { stock: true, aiGen: true, leadPush: true, pricing: true, label: '授权人员' },
  artist: { stock: true, aiGen: true, leadPush: false, pricing: false, label: '授权人员' },
  sales: { stock: true, aiGen: true, leadPush: true, pricing: false, label: '授权人员' },
  vip: { stock: true, aiGen: true, leadPush: true, pricing: false, label: 'VIP' },
  dealer_l1: { stock: true, aiGen: true, leadPush: true, pricing: false, label: '分销商' },
  dealer_l2: { stock: true, aiGen: true, leadPush: true, pricing: false, label: '分销商' },
  registered: { stock: false, aiGen: false, leadPush: true, pricing: false, label: '注册客户' },
}
// IP 大区映射（US-3.3.1 演示）
export const REGIONS = ['华东大区', '华南大区', '华北大会区', '西南大区', '华中大区']
export const DEMO_IPS = [
  { ip: '58.34.**.**', city: '上海', region: '华东大区' },
  { ip: '113.57.**.**', city: '武汉', region: '华中大区' },
  { ip: '119.123.**.**', city: '广州', region: '华南大区' },
  { ip: '61.135.**.**', city: '北京', region: '华北大会区' },
  { ip: '222.212.**.**', city: '成都', region: '西南大区' },
]

const c = (hex) => hex

// 30款面料 —— img 为 null 时使用程序化织纹；location=区域货架（US-3.1.3），clearance=清仓（US-3.1.5）
export const FABRICS = [
  { sku: 'XXF-001', name: '小香风黑白肌理提花', category: '服装面料', sub: '粗花呢', price: 168, gsm: 520, width: 150, stock: 180, safety: 150, colorFam: '黑色系', colors: [c('#1c1c1e'), c('#f4f1ea'), c('#8e8e93'), c('#c9a86a')], styles: ['小香风', '复古', '意式'], scenes: ['服装', '外套'], perf: ['耐磨', '抗皱', '不起球'], img: IMG.bwJacquard, views: 4120, salesRank: 5,
    story: '黑白交织的肌理中，藏着可可·香奈儿女士的经典美学。粗花呢的颗粒感与金线的点缀相得益彰，每一寸面料都在诉说着法式优雅的故事。它是外套的最佳拍档，也是永恒的衣橱必备。',
    craft: { process: '进口多臂提花机织造，羊毛混纺粗花呢工艺，经蒸呢定型，手感蓬松有骨感。', fastness: '4-5级', shrinkage: '≤3%', strength: '经向850N', eco: 'OEKO-TEX' } },
  { sku: 'ZS-021', name: '真丝素绉缎礼服面料', category: '服装面料', sub: '真丝', price: 280, gsm: 110, width: 114, stock: 60, safety: 150, colorFam: '白色系', colors: [c('#f6f2ea'), c('#e8ddc8'), c('#d4c5a8'), c('#7a6f5c')], styles: ['轻奢', '意式'], scenes: ['服装', '礼服'], perf: ['亲肤', '垂感好', '透气'], img: IMG.silkLight, views: 5670, salesRank: 2,
    story: '16姆米桑蚕丝，珍珠光泽含蓄温润。垂坠的缎面随身体的曲线流动，是高级定制礼服的心头好，也是红毯上最温柔的光。',
    craft: { process: '湖州桑蚕丝，缎纹组织，砂洗柔炼，光泽自然含蓄。', fastness: '4级', shrinkage: '≤5%', strength: '经向420N', eco: 'GOTS' } },
  { sku: 'YS-013', name: '意式丝绒沙发面料', category: '沙发布', sub: '丝绒', price: 118, gsm: 400, width: 142, stock: 120, safety: 150, colorFam: '蓝色系', colors: [c('#3d5a80'), c('#293241'), c('#7d8ca3'), c('#b0c4d4')], styles: ['意式', '轻奢'], scenes: ['沙发', '客厅'], perf: ['耐磨', '垂感好', '防污'], img: IMG.blueVelvet, views: 6780, salesRank: 1,
    story: '深穹蓝的天鹅绒面，随光线流转出深海般的层次。意式客厅的灵魂单品，触感如奶油般细腻，耐磨而不失华贵。',
    craft: { process: '意大利绒类工艺，经割绒整理，绒毛立体饱满，倒顺光自然。', fastness: '4-5级', shrinkage: '≤2%', strength: '经向980N', eco: 'OEKO-TEX' } },
  { sku: 'SF-022', name: '意式真皮沙发面料', category: '沙发布', sub: '科技真皮', price: 158, gsm: 580, width: 138, stock: 45, safety: 150, colorFam: '大地系', colors: [c('#6f4e37'), c('#8b6f47'), c('#a68a64'), c('#3e2f23')], styles: ['意式', '轻奢'], scenes: ['沙发', '客厅'], perf: ['耐磨', '防水', '防污'], img: null, hue: 28, sat: 24, views: 3240, salesRank: 9,
    story: '头层牛皮的呼吸感，与科技涂层的耐用相得益彰。越用越有味道的皮面，是意式大宅客厅沉稳气质的来源。',
    craft: { process: '头层牛皮鞣制，水性涂层处理，耐磨抗刮，质感温润。', fastness: '5级', shrinkage: '—', strength: '撕裂≥60N', eco: 'LWG' } },
  { sku: 'QS-010', name: '金丝提花窗帘面料', category: '窗帘布', sub: '提花布', price: 88, gsm: 400, width: 148, stock: 200, safety: 150, colorFam: '绿色系', colors: [c('#3c5a55'), c('#c9b98a'), c('#1f3630'), c('#8aa39c')], styles: ['轻奢', '意式'], scenes: ['窗帘', '客厅'], perf: ['遮光', '垂感好'], img: IMG.tealDrape, views: 2860, salesRank: 7,
    story: '墨绿底色上，金丝勾勒出巴洛克式的藤蔓纹样。光影掠过时，窗帘如一幕缓缓拉开的歌剧序曲。',
    craft: { process: '大提花机织造，金丝线嵌织，后定型压光处理。', fastness: '4级', shrinkage: '≤3%', strength: '经向760N', eco: 'OEKO-TEX' } },
  { sku: 'TC-019', name: '天丝莱赛尔夏被面料', category: '床品面料', sub: '天丝', price: 88, gsm: 180, width: 250, stock: 240, safety: 150, colorFam: '绿色系', colors: [c('#9cb8a0'), c('#dce8de'), c('#5c7d64'), c('#c3d6c6')], styles: ['现代简约', '意式'], scenes: ['床品', '卧室'], perf: ['亲肤', '透气', '抗菌'], img: IMG.tealSilk, views: 1980, salesRank: 12,
    story: '天丝莱赛尔的清凉顺滑，像把森林晨风铺在床上。吸湿透气性是棉的1.5倍，夏日卧室的温柔答案。',
    craft: { process: '兰精天丝纤维，缎纹织造，生物酶抛光处理。', fastness: '4-5级', shrinkage: '≤4%', strength: '经向520N', eco: 'FSC' } },
  { sku: 'ZK-005', name: '轻奢珠光缎面窗帘', category: '窗帘布', sub: '缎面', price: 72, gsm: 380, width: 148, stock: 210, safety: 150, colorFam: '灰色系', colors: [c('#9aa2ad'), c('#c6ccd4'), c('#6a7280'), c('#e2e5e9')], styles: ['轻奢', '现代简约'], scenes: ['窗帘', '客厅', '卧室'], perf: ['遮光', '垂感好'], img: null, hue: 220, sat: 6, views: 2210, salesRank: 10,
    story: '雾灰色缎面在光下泛起珍珠般的微光。克制的轻奢，不需要多余装饰，垂感自会说话。',
    craft: { process: '五枚缎纹组织，珠光浆整纬处理，垂感自然。', fastness: '4级', shrinkage: '≤3%', strength: '经向680N', eco: 'OEKO-TEX' } },
  { sku: 'CL-006', name: '雪尼尔遮光窗帘布', category: '窗帘布', sub: '雪尼尔', price: 38, gsm: 420, width: 148, stock: 850, safety: 150, colorFam: '灰色系', colors: [c('#8a8f98'), c('#b5bac1'), c('#5d626b'), c('#d7dade')], styles: ['现代简约', '北欧'], scenes: ['窗帘', '客厅', '卧室'], perf: ['遮光', '垂感好', '保暖'], img: null, hue: 220, sat: 8, views: 5680, salesRank: 3,
    story: '雪尼尔的绒感厚实温润，遮光率高达90%。北欧客厅与卧室的性价比之选，一帘之隔，世界安静下来。',
    craft: { process: '雪尼尔纱线织造，三层织遮光结构，涂层定型。', fastness: '4级', shrinkage: '≤3%', strength: '经向720N', eco: 'OEKO-TEX' } },
  { sku: 'MS-012', name: '美式田园印花布', category: '窗帘布', sub: '印花布', price: 55, gsm: 300, width: 148, stock: 300, safety: 150, colorFam: '暖色系', colors: [c('#c17c54'), c('#e8c9a3'), c('#8a5a3b'), c('#f0e3d0')], styles: ['美式', '田园'], scenes: ['窗帘', '客厅', '餐厅'], perf: ['垂感好', '透气'], img: null, hue: 25, sat: 45, views: 2140, salesRank: 14,
    story: '手绘风格的藤蔓与小花，铺满阳光的午后客厅。美式田园的浪漫不在远处，就在这一窗碎花里。',
    craft: { process: '活性数码印花，套色精准，水洗做旧手感。', fastness: '4级', shrinkage: '≤4%', strength: '经向580N', eco: 'OEKO-TEX' } },
  { sku: 'RS-011', name: '日式苎麻窗帘布', category: '窗帘布', sub: '苎麻', price: 52, gsm: 260, width: 145, stock: 380, safety: 150, colorFam: '大地系', colors: [c('#c9c0ae'), c('#e6dfd2'), c('#a89e8a'), c('#8f8672')], styles: ['日式', '侘寂风'], scenes: ['窗帘', '客厅', '书房'], perf: ['透气', '垂感好'], img: null, hue: 42, sat: 16, views: 1760, salesRank: 18,
    story: '苎麻天然的竹节肌理，带着泥土与阳光的气息。侘寂之家的窗前光影，一半来自窗外，一半来自这匹布。',
    craft: { process: '苎麻混纺，平纹织造，轻浆自然垂坠。', fastness: '4级', shrinkage: '≤5%', strength: '经向490N', eco: 'GOTS' } },
  { sku: 'CL-020', name: '肌理纱帘', category: '窗帘布', sub: '纱帘', price: 22, gsm: 120, width: 148, stock: 720, safety: 150, colorFam: '白色系', colors: [c('#f4f2ec'), c('#e9e5da'), c('#ddd6c6')], styles: ['现代简约', '北欧'], scenes: ['窗帘', '客厅', '卧室'], perf: ['透气', '垂感好'], img: null, hue: 45, sat: 10, views: 2450, salesRank: 8,
    story: '轻盈如晨雾的纱帘，把阳光滤成温柔的奶白色。透光不透人，是窗前最柔和的一层滤镜。',
    craft: { process: '涤纶空变纱织造，肌理提花，高温定型。', fastness: '4级', shrinkage: '≤2%', strength: '经向320N', eco: 'OEKO-TEX' } },
  { sku: 'CL-025', name: '木百叶梦幻帘面料', category: '窗帘布', sub: '梦幻帘', price: 95, gsm: 180, width: 200, stock: 90, safety: 150, colorFam: '白色系', colors: [c('#f2efe8'), c('#ddd8cb'), c('#c2bcab')], styles: ['意式', '现代简约'], scenes: ['窗帘', '客厅', '书房'], perf: ['遮光', '垂感好'], img: null, hue: 40, sat: 12, views: 1680, salesRank: 21,
    story: '一片帘叶之间，光影可开可合。梦幻帘的柔美与百叶的利落在此并存，是阳台与飘窗的气质之选。',
    craft: { process: '专用帘叶织带工艺，弧形纬编，翻转顺滑耐用。', fastness: '4-5级', shrinkage: '≤2%', strength: '经向460N', eco: 'OEKO-TEX' } },
  { sku: 'CL-030', name: 'ins风格子窗帘', category: '窗帘布', sub: '色织布', price: 42, gsm: 320, width: 148, stock: 340, safety: 150, colorFam: '蓝色系', colors: [c('#7d94ac'), c('#f0ede4'), c('#4a5d73'), c('#c3cfd9')], styles: ['北欧', '现代简约'], scenes: ['窗帘', '卧室', '儿童房'], perf: ['遮光', '透气'], img: null, hue: 210, sat: 22, views: 1890, salesRank: 16,
    story: '雾霾蓝与奶白的经典格纹，ins博主的窗帘常客。清爽干净，小户型和出租屋也能拥有的治愈感。',
    craft: { process: '色织提格工艺，先染后织，格型立体不褪色。', fastness: '4-5级', shrinkage: '≤3%', strength: '经向540N', eco: 'OEKO-TEX' } },
  { sku: 'SF-026', name: '麂皮绒沙发面料', category: '沙发布', sub: '麂皮绒', price: 75, gsm: 380, width: 142, stock: 260, safety: 150, colorFam: '大地系', colors: [c('#a68a64'), c('#c9b18a'), c('#7d6a4e'), c('#e0d3ba')], styles: ['意式', '轻奢'], scenes: ['沙发', '客厅', '书房'], perf: ['耐磨', '防污', '亲肤'], img: null, hue: 38, sat: 28, views: 4200, salesRank: 4,
    story: '麂皮绒的哑光质感，像被时间磨圆的老家具。复古而温柔，越坐越贴近生活的样子。',
    craft: { process: '经编麂皮绒，磨毛整理，防污助剂处理。', fastness: '4级', shrinkage: '≤2%', strength: '经向700N', eco: 'OEKO-TEX' } },
  { sku: 'BO-014', name: '北欧风素色亚麻', category: '沙发布', sub: '亚麻', price: 52, gsm: 290, width: 145, stock: 340, safety: 150, colorFam: '大地系', colors: [c('#cfc6b2'), c('#e8e2d4'), c('#b0a68e'), c('#948a72')], styles: ['北欧', '日式'], scenes: ['沙发', '客厅', '卧室'], perf: ['透气', '亲肤', '耐磨'], img: null, hue: 45, sat: 18, views: 2350, salesRank: 13,
    story: '亚麻的天然褶皱，是北欧之家最诚实的装饰。素色不素淡，每一道纹理都是自然的签名。',
    craft: { process: '亚麻棉混纺，平纹织造，轻洗水工艺。', fastness: '4级', shrinkage: '≤5%', strength: '经向510N', eco: 'GOTS' } },
  { sku: 'SF-007', name: '科技布防水防污面料', category: '沙发布', sub: '科技布', price: 68, gsm: 360, width: 142, stock: 320, safety: 150, colorFam: '灰色系', colors: [c('#9ba3ad'), c('#c9ced5'), c('#6e7681'), c('#e3e6ea')], styles: ['现代简约', '北欧'], scenes: ['沙发', '客厅', '儿童房'], perf: ['防水', '防污', '耐磨'], img: null, hue: 215, sat: 8, views: 3120, salesRank: 6,
    story: '咖啡渍、果汁、宠物爪印——科技布一擦就净。有孩子和毛孩子的家庭，都值得一张不用小心的沙发。',
    craft: { process: '三防涂层（防水防油防污），耐磨4万转以上。', fastness: '4-5级', shrinkage: '≤2%', strength: '经向820N', eco: 'OEKO-TEX' } },
  { sku: 'YL-003', name: '英伦千鸟格沙发面料', category: '沙发布', sub: '色织提花', price: 95, gsm: 420, width: 142, stock: 180, safety: 150, colorFam: '黑色系', colors: [c('#2b2b2e'), c('#f0efe9'), c('#6b6b70'), c('#c9c8c0')], styles: ['美式', '复古'], scenes: ['沙发', '书房'], perf: ['耐磨', '抗皱'], img: null, hue: 240, sat: 3, views: 2050, salesRank: 15,
    story: '千鸟格从苏格兰高地一路走到英伦书房，黑白经纬之间是永不过时的绅士趣味。',
    craft: { process: '色织千鸟格提花，双经轴织造，格型方正。', fastness: '4级', shrinkage: '≤3%', strength: '经向760N', eco: 'OEKO-TEX' } },
  { sku: 'SF-028', name: '奶油风羊羔绒布料', category: '沙发布', sub: '羊羔绒', price: 62, gsm: 450, width: 142, stock: 200, safety: 150, colorFam: '白色系', colors: [c('#f3ede1'), c('#e6dcc9'), c('#d4c6ac')], styles: ['北欧', '日式'], scenes: ['沙发', '卧室', '儿童房'], perf: ['亲肤', '保暖', '不起球'], img: null, hue: 40, sat: 22, views: 2670, salesRank: 11,
    story: '云朵一样的羊羔绒，陷进去就不想起来的柔软。奶油色的温柔，治愈疲惫的一整个冬天。',
    craft: { process: '经编羊羔绒，烫光整理，防静电防起球。', fastness: '4级', shrinkage: '≤2%', strength: '经向480N', eco: 'OEKO-TEX' } },
  { sku: 'CM-009', name: '60支长绒棉四件套面料', category: '床品面料', sub: '长绒棉', price: 68, gsm: 220, width: 250, stock: 450, safety: 150, colorFam: '白色系', colors: [c('#f7f5ef'), c('#eae5d9'), c('#d8d2c2')], styles: ['现代简约', '北欧'], scenes: ['床品', '卧室'], perf: ['亲肤', '透气', '不起球'], img: null, hue: 45, sat: 8, views: 2280, salesRank: 17,
    story: '60支长绒棉的细密触感，是五星级酒店床品的同款标准。一觉睡到天亮的柔软，从这支坯布开始。',
    craft: { process: '新疆长绒棉，精梳紧密纺，丝光处理。', fastness: '4-5级', shrinkage: '≤4%', strength: '经向560N', eco: 'GOTS' } },
  { sku: 'CP-018', name: '超柔宝宝绒床品', category: '床品面料', sub: '宝宝绒', price: 45, gsm: 280, width: 230, stock: 360, safety: 150, colorFam: '暖色系', colors: [c('#f0dcc8'), c('#e2c4a8'), c('#d4ab88')], styles: ['日式', '北欧'], scenes: ['床品', '卧室', '儿童房'], perf: ['亲肤', '保暖', '抗菌'], img: null, hue: 30, sat: 32, views: 1970, salesRank: 19,
    story: 'A类母婴级宝宝绒，像初生婴儿的肌肤般柔软。冬夜里的暖，是最简单也最重要的事。',
    craft: { process: '超细旦纤维经编绒，A类母婴标准，抗菌整理。', fastness: '4级', shrinkage: '≤3%', strength: '经向420N', eco: 'OEKO-TEX' } },
  { sku: 'FZ-002', name: '复古格纹羊毛呢', category: '服装面料', sub: '羊毛呢', price: 145, gsm: 480, width: 150, stock: 150, safety: 150, colorFam: '暖色系', colors: [c('#8a5a3b'), c('#c9a876'), c('#5c4632'), c('#b58a5f')], styles: ['复古', '美式'], scenes: ['服装', '外套'], perf: ['保暖', '抗皱'], img: null, hue: 28, sat: 38, views: 1640, salesRank: 20,
    story: '焦糖色的复古格纹，让人想起老电影里的秋日大衣。厚实的羊毛呢，是寒冬里体面的铠甲。',
    craft: { process: '羊毛混纺粗纺，格纹色织，缩绒起毛整理。', fastness: '4级', shrinkage: '≤3%', strength: '经向780N', eco: 'WOOLMARK' } },
  { sku: 'HL-004', name: '碎花连衣裙面料', category: '服装面料', sub: '印花雪纺', price: 42, gsm: 160, width: 148, stock: 520, safety: 150, colorFam: '暖色系', colors: [c('#e8b4a0'), c('#f4e0d0'), c('#c98a72'), c('#a05f4a')], styles: ['田园', '美式'], scenes: ['服装', '连衣裙'], perf: ['透气', '垂感好'], img: null, hue: 15, sat: 42, views: 1520, salesRank: 24,
    story: '微醺的玫瑰碎花洒在轻透的雪纺上，裙摆一转，就是夏日花园的微风。',
    craft: { process: '涤纶雪纺，数码活性印花，柔软整理。', fastness: '4级', shrinkage: '≤3%', strength: '经向380N', eco: 'OEKO-TEX' } },
  { sku: 'TF-015', name: '条绒男裤面料', category: '服装面料', sub: '条绒', price: 48, gsm: 340, width: 148, stock: 280, safety: 150, colorFam: '大地系', colors: [c('#7a6a50'), c('#a6946f'), c('#54483a')], styles: ['复古', '美式'], scenes: ['服装', '裤装'], perf: ['耐磨', '保暖'], img: null, hue: 40, sat: 25, views: 1290, salesRank: 26,
    story: '宽条的灯芯绒，复古得恰到好处。秋天的男裤，就该有这种温厚的质感。',
    craft: { process: '棉涤混纺割绒，条绒宽度8w，固绒牢靠。', fastness: '4级', shrinkage: '≤3%', strength: '经向620N', eco: 'OEKO-TEX' } },
  { sku: 'ZD-016', name: '珠地面料POLO衫', category: '服装面料', sub: '珠地网眼', price: 32, gsm: 220, width: 185, stock: 680, safety: 150, colorFam: '白色系', colors: [c('#f2f2ee'), c('#c8d4de'), c('#39465a'), c('#8a99a8')], styles: ['现代简约', '意式'], scenes: ['服装', 'T恤'], perf: ['透气', '高弹', '不起球'], img: null, hue: 210, sat: 15, views: 1430, salesRank: 23,
    story: '珠地网眼的透气与挺括，让POLO衫挺拔有型。商务与休闲之间，一件就好。',
    craft: { process: '珠地网眼针织，丝光棉线，防缩定型。', fastness: '4-5级', shrinkage: '≤2%', strength: '顶破380N', eco: 'OEKO-TEX' } },
  { sku: 'MB-017', name: '亚麻棉麻衬衫面料', category: '服装面料', sub: '棉麻', price: 38, gsm: 145, width: 145, stock: 420, safety: 150, colorFam: '大地系', colors: [c('#d8cfbc'), c('#e9e3d4'), c('#bfb49c'), c('#a2977e')], styles: ['日式', '侘寂风'], scenes: ['服装', '衬衫'], perf: ['透气', '亲肤'], img: null, hue: 45, sat: 20, views: 1710, salesRank: 22,
    story: '棉麻的呼吸感，是夏天衬衫最好的礼貌。微皱而不邋遢，松弛而不随便。',
    craft: { process: '亚麻棉混纺，平纹稀织，柔洗处理。', fastness: '4级', shrinkage: '≤5%', strength: '经向350N', eco: 'GOTS' } },
  { sku: 'FZ-023', name: '法兰绒衬衫面料', category: '服装面料', sub: '法兰绒', price: 38, gsm: 200, width: 148, stock: 310, safety: 150, colorFam: '暖色系', colors: [c('#a0522d'), c('#d2956a'), c('#6e3b22')], styles: ['美式', '复古'], scenes: ['服装', '衬衫'], perf: ['保暖', '亲肤'], img: null, hue: 20, sat: 40, views: 1180, salesRank: 28,
    story: '磨毛起绒的法兰绒，格子衬衫的灵魂面料。篝火、咖啡和秋天，一件都不缺。',
    craft: { process: '色织格纹，双面磨毛，绒毛均匀细腻。', fastness: '4级', shrinkage: '≤4%', strength: '经向460N', eco: 'OEKO-TEX' } },
  { sku: 'XZ-024', name: '针织弹力牛仔面料', category: '服装面料', sub: '针织牛仔', price: 45, gsm: 280, width: 150, stock: 450, safety: 150, colorFam: '蓝色系', colors: [c('#3f5d80'), c('#7d97b5'), c('#243c58')], styles: ['现代简约', '美式'], scenes: ['服装', '裤装'], perf: ['高弹', '耐磨'], img: null, hue: 215, sat: 30, views: 1360, salesRank: 25,
    story: '针织结构的牛仔，弹力十足不紧绷。骑行、通勤、遛娃——一条裤子撑起所有日常。',
    craft: { process: '针织静音牛仔，氨纶包芯纱，酵素洗。', fastness: '4级', shrinkage: '≤2%', strength: '顶破420N', eco: 'OEKO-TEX' } },
  { sku: 'CP-027', name: '莫代尔针织T恤面料', category: '服装面料', sub: '莫代尔', price: 35, gsm: 180, width: 185, stock: 550, safety: 150, colorFam: '灰色系', colors: [c('#c8c8cc'), c('#eaeaee'), c('#8e8e96'), c('#54545c')], styles: ['现代简约', '日式'], scenes: ['服装', 'T恤'], perf: ['亲肤', '透气', '高弹'], img: null, hue: 240, sat: 4, views: 1250, salesRank: 27,
    story: '莫代尔的丝滑，贴肤如第二层皮肤。基础款T恤的面料，藏着最日常的讲究。',
    craft: { process: '兰精莫代尔，平纹汗布，双纱高密。', fastness: '4-5级', shrinkage: '≤2%', strength: '顶破360N', eco: 'FSC' } },
  { sku: 'CP-008', name: '新中式祥云织锦缎', category: '装饰面料', sub: '织锦缎', price: 128, gsm: 450, width: 145, stock: 95, safety: 150, colorFam: '蓝色系', colors: [c('#2f4b6e'), c('#c9a86a'), c('#1a2f47'), c('#8a7a52')], styles: ['新中式', '轻奢'], scenes: ['窗帘', '客厅', '书房'], perf: ['垂感好', '抗皱'], img: null, hue: 215, sat: 35, views: 2450, salesRank: 21, clearance: true,
    story: '祥云纹在靛蓝缎面上流转千年，新中式的雅致不必声张。一匹锦缎，半部东方美学。',
    craft: { process: '真丝人丝交织提花，金星点缀，熟幅整理。', fastness: '4级', shrinkage: '≤2%', strength: '经向720N', eco: 'OEKO-TEX' } },
  { sku: 'QT-029', name: '民族风织锦装饰面料', category: '装饰面料', sub: '织锦', price: 135, gsm: 520, width: 145, stock: 80, safety: 150, colorFam: '暖色系', colors: [c('#a0522d'), c('#c9a876'), c('#4a6741'), c('#8a3b2a')], styles: ['复古', '新中式'], scenes: ['窗帘', '客厅', '餐厅'], perf: ['耐磨', '抗皱'], img: null, hue: 22, sat: 45, views: 1480, salesRank: 29, clearance: true,
    story: '多色织锦的浓烈与繁复，是民族审美的热忱表达。作抱枕、做背景帘，一室生辉。',
    craft: { process: '多色纬提花织锦，手绘纹样复原，厚实挺括。', fastness: '4级', shrinkage: '≤2%', strength: '经向840N', eco: 'OEKO-TEX' } },
]

// 区域货架（US-3.1.3：按风格/类别/区域划分存放）
const AREAS = ['A', 'B', 'C', 'D', 'E']
FABRICS.forEach((f, i) => {
  f.location = `${AREAS[i % 5]}区-${f.category.slice(0, 1)}排-${String(Math.floor(i / 5) + 1).padStart(2, '0')}号货架`
})

// 平台账号（US-3.5.1 角色体系）演示账号
export const USERS = [
  { id: 'U1', name: '系统管理员', phone: '13800000001', role: 'admin', region: '华东大区', ip: '58.34.**.**', points: 9999, customerId: null, registeredAt: '2024-01-01' },
  { id: 'U2', name: '美小美', phone: '13800000002', role: 'artist', region: '华东大区', ip: '58.34.**.**', points: 500, customerId: null, registeredAt: '2024-02-10' },
  { id: 'U3', name: '李销售', phone: '13800000003', role: 'sales', region: '华东大区', ip: '58.34.**.**', points: 200, customerId: null, registeredAt: '2024-02-15' },
  { id: 'U4', name: '陈经理', phone: '13800000004', role: 'sales', region: '华南大区', ip: '119.123.**.**', points: 180, customerId: null, registeredAt: '2024-02-20' },
  { id: 'U5', name: '王锦华', phone: '138****6688', role: 'vip', region: '华东大区', ip: '58.34.**.**', points: 100, customerId: 'C01', registeredAt: '2024-03-01' },
  { id: 'U6', name: '张总', phone: '139****3322', role: 'dealer_l1', region: '华南大区', ip: '119.123.**.**', points: 120, customerId: 'C02', registeredAt: '2024-03-05' },
  { id: 'U7', name: '刘芳', phone: '137****8899', role: 'dealer_l2', region: '华中大区', ip: '113.57.**.**', points: 80, customerId: 'C03', registeredAt: '2024-03-08' },
  { id: 'U8', name: '孙老板', phone: '135****7788', role: 'registered', region: '华中大区', ip: '113.57.**.**', points: 0, customerId: 'C05', registeredAt: '2024-03-12' },
]

// 企业客户档案（CRM）
export const CUSTOMERS = [
  { id: 'C01', name: '锦华软装设计公司', contact: '王锦华', phone: '138****6688', tier: 'vip', sales: '李销售', status: '活跃', region: '华东大区', note: '高端样板间项目为主，重质感' },
  { id: 'C02', name: '盛世窗帘批发', contact: '张总', phone: '139****3322', tier: 'l1', sales: '陈经理', status: '活跃', region: '华南大区', note: '窗帘批发走量，对交期敏感' },
  { id: 'C03', name: '雅居布艺生活馆', contact: '刘芳', phone: '137****8899', tier: 'l2', sales: '李销售', status: '活跃', region: '华中大区', note: '门店零售，喜欢日式北欧风' },
  { id: 'C04', name: '云裳高级定制', contact: '赵女士', phone: '136****5566', tier: 'vip', sales: '陈经理', status: '休眠', region: '华东大区', note: '礼服定制工作室，需真丝类' },
  { id: 'C05', name: '和家窗帘店', contact: '孙老板', phone: '135****7788', tier: 'normal', sales: '周业务', status: '活跃', region: '华中大区', note: '社区窗帘店，性价比优先' },
  { id: 'C06', name: '梵品空间设计', contact: '林设计', phone: '133****1122', tier: 'l1', sales: '李销售', status: '活跃', region: '华东大区', note: '软装设计公司，意式轻奢项目' },
  { id: 'C07', name: '美居窗帘工坊', contact: '黄师傅', phone: '132****4455', tier: 'l2', sales: '周业务', status: '停用', region: '西南大区', note: '合作减少，暂停供货' },
  { id: 'C08', name: '悦享酒店集团', contact: '钱经理', phone: '131****2299', tier: 'l1', sales: '陈经理', status: '活跃', region: '华北大会区', note: '酒店工程项目，批量采购' },
]

// 高意向线索（US-3.3.2 询价触发，摒弃购物车）
export const LEADS = [
  { id: 'L001', customerId: 'C08', sku: 'SF-007', qty: 300, note: '酒店翻新项目，含税含运费报价，望3天内回复', img: null, time: '2024-03-27 10:20', status: '跟进中', owner: '陈经理', source: '详情页询价' },
  { id: 'L002', customerId: 'C05', sku: 'CL-030', qty: 30, note: '', img: null, time: '2024-03-26 16:40', status: '待跟进', owner: '李销售', source: '详情页询价' },
]

// 打样单（US-3.3.4：打样单下达 + ERP双向打通，非交易订单）
export const PROOFS = [
  {
    id: 'P001', customerId: 'C01', date: '2024-03-20', status: 'ERP已接收', erpNo: 'ERP-SY-20240320-018',
    note: '新中式样板间项目，希望3月25日前寄出样布',
    items: [{ sku: 'MS-012', qty: 2 }, { sku: 'RS-011', qty: 3 }, { sku: 'CL-006', qty: 5 }],
    progress: [
      { time: '2024-03-20 14:30', who: '平台', what: '打样单提交', detail: '客户提交打样需求' },
      { time: '2024-03-20 14:31', who: '平台→ERP', what: '推送ERP成功', detail: 'ERP单号 ERP-SY-20240320-018' },
      { time: '2024-03-21 09:10', who: 'ERP→平台', what: '进度回传：备货中', detail: 'ERP回传：原料齐套，排产中' },
    ],
  },
  {
    id: 'P002', customerId: 'C08', date: '2024-03-21', status: '已提交', erpNo: '',
    note: '行政楼三层客房沙发布更换，需耐磨防火',
    items: [{ sku: 'SF-026', qty: 10 }, { sku: 'YS-013', qty: 15 }, { sku: 'BO-014', qty: 8 }, { sku: 'SF-007', qty: 12 }],
    progress: [
      { time: '2024-03-21 09:15', who: '平台', what: '打样单提交', detail: '客户提交打样需求' },
    ],
  },
  {
    id: 'P003', customerId: 'C05', date: '2024-03-10', status: '已完成', erpNo: 'ERP-SY-20240310-009',
    note: '新房装修，客厅卧室各打样一款',
    items: [{ sku: 'CL-006', qty: 6 }, { sku: 'CL-020', qty: 4 }],
    progress: [
      { time: '2024-03-10 10:00', who: '平台', what: '打样单提交', detail: '客户提交打样需求' },
      { time: '2024-03-10 10:01', who: '平台→ERP', what: '推送ERP成功', detail: 'ERP单号 ERP-SY-20240310-009' },
      { time: '2024-03-11 15:20', who: 'ERP→平台', what: '进度回传：已寄出', detail: '顺丰寄出，单号SF1234567890' },
      { time: '2024-03-13 11:05', who: '平台', what: '客户确认收样', detail: '打样流程完成' },
    ],
  },
]

// 库存流水（US-3.1.3）
export const FLOWS = [
  { id: 'F001', sku: 'CL-006', type: '入库', qty: 200, person: '张库管', time: '2024-03-28 14:30', note: '季度采购入库，来源：浙江绍兴织造厂' },
  { id: 'F002', sku: 'YS-013', type: '借用', qty: 5, person: '王设计', time: '2024-03-28 09:45', note: '设计部样板间展示借用，预计4月5日归还' },
  { id: 'F003', sku: 'SF-007', type: '出库', qty: 80, person: '张库管', time: '2024-03-27 14:10', note: '订单出库至生产部' },
  { id: 'F004', sku: 'CP-018', type: '领用', qty: 10, person: '李销售', time: '2024-03-26 15:20', note: '销售部样品领用' },
  { id: 'F005', sku: 'XXF-001', type: '入库', qty: 200, person: '张库管', time: '2024-03-20 10:30', note: '季度采购入库，来源：江苏苏州织造厂' },
  { id: 'F006', sku: 'XXF-001', type: '出库', qty: 30, person: '李销售', time: '2024-03-18 14:20', note: '订单出库，客户：锦华软装' },
  { id: 'F007', sku: 'XXF-001', type: '借用', qty: 5, person: '王设计', time: '2024-03-15 09:10', note: '样板间展示借用，预计3月25日归还' },
  { id: 'F008', sku: 'XXF-001', type: '领用', qty: 2, person: '品控部', time: '2024-03-12 16:00', note: '质检留样领用' },
  { id: 'F009', sku: 'XXF-001', type: '转借', qty: 10, person: '李销售', time: '2024-03-10 11:30', note: '转借至：杭州分公司展示厅' },
  { id: 'F010', sku: 'ZS-021', type: '出库', qty: 20, person: '陈经理', time: '2024-03-09 10:00', note: '云裳高级定制订单出库' },
]

// 电子册（US-3.2.1 多维电子画册：故事+成品图+视频位+企划案）
export const EBOOKS = [
  { id: 'E001', name: '意式轻奢客厅方案', customerId: 'C06', skus: ['QS-010', 'YS-013', 'ZK-005'], desc: '面向高端客户的意式轻奢风格客厅面料精选方案', date: '2024-03-10', views: 86, plan: '主推 QS-010 金丝提花：适配意式客厅整屋方案，配套YS-013沙发与ZK-005纱帘组合销售。' },
  { id: 'E002', name: '北欧简约卧室系列', customerId: 'C05', skus: ['CL-006', 'CL-020', 'CM-009'], desc: '北欧风格卧室窗帘与床品面料组合', date: '2024-03-08', views: 64, plan: 'CL-006+CL-020 双层帘搭配主打，CM-009床品联动，主打性价比套餐。' },
  { id: 'E003', name: '美式田园精选', customerId: 'C02', skus: ['MS-012', 'HL-004'], desc: '经典美式田园风格窗帘与沙发面料方案', date: '2024-03-05', views: 42, plan: '' },
]

// 浏览轨迹（US-3.3.1 用户画像）
export const TRACKS = [
  { id: 'T001', userId: 'U5', sku: 'YS-013', action: '浏览', time: '2024-03-28 15:02' },
  { id: 'T002', userId: 'U5', sku: 'QS-010', action: '浏览', time: '2024-03-28 14:58' },
  { id: 'T003', userId: 'U5', sku: 'ZK-005', action: '询价', time: '2024-03-28 14:55' },
  { id: 'T004', userId: 'U6', sku: 'CL-006', action: '浏览', time: '2024-03-28 10:12' },
  { id: 'T005', userId: 'U6', sku: 'CL-020', action: '分享', time: '2024-03-27 17:30' },
  { id: 'T006', userId: 'U8', sku: 'CL-030', action: '询价', time: '2024-03-26 16:40' },
  { id: 'T007', userId: 'U8', sku: 'CL-030', action: '浏览', time: '2024-03-26 16:38' },
]

// AI协同需求（US-3.4.2 后台人工协同生成，固定场景：客厅/卧室）
export const AI_REQUESTS = [
  { id: 'A001', fromUser: 'U3', fromName: '李销售', text: '客户是意式轻奢风格新房，想要客厅窗帘+沙发组合的成品效果', scene: '客厅', sku: 'YS-013', status: '已交付', time: '2024-03-28 10:20', doneAt: '2024-03-28 10:41', cost: 5, resultImg: IMG.sceneCurtainSofa },
  { id: 'A002', fromUser: 'U5', fromName: '王锦华', text: '样板间卧室想要奶油风遮光帘效果', scene: '卧室', sku: 'CL-006', status: '待处理', time: '2024-03-28 16:05', doneAt: '', cost: 0, resultImg: '' },
]

// 算力配置（US-3.4.3：固定场景框死 + 开放对象 + 消耗管控）
export const AI_CONFIG = {
  scenes: ['客厅', '卧室'],
  openRoles: ['sales', 'dealer_l1', 'dealer_l2', 'vip'],
  costPerGen: 5,
  monthlyLimit: 500,
  note: '多图合并生成单次成本预估超10元，固定场景以控制算力；一期仅向业务员/经销商/VIP开放。',
}

export const SALESPEOPLE = ['李销售', '陈经理', '周业务', '王设计']
