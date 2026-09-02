import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Scissors, CheckCircle2, Clock } from 'lucide-react'
import { useDB, priceFor } from '../store/db'
import { useAuth } from '../auth'
import { PageHead, Field, Empty } from '../components/kit'
import { fabricImg, fmtMoney } from '../lib/visual'

// 我的打样（US-3.3.4：打样单下达 + ERP双向进度跟踪）
export default function MyProofs() {
  const { db, addProof } = useDB()
  const { user } = useAuth()
  const myProofs = db.proofs.filter((p) => p.customerId === user?.customerId)
  const me = db.customers.find((c) => c.id === user?.customerId)
  const tier = me?.tier

  const [buildOpen, setBuildOpen] = useState(false)
  const [picked, setPicked] = useState([])
  const [note, setNote] = useState('')
  const [q, setQ] = useState('')

  const pool = db.fabrics.filter((f) => !q.trim() || (f.name + f.sku).toLowerCase().includes(q.trim().toLowerCase()))
  const toggle = (sku) => setPicked((p) => (p.some((x) => x.sku === sku) ? p.filter((x) => x.sku !== sku) : [...p, { sku, qty: 10 }]))
  const setQty = (sku, qty) => setPicked((p) => p.map((x) => (x.sku === sku ? { ...x, qty: Math.max(1, qty) } : x)))

  const submit = () => {
    addProof({ customerId: user.customerId, items: picked, note })
    setPicked([]); setNote(''); setBuildOpen(false)
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      <PageHead title="我的打样" desc="打样单为需求工单（非交易订单）· 提交后直连ERP，进度双向同步实时可查">
        <button className="btn-primary" onClick={() => setBuildOpen(true)}><Plus size={15} /> 新建打样单</button>
      </PageHead>

      {myProofs.length ? (
        <div className="space-y-4">
          {myProofs.map((p) => {
            const cls = { 已提交: 'bg-clay-100 text-clay-600', ERP已接收: 'bg-indigo-50 text-indigo-600', 生产中: 'bg-indigo-100 text-indigo-700', 已完成: 'bg-linen-200 text-ink-400' }[p.status] || 'bg-linen-200 text-ink-400'
            const total = p.items.reduce((s, it) => { const f = db.fabrics.find((x) => x.sku === it.sku); return s + (f ? priceFor(f, tier) * it.qty : 0) }, 0)
            return (
              <div key={p.id} className="card p-5 rise-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`badge ${cls} !px-3 !py-1`}>{p.status}</span>
                    <div>
                      <div className="font-medium text-[14.5px]">{p.id} 打样单</div>
                      <div className="text-[11.5px] text-ink-300">提交于 {p.date} {p.erpNo && `· ERP单号 ${p.erpNo}`}</div>
                    </div>
                  </div>
                  <div className="text-[13px]">预估 <b className="font-display text-clay-500">{fmtMoney(total)}</b></div>
                </div>
                <div className="flex gap-2 mt-3.5">
                  {p.items.map((it) => {
                    const f = db.fabrics.find((x) => x.sku === it.sku)
                    if (!f) return null
                    return (
                      <Link key={it.sku} to={`/shop/fabrics/${it.sku}`} className="w-14" title={`${f.name} × ${it.qty}米`}>
                        <img src={fabricImg(f)} alt={f.name} className="w-14 h-14 rounded-lg object-cover" />
                      </Link>
                    )
                  })}
                </div>
                <div className="flex items-center gap-2 mt-4 text-[12px]">
                  {['已提交', 'ERP已接收', '生产中', '已寄出/完成'].map((step, i) => {
                    const order = ['已提交', 'ERP已接收', '生产中', '已完成']
                    const cur = Math.max(0, order.indexOf(p.status))
                    const doneStep = i <= cur
                    return (
                      <React.Fragment key={step}>
                        {i > 0 && <span className={`h-px w-8 ${i <= cur ? 'bg-indigo-400' : 'bg-linen-300'}`} />}
                        <span className={`flex items-center gap-1 ${doneStep ? 'text-indigo-600 font-medium' : 'text-ink-300'}`}>
                          {doneStep ? <CheckCircle2 size={13} /> : <Clock size={13} />} {step}
                        </span>
                      </React.Fragment>
                    )
                  })}
                </div>
                {p.progress?.length > 1 && (
                  <div className="mt-3 rounded-lg bg-linen-100 px-4 py-3 text-[12px] text-ink-500">
                    最新进展：{p.progress[p.progress.length - 1].what} —— {p.progress[p.progress.length - 1].detail || '无备注'}
                    <span className="text-ink-300 ml-2">({p.progress[p.progress.length - 1].who} · {p.progress[p.progress.length - 1].time})</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card"><Empty text="还没有打样单，点击右上角新建" /></div>
      )}

      {buildOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 fadein" style={{ background: 'rgba(34,38,45,.42)' }} onClick={() => setBuildOpen(false)}>
          <div className="card popup w-[720px] max-h-[86vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-linen-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-[16px]">新建打样单 <span className="text-xs text-ink-300 font-body">已选 {picked.length} 款 · 提交后推送ERP</span></h3>
              <button className="btn-ghost !py-1.5" onClick={() => setBuildOpen(false)}>关闭</button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <input className="input mb-3" placeholder="搜索面料…" value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="grid grid-cols-2 gap-2.5">
                {pool.map((f) => {
                  const on = picked.some((x) => x.sku === f.sku)
                  return (
                    <button key={f.sku} onClick={() => toggle(f.sku)}
                      className={`flex gap-2.5 p-2 rounded-xl border text-left transition ${on ? 'border-indigo-500 bg-indigo-50/50' : 'border-linen-200 hover:border-linen-300'}`}>
                      <img src={fabricImg(f)} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-medium truncate">{f.name}</div>
                        <div className="text-[11px] text-ink-300 font-mono">{f.sku} · {tier ? `¥${priceFor(f, tier)}` : '询价'}/米</div>
                      </div>
                      {on && <span className="badge bg-indigo-600 text-white h-fit">已选</span>}
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="p-5 border-t border-linen-200 bg-linen-100/50">
              <Field label="打样需求说明（款式/规格/用途，选填）">
                <input className="input w-full" placeholder="如：样板间项目，希望本周寄样" value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
              <div className="flex justify-end gap-2 mt-3">
                <button className="btn-ghost" onClick={() => setBuildOpen(false)}>取消</button>
                <button className="btn-primary" disabled={!picked.length} onClick={submit}>
                  <Scissors size={14} /> 提交打样单（{picked.length} 款）
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
