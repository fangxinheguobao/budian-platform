import React from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Home, Layers, Store, FileText, Target, ChevronRight, LogOut, UserRound } from 'lucide-react'
import AssistantDock from '../components/AssistantDock'
import { useDB } from '../store/db'
import { useAuth } from '../auth'
import { TIER_MAP } from '../data/seed'

// 用户端（自助端）：与销售端同一套系统，权限开关区隔（US-3.4.5）
export default function ShopLayout() {
  const { db } = useDB()
  const { user, logout, roleLabel } = useAuth()
  const nav = useNavigate()
  const customer = db.customers.find((c) => c.id === user?.customerId)

  return (
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
              { to: '/shop/proofs', label: '我的打样', icon: FileText },
              { to: '/shop/my-leads', label: '我的询价', icon: Target },
            ].map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end}
                className={({ isActive }) => `flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-[13.5px] font-medium transition ${isActive ? 'text-indigo-600 bg-indigo-50' : 'text-ink-500 hover:bg-linen-200/70'}`}>
                <Icon size={15} /> {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-lg border border-linen-300 bg-cotton px-2.5 py-1.5">
              <UserRound size={14} className="text-ink-300" />
              <span className="text-[12.5px]">{user?.name}</span>
              <span className="badge bg-clay-100 text-clay-600">{customer ? TIER_MAP[customer.tier]?.priceTier : roleLabel}</span>
            </div>
            {['admin', 'sales'].includes(user?.role) && (
              <button className="btn-ghost !py-2" onClick={() => nav('/admin')}>管理端 <ChevronRight size={13} /></button>
            )}
            <button className="btn-ghost !py-2" onClick={() => { logout(); nav('/') }}><LogOut size={14} /></button>
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
            <p className="text-xs text-ink-400 mt-2 max-w-md leading-relaxed">面料数字资产为底座，打通样料管理、电子画册、B2B获客与AI协同。库存等敏感数据按角色隔离，询价即时推送业务员跟进。</p>
          </div>
          <div className="text-xs text-ink-300 leading-loose">
            <div>客户服务热线 400-800-0000</div>
            <div>工作日 9:00 - 18:00</div>
            <div>© 2026 布典人生 v6.0 演示环境</div>
          </div>
        </div>
      </footer>
      <AssistantDock mode="shop" />
    </div>
  )
}
