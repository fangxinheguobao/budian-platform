import React, { useState } from 'react'
import { Printer, Users, Footprints, Target } from 'lucide-react'
import { useDB } from '../store/db'
import { PageHead, TierBadge, Modal, Empty } from '../components/kit'
import { analyzeCustomer, rankCustomers } from '../lib/profile'
import { fabricImg } from '../lib/visual'

// 客户画像分析（US-3.3.1）：轨迹梳理成册 · 意向度评分 · 偏好分析 · 定向跟进建议
export default function Insights() {
  const { db } = useDB()
  const ranked = rankCustomers(db)
  const [reportId, setReportId] = useState(null)
  const high = ranked.filter((x) => x.a.level === '高意向').length
  const totalTracks = db.tracks.length
  const totalInquiries = db.leads.length

  return (
    <div>
      <PageHead title="客户画像分析" desc="客户行为轨迹自动梳理成册 · 意向度评分 · 偏好聚合与定向跟进建议（US-3.3.1）" />

      <div className="grid grid-cols-3 gap-4 mb-5">
        <div className="card p-5 flex items-center gap-3.5 rise-1">
          <div className="w-11 h-11 rounded-xl bg-clay-50 text-clay-500 flex items-center justify-center"><Target size={20} /></div>
          <div><div className="font-display text-[26px] font-bold leading-none">{high}</div><div className="text-xs text-ink-400 mt-1">高意向客户（建议优先跟进）</div></div>
        </div>
        <div className="card p-5 flex items-center gap-3.5 rise-2">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center"><Footprints size={20} /></div>
          <div><div className="font-display text-[26px] font-bold leading-none">{totalTracks}</div><div className="text-xs text-ink-400 mt-1">累计行为轨迹（浏览/收藏/分享/询价…）</div></div>
        </div>
        <div className="card p-5 flex items-center gap-3.5 rise-3">
          <div className="w-11 h-11 rounded-xl bg-linen-200 text-ink-500 flex items-center justify-center"><Users size={20} /></div>
          <div><div className="font-display text-[26px] font-bold leading-none">{totalInquiries}</div><div className="text-xs text-ink-400 mt-1">累计询价线索</div></div>
        </div>
      </div>

      <h3 className="h-panel mb-3 rise-1">客户意向度排行 <span className="text-xs text-ink-300 font-body">按行为轨迹加权评分：询价×5 · 打样×6 · AI需求×4 · 收藏×3 · 分享×2 · 浏览×1</span></h3>
      {ranked.length ? (
        <div className="space-y-3">
          {ranked.map(({ c, a }, i) => (
            <div key={c.id} className="card p-4 flex items-center gap-4 rise-1">
              <span className={`font-display font-bold w-7 text-center ${i === 0 ? 'text-clay-400 text-xl' : 'text-ink-300'}`}>{i + 1}</span>
              <div className="w-10 h-10 rounded-xl bg-linen-200 font-display font-bold flex items-center justify-center shrink-0">{c.name[0]}</div>
              <div className="min-w-0 w-[230px]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-medium text-[14px]">{c.name}</span>
                  <TierBadge tier={c.tier} />
                </div>
                <div className="text-[11px] text-ink-300 mt-0.5">{c.region} · 业务员 {c.sales}</div>
              </div>
              <div className="w-[130px]">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 rounded-full bg-linen-200 overflow-hidden">
                    <div className={`h-full rounded-full ${a.level === '高意向' ? 'bg-clay-400' : a.level === '中意向' ? 'bg-indigo-400' : 'bg-linen-300'}`}
                      style={{ width: `${Math.min(100, (a.score / 40) * 100)}%` }} />
                  </div>
                  <span className="text-[12px] font-medium">{a.score}</span>
                </div>
                <div className="text-[10.5px] text-ink-300 mt-0.5">浏览{a.stats.浏览} · 收藏{a.stats.收藏} · 询价{a.leads.length}</div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap gap-1">
                  {a.prefs.styles.slice(0, 3).map(([s]) => <span key={s} className="badge bg-clay-50 text-clay-500">{s}</span>)}
                  {a.prefs.categories.slice(0, 2).map(([s]) => <span key={s} className="badge bg-linen-200/80 text-ink-500">{s}</span>)}
                </div>
                {a.avgPrice > 0 && <div className="text-[10.5px] text-ink-300 mt-1">关注均价 ¥{a.avgPrice}/米</div>}
              </div>
              <span className={`badge ${a.levelCls} shrink-0`}>{a.level}</span>
              <button className="btn-light !py-1.5 shrink-0" onClick={() => setReportId(c.id)}>画像报告</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="card"><Empty text="暂无注册客户行为数据" /></div>
      )}

      {reportId && <ReportModal db={db} customerId={reportId} onClose={() => setReportId(null)} />}
    </div>
  )
}

// 画像报告（可打印成册）
function ReportModal({ db, customerId, onClose }) {
  const a = analyzeCustomer(db, customerId)
  const c = a.customer
  const maxW = Math.max(...a.prefs.styles.map((x) => x[1]), 1)
  return (
    <Modal open={!!customerId} onClose={onClose} title={`客户画像报告 · ${c.name}`} width={760}>
      <div className="print-area">
        <div className="flex items-center justify-between pb-4 border-b border-linen-200">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-linen-200 font-display font-bold text-lg flex items-center justify-center">{c.name[0]}</div>
            <div>
              <div className="font-display font-bold text-[17px] flex items-center gap-2">{c.name} <TierBadge tier={c.tier} /> <span className={`badge ${a.levelCls}`}>{a.level}（{a.score}分）</span></div>
              <div className="text-[11.5px] text-ink-400 mt-0.5">{c.contact} · {c.region} · IP {a.user?.ip} · 注册 {a.user?.registeredAt} · 业务员 {c.sales}</div>
            </div>
          </div>
          <button className="btn-primary no-print" onClick={() => window.print()}><Printer size={14} /> 打印 / 导出PDF</button>
        </div>

        <div className="grid grid-cols-7 gap-2 mt-4">
          {Object.entries(a.stats).map(([k, v]) => (
            <div key={k} className="rounded-lg bg-linen-100 py-2.5 text-center">
              <div className="text-[10.5px] text-ink-400">{k}</div>
              <div className="font-display font-bold text-[16px] mt-0.5">{v}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6 mt-5">
          <div>
            <h4 className="text-[13px] font-semibold mb-2.5">偏好分析</h4>
            <div className="space-y-2.5">
              {a.prefs.styles.map(([s, w]) => (
                <div key={s}>
                  <div className="flex justify-between text-[11.5px] mb-0.5"><span>风格 · {s}</span><span className="text-ink-300">{w}</span></div>
                  <div className="h-1.5 rounded-full bg-linen-200 overflow-hidden"><div className="h-full bg-clay-400 rounded-full" style={{ width: `${(w / maxW) * 100}%` }} /></div>
                </div>
              ))}
              {a.prefs.categories.map(([s]) => <span key={s} className="badge bg-linen-200/80 text-ink-500 mr-1">品类 · {s}</span>)}
              {a.prefs.colors.map(([s]) => <span key={s} className="badge bg-indigo-50 text-indigo-500 mr-1">色系 · {s}</span>)}
              {a.prefs.perfs.map(([s]) => <span key={s} className="badge bg-clay-50 text-clay-500 mr-1">性能 · {s}</span>)}
              {a.avgPrice > 0 && <div className="text-[11.5px] text-ink-400 mt-1">关注价格带：约 ¥{a.avgPrice} / 米</div>}
            </div>

            <h4 className="text-[13px] font-semibold mt-5 mb-2.5">定向跟进建议</h4>
            <ul className="space-y-1.5 text-[12.5px] text-ink-600 leading-relaxed">
              {a.suggestions.map((s, i) => <li key={i} className="flex gap-1.5"><span className="text-clay-400 shrink-0">▸</span>{s}</li>)}
            </ul>

            {!!a.recommend.length && (
              <>
                <h4 className="text-[13px] font-semibold mt-5 mb-2.5">系统推荐推送（偏好匹配 · 未接触）</h4>
                <div className="grid grid-cols-3 gap-2">
                  {a.recommend.map((f) => (
                    <div key={f.sku} className="rounded-lg border border-linen-200 overflow-hidden">
                      <img src={fabricImg(f)} alt={f.name} className="w-full aspect-square object-cover" />
                      <div className="p-1.5">
                        <div className="text-[11px] font-medium truncate">{f.name}</div>
                        <div className="text-[10px] text-ink-300 font-mono">{f.sku} · ¥{f.price}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <div>
            <h4 className="text-[13px] font-semibold mb-2.5">行为轨迹明细（{a.tracks.length} 条）</h4>
            <div className="space-y-1.5 max-h-[430px] overflow-auto pr-1">
              {a.tracks.map((t) => {
                const f = db.fabrics.find((x) => x.sku === t.sku)
                return (
                  <div key={t.id} className="flex items-center gap-2 text-[12px] rounded-lg border border-linen-200 px-2.5 py-1.5">
                    <span className={`badge ${t.action === '询价' ? 'bg-clay-100 text-clay-600' : t.action === '收藏' ? 'bg-clay-50 text-clay-500' : t.action === '分享' || t.action === '分享访问' || t.action === 'AI需求' ? 'bg-indigo-50 text-indigo-600' : 'bg-linen-200 text-ink-500'} w-[58px] justify-center shrink-0`}>{t.action}</span>
                    <span className="font-medium truncate flex-1">{f?.name || t.sku}</span>
                    <span className="text-ink-300 text-[10.5px] shrink-0">{t.time}</span>
                  </div>
                )
              })}
              {!a.tracks.length && <div className="text-xs text-ink-300 py-4 text-center">暂无轨迹</div>}
            </div>
          </div>
        </div>

        <div className="text-[10.5px] text-ink-300 mt-5 pt-3 border-t border-dashed border-linen-200">
          报告由布典人生平台根据客户行为轨迹自动生成（{new Date().toLocaleString('zh-CN')}）· 评分模型：询价×5 / 打样×6 / AI需求×4 / 收藏×3 / 分享×2 / 浏览×1 · 仅供内部销售参考
        </div>
      </div>
    </Modal>
  )
}
