import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useDB, fabricStatus } from '../store/db'
import { PageHead, StatusBadge, Empty } from '../components/kit'
import { FlowModal } from './FabricDetail'
import { fabricImg } from '../lib/visual'

export default function Inventory() {
  const { db } = useDB()
  const [q, setQ] = useState('')
  const [onlyAlert, setOnlyAlert] = useState(false)
  const [opSku, setOpSku] = useState(null)
  const [tab, setTab] = useState('stock') // stock | flows

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
      <PageHead title="样料库存" desc="入库 · 出库 · 借用 · 领用 · 转借 · 归还 全流程动态调度">
      </PageHead>

      <div className="flex items-center gap-2 mb-4 rise-1">
        <div className="flex rounded-lg border border-linen-300 overflow-hidden bg-cotton">
          {[['stock', '库存总览'], ['flows', '流水台账']].map(([k, label]) => (
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
        <div className="card overflow-hidden rise-2">
          <table className="w-full">
            <thead className="bg-linen-100/70 border-b border-linen-200">
              <tr>
                <th className="th">面料</th>
                <th className="th">品类</th>
                <th className="th">状态</th>
                <th className="th w-[180px]">库存 / 安全线</th>
                <th className="th">价格</th>
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
                          <div className="text-[11px] text-ink-300 font-mono">{f.sku}</div>
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
                        <span className="text-xs text-ink-400 w-20 shrink-0">{f.stock} / {f.safety}m</span>
                      </div>
                    </td>
                    <td className="td">¥{f.price}/米</td>
                    <td className="td text-right">
                      <button className="btn-light !py-1.5" onClick={() => setOpSku(f.sku)}>登记出入库</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {!rows.length && <Empty text="没有匹配的面料" />}
        </div>
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
                      <span className={`badge w-12 justify-center ${fl.type === '入库' || fl.type === '归还' ? 'bg-indigo-50 text-indigo-600' : fl.type === '出库' ? 'bg-linen-200 text-ink-500' : 'bg-clay-50 text-clay-500'}`}>{fl.type}</span>
                    </td>
                    <td className="td">
                      <Link to={`/admin/fabrics/${fl.sku}`} className="hover:text-indigo-600">{fl.sku} {f?.name}</Link>
                    </td>
                    <td className="td font-medium">{fl.type === '入库' || fl.type === '归还' ? '+' : '-'}{fl.qty} 米</td>
                    <td className="td">{fl.person}</td>
                    <td className="td text-ink-400 text-[12.5px]">{fl.note}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <FlowModal open={!!opSku} onClose={() => setOpSku(null)} f={opFabric} onSubmit={() => setOpSku(null)} />
    </div>
  )
}
