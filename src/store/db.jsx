import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import * as seed from '../data/seed'

const DB_KEY = 'budian_v5_db'

function freshDB() {
  return {
    fabrics: structuredClone(seed.FABRICS),
    customers: structuredClone(seed.CUSTOMERS),
    requests: structuredClone(seed.REQUESTS),
    flows: structuredClone(seed.FLOWS),
    ebooks: structuredClone(seed.EBOOKS),
    inquiries: structuredClone(seed.INQUIRIES),
    tags: structuredClone(seed.TAGS),
    seq: { flow: 100, request: 100, ebook: 100, inquiry: 100, customer: 100, timeline: 0 },
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

export function DBProvider({ children }) {
  const [db, setDb] = useState(load)
  const first = useRef(true)

  useEffect(() => {
    if (first.current) { first.current = false }
    localStorage.setItem(DB_KEY, JSON.stringify(db))
  }, [db])

  const api = useMemo(() => {
    const patch = (fn) => setDb((d) => {
      const next = structuredClone(d)
      fn(next)
      return next
    })
    return {
      db,
      reset: () => setDb(freshDB()),

      // 面料
      upsertFabric(f) {
        patch((d) => {
          const i = d.fabrics.findIndex((x) => x.sku === f.sku)
          if (i >= 0) d.fabrics[i] = { ...d.fabrics[i], ...f }
          else d.fabrics.unshift(f)
        })
      },
      removeFabric(sku) {
        patch((d) => { d.fabrics = d.fabrics.filter((x) => x.sku !== sku) })
      },
      trackView(sku) {
        patch((d) => {
          const f = d.fabrics.find((x) => x.sku === sku)
          if (f) f.views = (f.views || 0) + 1
        })
      },

      // 库存：入库/出库/借用/领用/转借（出借方向减库存，入库方向加库存）
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

      // 客户
      upsertCustomer(cu) {
        patch((d) => {
          const i = d.customers.findIndex((x) => x.id === cu.id)
          if (i >= 0) d.customers[i] = { ...d.customers[i], ...cu }
          else d.customers.unshift(cu)
        })
      },
      removeCustomer(id) {
        patch((d) => { d.customers = d.customers.filter((x) => x.id !== id) })
      },

      // 选样需求
      addRequest(req) {
        let id = ''
        patch((d) => {
          id = 'R' + d.seq.request++
          const firstEntry = { time: now(), who: req.who || '客户', what: '需求提交 · 待处理', detail: req.note || '' }
          d.requests.unshift({
            id,
            status: '待处理',
            date: today(),
            ...req,
            timeline: [firstEntry],
          })
        })
        return id
      },
      updateRequest(id, fields) {
        patch((d) => {
          const r = d.requests.find((x) => x.id === id)
          if (r) Object.assign(r, fields)
        })
      },
      requestAct(id, what, detail, who = '李销售') {
        patch((d) => {
          const r = d.requests.find((x) => x.id === id)
          if (!r) return
          r.timeline.push({ time: now(), who, what, detail: detail || '' })
          if (what === '标记完成') r.status = '已完成'
          else if (r.status === '待处理') r.status = '处理中'
        })
      },

      // 电子册
      createEbook(eb) {
        let id = ''
        patch((d) => {
          id = 'E' + d.seq.ebook++
          d.ebooks.unshift({ id, date: today(), views: 0, ...eb })
        })
        return id
      },
      removeEbook(id) {
        patch((d) => { d.ebooks = d.ebooks.filter((x) => x.id !== id) })
      },
      updateEbook(id, fields) {
        patch((d) => {
          const e = d.ebooks.find((x) => x.id === id)
          if (e) Object.assign(e, fields)
        })
      },
      trackEbook(id) {
        patch((d) => {
          const e = d.ebooks.find((x) => x.id === id)
          if (e) e.views += 1
        })
      },

      // B2B 询价单
      addInquiry(q) {
        let id = ''
        patch((d) => {
          id = 'Q' + d.seq.inquiry++
          d.inquiries.unshift({ id, date: today(), status: '待处理', ...q })
        })
        return id
      },
      updateInquiry(id, fields) {
        patch((d) => {
          const q = d.inquiries.find((x) => x.id === id)
          if (q) Object.assign(q, fields)
        })
      },

      // 标签
      addTag(dim, tag) {
        patch((d) => {
          if (!d.tags[dim].includes(tag)) d.tags[dim].push(tag)
        })
      },
      removeTag(dim, tag) {
        patch((d) => { d.tags[dim] = d.tags[dim].filter((t) => t !== tag) })
      },
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

export function customerById(db, id) {
  return db.customers.find((c) => c.id === id)
}

export function priceFor(fabric, tier) {
  const d = seed.TIER_MAP[tier]?.discount ?? 1
  return Math.round(fabric.price * d)
}
