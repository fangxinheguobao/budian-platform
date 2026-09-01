import React, { useMemo, useState } from 'react'
import { FileDown, Send, CheckCircle2, CircleDot, Clock } from 'lucide-react'
import { useDB, customerById, priceFor } from '../store/db'
import { PageHead, TierBadge, Empty } from '../components/kit'
import { fabricImg, fmtMoney } from '../lib/visual'

const STATUS = ['全部', '待处理', '处理中', '已完成']

export default function SampleLists() {
  const { db, requestAct } = useDB()
  const [tab, setTab] = useState('全部')
  const [activeId, setActiveId] = useState(db.requests[0]?.id)

  const list = useMemo(() => (tab === '全部' ? db.requests : db.requests.filter((r) => r.status === tab)), [db.requests, tab])
  const active = db.requests.find((r) => r.id === activeId) || list[0]
  const cu = active ? customerById(db, active.customerId) : null
  const total = active ? active.items.reduce((sum, it) => {
    const f = db.fabrics.find((x) => x.sku === it.sku)
    return sum + (f ? priceFor(f, cu?.tier) * it.qty : 0)
  }, 0) : 0
  const totalQty = active ? active.items.reduce((a, b) => a + Number(b.qty || 0), 0) : 0

  return (
    <div>
      <PageHead title="客户选样需求" desc="客户提交的选样需求 · 进度追踪 · 状态呈现" />

      <div className="flex items-center gap-2 mb-4 rise-1">
        {STATUS.map((s) => (
          <button key={s} className={`chip !px-3.5 !py-1.5 ${tab === s ? 'chip-on' : 'hover:border-indigo-300'}`} onClick={() => setTab(s)}>
            {s} {s === '全部' ? db.requests.length : db.requests.filter((r) => r.status === s).length}
          </button>
        ))}
        <button className="btn-ghost ml-auto !py-1.5" onClick={() => window.alert('演示环境：导出 Excel 功能在正式版中提供')}>
          <FileDown size={14} /> 导出
        </button>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* 队列 */}
        <div className="col-span-4 space-y-2.5 rise-1">
          {list.map((r) => {
            const cu2 = customerById(db, r.customerId)
            const on = active?.id === r.id
            return (
              <button key={r.id} onClick={() => setActiveId(r.id)}
                className={`w-full text-left card p-4 transition ${on ? 'ring-2 ring-indigo-400' : 'card-hover'}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium text-[14px]">{r.title}</span>
                  <span className={`badge ${r.status === '待处理' ? 'bg-clay-100 text-clay-600' : r.status === '处理中' ? 'bg-indigo-50 text-indigo-600' : 'bg-linen-200 text-ink-400'}`}>{r.status}</span>
                </div>
                <div className="text-[11.5px] text-ink-400 mt-1">{cu2?.name} · {r.items.length} 款面料 · {r.sales}</div>
                <div className="text-[11px] text-ink-300 mt-0.5">提交于 {r.date}</div>
              </button>
            )
          })}
          {!list.length && <div className="card"><Empty text="该状态下暂无需求" /></div>}
        </div>

        {/* 详情 */}
        <div className="col-span-8">
          {active ? (
            <div className="card p-6 rise-2">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="font-display text-[20px] font-bold">{active.title}</h2>
                  <div className="text-xs text-ink-400 mt-1">
                    <TierBadge tier={cu?.tier} /> <span className="ml-1">{cu?.name} · {cu?.contact} · {cu?.phone}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {active.status !== '已完成' && (
                    <>
                      <button className="btn-light !py-1.5" onClick={() => requestAct(active.id, '寄出样布', '样布已寄出（演示操作）')}>
                        <Send size={13} /> 寄出样布
                      </button>
                      <button className="btn-primary !py-1.5" onClick={() => requestAct(active.id, '标记完成', '客户确认选样，转入订单流程')}>
                        <CheckCircle2 size={13} /> 标记完成
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mt-5">
                {[['客户等级', cu ? { vip: 'VIP会员', l1: '一级经销商', l2: '二级经销商', normal: '普通客户' }[cu.tier] : '—'],
                  ['面料款数', `${active.items.length} 款`],
                  ['总数量', `${totalQty} 米`],
                  ['提交时间', active.date]].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-linen-100 px-3 py-2.5">
                    <div className="text-[10.5px] text-ink-400">{k}</div>
                    <div className="text-[13px] font-medium mt-0.5">{v}</div>
                  </div>
                ))}
              </div>

              {active.note && (
                <div className="rounded-lg border border-clay-200 bg-clay-50/60 px-4 py-3 mt-4 text-[12.5px] text-clay-600">
                  客户备注：{active.note}
                </div>
              )}

              <h3 className="font-display font-bold mt-6 mb-3">选样面料清单（{active.items.length} 款）</h3>
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
                        <div className="text-[11px] text-ink-300 font-mono">{f.sku} · {f.gsm}gsm / {f.width}cm · {f.category}</div>
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
              <div className="flex items-center justify-between mt-4 px-1">
                <span className="text-[12.5px] text-ink-400">共 {active.items.length} 款面料，合计 {totalQty} 米 · 价格已按 {cu ? '客户档位' : '标准价'}计算</span>
                <span className="text-[15px]">预估金额 <b className="font-display text-clay-500 text-[19px]">{fmtMoney(total)}</b></span>
              </div>

              <h3 className="font-display font-bold mt-7 mb-3">跟进记录</h3>
              <div className="space-y-0">
                {active.timeline.map((t, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center ${i === active.timeline.length - 1 ? 'bg-indigo-600 text-white' : 'bg-linen-200 text-ink-400'}`}>
                        {i === active.timeline.length - 1 ? <CircleDot size={13} /> : <Clock size={12} />}
                      </span>
                      {i < active.timeline.length - 1 && <span className="w-px flex-1 bg-linen-300 my-1" />}
                    </div>
                    <div className="pb-5">
                      <div className="text-[13px] font-medium">{t.what}</div>
                      <div className="text-[11.5px] text-ink-300">{t.who} · {t.time}</div>
                      {t.detail && <div className="text-[12.5px] text-ink-500 mt-1">{t.detail}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card"><Empty text="选择左侧需求查看详情" /></div>
          )}
        </div>
      </div>
    </div>
  )
}
