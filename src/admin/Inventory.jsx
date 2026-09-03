import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Info } from 'lucide-react'
import { useDB, fabricStatus } from '../store/db'
import { useAuth } from '../auth'
import { PageHead, StatusBadge, Empty } from '../components/kit'
import { FlowModal } from './FabricDetail'
import { fabricImg } from '../lib/visual'

// 色卡台账（US-3.1.3）：仓库管理对象为色卡（张），非面料实物
// 本期无采购入库/销售出库，仅 借用/领用/转借/归还 流转；仅管理员可见可操作
export default function Inventory() {
  const { db, addFlow } = useDB()
  const { user } = useAuth()
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [onlyAlert, setOnlyAlert] = useState(false)
  const [opSku, setOpSku] = useState(null)
  const [tab, setTab] = useState('stock') // stock | flows

  // 仓库色卡数据仅管理员可见（US-3.1.3 权限隔离），非管理员直达URL时回工作台
  React.useEffect(() => {
    if (user?.role !== 'admin') nav('/admin', { replace: true })
  }, [user, nav])

  const rows = useMemo(() => {
    let arr = db.fabrics
    if (q.trim()) {
      const kw = q.trim().toLowerCase()
      arr = arr.filter((f) => (f.name + f.sku).toLowerCase().includes(kw))
    }
    if (onlyAlert) arr = arr.filter((f) => f.stock < f.safety)
    return [...arr].sort((a, b) => a.stock / a.safety - b.stock / b.safety)
  }, [db.fabrics, q, onlyAlert])

  const flows = db.flows
  const opFabric = db.fabrics.find((f) => f.sku === opSku)

  return (
    <div>
      <PageHead title="色卡台账" desc="色卡（张）借用 · 领用 · 转借 · 归还 全流程动态追踪 · 本期不含采购出入库" />

      <div className="flex items-center gap-2 mb-4 rise-1">
        <div className="flex rounded-lg border border-linen-300 overflow-hidden bg-cotton">
          {[['stock', '色卡库存'], ['flows', '流转记录']].map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`px-4 py-2 text-[13px] font-medium ${tab === k ? 'bg-indigo-600 text-white' : 'text-ink-400 hover:bg-linen-200'}`}>{label}</button>
          ))}
        </div>
        {tab === 'stock' && (
          <>
            <div className="relative ml-2">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300" />
              <input className="input !pl-8 w-56" placeholder="搜索面料…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <label className="flex items-center gap-1.5 text-[13px] text-ink-500 cursor-pointer select-none">
              <input type="checkbox" checked={onlyAlert} onChange={(e) => setOnlyAlert(e.target.checked)} className="accent-indigo-600" />
              只看预警（{db.fabrics.filter((f) => f.stock < f.safety).length}）
            </label>
          </>
        )}
      </div>

      {tab === 'stock' ? (
        <>
          <div className="flex items-start gap-2 mb-3 rounded-lg bg-linen-100 p-3 rise-1">
            <Info size={14} className="text-ink-300 mt-0.5 shrink-0" />
            <p className="text-[11.5px] text-ink-400 leading-relaxed">
              台账管理对象为<b>色卡（张）</b>，不含面料实物；本期无采购与销售出库，仅登记色卡的借用 / 领用 / 转借 / 归还。面料成品采购与交易由ERP体系管理。
            </p>
          </div>
          <div className="card overflow-hidden rise-2">
            <table className="w-full">
              <thead className="bg-linen-100/70 border-b border-linen-200">
                <tr>
                  <th className="th">面料</th>
                  <th className="th">品类</th>
                  <th className="th">状态</th>
                  <th className="th w-[180px]">色卡 / 安全线</th>
                  <th className="th">借出中</th>
                  <th className="th text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-linen-200/80">
                {rows.map((f) => {
                  const pct = Math.min(100, (f.stock / (f.safety * 1.5)) * 100)
                  return (
                    <tr key={f.sku} className="hover:bg-linen-100/50 transition">
                      <td className="td">
                        <Link to={`/admin/fabrics/${f.sku}`} className="flex items-center gap-3 group">
                          <img src={fabricImg(f)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          <div>
                            <div className="font-medium group-hover:text-indigo-600 transition-colors">{f.name}</div>
                            <div className="text-[11px] text-ink-300 font-mono">{f.sku} · {f.location}</div>
                          </div>
                        </Link>
                      </td>
                      <td className="td">{f.category}</td>
                      <td className="td"><StatusBadge f={f} /></td>
                      <td className="td">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-linen-200 overflow-hidden">
                            <div className={`h-full rounded-full ${f.stock < f.safety ? 'bg-clay-400' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-ink-400 w-20 shrink-0">{f.stock} / {f.safety}张</span>
                        </div>
                      </td>
                      <td className="td text-[12px]">
                        {f.borrowedBy
                          ? <span className="text-clay-600">{f.borrowedBy.person}（{f.borrowedBy.until}）</span>
                          : <span className="text-ink-300">—</span>}
                      </td>
                      <td className="td text-right">
                        <button className="btn-light !py-1.5" onClick={() => setOpSku(f.sku)}>登记流转</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!rows.length && <Empty text="没有匹配的面料" />}
          </div>
        </>
      ) : (
        <div className="card overflow-hidden rise-2">
          <table className="w-full">
            <thead className="bg-linen-100/70 border-b border-linen-200">
              <tr>
                <th className="th">时间</th>
                <th className="th">类型</th>
                <th className="th">面料</th>
                <th className="th">数量</th>
                <th className="th">经手人</th>
                <th className="th">备注</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-linen-200/80">
              {flows.map((fl) => {
                const f = db.fabrics.find((x) => x.sku === fl.sku)
                return (
                  <tr key={fl.id} className="hover:bg-linen-100/50 transition">
                    <td className="td text-ink-400 text-xs whitespace-nowrap">{fl.time}</td>
                    <td className="td">
                      <span className={`badge w-12 justify-center ${fl.type === '归还' ? 'bg-indigo-50 text-indigo-600' : 'bg-clay-50 text-clay-500'}`}>{fl.type}</span>
                    </td>
                    <td className="td">
                      <Link to={`/admin/fabrics/${fl.sku}`} className="hover:text-indigo-600">{fl.sku} {f?.name}</Link>
                    </td>
                    <td className="td font-medium">{fl.type === '归还' ? '+' : '-'}{fl.qty} 张</td>
                    <td className="td">{fl.person}</td>
                    <td className="td text-ink-400 text-[12.5px]">{fl.note}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <FlowModal open={!!opSku} onClose={() => setOpSku(null)} f={opFabric} onSubmit={(v) => { addFlow(v); setOpSku(null) }} />
    </div>
  )
}
