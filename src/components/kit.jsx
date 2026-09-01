import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { fabricImg, fmtMoney } from '../lib/visual'
import { fabricStatus } from '../store/db'

export function PageHead({ title, desc, children }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5 rise">
      <div>
        <h1 className="font-display text-[26px] font-bold leading-tight">{title}</h1>
        {desc && <p className="text-ink-400 text-[13px] mt-1">{desc}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  )
}

export function Modal({ open, onClose, title, width = 560, children }) {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose?.()
    if (open) window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 fadein" style={{ background: 'rgba(34,38,45,.42)', backdropFilter: 'blur(2px)' }} onClick={onClose}>
      <div className="card popup w-full overflow-hidden" style={{ maxWidth: width }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-linen-200">
          <h3 className="font-display font-bold">{title}</h3>
          <button className="btn-ghost !px-2 !py-1.5" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="p-5 max-h-[74vh] overflow-auto">{children}</div>
      </div>
    </div>
  )
}

export function Empty({ text = '暂无数据' }) {
  return (
    <div className="py-16 text-center text-ink-300 text-sm">
      <div className="font-display text-4xl mb-3 opacity-40">布</div>
      {text}
    </div>
  )
}

export function StatusBadge({ f }) {
  const s = fabricStatus(f)
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

export function TierBadge({ tier }) {
  const map = {
    vip: ['VIP会员', 'bg-clay-100 text-clay-600'],
    l1: ['一级经销商', 'bg-indigo-50 text-indigo-600'],
    l2: ['二级经销商', 'bg-indigo-50/70 text-indigo-500'],
    normal: ['普通客户', 'bg-linen-200 text-ink-500'],
  }
  const [label, cls] = map[tier] || map.normal
  return <span className={`badge ${cls}`}>{label}</span>
}

// 面料卡（管理端/商城共用）
export function FabricCard({ f, price, to, footer, showStock = true }) {
  const img = fabricImg(f)
  return (
    <div className="card card-hover overflow-hidden group">
      <Link to={to} className="block relative">
        <div className="swatch aspect-[4/3]">
          <img src={img} alt={f.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" loading="lazy" />
        </div>
        <div className="absolute top-2.5 left-2.5"><StatusBadge f={f} /></div>
        {showStock && (
          <div className="absolute bottom-2.5 right-2.5 rounded-md bg-ink-900/70 text-linen-50 text-[11px] px-2 py-0.5 backdrop-blur-sm">
            库存 {f.stock}m
          </div>
        )}
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] text-ink-300 font-mono">{f.sku}</div>
            <Link to={to} className="font-medium text-[15px] leading-snug hover:text-indigo-600 transition-colors line-clamp-1">{f.name}</Link>
          </div>
          <div className="text-right shrink-0">
            <span className="font-display font-bold text-clay-500 text-[17px]">{fmtMoney(price ?? f.price)}</span>
            {price != null && <div className="text-[10px] text-ink-300">原价{fmtMoney(f.price)}</div>}
          </div>
        </div>
        <div className="text-xs text-ink-400 mt-1">{f.gsm}gsm · {f.width}cm · {f.category}</div>
        <div className="flex flex-wrap gap-1 mt-2.5">
          {f.styles.slice(0, 2).map((t) => <span key={t} className="badge bg-linen-200/80 text-ink-500">{t}</span>)}
          {f.perf.slice(0, 2).map((t) => <span key={t} className="badge bg-indigo-50 text-indigo-500">{t}</span>)}
        </div>
        {footer}
      </div>
    </div>
  )
}

export function Field({ label, children }) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
    </div>
  )
}
