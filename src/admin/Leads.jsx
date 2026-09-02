import React, { useState } from 'react'
import { UserSearch, Eye } from 'lucide-react'
import { useDB, customerById, priceFor } from '../store/db'
import { PageHead, TierBadge, Empty, Modal } from '../components/kit'
import { fabricImg, fmtMoney } from '../lib/visual'

// 询价线索（US-3.3.2：摒弃购物车，主动询价触发高意向线索推送）
export default function Leads() {
  const { db, updateLead } = useDB()
  const [tab, setTab] = useState('全部')
  const [profileId, setProfileId] = useState(null)
  const STATUS = ['全部', '待跟进', '跟进中', '已成交', '无效']
  const list = tab === '全部' ? db.leads : db.leads.filter((l) => l.status === tab)
  const profileLead = db.leads.find((l) => l.id === profileId)
  const profileCustomer = profileLead ? customerById(db, profileLead.customerId) : null
  const profileUser = profileCustomer ? db.users.find((u) => u.customerId === profileCustomer.id) : null
  const profileTracks = profileUser ? db.tracks.filter((t) => t.userId === profileUser.id) : []

  return (
    <div>
      <PageHead title="询价线索" desc="摒弃购物车 · 客户主动「询价」即触发高意向线索推送，浏览不触发（US-3.3.2）" />

      <div className="flex items-center gap-2 mb-4 rise-1">
        {STATUS.map((s) => (
          <button key={s} className={`chip !px-3.5 !py-1.5 ${tab === s ? 'chip-on' : 'hover:border-indigo-300'}`} onClick={() => setTab(s)}>
            {s} {s === '全部' ? db.leads.length : db.leads.filter((l) => l.status === s).length}
          </button>
        ))}
      </div>

      {list.length ? (
        <div className="space-y-3">
          {list.map((l) => {
            const cu = customerById(db, l.customerId)
            const f = db.fabrics.find((x) => x.sku === l.sku)
            const price = f ? priceFor(f, cu?.tier) : 0
            return (
              <div key={l.id} className="card p-4 rise-1 flex items-center gap-4">
                <img src={fabricImg(f || {})} alt="" className="w-14 h-14 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-[14px]">{l.id}</span>
                    <span className="text-[13px] font-medium">{f?.name || l.sku}</span>
                    <span className={`badge ${l.status === '待跟进' ? 'bg-clay-100 text-clay-600' : l.status === '无效' ? 'bg-linen-200 text-ink-300' : 'bg-indigo-50 text-indigo-600'}`}>{l.status}</span>
                    {l.source && <span className="badge bg-linen-200/80 text-ink-400">{l.source}</span>}
                  </div>
                  <div className="text-[11.5px] text-ink-400 mt-1">
                    {cu?.name}（{cu?.contact} · {cu?.region}）· 意向数量 {l.qty} 米 · ¥{price}/米
                    <span className="text-ink-300 ml-2">{l.time}</span>
                  </div>
                  {l.note && <div className="text-[12px] text-ink-500 mt-1">需求：{l.note}</div>}
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="flex gap-1.5">
                    <button className="btn-light !py-1.5" onClick={() => setProfileId(l.id)}><Eye size={13} /> 客户画像</button>
                    <select className="input !w-auto !py-1.5 text-[12px]" value={l.owner} onChange={(e) => updateLead(l.id, { owner: e.target.value, status: l.status === '待跟进' ? '跟进中' : l.status })}>
                      {['待分配', '李销售', '陈经理', '周业务'].map((o) => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-1.5">
                    {l.status === '待跟进' && <button className="btn-primary !py-1.5" onClick={() => updateLead(l.id, { status: '跟进中' })}>开始跟进</button>}
                    {l.status !== '无效' && l.status !== '已成交' && <button className="btn-ghost !py-1.5" onClick={() => updateLead(l.id, { status: '已成交' })}>标记成交</button>}
                    {l.status !== '无效' && <button className="btn-ghost !py-1.5" onClick={() => updateLead(l.id, { status: '无效' })}>无效</button>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card"><Empty text="该状态下暂无线索" /></div>
      )}

      {/* 客户画像弹层（US-3.3.1 轨迹画像） */}
      <Modal open={!!profileId} onClose={() => setProfileId(null)} title="客户画像 · 轨迹追踪" width={620}>
        {profileCustomer && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-linen-200 font-display font-bold text-lg flex items-center justify-center">{profileCustomer.name[0]}</div>
              <div>
                <div className="font-display font-bold text-[16px]">{profileCustomer.name} <TierBadge tier={profileCustomer.tier} /></div>
                <div className="text-[11.5px] text-ink-400">{profileCustomer.contact} · {profileCustomer.phone} · 大区：{profileUser?.region || profileCustomer.region}（IP {profileUser?.ip || '—'}）</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2.5 mb-4">
              {[['浏览轨迹', profileTracks.filter((t) => t.action === '浏览').length], ['询价次数', profileTracks.filter((t) => t.action === '询价').length], ['分享次数', profileTracks.filter((t) => t.action === '分享').length], ['注册时间', profileUser?.registeredAt || '—']].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-linen-100 px-3 py-2 text-center">
                  <div className="text-[10.5px] text-ink-400">{k}</div>
                  <div className="text-[13px] font-medium mt-0.5">{v}</div>
                </div>
              ))}
            </div>
            <h4 className="text-[13px] font-semibold mb-2">浏览轨迹（业务员据此精准跟进）</h4>
            <div className="space-y-1.5 max-h-[260px] overflow-auto">
              {profileTracks.map((t) => {
                const f = db.fabrics.find((x) => x.sku === t.sku)
                return (
                  <div key={t.id} className="flex items-center gap-2.5 text-[12.5px] rounded-lg border border-linen-200 px-3 py-2">
                    <span className={`badge ${t.action === '询价' ? 'bg-clay-100 text-clay-600' : t.action === '分享' ? 'bg-indigo-50 text-indigo-600' : 'bg-linen-200 text-ink-500'}`}>{t.action}</span>
                    <span className="font-medium">{f?.name || t.sku}</span>
                    <span className="text-ink-300 ml-auto text-[11px]">{t.time}</span>
                  </div>
                )
              })}
              {!profileTracks.length && <div className="text-xs text-ink-300 py-3 text-center">暂无轨迹记录</div>}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
