import React, { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Layers, BookOpen, Users, Tags,
  Wand2, QrCode, RotateCcw, ChevronRight, Scissors, Target, FileText, ClipboardList, Settings2, LogOut,
} from 'lucide-react'
import AssistantDock from '../components/AssistantDock'
import { useDB } from '../store/db'
import { useAuth } from '../auth'
import { qrDataUri } from '../lib/visual'
import { ROLES } from '../data/seed'

// 导航按角色过滤（US-3.5.1 权限开关区隔）
const NAV = [
  { to: '/admin', label: '工作台', icon: LayoutDashboard, end: true, roles: ['admin', 'sales', 'artist'] },
  { to: '/admin/fabrics', label: '面料库', icon: Layers, roles: ['admin', 'sales'] },
  { to: '/admin/inventory', label: '样料库存', icon: Scissors, roles: ['admin', 'sales'] },
  { to: '/admin/ebooks', label: '电子画册', icon: BookOpen, roles: ['admin', 'sales'] },
  { to: '/admin/customers', label: '客户画像', icon: Users, roles: ['admin', 'sales'] },
  { to: '/admin/leads', label: '询价线索', icon: Target, roles: ['admin', 'sales'] },
  { to: '/admin/proofs', label: '打样管理', icon: ClipboardList, roles: ['admin', 'sales'] },
  { to: '/admin/ai-studio', label: 'AI协同工作台', icon: Wand2, roles: ['admin', 'artist'] },
  { to: '/admin/reports', label: '报表中心', icon: FileText, roles: ['admin', 'sales'] },
  { to: '/admin/tags', label: '标签体系', icon: Tags, roles: ['admin'] },
  { to: '/admin/system', label: '系统管理', icon: Settings2, roles: ['admin'] },
]

export default function AdminLayout() {
  const nav = useNavigate()
  const { user, logout, roleLabel } = useAuth()
  const { reset } = useDB()
  const role = user?.role || 'sales'
  const navs = NAV.filter((n) => n.roles.includes(role))

  // 非管理端角色（VIP/经销商/注册客户）自动回到用户端（US-3.4.5 权限区隔）
  React.useEffect(() => {
    if (!['admin', 'artist', 'sales'].includes(role)) nav('/shop', { replace: true })
  }, [role, nav])

  return (
    <div className="min-h-screen flex">
      <aside className="w-[218px] shrink-0 bg-ink-900 text-linen-100 flex flex-col sticky top-0 h-screen">
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-2.5">
            <img src="./favicon.svg" alt="布典" className="w-9 h-9" />
            <div>
              <div className="font-display font-bold text-[17px] leading-tight tracking-wide">布典人生</div>
              <div className="text-[10.5px] text-linen-100/50 tracking-[.18em]">管理端 · 数字化平台</div>
            </div>
          </div>
        </div>
        <div className="weave-divider mx-5 !opacity-20" />
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-auto">
          {navs.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-lg px-3.5 py-2.5 text-[13.5px] transition-all ${
                  isActive ? 'bg-indigo-600 text-white shadow-card' : 'text-linen-100/70 hover:bg-white/10 hover:text-linen-50'
                }`}
            >
              <Icon size={16.5} strokeWidth={1.9} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          {role === 'admin' && (
            <button
              onClick={() => nav('/shop')}
              className="w-full flex items-center justify-between rounded-lg bg-white/10 hover:bg-white/15 transition px-3.5 py-2.5 text-[13px] text-linen-100 mb-2"
            >
              <span>切换到用户端</span>
              <ChevronRight size={14} />
            </button>
          )}
          <div className="flex items-center gap-2.5 px-2.5 pt-1 pb-2">
            <div className="w-8 h-8 rounded-full bg-clay-400 flex items-center justify-center font-display font-bold text-sm">{user?.name?.[0] || '管'}</div>
            <div className="leading-tight min-w-0 flex-1">
              <div className="text-[12.5px] font-medium truncate">{user?.name}</div>
              <div className="text-[10.5px] text-linen-100/40">{roleLabel} · {user?.region}</div>
            </div>
            <button title="退出登录" onClick={() => { logout(); nav('/') }} className="text-linen-100/40 hover:text-linen-50"><LogOut size={14} /></button>
          </div>
        </div>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-linen-100/85 backdrop-blur border-b border-linen-200">
          <div className="px-7 h-[58px] flex items-center gap-4">
            <div className="font-display font-bold text-ink-500 text-sm tracking-wide">面料企业数字化平台</div>
            <div className="ml-auto flex items-center gap-2">
              <ResetBtn reset={reset} />
              <QrBtn />
            </div>
          </div>
        </header>
        <main className="flex-1 px-7 py-6 max-w-[1440px] w-full mx-auto">
          <Outlet />
        </main>
        <footer className="px-7 py-4 text-[11px] text-ink-300 border-t border-linen-200">
          布典人生 v6.0 · 一期：样料数字资产 / 电子画册 / B2B获客 / AI协同 · 演示数据存于浏览器本地
        </footer>
      </div>

      {(['admin', 'sales'].includes(role)) && <AssistantDock mode="sales" />}
    </div>
  )
}

function ResetBtn({ reset }) {
  const [done, setDone] = useState(false)
  return (
    <button
      className="btn-ghost !py-1.5"
      onClick={() => {
        if (window.confirm('确定重置为初始演示数据？当前所有改动将被清除。')) {
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
            <p className="text-xs text-ink-400 mb-4">样料二维码与档案一一对应，扫码即达（US-3.1.3）</p>
            <img src={qrDataUri('budian-scan-demo')} alt="qr" className="w-44 h-44 mx-auto rounded-lg border border-linen-200" />
            <div className="text-[11px] text-ink-300 mt-3">正式部署后：蓝牙扫描枪/手机扫码 → 自动打开对应面料档案</div>
            <button className="btn-primary mt-4" onClick={() => setOpen(false)}>知道了</button>
          </div>
        </div>
      )}
    </>
  )
}
