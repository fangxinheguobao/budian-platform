import React, { useMemo, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, Layers, Store, ClipboardList, ShoppingCart, ChevronRight, UserRound } from 'lucide-react'
import AssistantDock from '../components/AssistantDock'
import { useDB, customerById } from '../store/db'
import { TIER_MAP } from '../data/seed'
import { BasketCtx } from '../basket'

export default function ShopLayout() {
  const { db, addRequest } = useDB()
  const nav = useNavigate()
  const [basket, setBasket] = useState([]) // [{sku, qty}]
  const [myId, setMyId] = useState('C06') // 当前登录身份（演示）

  const api = useMemo(() => ({
    basket,
    myId,
    setMyId,
    add: (sku, qty = 10) => setBasket((b) => {
      const i = b.findIndex((x) => x.sku === sku)
      if (i >= 0) { const n = [...b]; n[i] = { ...n[i], qty: n[i].qty + qty }; return n }
      return [...b, { sku, qty }]
    }),
    setQty: (sku, qty) => setBasket((b) => b.map((x) => (x.sku === sku ? { ...x, qty: Math.max(1, qty) } : x))),
    remove: (sku) => setBasket((b) => b.filter((x) => x.sku !== sku)),
    clear: () => setBasket([]),
    // 申请样品：直接生成一条选样需求进入管理端队列
    addRequest: (sku, qty, note = '') => {
      const f = db.fabrics.find((x) => x.sku === sku)
      addRequest({
        title: `样品申请 · ${f?.name || sku}`,
        customerId: myId,
        sales: '待分配',
        note: note || '用户端商城提交的样品申请',
        items: [{ sku, qty }],
        who: db.customers.find((c) => c.id === myId)?.contact || '客户',
      })
    },
  }), [basket, myId, db, addRequest])

  const me = customerById(db, myId)
  const basketCount = basket.reduce((a, b) => a + 1, 0)

  return (
    <BasketCtx.Provider value={api}>
      <div className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-30 bg-cotton/90 backdrop-blur border-b border-linen-200">
          <div className="max-w-[1280px] mx-auto px-6 h-[62px] flex items-center gap-7">
            <button className="flex items-center gap-2.5" onClick={() => nav('/shop')}>
              <img src="./favicon.svg" alt="布典" className="w-9 h-9" />
              <div className="text-left">
                <div className="font-display font-bold text-[17px] leading-tight">布典人生</div>
                <div className="text-[10px] text-ink-300 tracking-[.2em]">面料数字选样平台</div>
              </div>
            </button>
            <nav className="flex items-center gap-1">
              {[
                { to: '/shop', label: '首页', icon: Home, end: true },
                { to: '/shop/fabrics', label: '面料库', icon: Layers },
                { to: '/shop/mall', label: 'B2B 商城', icon: Store },
                { to: '/shop/my-samples', label: '我的选样', icon: ClipboardList },
              ].map(({ to, label, icon: Icon, end }) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) => `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-ink-500 hover:bg-linen-200/70'}`}>
                  <Icon size={15} /> {label}
                </NavLink>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2.5">
              <button className="relative btn-ghost !py-2" onClick={() => nav('/shop/mall')} title="询价篮">
                <ShoppingCart size={15} />
                {basketCount > 0 && <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] rounded-full bg-clay-400 text-white text-[10px] flex items-center justify-center px-1">{basketCount}</span>}
              </button>
              <div className="flex items-center gap-2 rounded-lg border border-linen-300 bg-cotton px-2.5 py-1.5">
                <UserRound size={14} className="text-ink-300" />
                <select className="text-[12.5px] bg-transparent outline-none cursor-pointer" value={myId} onChange={(e) => setMyId(e.target.value)}>
                  {db.customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                <span className="badge bg-clay-100 text-clay-600">{TIER_MAP[me?.tier]?.priceTier}</span>
              </div>
              <button className="btn-ghost !py-2" onClick={() => nav('/admin')}>管理端 <ChevronRight size={13} /></button>
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>

        <footer className="border-t border-linen-200 bg-cotton mt-10">
          <div className="max-w-[1280px] mx-auto px-6 py-8 flex items-start justify-between gap-8">
            <div>
              <div className="font-display font-bold">布典人生 · 面料数字选样平台</div>
              <p className="text-xs text-ink-400 mt-2 max-w-md leading-relaxed">面料数字资产为底座，打通样品管理、AI展示、销售服务与客户转化。让销售随时查、客户自己看，打破时空限制减少重复沟通。</p>
            </div>
            <div className="text-xs text-ink-300 leading-loose">
              <div>客户服务热线 400-800-0000</div>
              <div>工作日 9:00 - 18:00</div>
              <div>© 2026 布典人生 v5.0 演示环境</div>
            </div>
          </div>
        </footer>
      </div>
      <AssistantDock mode="shop" />
    </BasketCtx.Provider>
  )
}
