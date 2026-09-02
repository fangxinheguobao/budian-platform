import React, { useMemo } from 'react'
import { Download } from 'lucide-react'
import { useDB, fabricStatus } from '../store/db'
import { PageHead } from '../components/kit'
import { fmtNum } from '../lib/visual'

// 报表中心（US-3.1.5：库存/清仓数据同步 + 多维报表）
export default function Reports() {
  const { db } = useDB()
  const { fabrics, flows, leads, proofs } = db

  const byCategory = useMemo(() => {
    const m = {}
    fabrics.forEach((f) => { m[f.category] = (m[f.category] || 0) + f.stock })
    return Object.entries(m).sort((a, b) => b[1] - a[1])
  }, [fabrics])
  const maxStock = Math.max(...byCategory.map((x) => x[1]), 1)

  const clearance = fabrics.filter((f) => f.clearance || f.stock < f.safety * 0.4)
  const top = [...fabrics].sort((a, b) => (a.salesRank || 99) - (b.salesRank || 99)).slice(0, 10)
  const flowStats = useMemo(() => {
    const m = {}
    flows.forEach((fl) => { m[fl.type] = (m[fl.type] || 0) + fl.qty })
    return Object.entries(m)
  }, [flows])

  const downloadCsv = (name, rows) => {
    const csv = '\uFEFF' + rows.map((r) => r.join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = name
    a.click()
  }

  return (
    <div>
      <PageHead title="报表中心" desc="库存与清仓数据同步 · 多维度决策报表（PC端）· US-3.1.5">
        <button className="btn-ghost" onClick={() => downloadCsv('库存报表.csv', [['SKU', '名称', '品类', '库存', '安全线', '状态', '货架位置', '清仓'], ...fabrics.map((f) => [f.sku, f.name, f.category, f.stock, f.safety, fabricStatus(f).label, f.location, f.clearance ? '是' : '否'])])}>
          <Download size={14} /> 导出库存报表
        </button>
      </PageHead>

      <div className="grid grid-cols-3 gap-5">
        <div className="card p-5 rise-1 col-span-2">
          <h3 className="h-panel mb-4">库存分布（按品类 · 米）</h3>
          <div className="space-y-3">
            {byCategory.map(([cat, stock]) => (
              <div key={cat}>
                <div className="flex justify-between text-[12.5px] mb-1"><span>{cat}</span><span className="font-medium">{fmtNum(stock)} m</span></div>
                <div className="h-2.5 rounded-full bg-linen-200 overflow-hidden">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(stock / maxStock) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
          <h3 className="h-panel mt-7 mb-4">样料流转统计（累计米数）</h3>
          <div className="grid grid-cols-6 gap-2.5">
            {flowStats.map(([type, qty]) => (
              <div key={type} className="rounded-lg bg-linen-100 p-3 text-center">
                <div className="text-[10.5px] text-ink-400">{type}</div>
                <div className="font-display font-bold text-[16px] mt-1">{fmtNum(qty)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-5 rise-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="h-panel">畅销排行 TOP10</h3>
            <button className="btn-ghost !py-1" onClick={() => downloadCsv('畅销排行.csv', [['排名', 'SKU', '名称', '浏览量'], ...top.map((f, i) => [i + 1, f.sku, f.name, f.views])])}><Download size={12} /></button>
          </div>
          <div className="space-y-2.5">
            {top.map((f, i) => (
              <div key={f.sku} className="flex items-center gap-2.5">
                <span className={`font-display font-bold w-5 text-center ${i < 3 ? 'text-clay-400' : 'text-ink-300'}`}>{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-[12.5px] font-medium truncate">{f.name}</div>
                  <div className="text-[10.5px] text-ink-300 font-mono">{f.sku} · {f.category}</div>
                </div>
                <span className="text-[12px] text-ink-400">{fmtNum(f.views)} 浏览</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card mt-5 overflow-hidden rise-3">
        <div className="flex items-center justify-between px-5 py-4 border-b border-linen-200">
          <h3 className="h-panel">清仓同步清单 <span className="text-xs text-ink-300 font-body">清仓标记 + 库存紧缺自动纳入，工艺纹理属性已注入，可精准同步至清仓渠道</span></h3>
          <button className="btn-ghost !py-1.5" onClick={() => downloadCsv('清仓清单.csv', [['SKU', '名称', '库存', '克重', '门幅', '纹理', '货架位置'], ...clearance.map((f) => [f.sku, f.name, f.stock, f.gsm, f.width, f.sub, f.location])])}>
            <Download size={13} /> 导出清仓清单
          </button>
        </div>
        <table className="w-full">
          <thead className="bg-linen-100/70 border-b border-linen-200">
            <tr><th className="th">SKU</th><th className="th">名称</th><th className="th">库存</th><th className="th">工艺</th><th className="th">货架位置</th><th className="th">标记</th></tr>
          </thead>
          <tbody className="divide-y divide-linen-200/80">
            {clearance.map((f) => (
              <tr key={f.sku} className="hover:bg-linen-100/50">
                <td className="td font-mono text-xs">{f.sku}</td>
                <td className="td font-medium">{f.name}</td>
                <td className="td text-clay-500 font-medium">{f.stock}m</td>
                <td className="td text-[12.5px]">{f.gsm}gsm · {f.width}cm · {f.sub}</td>
                <td className="td text-[12.5px]">{f.location}</td>
                <td className="td">{f.clearance ? <span className="badge bg-ink-900 text-linen-50">清仓</span> : <span className="badge bg-clay-100 text-clay-600">紧缺</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-3 gap-5 mt-5">
        <div className="card p-5 rise-4 text-center"><div className="text-2xl font-display font-bold">{leads.length}</div><div className="text-xs text-ink-400 mt-1">累计询价线索</div></div>
        <div className="card p-5 rise-4 text-center"><div className="text-2xl font-display font-bold">{proofs.length}</div><div className="text-xs text-ink-400 mt-1">累计打样单</div></div>
        <div className="card p-5 rise-4 text-center"><div className="text-2xl font-display font-bold">{fmtNum(fabrics.reduce((s, f) => s + f.stock, 0))}</div><div className="text-xs text-ink-400 mt-1">样料总库存（米）</div></div>
      </div>
    </div>
  )
}
