// 客户画像分析引擎：行为轨迹聚合 → 意向度评分 + 偏好分析 + 跟进建议（US-3.3.1）
const ACTION_WEIGHT = { 浏览: 1, 收藏: 3, 分享: 2, 分享访问: 2, 询价: 5, 打样: 6, AI需求: 4 }

export function analyzeCustomer(db, customerId) {
  const customer = db.customers.find((c) => c.id === customerId)
  const user = db.users.find((u) => u.customerId === customerId)
  const tracks = user ? db.tracks.filter((t) => t.userId === user.id) : []
  const leads = db.leads.filter((l) => l.customerId === customerId)
  const proofs = db.proofs.filter((p) => p.customerId === customerId)

  const stats = { 浏览: 0, 收藏: 0, 分享: 0, 分享访问: 0, 询价: 0, 打样: 0, AI需求: 0 }
  let score = 0
  const skuAgg = {} // sku -> {count, actions:Set}
  tracks.forEach((t) => {
    if (stats[t.action] != null) stats[t.action]++
    score += ACTION_WEIGHT[t.action] || 1
    skuAgg[t.sku] = skuAgg[t.sku] || { count: 0, actions: new Set() }
    skuAgg[t.sku].count++
    skuAgg[t.sku].actions.add(t.action)
  })
  leads.forEach((l) => { score += l.status === '已成交' ? 10 : 3 })
  proofs.forEach((p) => { score += 4 })

  // 偏好聚合：轨迹涉及面料的风格/品类/色系/性能加权（收藏、询价权重更高）
  const dim = (get) => {
    const m = {}
    Object.entries(skuAgg).forEach(([sku, info]) => {
      const f = db.fabrics.find((x) => x.sku === sku)
      if (!f) return
      const w = (info.actions.has('询价') ? 3 : info.actions.has('收藏') ? 2 : 1) * info.count
      get(f).forEach((v) => { m[v] = (m[v] || 0) + w })
    })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }
  const prefs = {
    styles: dim((f) => f.styles).slice(0, 4),
    categories: dim((f) => [f.category]).slice(0, 3),
    colors: dim((f) => [f.colorFam]).slice(0, 3),
    perfs: dim((f) => f.perf).slice(0, 4),
  }
  const viewed = Object.keys(skuAgg).map((s) => db.fabrics.find((x) => x.sku === s)).filter(Boolean)
  const avgPrice = viewed.length ? Math.round(viewed.reduce((s, f) => s + f.price, 0) / viewed.length) : 0

  const level = score >= 15 ? '高意向' : score >= 8 ? '中意向' : '低意向'
  const levelCls = score >= 15 ? 'bg-clay-500 text-white' : score >= 8 ? 'bg-indigo-50 text-indigo-600' : 'bg-linen-200 text-ink-400'

  // 跟进建议
  const suggestions = []
  if (leads.some((l) => l.status === '待跟进')) suggestions.push(`有 ${leads.filter((l) => l.status === '待跟进').length} 条询价待跟进，建议 24 小时内响应（高意向信号）`)
  if (prefs.styles[0]) suggestions.push(`客户偏好「${prefs.styles[0][0]}」风格，沟通时优先展示该系列`)
  if (prefs.colors[0]) suggestions.push(`关注色系集中在「${prefs.colors.map((x) => x[0]).join('、')}」，可推送对应色卡与场景图`)
  if (avgPrice) suggestions.push(`关注面料均价约 ¥${avgPrice}/米，报价时按「${customer ? { vip: 'A类专属价', l1: 'B类经销价', l2: 'C类经销价', normal: '标准价' }[customer.tier] || '标准价' : '标准价'}」档位切入`)
  if (stats.AI需求) suggestions.push('客户使用过 AI 成品效果生成，可在跟进时附上效果图强化感知')
  if (level === '高意向') suggestions.push('综合意向度高，建议列入本周必访清单')

  // 推荐面料：偏好风格匹配 + 未浏览过 + 畅销优先
  const viewedSet = new Set(Object.keys(skuAgg))
  const styleTops = prefs.styles.map((s) => s[0])
  const recommend = db.fabrics
    .filter((f) => !viewedSet.has(f.sku))
    .map((f) => ({ f, s: f.styles.filter((y) => styleTops.includes(y)).length * 2 + (prefs.categories.some(([c]) => c === f.category) ? 1.5 : 0) + (prefs.perfs.some(([p]) => f.perf.includes(p)) ? 1 : 0) - f.salesRank * 0.01 }))
    .sort((a, b) => b.s - a.s).slice(0, 3).map((x) => x.f)

  return { customer, user, tracks, leads, proofs, stats, score, level, levelCls, prefs, avgPrice, suggestions, recommend }
}

// 全员意向度排行
export function rankCustomers(db) {
  return db.customers
    .map((c) => ({ c, a: analyzeCustomer(db, c.id) }))
    .filter((x) => x.a.user) // 仅平台注册用户有轨迹
    .sort((a, b) => b.a.score - a.a.score)
}
