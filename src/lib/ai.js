// AI 能力（本地规则引擎演示）：需求匹配 / 产品故事生成 / 以图搜图
import { TAGS } from '../data/seed'

const SYN = {
  客厅: '客厅', 卧室: '卧室', 书房: '书房', 餐厅: '餐厅',
  窗帘: '窗帘', 布帘: '窗帘', 纱帘: '窗帘', 梦幻帘: '窗帘', 百叶: '窗帘',
  沙发: '沙发', 床: '床品', 床品: '床品', 四件套: '床品', 被套: '床品',
  衬衫: '服装', T恤: '服装', t恤: '服装', 裙: '服装', 礼服: '服装', 外套: '服装', 裤: '服装', 衣: '服装',
  儿童: '儿童房', 小孩: '儿童房', 宝宝: '儿童房', 婴儿: '儿童房',
  遮光: '遮光', 防污: '防污', 防水: '防水', 耐磨: '耐磨', 透气: '透气', 抗菌: '抗菌', 抗螨: '抗菌',
  防螨: '抗菌', 抗皱: '抗皱', 垂感: '垂感好', 垂坠: '垂感好', 亲肤: '亲肤', 起球: '不起球', 保暖: '保暖',
  弹力: '高弹', 弹性: '高弹',
}

export function parseIntent(text) {
  const t = (text || '').toLowerCase()
  const intent = { styles: [], scenes: [], perfs: [], categories: [], maxPrice: null, colorHint: null, raw: text }
  TAGS.style.forEach((s) => { if (t.includes(s.toLowerCase())) intent.styles.push(s) })
  TAGS.perf.forEach((p) => { if (t.includes(p)) intent.perfs.push(p) })
  Object.entries(SYN).forEach(([k, v]) => {
    if (t.includes(k)) {
      if (TAGS.scene.includes(v) && !intent.scenes.includes(v)) intent.scenes.push(v)
      if (TAGS.perf.includes(v) && !intent.perfs.includes(v)) intent.perfs.push(v)
    }
  })
  TAGS.category.forEach((cat) => {
    const head = cat.replace('面料', '').replace('布', '')
    if (t.includes(cat) || (head && t.includes(head))) intent.categories.push(cat)
  })
  const m = t.match(/(\d+(\.\d+)?)\s*(元|块|rmb)/)
  if (m) intent.maxPrice = parseFloat(m[1])
  const colors = { 白: '白色系', 灰: '灰色系', 蓝: '蓝色系', 雾霾蓝: '蓝色系', 米: '大地系', 咖: '大地系', 驼: '大地系', 绿: '绿色系', 墨绿: '绿色系', 黑: '黑色系', 红: '暖色系', 橙: '暖色系', 姜黄: '暖色系' }
  Object.entries(colors).forEach(([k, v]) => { if (t.includes(k) && !intent.colorHint) intent.colorHint = v })
  return intent
}

export function matchFabrics(fabrics, intent) {
  const scored = fabrics.map((f) => {
    let score = 0
    const reasons = []
    intent.styles.forEach((s) => { if (f.styles.includes(s)) { score += 3; reasons.push(s) } })
    intent.categories.forEach((cat) => { if (f.category === cat) { score += 3; reasons.push(cat) } })
    intent.scenes.forEach((s) => {
      if (f.scenes.includes(s)) { score += 2.5; reasons.push(s) }
      else if (f.category === '窗帘布' && s === '窗帘') { score += 2.5; reasons.push(s) }
    })
    intent.perfs.forEach((p) => { if (f.perf.includes(p)) { score += 2; reasons.push(p) } })
    if (intent.colorHint && f.colorFam === intent.colorHint) { score += 1.5; reasons.push(intent.colorHint) }
    if (intent.maxPrice != null) {
      if (f.price <= intent.maxPrice) { score += 2.5; reasons.push(`¥${f.price} ≤ 预算¥${intent.maxPrice}`) }
      else score -= 2
    }
    score += Math.min(1.2, (f.views || 0) / 6000)
    return { f, score, reasons: [...new Set(reasons)] }
  })
  return scored.filter((x) => x.score >= 2).sort((a, b) => b.score - a.score).slice(0, 4)
}

export function aiReply(text, fabrics) {
  const intent = parseIntent(text)
  const hits = matchFabrics(fabrics, intent)
  if (!hits.length) {
    return { text: '暂时没找到完全匹配的面料。可以告诉我更多偏好吗？比如：风格（小香风/新中式/北欧…）、用途（窗帘/沙发/床品/服装）、性能（遮光/抗菌/耐磨…）和预算（每米多少元内）。需要成品效果图的话，我会把需求转给后台美工，按固定场景（客厅/卧室）10分钟内出图。', hits: [], intent }
  }
  const parts = []
  if (intent.styles.length) parts.push(`风格「${intent.styles.join('、')}」`)
  if (intent.categories.length) parts.push(`品类「${intent.categories.join('、')}」`)
  if (intent.scenes.length) parts.push(`场景「${intent.scenes.join('、')}」`)
  if (intent.perfs.length) parts.push(`性能「${intent.perfs.join('、')}」`)
  if (intent.maxPrice != null) parts.push(`预算每米 ${intent.maxPrice} 元内`)
  if (intent.colorHint) parts.push(`色系「${intent.colorHint}」`)
  const head = parts.length ? `根据您${parts.join('，')}的需求` : '根据您的需求'
  return { text: `${head}，从面料库中为您精选出 ${hits.length} 款匹配度最高的面料（按综合匹配度排序）。点击面料可查看详情，或一键询价/申请打样。`, hits, intent }
}

export const QUICK_PROMPTS = [
  '客户想要北欧风卧室窗帘面料，预算50元/米内',
  '推荐适合新中式客厅的沙发布，高端质感',
  '找一款抗菌亲肤的儿童房面料',
  '意式轻奢风格，绒面窗帘，垂感好，遮光',
]

// ─── US-3.1.2 AI生成产品故事（结构化：开发背景/目标客群/设计理念）───
export function generateStory(f) {
  const bg = `本款「${f.name}」源于${f.styles[0] || '现代'}美学与${new Date().getFullYear()}季流行趋势的结合。设计团队在${f.craft?.process ? f.craft.process.split('，')[0] : '常规工艺'}基础上反复调校，最终以 ${f.gsm}gsm 克重、${f.width}cm 门幅定型，兼顾视觉表现与实用性能${f.perf.length ? `（${f.perf.join('、')}）` : ''}。`
  const crowd = `目标客群定位为追求${f.styles.join('、') || '品质'}生活方式的家庭与空间设计师：${f.scenes.includes('窗帘') || f.category === '窗帘布' ? '适合中高端家装公司与软装馆渠道的窗帘定制需求' : ''}${f.scenes.includes('沙发') ? '适合成品沙发厂与软装设计项目' : ''}${f.scenes.includes('床品') ? '适合家纺品牌与酒店布草采购' : ''}${f.scenes.includes('服装') ? '适合女装/男装品牌与定制工作室' : ''}。核心客群年龄层 28-45 岁，注重质感与性价比的平衡。`
  const idea = `设计理念上，${f.colorFam}基调传递${f.styles.includes('轻奢') || f.styles.includes('意式') ? '克制而高级的氛围' : f.styles.includes('北欧') || f.styles.includes('日式') ? '自然松弛的居住情绪' : f.styles.includes('复古') || f.styles.includes('美式') ? '经年不褪的经典韵味' : '现代生活的秩序感'}${f.colors?.length ? `，主色参考 ${f.colors[0]}` : ''}。${f.story ? f.story : ''}`
  return `【开发背景】\n${bg}\n\n【目标客群】\n${crowd}\n\n【设计理念】\n${idea}`
}

// ─── US-3.1.4 以图搜图（客户端颜色特征匹配，配合属性筛选）───
export async function extractImageFeature(file) {
  const url = URL.createObjectURL(file)
  const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = url })
  const cv = document.createElement('canvas')
  cv.width = 64; cv.height = 64
  const ctx = cv.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, 64, 64)
  URL.revokeObjectURL(url)
  const d = ctx.getImageData(0, 0, 64, 64).data
  let r = 0, g = 0, b = 0, n = 0
  const hues = {}
  for (let i = 0; i < d.length; i += 4) {
    r += d[i]; g += d[i + 1]; b += d[i + 2]; n++
    const [h, s, l] = rgb2hsl(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255)
    if (s > 0.12 && l > 0.12 && l < 0.9) {
      const bucket = Math.round(h / 30) * 30 % 360
      hues[bucket] = (hues[bucket] || 0) + 1
    }
  }
  const domHue = Number(Object.entries(hues).sort((a, b) => b[1] - a[1])[0]?.[0] || 0)
  return { r: r / n, g: g / n, b: b / n, domHue }
}

export function rgb2hsl(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = (g - b) / d + (g < b ? 6 : 0)
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h * 60, s, l]
}

// 面料主色匹配（离线计算：面料图 → 主色 + 主色相，与上传图特征求距离）
export async function fabricFeature(f) {
  const url = f.img || swatchUrl(f)
  const img = await new Promise((res, rej) => { const i = new Image(); i.crossOrigin = 'anonymous'; i.onload = () => res(i); i.onerror = rej; i.src = url })
  const cv = document.createElement('canvas')
  cv.width = 48; cv.height = 48
  const ctx = cv.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(img, 0, 0, 48, 48)
  const d = ctx.getImageData(0, 0, 48, 48).data
  let r = 0, g = 0, b = 0, n = 0
  const hues = {}
  for (let i = 0; i < d.length; i += 4) {
    r += d[i]; g += d[i + 1]; b += d[i + 2]; n++
    const [h, s, l] = rgb2hsl(d[i] / 255, d[i + 1] / 255, d[i + 2] / 255)
    if (s > 0.12 && l > 0.12 && l < 0.9) {
      const bucket = Math.round(h / 30) * 30 % 360
      hues[bucket] = (hues[bucket] || 0) + 1
    }
  }
  return { r: r / n, g: g / n, b: b / n, domHue: Number(Object.entries(hues).sort((a, b) => b[1] - a[1])[0]?.[0] || 0) }
}

function swatchUrl(f) {
  // 简版纯色样（避免循环依赖 visual.js）
  const cv = document.createElement('canvas')
  cv.width = 48; cv.height = 48
  const ctx = cv.getContext('2d')
  ctx.fillStyle = `hsl(${f.hue ?? 220} ${f.sat ?? 12}% 55%)`
  ctx.fillRect(0, 0, 48, 48)
  return cv.toDataURL()
}

export function imageDistance(a, b) {
  const cd = Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2) // 0~441
  let hd = Math.abs(a.domHue - b.domHue)
  if (hd > 180) hd = 360 - hd
  return cd / 4.41 + hd / 3.6 // 归一化 0~100+
}
