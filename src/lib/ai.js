// AI 选样助手 —— 本地规则引擎（演示）：解析需求关键词 → 匹配面料 → 输出推荐
import { TAGS } from '../data/seed'

const SYN = {
  // 意图 → 标签同义词
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
  TAGS.perf.forEach((p) => {
    if (t.includes(p)) intent.perfs.push(p)
  })
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
  Object.entries(colors).forEach(([k, v]) => {
    if (t.includes(k) && !intent.colorHint) intent.colorHint = v
  })
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
    score += Math.min(1.2, (f.views || 0) / 6000) // 人气微调
    return { f, score, reasons: [...new Set(reasons)] }
  })
  return scored.filter((x) => x.score >= 2).sort((a, b) => b.score - a.score).slice(0, 4)
}

// 生成一条助手回复
export function aiReply(text, fabrics) {
  const intent = parseIntent(text)
  const hits = matchFabrics(fabrics, intent)
  if (!hits.length) {
    return {
      text: '暂时没找到完全匹配的面料。可以告诉我更多偏好吗？比如：风格（小香风/新中式/北欧…）、用途（窗帘/沙发/床品/服装）、性能（遮光/抗菌/耐磨…）和预算（每米多少元内）。',
      hits: [],
      intent,
    }
  }
  const parts = []
  if (intent.styles.length) parts.push(`风格「${intent.styles.join('、')}」`)
  if (intent.categories.length) parts.push(`品类「${intent.categories.join('、')}」`)
  if (intent.scenes.length) parts.push(`场景「${intent.scenes.join('、')}」`)
  if (intent.perfs.length) parts.push(`性能「${intent.perfs.join('、')}」`)
  if (intent.maxPrice != null) parts.push(`预算每米 ${intent.maxPrice} 元内`)
  if (intent.colorHint) parts.push(`色系「${intent.colorHint}」`)

  const head = parts.length ? `根据您${parts.join('，')}的需求` : '根据您的需求'
  const text2 = `${head}，从面料库中为您精选出 ${hits.length} 款匹配度最高的面料（按综合匹配度排序）。点击面料可直接查看详情，或一键生成选样清单发给客户确认。`
  return { text: text2, hits, intent }
}

export const QUICK_PROMPTS = [
  '客户想要北欧风卧室窗帘面料，预算50元/米内',
  '推荐适合新中式客厅的沙发布，高端质感',
  '找一款抗菌亲肤的儿童房面料',
  '意式轻奢风格，绒面窗帘，垂感好，遮光',
]
