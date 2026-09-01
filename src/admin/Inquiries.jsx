import React, { useState } from 'react'
import { useDB, customerById, priceFor } from '../store/db'
import { PageHead, Empty } from '../components/kit'
import { fabricImg, fmtMoney } from '../lib/visual'

// B2B 询价单：接收用户端商城提交的询价
export default function Inquiries() {
  const { db, updateInquiry } = useDB()
  const [tab, setTab] = useState('全部')
  const STATUS = ['全部', '待处理', '处理中', '已报价', '已关闭']

  const list = tab === '全部' ? db.inquiries : db.inquiries.filter((q) => q.status === tab)

  return (
    <div>
      <PageHead title="B2B 询价单" desc="商城化产品展示 · 移动端推送 · 客户需求信息采集" />

      <div className="flex items-center gap-2 mb-4 rise-1">
        {STATUS.map((s) => (
          <button key={s} className={`chip !px-3.5 !py-1.5 ${tab === s ? 'chip-on' : 'hover:border-indigo-300'}`} onClick={() => setTab(s)}>
            {s} {s === '全部' ? db.inquiries.length : db.inquiries.filter((q) => q.status === s).length}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="space-y-4">
          {list.map((q) => {
            const cu = customerById(db, q.customerId)
            const total = q.items.reduce((sum, it) => {
              const f = db.fabrics.find((x) => x.sku === it.sku)
              return sum + (f ? priceFor(f, cu?.tier) * it.qty : 0)
            }, 0)
            return (
              <div key={q.id} className="card p-5 rise-1">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-display font-bold text-[15.5px]">{q.id}</span>
                    <span className="text-[13px] text-ink-400 ml-3">{cu?.name}（{cu?.contact}）</span>
                    <span className="text-[11.5px] text-ink-300 ml-3">提交于 {q.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`badge ${q.status === '待处理' ? 'bg-clay-100 text-clay-600' : q.status === '已关闭' ? 'bg-linen-200 text-ink-400' : 'bg-indigo-50 text-indigo-600'}`}>{q.status}</span>
                    {q.status === '待处理' && (
                      <button className="btn-light !py-1.5" onClick={() => updateInquiry(q.id, { status: '处理中' })}>开始处理</button>
                    )}
                    {q.status === '处理中' && (
                      <button className="btn-primary !py-1.5" onClick={() => updateInquiry(q.id, { status: '已报价' })}>发送报价</button>
                    )}
                    {q.status !== '已关闭' && q.status !== '待处理' && (
                      <button className="btn-ghost !py-1.5" onClick={() => updateInquiry(q.id, { status: '已关闭' })}>关闭</button>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {q.items.map((it) => {
                    const f = db.fabrics.find((x) => x.sku === it.sku)
                    if (!f) return null
                    const price = priceFor(f, cu?.tier)
                    return (
                      <div key={it.sku} className="flex items-center gap-2.5 rounded-lg border border-linen-200 p-2.5">
                        <img src={fabricImg(f)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="min-w-0 flex-1">
                          <div className="text-[12.5px] font-medium truncate">{f.name}</div>
                          <div className="text-[11px] text-ink-300 font-mono">{f.sku} · ¥{price}/米 × {it.qty}米</div>
                        </div>
                        <div className="text-[12.5px] font-medium">{fmtMoney(price * it.qty)}</div>
                      </div>
                    )
                  })}
                </div>
                {q.note && <div className="text-[12.5px] text-clay-600 bg-clay-50/60 border border-clay-200 rounded-lg px-3.5 py-2.5 mt-3">客户备注：{q.note}</div>}
                <div className="text-right text-[13px] mt-2">预估金额 <b className="font-display text-clay-500 text-[16px]">{fmtMoney(total)}</b></div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card"><Empty text="该状态下暂无询价单" /></div>
      )}
    </div>
  )
}
