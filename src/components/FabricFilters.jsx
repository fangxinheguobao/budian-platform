import React from 'react'
import { useDB } from '../store/db'

// 六维筛选面板：品类 / 风格 / 场景 / 性能 / 库存状态 / 颜色 —— 真实可用
// dims 可控制显示哪些维度（用户端隐藏库存）
export default function FabricFilters({ sel, setSel, counts, dims = ['category', 'style', 'scene', 'perf', 'stock', 'color'] }) {
  const { db } = useDB()
  const tags = db.tags
  const toggle = (dim, v) => {
    setSel((s) => {
      const cur = s[dim] || []
      return { ...s, [dim]: cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v] }
    })
  }
  const Group = ({ title, dim: d, options }) => (
    <div className="mb-5">
      <h3 className="text-xs font-semibold text-ink-400 tracking-wide mb-2">{title}</h3>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = (sel[d] || []).includes(o)
          const n = counts?.[d]?.[o]
          return (
            <button key={o} className={`chip ${on ? 'chip-on' : 'hover:border-indigo-300'}`} onClick={() => toggle(d, o)}>
              {o}{n != null ? ` ${n}` : ''}
            </button>
          )
        })}
      </div>
    </div>
  )

  const stockDims = ['在库充足', '库存偏低', '库存告急']

  return (
    <div>
      {dims.includes('category') && <Group title="品类" dim="category" options={tags.category} />}
      {dims.includes('style') && <Group title="风格" dim="style" options={tags.style} />}
      {dims.includes('scene') && <Group title="场景" dim="scene" options={tags.scene} />}
      {dims.includes('perf') && <Group title="性能" dim="perf" options={tags.perf} />}
      {dims.includes('stock') && <Group title="库存状态" dim="stock" options={stockDims} />}
      {dims.includes('color') && <Group title="颜色" dim="color" options={tags.color} />}
      <button
        className="btn-ghost w-full"
        onClick={() => setSel({ category: [], style: [], scene: [], perf: [], stock: [], color: [] })}
      >
        清除全部筛选
      </button>
    </div>
  )
}

// 依据筛选条件过滤面料
export function applyFilters(fabrics, sel) {
  const stockState = (f) => (f.stock < f.safety * 0.6 ? '库存告急' : f.stock < f.safety ? '库存偏低' : '在库充足')
  return fabrics.filter((f) => {
    if (sel.category?.length && !sel.category.includes(f.category)) return false
    if (sel.style?.length && !f.styles.some((s) => sel.style.includes(s))) return false
    if (sel.scene?.length && !f.scenes.some((s) => sel.scene.includes(s))) return false
    if (sel.perf?.length && !f.perf.some((s) => sel.perf.includes(s))) return false
    if (sel.stock?.length && !sel.stock.includes(stockState(f))) return false
    if (sel.color?.length && !sel.color.includes(f.colorFam)) return false
    return true
  })
}

// 各维度计数（用于筛选标签显示数量）
export function countByDims(fabrics) {
  const counts = {}
  const dim = (key, get) => {
    counts[key] = {}
    fabrics.forEach((f) => {
      const vals = get(f)
      vals.forEach((v) => { counts[key][v] = (counts[key][v] || 0) + 1 })
    })
  }
  dim('category', (f) => [f.category])
  dim('style', (f) => f.styles)
  dim('scene', (f) => f.scenes)
  dim('perf', (f) => f.perf)
  dim('stock', (f) => [f.stock < f.safety * 0.6 ? '库存告急' : f.stock < f.safety ? '库存偏低' : '在库充足'])
  dim('color', (f) => [f.colorFam])
  return counts
}
