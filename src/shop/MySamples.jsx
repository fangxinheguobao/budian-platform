import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Send, CheckCircle2, Clock, PackageOpen } from 'lucide-react'
import { useDB, customerById, priceFor } from '../store/db'
import { useBasket } from '../basket'
import { PageHead, Field, Empty } from '../components/kit'
import { fabricImg, fmtMoney } from '../lib/visual'

// 我的选样：查看本人需求进度 + 自助提交选样需求
export default function MySamples() {
  const { db, addRequest } = useDB()
  const basket = useBasket()
  const me = customerById(db, basket?.myId)
  const myRequests = db.requests.filter((r) => r.customerId === basket?.myId)

  const [buildOpen, setBuildOpen] = useState(false)
  const [picked, setPicked] = useState([])
  const [note, setNote] = useState('')
  const [q, setQ] = useState('')

  const pool = useMemo(() => {
    let arr = db.fabrics
    if (q.trim()) {
      const kw = q.trim().toLowerCase()
      arr = arr.filter((f) => (f.name + f.sku).toLowerCase().includes(kw))
    }
    return arr
  }, [db.fabrics, q])

  const toggle = (sku) => setPicked((p) => (p.includes(sku) ? p.filter((x) => x !== sku) : [...p, sku]))
  const qtyOf = (sku) => picked.find((p) => p.sku === sku)?.qty || 5
  const setQty = (sku, qty) => setPicked((p) => p.map((x) => (x.sku === sku ? { ...x, qty: Math.max(1, qty) } : x)))

  const submit = () => {
    addRequest({
      title: '在线选样需求',
      customerId: basket.myId,
      sales: '待分配',
      note: note || '用户端在线提交的选样需求',
      items: picked,
      who: me?.contact || '客户',
    })
    setPicked([]); setNote(''); setBuildOpen(false)
  }

  const totalAmt = (r) => r.items.reduce((sum, it) => {
    const f = db.fabrics.find((x) => x.sku === it.sku)
    return sum + (f ? priceFor(f, me?.tier) * it.qty : 0)
  }, 0)

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      <PageHead title="我的选样" desc={`当前身份：${me?.name}（${me?.contact}）· 需求进度实时可查`}>
        <button className="btn-primary" onClick={() => setBuildOpen(true)}><Plus size={15} /> 提交选样需求</button>
      </PageHead>

      {myRequests.length ? (
        <div className="space-y-4">
          {myRequests.map((r) => {
            const cls = r.status === '待处理' ? 'bg-clay-100 text-clay-600' : r.status === '处理中' ? 'bg-indigo-50 text-indigo-600' : 'bg-linen-200 text-ink-400'
            return (
              <div key={r.id} className="card p-5 rise-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`badge ${cls} !px-3 !py-1`}>{r.status}</span>
                    <div>
                      <div className="font-medium text-[14.5px]">{r.title}</div>
                      <div className="text-[11.5px] text-ink-300">提交于 {r.date} · 跟进人：{r.sales}</div>
                    </div>
                  </div>
                  <div className="text-[13px]">预估 <b className="font-display text-clay-500">{fmtMoney(totalAmt(r))}</b></div>
                </div>
                <div className="flex gap-2 mt-3.5">
                  {r.items.map((it) => {
                    const f = db.fabrics.find((x) => x.sku === it.sku)
                    if (!f) return null
                    return (
                      <Link key={it.sku} to={`/shop/fabrics/${it.sku}`} className="w-14 group" title={`${f.name} × ${it.qty}米`}>
                        <img src={fabricImg(f)} alt={f.name} className="w-14 h-14 rounded-lg object-cover" />
                      </Link>
                    )
                  })}
                </div>
                {/* 进度 */}
                <div className="flex items-center gap-2 mt-4 text-[12px]">
                  {['已提交', '处理中', '寄送样布', '已完成'].map((step, i) => {
                    const order = { 待处理: 0, 处理中: 1, 已完成: 3 }
                    const cur = order[r.status] ?? 0
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
                {r.timeline?.length > 1 && (
                  <div className="mt-3 rounded-lg bg-linen-100 px-4 py-3 text-[12px] text-ink-500">
                    最新进展：{r.timeline[r.timeline.length - 1].what} —— {r.timeline[r.timeline.length - 1].detail || '无备注'}
                    <span className="text-ink-300 ml-2">({r.timeline[r.timeline.length - 1].who} · {r.timeline[r.timeline.length - 1].time})</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card"><Empty text="还没有选样记录，点击右上角提交第一份需求" /></div>
      )}

      {/* 需求构建器 */}
      {buildOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 fadein" style={{ background: 'rgba(34,38,45,.42)' }} onClick={() => setBuildOpen(false)}>
          <div className="card popup w-[760px] max-h-[86vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="px-6 py-4 border-b border-linen-200 flex items-center justify-between">
              <h3 className="font-display font-bold text-[16px]">提交选样需求 <span className="text-xs text-ink-300 font-body">已选 {picked.length} 款</span></h3>
              <button className="btn-ghost !py-1.5" onClick={() => setBuildOpen(false)}>关闭</button>
            </div>
            <div className="p-6 overflow-auto flex-1">
              <input className="input mb-3" placeholder="搜索面料…" value={q} onChange={(e) => setQ(e.target.value)} />
              <div className="grid grid-cols-2 gap-2.5">
                {pool.map((f) => {
                  const p = picked.find((x) => x.sku === f.sku)
                  const on = !!p
                  return (
                    <div key={f.sku} className={`flex gap-2.5 p-2 rounded-xl border transition ${on ? 'border-indigo-500 bg-indigo-50/50' : 'border-linen-200 hover:border-linen-300'}`}>
                      <button className="flex gap-2.5 flex-1 min-w-0 text-left" onClick={() => toggle(f.sku)}>
                        <img src={fabricImg(f)} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                        <div className="min-w-0">
                          <div className="text-[12.5px] font-medium truncate">{f.name}</div>
                          <div className="text-[11px] text-ink-300 font-mono">{f.sku} · ¥{priceFor(f, me?.tier)}/米</div>
                        </div>
                      </button>
                      {on ? (
                        <div className="flex items-center gap-1">
                          <button className="btn-ghost !px-1.5 !py-1" onClick={() => setQty(f.sku, qtyOf(f.sku) - 1)}><Trash2 size={11} /></button>
                          <span className="text-[12px] w-9 text-center">{qtyOf(f.sku)}米</span>
                          <button className="btn-ghost !px-1.5 !py-1" onClick={() => setQty(f.sku, qtyOf(f.sku) + 1)}><Plus size={12} /></button>
                        </div>
                      ) : <span className="w-5" />}
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="p-5 border-t border-linen-200 bg-linen-100/50">
              <Field label="需求备注">
                <input className="input" placeholder="如：新房装修，客厅卧室各选一款，希望本周寄样" value={note} onChange={(e) => setNote(e.target.value)} />
              </Field>
              <div className="flex justify-end gap-2 mt-3">
                <button className="btn-ghost" onClick={() => setBuildOpen(false)}>取消</button>
                <button className="btn-primary" disabled={!picked.length} onClick={submit}>
                  <PackageOpen size={14} /> 提交需求（{picked.length} 款）
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
