import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import * as seed from '../data/seed'

const DB_KEY = 'budian_v6_db'
const SESSION_KEY = 'budian_v6_session'

function freshDB() {
  return {
    fabrics: structuredClone(seed.FABRICS),
    customers: structuredClone(seed.CUSTOMERS),
    users: structuredClone(seed.USERS),
    leads: structuredClone(seed.LEADS),
    proofs: structuredClone(seed.PROOFS),
    flows: structuredClone(seed.FLOWS),
    ebooks: structuredClone(seed.EBOOKS),
    tracks: structuredClone(seed.TRACKS),
    aiRequests: structuredClone(seed.AI_REQUESTS),
    aiConfig: structuredClone(seed.AI_CONFIG),
    tags: structuredClone(seed.TAGS),
    seq: { flow: 100, proof: 100, ebook: 100, lead: 100, customer: 100, user: 100, track: 100, ai: 100 },
  }
}

function load() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const db = JSON.parse(raw)
      if (db && db.fabrics?.length) return db
    }
  } catch (e) { /* fallthrough */ }
  return freshDB()
}

const Ctx = createContext(null)
export const useDB = () => useContext(Ctx)

const now = () => {
  const d = new Date()
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}
export const today = () => now().slice(0, 10)

// 会话（US-3.3.1 准入机制 + US-3.4.5 权限开关区隔）
export function useSession() {
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })
  const login = (user) => {
    const s = { userId: user.id, name: user.name, role: user.role, customerId: user.customerId, at: now() }
    localStorage.setItem(SESSION_KEY, JSON.stringify(s))
    setSession(s)
  }
  const logout = () => { localStorage.removeItem(SESSION_KEY); setSession(null) }
  return { session, login, logout }
}

export function DBProvider({ children }) {
  const [db, setDb] = useState(load)
  useEffect(() => { localStorage.setItem(DB_KEY, JSON.stringify(db)) }, [db])

  const api = useMemo(() => {
    const patch = (fn) => setDb((d) => {
      const next = structuredClone(d)
      fn(next)
      return next
    })
    return {
      db,
      reset: () => { localStorage.removeItem(SESSION_KEY); setDb(freshDB()) },

      // 会话相关
      currentUser(session) {
        if (!session) return null
        return db.users.find((u) => u.id === session.userId) || null
      },
      userById(id) { return db.users.find((u) => u.id === id) },

      // 面料
      upsertFabric(f) {
        patch((d) => {
          const i = d.fabrics.findIndex((x) => x.sku === f.sku)
          if (i >= 0) d.fabrics[i] = { ...d.fabrics[i], ...f }
          else d.fabrics.unshift(f)
        })
      },
      removeFabric(sku) { patch((d) => { d.fabrics = d.fabrics.filter((x) => x.sku !== sku) }) },
      trackView(sku) { patch((d) => { const f = d.fabrics.find((x) => x.sku === sku); if (f) f.views = (f.views || 0) + 1 }) },

      // 浏览轨迹（US-3.3.1：画像）
      addTrack(sku, action, session) {
        patch((d) => {
          d.tracks.unshift({ id: 'T' + d.seq.track++, userId: session?.userId || 'guest', sku, action, time: now() })
        })
      },

      // 库存（US-3.1.3 流转）
      addFlow({ sku, type, qty, person, note }) {
        patch((d) => {
          const f = d.fabrics.find((x) => x.sku === sku)
          if (f) {
            if (type === '入库' || type === '归还') f.stock += qty
            else f.stock = Math.max(0, f.stock - qty)
          }
          d.flows.unshift({ id: 'F' + d.seq.flow++, sku, type, qty, person, note, time: now() })
        })
      },

      // 客户 CRM
      upsertCustomer(cu) {
        patch((d) => {
          const i = d.customers.findIndex((x) => x.id === cu.id)
          if (i >= 0) d.customers[i] = { ...d.customers[i], ...cu }
          else d.customers.unshift(cu)
        })
      },

      // 注册（US-3.3.1 准入与留资）
      register({ name, phone, company }) {
        let userId = ''
        patch((d) => {
          const region = seed.DEMO_IPS[Math.floor(Math.random() * seed.DEMO_IPS.length)]
          userId = 'U' + d.seq.user++
          d.users.unshift({ id: userId, name: name || phone, phone, role: 'registered', region: region.region, ip: region.ip, points: 0, customerId: null, registeredAt: today(), company })
        })
        return userId
      },

      // 线索（US-3.3.2 询价触发推送）
      addLead({ customerId, sku, qty, note, img, source, owner }) {
        let id = ''
        patch((d) => {
          id = 'L' + d.seq.lead++
          d.leads.unshift({ id, customerId, sku, qty: qty || 0, note: note || '', img: img || null, time: now(), status: '待跟进', owner: owner || '待分配', source: source || '详情页询价' })
        })
        return id
      },
      updateLead(id, fields) {
        patch((d) => { const l = d.leads.find((x) => x.id === id); if (l) Object.assign(l, fields) })
      },

      // 打样单（US-3.3.4 双向ERP）
      addProof({ customerId, items, note }) {
        let id = ''
        patch((d) => {
          id = 'P' + d.seq.proof++
          d.proofs.unshift({
            id, customerId, date: today(), status: '已提交', erpNo: '', note: note || '', items,
            progress: [{ time: now(), who: '平台', what: '打样单提交', detail: '客户提交打样需求' }],
          })
        })
        return id
      },
      pushToErp(id) {
        patch((d) => {
          const p = d.proofs.find((x) => x.id === id)
          if (!p || p.erpNo) return
          p.erpNo = `ERP-SY-${p.date.replace(/-/g, '')}-0${Math.floor(Math.random() * 90 + 10)}`
          p.status = 'ERP已接收'
          p.progress.push({ time: now(), who: '平台→ERP', what: '推送ERP成功', detail: `ERP单号 ${p.erpNo}` })
        })
      },
      erpSync(id, text) {
        patch((d) => {
          const p = d.proofs.find((x) => x.id === id)
          if (!p || !p.erpNo) return
          p.progress.push({ time: now(), who: 'ERP→平台', what: `进度回传：${text}`, detail: 'ERP接口反向传送' })
          if (text === '已寄出' || text === '已完成') p.status = '已完成'
          else if (p.status === 'ERP已接收') p.status = '生产中'
        })
      },
      manualProgress(id, text) {
        patch((d) => {
          const p = d.proofs.find((x) => x.id === id)
          if (!p) return
          p.progress.push({ time: now(), who: '后台人工兜底', what: '人工录入进度', detail: text || 'ERP接口不可用，人工维护' })
        })
      },

      // 电子册
      createEbook(eb) {
        let id = ''
        patch((d) => {
          id = 'E' + d.seq.ebook++
          d.ebooks.unshift({ id, date: today(), views: 0, plan: '', ...eb })
        })
        return id
      },
      updateEbook(id, fields) {
        patch((d) => { const e = d.ebooks.find((x) => x.id === id); if (e) Object.assign(e, fields) })
      },
      removeEbook(id) { patch((d) => { d.ebooks = d.ebooks.filter((x) => x.id !== id) }) },
      trackEbook(id) { patch((d) => { const e = d.ebooks.find((x) => x.id === id); if (e) e.views += 1 }) },

      // AI协同（US-3.4.2 / 3.4.3）
      addAiRequest({ fromUser, fromName, text, scene, sku }) {
        let id = ''
        patch((d) => {
          id = 'A' + d.seq.ai++
          d.aiRequests.unshift({ id, fromUser, fromName, text, scene, sku, status: '待处理', time: now(), doneAt: '', cost: 0, resultImg: '' })
        })
        return id
      },
      deliverAi(id, resultImg, costPerGen) {
        patch((d) => {
          const a = d.aiRequests.find((x) => x.id === id)
          if (!a) return
          a.status = '已交付'
          a.doneAt = now()
          a.resultImg = resultImg || ''
          a.cost = costPerGen || 0
          const u = d.users.find((x) => x.id === a.fromUser)
          if (u) u.points = Math.max(0, (u.points || 0) - (costPerGen || 0))
        })
      },
      updateAiConfig(fields) {
        patch((d) => { Object.assign(d.aiConfig, fields) })
      },

      // 用户与角色（US-3.5.1）
      updateUserRole(id, role) {
        patch((d) => { const u = d.users.find((x) => x.id === id); if (u) u.role = role })
      },
      addTag(dim, tag) { patch((d) => { if (!d.tags[dim].includes(tag)) d.tags[dim].push(tag) }) },
      removeTag(dim, tag) { patch((d) => { d.tags[dim] = d.tags[dim].filter((t) => t !== tag) }) },
    }
  }, [db])

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

// 派生工具
export function fabricStatus(f) {
  if (!f) return { label: '未知', cls: 'bg-linen-200 text-ink-500' }
  if (f.stock <= 0) return { label: '无库存', cls: 'bg-ink-900/85 text-linen-50' }
  if (f.stock < f.safety * 0.6) return { label: '库存告急', cls: 'bg-clay-500 text-white' }
  if (f.stock < f.safety) return { label: '库存偏低', cls: 'bg-clay-200 text-clay-600' }
  return { label: '在库充足', cls: 'bg-indigo-50 text-indigo-600' }
}

export function customerById(db, id) { return db.customers.find((c) => c.id === id) }
export function priceFor(fabric, tier) {
  const d = seed.TIER_MAP[tier]?.discount ?? 1
  return Math.round(fabric.price * d)
}
