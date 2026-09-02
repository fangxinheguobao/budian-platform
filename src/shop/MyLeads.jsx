import React from 'react'
import { Link } from 'react-router-dom'
import { MessageSquareText, Footprints, ArrowRight } from 'lucide-react'
import { useDB, priceFor } from '../store/db'
import { useAuth } from '../auth'
import { PageHead, Empty } from '../components/kit'
import { fabricImg, fmtMoney } from '../lib/visual'

// 我的询价（闭环：客户提交的询价线索进度可查）+ 我的足迹（个人轨迹，画像数据同源）
export default function MyLeads() {
  const { db } = useDB()
  const { user, session } = useAuth()
  const me = db.customers.find((c) => c.id === user?.customerId)
  const myLeads = db.leads.filter((l) => l.customerId === user?.customerId)
  const myTracks = user ? db.tracks.filter((t) => t.userId === user.id).slice(0, 12) : []

  const statusCls = { 待跟进: 'bg-clay-100 text-clay-600', 跟进中: 'bg-indigo-50 text-indigo-600', 已成交: 'bg-indigo-600 text-white', 无效: 'bg-linen-200 text-ink-300' }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      <PageHead title="我的询价" desc={`提交的询价单实时同步业务员跟进进度 · 当前档位：${me ? { vip: 'A类专属价', l1: 'B类经销价', l2: 'C类经销价', normal: '标准价' }[me.tier] : '标准价'}`} />

      {myLeads.length ? (
        <div className="space-y-3">
          {myLeads.map((l) => {
            const f = db.fabrics.find((x) => x.sku === l.sku)
            const price = f ? priceFor(f, me?.tier) : 0
            return (
              <div key={l.id} className="card p-4 flex items-center gap-4 rise-1">
                {f && <Link to={`/shop/fabrics/${f.sku}`}><img src={fabricImg(f)} alt="" className="w-14 h-14 rounded-lg object-cover" /></Link>}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-[14px]">{f?.name || l.sku}</span>
                    <span className={`badge ${statusCls[l.status] || ''}`}>{l.status}</span>
                    {l.img && <span className="badge bg-linen-200 text-ink-400">已附图</span>}
                  </div>
                  <div className="text-[11.5px] text-ink-400 mt-1">
                    {l.qty} 米 · ¥{price}/米 · 业务员 {l.owner} · {l.time}
                  </div>
                  {l.note && <div className="text-[12px] text-ink-500 mt-1">需求：{l.note}</div>}
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] text-ink-300">预估</div>
                  <div className="font-display font-bold text-clay-500">{fmtMoney(price * l.qty)}</div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card">
          <Empty text="还没有询价记录" />
          <div className="text-center pb-6 -mt-8">
            <Link to="/shop/fabrics" className="btn-primary">去逛面料库 <ArrowRight size={14} /></Link>
          </div>
        </div>
      )}

      {/* 我的足迹 */}
      <div className="card p-5 mt-6 rise-2">
        <h3 className="h-panel text-[15px] flex items-center gap-2 mb-4"><Footprints size={16} className="text-indigo-500" /> 我的足迹 <span className="text-[11px] text-ink-300 font-body">浏览/收藏/分享行为将帮业务员更懂你的需求</span></h3>
        {myTracks.length ? (
          <div className="space-y-2">
            {myTracks.map((t) => {
              const f = db.fabrics.find((x) => x.sku === t.sku)
              return (
                <div key={t.id} className="flex items-center gap-2.5 text-[12.5px] rounded-lg border border-linen-200 px-3 py-2">
                  <span className={`badge ${t.action === '询价' ? 'bg-clay-100 text-clay-600' : t.action === '收藏' ? 'bg-clay-50 text-clay-500' : t.action === '分享' || t.action === 'AI需求' ? 'bg-indigo-50 text-indigo-600' : 'bg-linen-200 text-ink-500'}`}>{t.action}</span>
                  {f && <Link to={`/shop/fabrics/${f.sku}`} className="font-medium hover:text-indigo-600">{f.name}</Link>}
                  <span className="text-ink-300 ml-auto text-[11px]">{t.time}</span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-xs text-ink-300 text-center py-4">暂无足迹，浏览面料后这里会留下记录</div>
        )}
      </div>
    </div>
  )
}
