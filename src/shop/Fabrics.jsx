import React, { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Check } from 'lucide-react'
import { useDB, priceFor } from '../store/db'
import { useBasket } from '../basket'
import { FabricCard } from '../components/kit'
import FabricFilters, { applyFilters, countByDims } from '../components/FabricFilters'
import { fabricImg } from '../lib/visual'

const EMPTY_SEL = { category: [], style: [], scene: [], perf: [], stock: [], color: [] }

export default function Fabrics() {
  const { db } = useDB()
  const basket = useBasket()
  const [sp] = useSearchParams()
  const initScene = sp.get('scene')
  const [sel, setSel] = useState({ ...EMPTY_SEL, scene: initScene ? [initScene] : [] })
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('default')

  const counts = useMemo(() => countByDims(db.fabrics), [db.fabrics])
  const list = useMemo(() => {
    let arr = applyFilters(db.fabrics, sel)
    if (q.trim()) {
      const kw = q.trim().toLowerCase()
      arr = arr.filter((f) => (f.name + f.sku + (f.story || '')).toLowerCase().includes(kw))
    }
    if (sort === 'price-asc') arr = [...arr].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') arr = [...arr].sort((a, b) => b.price - a.price)
    if (sort === 'views') arr = [...arr].sort((a, b) => b.views - a.views)
    return arr
  }, [db.fabrics, sel, q, sort])

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      <div className="flex items-end justify-between gap-4 mb-5 rise">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-tight">面料库</h1>
          <p className="text-ink-400 text-[13px] mt-1">高清纹理与真实参数 · 看中的面料可加入询价单或申请样品</p>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        <aside className="card p-5 w-[236px] shrink-0 sticky top-[80px] max-h-[calc(100vh-100px)] overflow-auto rise-1">
          <FabricFilters sel={sel} setSel={setSel} counts={counts} dims={['category', 'style', 'scene', 'perf', 'color']} />
        </aside>

        <div className="flex-1 min-w-0 rise-2">
          <div className="flex items-center gap-2.5 mb-4">
            <input className="input flex-1" placeholder="搜索面料名称、SKU…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">默认排序</option>
              <option value="views">按人气</option>
              <option value="price-asc">价格从低到高</option>
              <option value="price-desc">价格从高到低</option>
            </select>
          </div>
          <div className="text-xs text-ink-400 mb-3">
            {initScene && <span className="badge bg-indigo-50 text-indigo-600 mr-2">场景：{initScene}</span>}
            共 {list.length} 款面料 · 价格按您的档位显示
          </div>

          <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((f) => {
              const myTier = db.customers.find((c) => c.id === basket?.myId)?.tier
              const price = priceFor(f, myTier)
              const inBasket = basket?.basket.some((b) => b.sku === f.sku)
              return (
                <FabricCard key={f.sku} f={f} price={price} showStock={false} to={`/shop/fabrics/${f.sku}`}
                  footer={
                    <div className="flex gap-1.5 mt-3">
                      <button className={`btn flex-1 !py-1.5 ${inBasket ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'btn-ghost'}`}
                        onClick={() => basket?.add(f.sku)}>
                        {inBasket ? <><Check size={13} /> 已在询价篮</> : <><Plus size={13} /> 加入询价篮</>}
                      </button>
                    </div>
                  } />
              )
            })}
          </div>
          {!list.length && <div className="card p-10 text-center text-ink-300 text-sm">没有匹配的面料，试试调整筛选</div>}
        </div>
      </div>
    </div>
  )
}
