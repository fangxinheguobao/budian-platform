import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Layers, BookOpen, Users, ClipboardList, Tags,
  Wand2, Store, QrCode, RotateCcw, ChevronRight, Scissors,
} from 'lucide-react'
import AssistantDock from '../components/AssistantDock'
import { useDB } from '../store/db'
import { qrDataUri } from '../lib/visual'

const NAV = [
  { to: '/admin', label: '工作台', icon: LayoutDashboard, end: true },
  { to: '/admin/fabrics', label: '面料库', icon: Layers },
  { to: '/admin/inventory', label: '样料库存', icon: Scissors },
  { to: '/admin/ebooks', label: '电子册', icon: BookOpen },
  { to: '/admin/customers', label: '客户管理', icon: Users },
  { to: '/admin/sample-lists', label: '客户选样', icon: ClipboardList },
  { to: '/admin/inquiries', label: 'B2B询价单', icon: Store },
  { to: '/admin/tags', label: '标签体系', icon: Tags },
  { to: '/admin/rehash', label: 'AI换布演示', icon: Wand2 },
]

export default function AdminLayout() {
  const nav = useNavigate()
  return (
    <div className="min-h-screen flex">
      <aside className="w-[218px] shrink-0 bg-ink-900 text-linen-100 flex flex-col sticky top-0 h-screen">
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <img src="./favicon.svg" alt="布典" className="w-9 h-9" />
            <div>
              <div className="font-display font-bold text-[17px] leading-tight tracking-wide">布典人生</div>
              <div className="text-[10.5px] text-linen-100/50 tracking-[.18em]">管理端 · 面料协同平台</div>
            </div>
          </div>
        </div>
        <div className="weave-divider mx-5 !opacity-20" />
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-auto">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[13.5px] transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-card'
                    : 'text-linen-100/70 hover:bg-white/10 hover:text-linen-50'
                }`}
            >
              <Icon size={16.5} strokeWidth={1.9} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => nav('/shop')}
            className="w-full flex items-center justify-between rounded-lg bg-white/10 hover:bg-white/15 transition px-3.5 py-2.5 text-[13px] text-linen-100"
          >
            <span className="flex items-center gap-2"><Store size={15} /> 切换到用户端</span>
            <ChevronRight size={14} />
          </button>
          <div className="flex items-center gap-2.5 px-2.5 pt-3 pb-1">
            <div className="w-8 h-8 rounded-full bg-clay-400 flex items-center justify-center font-display font-bold text-sm">管</div>
            <div className="leading-tight">
              <div className="text-[12.5px] font-medium">管理员</div>
              <div className="text-[10.5px] text-linen-100/40">admin@budian.com</div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-linen-100/85 backdrop-blur border-b border-linen-200">
          <div className="px-7 h-[58px] flex items-center gap-4">
            <div className="font-display font-bold text-ink-500 text-sm tracking-wide">面料管理协同平台</div>
            <div className="ml-auto flex items-center gap-2">
              <ResetBtn />
              <QrBtn />
            </div>
          </div>
        </header>
        <main className="flex-1 px-7 py-6 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
        <footer className="px-7 py-4 text-[11px] text-ink-300 border-t border-linen-200">
          布典人生 v5.0 · 面料数字资产为底座，打通样品管理、AI展示、销售服务与客户转化 · 演示数据存储于浏览器本地
        </footer>
      </div>

      <AssistantDock mode="sales" />
    </div>
  )
}

function ResetBtn() {
  const { reset } = useDB()
  const [done, setDone] = useState(false)
  return (
    <button
      className="btn-ghost !py-1.5"
      onClick={() => {
        if (window.confirm('确定重置为初始演示数据？当前所有改动（库存操作/需求/询价单等）将被清除。')) {
          reset()
          setDone(true)
          setTimeout(() => setDone(false), 1500)
        }
      }}
    >
      <RotateCcw size={14} /> {done ? '已重置' : '重置演示数据'}
    </button>
  )
}

function QrBtn() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button className="btn-ghost !py-1.5" onClick={() => setOpen(true)}><QrCode size={14} /> 扫码查料</button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center fadein" style={{ background: 'rgba(34,38,45,.4)' }} onClick={() => setOpen(false)}>
          <div className="card popup p-6 text-center" onClick={(e) => e.stopPropagation()}>
            <div className="font-display font-bold mb-1">扫码查料</div>
            <p className="text-xs text-ink-400 mb-4">现场扫码即可调取面料电子档案（演示二维码）</p>
            <img src={qrDataUri('budian-scan-demo')} alt="qr" className="w-44 h-44 mx-auto rounded-lg border border-linen-200" />
            <div className="text-[11px] text-ink-300 mt-3">实际部署后：客户扫描样料二维码 → 自动打开对应面料详情</div>
            <button className="btn-primary mt-4" onClick={() => setOpen(false)}>知道了</button>
          </div>
        </div>
      )}
    </>
  )
}
