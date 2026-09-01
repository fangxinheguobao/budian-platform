import React from 'react'
import { Link } from 'react-router-dom'
import { Layers, Users, BookOpen, ClipboardList, AlertTriangle, Flame, ArrowRight } from 'lucide-react'
import { useDB, fabricStatus, customerById } from '../store/db'
import { fabricImg, fmtNum } from '../lib/visual'
import { PageHead, TierBadge } from '../components/kit'

function Kpi({ icon: Icon, label, value, to, accent }) {
  return (
    <Link to={to} className={`card card-hover p-5 block rise ${accent}`}>
      <div className="flex items-center justify-between">
        <div className="text-[13px] text-ink-400">{label}</div>
        <Icon size={18} className="text-ink-300" strokeWidth={1.8} />
      </div>
      <div className="font-display text-[30px] font-bold mt-1.5 leading-none">{fmtNum(value)}</div>
    </Link>
  )
}

export default function Dashboard() {
  const { db } = useDB()
  const { fabrics, customers, ebooks, requests, flows } = db

  const alerts = fabrics
    .filter((f) => f.stock < f.safety)
    .sort((a, b) => a.stock / a.safety - b.stock / b.safety)
  const pending = requests.filter((r) => r.status !== '已完成')
  const top = [...fabrics].sort((a, b) => b.views - a.views).slice(0, 5)

  return (
    <div>
      <PageHead title="工作台" desc="面料数字资产底座 · 今日经营一览" />

      <div className="grid grid-cols-5 gap-4 mb-6">
        <Kpi icon={Layers} label="面料总数" value={fabrics.length} to="/admin/fabrics" accent="rise-1" />
        <Kpi icon={Users} label="客户总数" value={customers.length} to="/admin/customers" accent="rise-1" />
        <Kpi icon={BookOpen} label="电子册数" value={ebooks.length} to="/admin/ebooks" accent="rise-2" />
        <Kpi icon={ClipboardList} label="待处理需求" value={pending.length} to="/admin/sample-lists" accent="rise-2" />
        <Kpi icon={AlertTriangle} label="库存预警" value={alerts.length} to="/admin/inventory" accent="rise-3" />
      </div>

      <div className="grid grid-cols-3 gap-5">
        {/* 热门TOP */}
        <div className="card p-5 rise-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-panel flex items-center gap-2"><Flame size={17} className="text-clay-400" /> 热门面料 TOP 榜</div>
            <span className="text-[11px] text-ink-300">按浏览量</span>
          </div>
          <div className="space-y-3">
            {top.map((f, i) => (
              <Link key={f.sku} to={`/admin/fabrics/${f.sku}`} className="flex items-center gap-3 group">
                <span className={`font-display font-bold w-5 text-center ${i === 0 ? 'text-clay-400 text-lg' : 'text-ink-300'}`}>{i + 1}</span>
                <img src={fabricImg(f)} alt={f.name} className="w-11 h-11 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium truncate group-hover:text-indigo-600 transition-colors">{f.name}</div>
                  <div className="text-[11px] text-ink-300 font-mono">{f.sku}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-[15px]">{fmtNum(f.views)}</div>
                  <div className="text-[10px] text-ink-300">浏览量</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* 最近动态 */}
        <div className="card p-5 rise-2">
          <div className="h-panel mb-4">最近动态</div>
          <div className="space-y-3.5 max-h-[430px] overflow-auto pr-1">
            {flows.slice(0, 8).map((fl) => {
              const f = fabrics.find((x) => x.sku === fl.sku)
              const typeCls = { 入库: 'bg-indigo-50 text-indigo-600', 出库: 'bg-linen-200 text-ink-500', 借用: 'bg-clay-50 text-clay-500', 领用: 'bg-clay-100 text-clay-600', 转借: 'bg-indigo-50 text-indigo-500', 归还: 'bg-indigo-100 text-indigo-700' }[fl.type] || 'bg-linen-200 text-ink-500'
              return (
                <div key={fl.id} className="flex gap-2.5">
                  <span className={`badge ${typeCls} h-fit shrink-0`}>{fl.type}</span>
                  <div className="min-w-0">
                    <div className="text-[12.5px] text-ink-700 leading-snug">
                      {fl.sku} {f?.name} · <b>{fl.type === '入库' || fl.type === '归还' ? '+' : '-'}{fl.qty}</b> 米
                    </div>
                    <div className="text-[11px] text-ink-300 mt-0.5">{fl.person} · {fl.time}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-5">
          {/* 库存预警 */}
          <div className="card p-5 rise-3">
            <div className="flex items-center justify-between mb-3.5">
              <div className="h-panel flex items-center gap-2 text-[15px]"><AlertTriangle size={16} className="text-clay-500" /> 库存预警</div>
              <Link to="/admin/inventory" className="text-xs text-indigo-500 hover:underline flex items-center gap-0.5">库存操作 <ArrowRight size={12} /></Link>
            </div>
            <div className="space-y-2.5">
              {alerts.slice(0, 4).map((f) => {
                const st = fabricStatus(f)
                return (
                  <Link key={f.sku} to={`/admin/fabrics/${f.sku}`} className="flex items-center gap-2.5 group">
                    <span className={`badge ${st.cls} w-[62px] justify-center`}>{st.label}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] truncate group-hover:text-indigo-600 transition-colors">{f.name}</div>
                      <div className="h-1 rounded-full bg-linen-200 mt-1 overflow-hidden">
                        <div className="h-full bg-clay-400 rounded-full" style={{ width: `${Math.min(100, (f.stock / f.safety) * 100)}%` }} />
                      </div>
                    </div>
                    <span className="text-[12px] font-medium text-clay-500 w-12 text-right">{f.stock}m</span>
                  </Link>
                )
              })}
              {!alerts.length && <div className="text-xs text-ink-300 py-3 text-center">库存状态良好，无预警</div>}
            </div>
          </div>

          {/* 待处理需求 */}
          <div className="card p-5 rise-4">
            <div className="flex items-center justify-between mb-3.5">
              <div className="h-panel text-[15px]">待处理客户需求</div>
              <Link to="/admin/sample-lists" className="text-xs text-indigo-500 hover:underline flex items-center gap-0.5">全部 <ArrowRight size={12} /></Link>
            </div>
            <div className="space-y-2.5">
              {pending.slice(0, 3).map((r) => (
                <Link key={r.id} to="/admin/sample-lists" className="block rounded-lg border border-linen-200 hover:border-indigo-200 hover:bg-indigo-50/40 transition p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium">{r.title}</span>
                    <span className={`badge ${r.status === '待处理' ? 'bg-clay-100 text-clay-600' : 'bg-indigo-50 text-indigo-600'}`}>{r.status}</span>
                  </div>
                  <div className="text-[11px] text-ink-400 mt-1">
                    {customerById(db, r.customerId)?.name} · {r.items.length} 款面料 · {r.date}
                  </div>
                </Link>
              ))}
              {!pending.length && <div className="text-xs text-ink-300 py-3 text-center">暂无待处理需求</div>}
            </div>
          </div>

          {/* 新增客户 */}
          <div className="card p-5 rise-4">
            <div className="h-panel text-[15px] mb-3">客户概览</div>
            <div className="space-y-2">
              {customers.slice(0, 3).map((cu) => (
                <div key={cu.id} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-linen-200 font-display font-bold text-sm flex items-center justify-center">{cu.name[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium truncate">{cu.name}</div>
                    <div className="text-[10.5px] text-ink-300">{cu.contact} · {cu.phone}</div>
                  </div>
                  <TierBadge tier={cu.tier} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
