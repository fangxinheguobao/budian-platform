import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { fabricStatus, useDB } from '../store/db'
import { useAuth } from '../auth'
import { fabricImg, fmtMoney } from '../lib/visual'

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
        <div className="absolute top-2.5 left-2.5">{showStock ? <StatusBadge f={f} /> : <span className="badge bg-linen-200/90 text-ink-400">可询价</span>}</div>
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

// 询价弹窗（US-3.3.2：摒弃购物车，主动询价触发高意向线索推送；需求文字/图片选填）
export function AskModal({ open, onClose, sku, tier, customer }) {
  const { db, addLead, addTrack } = useDB()
  const { session } = useAuth()
  const [qty, setQty] = useState(30)
  const [note, setNote] = useState('')
  const [img, setImg] = useState(null)
  const [done, setDone] = useState(false)
  const fileRef = React.useRef(null)
  const f = db.fabrics.find((x) => x.sku === sku)
  React.useEffect(() => { if (open) { setQty(30); setNote(''); setImg(null); setDone(false) } }, [open, sku])
  if (!open || !f) return null
  const cu = customer || db.customers.find((c) => c.id === session?.customerId)

  const pickImg = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      // 压缩到最长边 480px，避免撑爆 localStorage
      const im = new Image()
      im.onload = () => {
        const MAX = 480
        const ratio = Math.min(1, MAX / Math.max(im.width, im.height))
        const cv = document.createElement('canvas')
        cv.width = Math.round(im.width * ratio)
        cv.height = Math.round(im.height * ratio)
        cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height)
        setImg(cv.toDataURL('image/jpeg', 0.7))
      }
      im.src = reader.result
    }
    reader.readAsDataURL(file)
  }

  const submit = () => {
    addLead({ customerId: cu?.id || session?.customerId, sku, qty, note, img, source: '详情页询价', owner: cu?.sales })
    if (session) addTrack(sku, '询价', session)
    setDone(true)
  }
  return (
    <Modal open={open} onClose={onClose} title={`询价 · ${f.name}`} width={480}>
      {done ? (
        <div className="text-center py-6">
          <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">✓</div>
          <h3 className="font-display font-bold text-[17px] mt-4">询价已提交</h3>
          <p className="text-[13px] text-ink-400 mt-2 leading-relaxed">高意向线索已实时推送至业务员（{cu?.sales || '待分配'}），<br />可在「我的询价」中查看跟进进度。</p>
          <button className="btn-primary mt-5" onClick={onClose}>好的</button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-lg bg-linen-100 p-3 mb-4">
            <img src={fabricImg(f)} alt="" className="w-12 h-12 rounded-lg object-cover" />
            <div className="text-[12.5px]">
              <div className="font-medium">{f.name}</div>
              <div className="text-ink-300 font-mono text-[11px]">{f.sku} · {f.category}</div>
            </div>
          </div>
          <Field label="意向数量（米）">
            <input className="input w-full" type="number" min="1" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))} />
          </Field>
          <Field label="需求说明（选填：文字或图片）">
            <textarea className="input w-full mt-1" rows="3" placeholder="如：酒店项目用，需防火检测报告，含税含运费" value={note} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <div className="mt-2">
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { pickImg(e.target.files?.[0]); e.target.value = '' }} />
            {img ? (
              <div className="flex items-center gap-2.5 rounded-lg border border-linen-200 p-2">
                <img src={img} alt="需求图" className="w-14 h-14 rounded-lg object-cover" />
                <span className="text-[11.5px] text-ink-400 flex-1">已附图片（随询价单推送业务员）</span>
                <button className="text-ink-300 hover:text-clay-500" onClick={() => setImg(null)}><X size={15} /></button>
              </div>
            ) : (
              <button className="btn-ghost w-full !py-2" onClick={() => fileRef.current?.click()}>＋ 添加图片（现场照片/参考图）</button>
            )}
          </div>
          <button className="btn-primary w-full mt-4 !py-2.5" onClick={submit}>提交询价（触发线索推送）</button>
          <p className="text-[10.5px] text-ink-300 mt-2 text-center">摒弃购物车模式：仅在主动询价时推送线索，浏览不触发</p>
        </>
      )}
    </Modal>
  )
}
