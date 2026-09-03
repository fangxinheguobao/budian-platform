import React, { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ScanSearch, X, MessageSquareText } from 'lucide-react'
import { useDB } from '../store/db'
import { useAuth } from '../auth'
import { FabricCard, AskModal } from '../components/kit'
import FabricFilters, { applyFilters, countByDims } from '../components/FabricFilters'
import { extractImageFeature, fabricFeature, imageDistance } from '../lib/ai'

const EMPTY_SEL = { category: [], style: [], scene: [], perf: [], stock: [], color: [] }

export default function Fabrics() {
  const { db } = useDB()
  const { user, can } = useAuth()
  const [sp] = useSearchParams()
  const initScene = sp.get('scene')
  const [sel, setSel] = useState({ ...EMPTY_SEL, scene: initScene ? [initScene] : [] })
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('default')
  const [imgSearch, setImgSearch] = useState(null)
  const [imgBusy, setImgBusy] = useState(false)
  const [askSku, setAskSku] = useState(null)
  const fileRef = useRef(null)
  const myCustomer = db.customers.find((c) => c.id === user?.customerId)
  const tier = myCustomer?.tier
  const showStock = can('stock')

  const counts = useMemo(() => countByDims(db.fabrics), [db.fabrics])
  const list = useMemo(() => {
    let arr = applyFilters(db.fabrics, sel)
    if (q.trim()) {
      const kw = q.trim().toLowerCase()
      arr = arr.filter((f) => (f.name + f.sku + (f.story || '')).toLowerCase().includes(kw))
    }
    if (imgSearch) arr = [...arr].sort((a, b) => (imgSearch.order.get(a.sku) ?? 999) - (imgSearch.order.get(b.sku) ?? 999))
    else if (sort === 'sales') arr = [...arr].sort((a, b) => (a.salesRank || 99) - (b.salesRank || 99))
    else if (sort === 'price-asc') arr = [...arr].sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') arr = [...arr].sort((a, b) => b.price - a.price)
    else if (sort === 'views') arr = [...arr].sort((a, b) => b.views - a.views)
    return arr
  }, [db.fabrics, sel, q, sort, imgSearch])

  const doScanSearch = async (file) => {
    setImgBusy(true)
    try {
      const feat = await extractImageFeature(file)
      const withFeat = await Promise.all(db.fabrics.map(async (f) => ({ sku: f.sku, d: imageDistance(feat, await fabricFeature(f)) })))
      setImgSearch({ url: URL.createObjectURL(file), order: new Map(withFeat.sort((a, b) => a.d - b.d).map((x, i) => [x.sku, i])) })
      setSort('default')
    } finally { setImgBusy(false) }
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      <div className="flex items-end justify-between gap-4 mb-5 rise">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-tight">面料库</h1>
          <p className="text-ink-400 text-[13px] mt-1">以图搜图 + 多重属性组合检索 · 畅销品前置（US-3.1.4）{!showStock && ' · 库存数据仅对授权角色开放'}</p>
        </div>
      </div>

      <div className="flex gap-5 items-start">
        <aside className="card p-5 w-[236px] shrink-0 sticky top-[80px] max-h-[calc(100vh-100px)] overflow-auto rise-1">
          <FabricFilters sel={sel} setSel={setSel} counts={counts} dims={['category', 'style', 'scene', 'perf', 'color']} />
        </aside>

        <div className="flex-1 min-w-0 rise-2">
          <div className="flex items-center gap-2.5 mb-4">
            <input className="input flex-1" placeholder="搜索面料名称、SKU…" value={q} onChange={(e) => setQ(e.target.value)} />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) doScanSearch(f); e.target.value = '' }} />
            <button className={`btn ${imgSearch ? 'bg-indigo-600 text-white' : 'btn-ghost'}`} disabled={imgBusy} onClick={() => fileRef.current?.click()}>
              <ScanSearch size={15} /> {imgBusy ? '识别中…' : '以图搜图'}
            </button>
            <select className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">默认排序</option>
              <option value="sales">按畅销排行</option>
              <option value="views">按人气</option>
              <option value="price-asc">价格从低到高</option>
              <option value="price-desc">价格从高到低</option>
            </select>
          </div>

          {imgSearch && (
            <div className="flex items-center gap-3 mb-3 rounded-lg border border-indigo-200 bg-indigo-50/50 px-3.5 py-2.5">
              <img src={imgSearch.url} alt="search" className="w-10 h-10 rounded-lg object-cover" />
              <div className="text-[12.5px] text-ink-600 flex-1">以图搜图结果：按颜色特征相似度排序，可叠加属性条件精准过滤</div>
              <button className="text-ink-400 hover:text-clay-500" onClick={() => setImgSearch(null)}><X size={15} /></button>
            </div>
          )}

          <div className="text-xs text-ink-400 mb-3">共 {list.length} 款面料</div>

          <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
            {list.map((f) => (
              <FabricCard key={f.sku} f={f} showStock={showStock} to={`/shop/fabrics/${f.sku}`}
                footer={
                  <button className="btn-ghost w-full mt-3 !py-1.5" onClick={() => setAskSku(f.sku)}>
                    <MessageSquareText size={13} /> 询价
                  </button>
                } />
            ))}
          </div>
          {!list.length && <div className="card p-10 text-center text-ink-300 text-sm">没有匹配的面料，试试调整筛选</div>}
        </div>
      </div>

      <AskModal open={!!askSku} onClose={() => setAskSku(null)} sku={askSku} tier={tier} />
    </div>
  )
}
