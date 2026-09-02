import React from 'react'
import { Link } from 'react-router-dom'
import { Layers, Users, ClipboardList, AlertTriangle, Flame, ArrowRight, Target, Wand2, FileText } from 'lucide-react'
import { useDB, customerById } from '../store/db'
import { useAuth } from '../auth'
import { fabricImg, fmtNum } from '../lib/visual'
import { TierBadge } from '../components/kit'

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
  const { user } = useAuth()
  const { fabrics, customers, ebooks, proofs, leads, flows, aiRequests } = db

  const alerts = fabrics.filter((f) => f.stock < f.safety).sort((a, b) => a.stock / a.safety - b.stock / b.safety)
  const pendingProofs = proofs.filter((r) => r.status !== '已完成')
  const pendingLeads = leads.filter((l) => l.status === '待跟进')
  const pendingAi = aiRequests.filter((a) => a.status === '待处理')
  const top = [...fabrics].sort((a, b) => (a.salesRank || 99) - (b.salesRank || 99)).slice(0, 5)

  return (
    <div>
      <PageHeadTitle name={user?.name} />

      <div className="grid grid-cols-6 gap-4 mb-6">
        <Kpi icon={Layers} label="面料总数" value={fabrics.length} to="/admin/fabrics" accent="rise-1" />
        <Kpi icon={Users} label="客户总数" value={customers.length} to="/admin/customers" accent="rise-1" />
        <Kpi icon={FileText} label="电子画册" value={ebooks.length} to="/admin/ebooks" accent="rise-2" />
        <Kpi icon={Target} label="待跟进线索" value={pendingLeads.length} to="/admin/leads" accent="rise-2" />
        <Kpi icon={ClipboardList} label="进行中打样" value={pendingProofs.length} to="/admin/proofs" accent="rise-3" />
        <Kpi icon={AlertTriangle} label="库存预警" value={alerts.length} to="/admin/inventory" accent="rise-3" />
      </div>

      {pendingAi.length > 0 && (
        <Link to="/admin/ai-studio" className="card p-4 mb-6 flex items-center gap-3 border-clay-200 bg-clay-50/60 hover:shadow-card transition rise-2">
          <Wand2 size={18} className="text-clay-500" />
          <div className="flex-1 text-[13.5px]">AI协同：<b>{pendingAi.length} 条成品效果需求</b>待后台美工处理（固定场景：客厅 / 卧室 · 承诺10分钟内交付）</div>
          <span className="text-xs text-clay-500 flex items-center gap-0.5">去处理 <ArrowRight size={12} /></span>
        </Link>
      )}

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-5 rise-1">
          <div className="flex items-center justify-between mb-4">
            <div className="h-panel flex items-center gap-2"><Flame size={17} className="text-clay-400" /> 畅销 TOP 榜</div>
            <Link to="/admin/reports" className="text-[11px] text-ink-300 hover:text-indigo-500">销售排行 →</Link>
          </div>
          <div className="space-y-3">
            {top.map((f, i) => (
              <Link key={f.sku} to={`/admin/fabrics/${f.sku}`} className="flex items-center gap-3 group">
                <span className={`font-display font-bold w-5 text-center ${i === 0 ? 'text-clay-400 text-lg' : 'text-ink-300'}`}>{i + 1}</span>
                <img src={fabricImg(f)} alt={f.name} className="w-11 h-11 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13.5px] font-medium truncate group-hover:text-indigo-600 transition-colors">{f.name}</div>
                  <div className="text-[11px] text-ink-300 font-mono">{f.sku} · {f.location}</div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold text-[15px]">{fmtNum(f.views)}</div>
                  <div className="text-[10px] text-ink-300">浏览量</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

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
                    <div className="text-[12.5px] text-ink-700 leading-snug">{fl.sku} {f?.name} · <b>{fl.type === '入库' || fl.type === '归还' ? '+' : '-'}{fl.qty}</b> 米</div>
                    <div className="text-[11px] text-ink-300 mt-0.5">{fl.person} · {fl.time}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-5 rise-3">
            <div className="flex items-center justify-between mb-3.5">
              <div className="h-panel flex items-center gap-2 text-[15px]"><AlertTriangle size={16} className="text-clay-500" /> 库存预警</div>
              <Link to="/admin/inventory" className="text-xs text-indigo-500 hover:underline flex items-center gap-0.5">库存操作 <ArrowRight size={12} /></Link>
            </div>
            <div className="space-y-2.5">
              {alerts.slice(0, 4).map((f) => (
                <Link key={f.sku} to={`/admin/fabrics/${f.sku}`} className="flex items-center gap-2.5 group">
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] truncate group-hover:text-indigo-600 transition-colors">{f.name}</div>
                    <div className="h-1 rounded-full bg-linen-200 mt-1 overflow-hidden">
                      <div className="h-full bg-clay-400 rounded-full" style={{ width: `${Math.min(100, (f.stock / f.safety) * 100)}%` }} />
                    </div>
                  </div>
                  <span className="text-[12px] font-medium text-clay-500 w-12 text-right">{f.stock}m</span>
                </Link>
              ))}
              {!alerts.length && <div className="text-xs text-ink-300 py-3 text-center">库存状态良好，无预警</div>}
            </div>
          </div>

          <div className="card p-5 rise-4">
            <div className="flex items-center justify-between mb-3.5">
              <div className="h-panel text-[15px]">最新线索</div>
              <Link to="/admin/leads" className="text-xs text-indigo-500 hover:underline flex items-center gap-0.5">全部 <ArrowRight size={12} /></Link>
            </div>
            <div className="space-y-2.5">
              {leads.slice(0, 3).map((l) => (
                <Link key={l.id} to="/admin/leads" className="block rounded-lg border border-linen-200 hover:border-indigo-200 hover:bg-indigo-50/40 transition p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium">{customerById(db, l.customerId)?.name}</span>
                    <span className={`badge ${l.status === '待跟进' ? 'bg-clay-100 text-clay-600' : 'bg-indigo-50 text-indigo-600'}`}>{l.status}</span>
                  </div>
                  <div className="text-[11px] text-ink-400 mt-1">{l.sku} {fabrics.find((f) => f.sku === l.sku)?.name} · {l.time}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="card p-5 rise-4">
            <div className="h-panel text-[15px] mb-3">客户概览</div>
            <div className="space-y-2">
              {customers.slice(0, 3).map((cu) => (
                <div key={cu.id} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-linen-200 font-display font-bold text-sm flex items-center justify-center">{cu.name[0]}</div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium truncate">{cu.name}</div>
                    <div className="text-[10.5px] text-ink-300">{cu.region}</div>
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

function PageHeadTitle({ name }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5 rise">
      <div>
        <h1 className="font-display text-[26px] font-bold leading-tight">工作台</h1>
        <p className="text-ink-400 text-[13px] mt-1">{name}，欢迎回来 · 样料数字资产 / 电子画册 / B2B获客 / AI协同</p>
      </div>
    </div>
  )
}
