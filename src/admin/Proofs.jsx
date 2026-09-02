import React, { useState } from 'react'
import { RefreshCw, Send, FileEdit, ArrowLeft } from 'lucide-react'
import { useDB, customerById, priceFor } from '../store/db'
import { PageHead, TierBadge, Empty } from '../components/kit'
import { fabricImg, fmtMoney } from '../lib/visual'

// 打样管理（US-3.3.4：打样单下达 + B2B↔ERP 双向数据打通，非交易订单）
export default function Proofs() {
  const { db, pushToErp, erpSync, manualProgress } = useDB()
  const [activeId, setActiveId] = useState(db.proofs[0]?.id)
  const active = db.proofs.find((p) => p.id === activeId) || db.proofs[0]
  const cu = active ? customerById(db, active.customerId) : null
  const total = active ? active.items.reduce((s, it) => { const f = db.fabrics.find((x) => x.sku === it.sku); return s + (f ? priceFor(f, cu?.tier) * it.qty : 0) }, 0) : 0

  const statusCls = { 已提交: 'bg-clay-100 text-clay-600', ERP已接收: 'bg-indigo-50 text-indigo-600', 生产中: 'bg-indigo-100 text-indigo-700', 已完成: 'bg-linen-200 text-ink-400' }

  return (
    <div>
      <PageHead title="打样管理" desc="打样单下达（非交易订单）· 平台 ⇄ ERP 双向数据打通 · 对接失败由后台人工兜底（US-3.3.4 / ADR-01）" />

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-4 space-y-2.5 rise-1">
          {db.proofs.map((p) => {
            const c2 = customerById(db, p.customerId)
            return (
              <button key={p.id} onClick={() => setActiveId(p.id)}
                className={`w-full text-left card p-4 transition ${active?.id === p.id ? 'ring-2 ring-indigo-400' : 'card-hover'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-[14px]">{p.id} · {c2?.name}</span>
                  <span className={`badge ${statusCls[p.status] || 'bg-linen-200 text-ink-400'}`}>{p.status}</span>
                </div>
                <div className="text-[11.5px] text-ink-400 mt-1">{p.items.length} 款面料 · 提交于 {p.date}</div>
                <div className="text-[11px] text-ink-300 mt-0.5">{p.erpNo ? `ERP单号 ${p.erpNo}` : '尚未推送ERP'}</div>
              </button>
            )
          })}
          {!db.proofs.length && <div className="card"><Empty text="暂无打样单" /></div>}
        </div>

        <div className="col-span-8">
          {active ? (
            <div className="card p-6 rise-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-[20px] font-bold">{active.id} 打样单 <TierBadge tier={cu?.tier} /></h2>
                  <div className="text-xs text-ink-400 mt-1">{cu?.name} · {cu?.contact} · {cu?.phone}</div>
                  {active.note && <div className="text-[12.5px] text-clay-600 bg-clay-50/60 border border-clay-200 rounded-lg px-3.5 py-2 mt-2.5">客户备注：{active.note}</div>}
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`badge ${statusCls[active.status]} !px-3 !py-1`}>{active.status}</span>
                  {!active.erpNo ? (
                    <button className="btn-primary !py-1.5" onClick={() => pushToErp(active.id)}>
                      <Send size={13} /> 推送ERP
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1.5 items-end">
                      <span className="text-[11px] text-ink-300 font-mono">{active.erpNo}</span>
                      <div className="flex gap-1.5">
                        <button className="btn-light !py-1.5" onClick={() => erpSync(active.id, '备货中')}><RefreshCw size={12} /> 回传：备货中</button>
                        <button className="btn-light !py-1.5" onClick={() => erpSync(active.id, '已寄出')}>回传：已寄出</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-indigo-100 bg-indigo-50/40 p-3.5 flex items-center gap-2 text-[12px] text-indigo-600">
                <ArrowLeft size={14} /> ERP对接说明：打样数据由平台推送ERP；生产/寄出进度由ERP反向回传平台，客户端实时可见。ERP不可用时点击「人工兜底」维护进度。
                <button className="btn-ghost !py-1 shrink-0 ml-auto" onClick={() => manualProgress(active.id, window.prompt('人工录入进度说明（ERP兜底）') || '')}><FileEdit size={12} /> 人工兜底</button>
              </div>

              <h3 className="font-display font-bold mt-6 mb-3">打样清单（{active.items.length} 款）</h3>
              <div className="space-y-2">
                {active.items.map((it) => {
                  const f = db.fabrics.find((x) => x.sku === it.sku)
                  if (!f) return null
                  const price = priceFor(f, cu?.tier)
                  return (
                    <div key={it.sku} className="flex items-center gap-3 rounded-lg border border-linen-200 p-2.5">
                      <img src={fabricImg(f)} alt="" className="w-12 h-12 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-medium truncate">{f.name}</div>
                        <div className="text-[11px] text-ink-300 font-mono">{f.sku} · {f.location}</div>
                      </div>
                      <div className="text-[12.5px] text-ink-500">{it.qty} 米</div>
                      <div className="text-[12.5px] w-24 text-right">
                        <span className="text-ink-400">¥{price}/米</span>
                        <div className="font-medium">小计 {fmtMoney(price * it.qty)}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="text-right text-[15px] mt-3">预估金额 <b className="font-display text-clay-500 text-[19px]">{fmtMoney(total)}</b> <span className="text-[11px] text-ink-300">（打样非交易订单）</span></div>

              <h3 className="font-display font-bold mt-7 mb-3">流转进度（平台 ⇄ ERP）</h3>
              <div className="space-y-0">
                {active.progress.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`badge w-[74px] justify-center ${t.who.includes('ERP') ? 'bg-indigo-600 text-white' : t.who === '平台' ? 'bg-indigo-50 text-indigo-600' : 'bg-linen-200 text-ink-400'}`}>{t.who}</span>
                      {i < active.progress.length - 1 && <span className="w-px flex-1 bg-linen-300 my-1" />}
                    </div>
                    <div className="pb-5">
                      <div className="text-[13px] font-medium">{t.what}</div>
                      <div className="text-[11.5px] text-ink-300">{t.time}</div>
                      {t.detail && <div className="text-[12.5px] text-ink-500 mt-1">{t.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card"><Empty text="选择左侧打样单查看" /></div>
          )}
        </div>
      </div>
    </div>
  )
}
