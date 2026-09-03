import React, { useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LayoutGrid, List, Plus, ScanSearch, X } from 'lucide-react'
import { useDB } from '../store/db'
import { PageHead, FabricCard, Modal, Field, Empty } from '../components/kit'
import FabricFilters, { applyFilters, countByDims } from '../components/FabricFilters'
import { CATEGORY_PREFIX, TAGS } from '../data/seed'
import { fabricImg } from '../lib/visual'
import { extractImageFeature, fabricFeature, imageDistance } from '../lib/ai'

const EMPTY_SEL = { category: [], style: [], scene: [], perf: [], stock: [], color: [] }

export default function Fabrics() {
  const { db, upsertFabric } = useDB()
  const nav = useNavigate()
  const [sel, setSel] = useState(EMPTY_SEL)
  const [q, setQ] = useState('')
  const [sort, setSort] = useState('default')
  const [view, setView] = useState('grid')
  const [showNew, setShowNew] = useState(false)
  const [imgSearch, setImgSearch] = useState(null) // {url, order: Map(sku->rank)}
  const [imgBusy, setImgBusy] = useState(false)
  const fileRef = useRef(null)

  const counts = useMemo(() => countByDims(db.fabrics), [db.fabrics])
  const list = useMemo(() => {
    let arr = applyFilters(db.fabrics, sel)
    if (q.trim()) {
      const kw = q.trim().toLowerCase()
      arr = arr.filter((f) => (f.name + f.sku + (f.story || '')).toLowerCase().includes(kw))
    }
    if (imgSearch) {
      arr = [...arr].sort((a, b) => (imgSearch.order.get(a.sku) ?? 999) - (imgSearch.order.get(b.sku) ?? 999))
    } else if (sort === 'sales') arr = [...arr].sort((a, b) => (a.salesRank || 99) - (b.salesRank || 99))
    else if (sort === 'price-asc') arr = [...arr].sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') arr = [...arr].sort((a, b) => b.price - a.price)
    else if (sort === 'views') arr = [...arr].sort((a, b) => b.views - a.views)
    else if (sort === 'stock') arr = [...arr].sort((a, b) => a.stock / a.safety - b.stock / b.safety)
    return arr
  }, [db.fabrics, sel, q, sort, imgSearch])

  const doScanSearch = async (file) => {
    setImgBusy(true)
    try {
      const feat = await extractImageFeature(file)
      const withFeat = await Promise.all(db.fabrics.map(async (f) => ({ sku: f.sku, d: imageDistance(feat, await fabricFeature(f)) })))
      const order = new Map(withFeat.sort((a, b) => a.d - b.d).map((x, i) => [x.sku, i]))
      setImgSearch({ url: URL.createObjectURL(file), order })
      setSort('default')
    } finally { setImgBusy(false) }
  }

  const filtered = sel.category.length + sel.style.length + sel.scene.length + sel.perf.length + sel.stock.length + sel.color.length > 0 || q.trim()

  return (
    <div>
      <PageHead title="面料库" desc={`面料数字资产中心 · 共 ${db.fabrics.length} 款`}>
        <button className="btn-primary" onClick={() => setShowNew(true)}><Plus size={15} /> 新建面料</button>
      </PageHead>

      <div className="flex gap-5 items-start">
        <aside className="card p-5 w-[240px] shrink-0 sticky top-[74px] max-h-[calc(100vh-96px)] overflow-auto rise-1">
          <FabricFilters sel={sel} setSel={setSel} counts={counts} />
        </aside>

        <div className="flex-1 min-w-0 rise-2">
          <div className="flex items-center gap-2.5 mb-4">
            <input
              className="input flex-1"
              placeholder="搜索面料 SKU、名称、产品故事…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) doScanSearch(f); e.target.value = '' }} />
            <button className={`btn ${imgSearch ? 'bg-indigo-600 text-white' : 'btn-ghost'}`} disabled={imgBusy} onClick={() => fileRef.current?.click()}>
              <ScanSearch size={15} /> {imgBusy ? '识别中…' : '以图搜图'}
            </button>
            <select className="input !w-auto" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="default">默认排序</option>
              <option value="sales">按畅销排行</option>
              <option value="views">按浏览量</option>
              <option value="price-asc">价格从低到高</option>
              <option value="price-desc">价格从高到低</option>
              <option value="stock">库存紧急优先</option>
            </select>
            <div className="flex rounded-lg border border-linen-300 overflow-hidden">
              <button className={`px-2.5 py-2 ${view === 'grid' ? 'bg-indigo-600 text-white' : 'bg-cotton text-ink-400 hover:bg-linen-200'}`} onClick={() => setView('grid')}><LayoutGrid size={15} /></button>
              <button className={`px-2.5 py-2 ${view === 'list' ? 'bg-indigo-600 text-white' : 'bg-cotton text-ink-400 hover:bg-linen-200'}`} onClick={() => setView('list')}><List size={15} /></button>
            </div>
          </div>

          {imgSearch && (
            <div className="flex items-center gap-3 mb-3 rounded-lg border border-indigo-200 bg-indigo-50/50 px-3.5 py-2.5">
              <img src={imgSearch.url} alt="search" className="w-10 h-10 rounded-lg object-cover" />
              <div className="text-[12.5px] text-ink-600 flex-1">以图搜图：已按颜色特征相似度排序（可叠加左侧属性条件精准过滤，US-3.1.4）</div>
              <button className="text-ink-400 hover:text-clay-500" onClick={() => setImgSearch(null)}><X size={15} /></button>
            </div>
          )}

          <div className="text-xs text-ink-400 mb-3">
            {filtered ? <>筛选出 <b className="text-ink-700">{list.length}</b> 款面料</> : <>共 {list.length} 款面料</>}
          </div>

          {!list.length ? (
            <div className="card"><Empty text="没有匹配的面料，试试调整筛选条件" /></div>
          ) : view === 'grid' ? (
            <div className="grid grid-cols-3 xl:grid-cols-4 gap-4">
              {list.map((f) => (
                <FabricCard key={f.sku} f={f} to={`/admin/fabrics/${f.sku}`} />
              ))}
            </div>
          ) : (
            <div className="card divide-y divide-linen-200">
              {list.map((f) => (
                <Link key={f.sku} to={`/admin/fabrics/${f.sku}`} className="flex items-center gap-4 p-3.5 hover:bg-linen-100/70 transition">
                  <img src={fabricImg(f)} alt={f.name} className="w-14 h-14 rounded-lg object-cover swatch" />
                  <div className="w-[240px] min-w-0">
                    <div className="text-[13.5px] font-medium truncate">{f.name}</div>
                    <div className="text-[11px] text-ink-300 font-mono">{f.sku} · {f.category}</div>
                  </div>
                  <div className="text-[12.5px] text-ink-500 w-32">{f.gsm}gsm · {f.width}cm</div>
                  <div className="text-[12.5px] w-20">¥{f.price}/米</div>
                  <div className="text-[12.5px] text-ink-500 w-20">色卡 {f.stock}张</div>
                  <div className="flex-1 flex gap-1 justify-end">
                    {f.styles.slice(0, 3).map((t) => <span key={t} className="badge bg-linen-200/80 text-ink-500">{t}</span>)}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <NewFabricModal open={showNew} onClose={() => setShowNew(false)} onCreate={(f) => { upsertFabric(f); nav(`/admin/fabrics/${f.sku}`) }} />
    </div>
  )
}

function NewFabricModal({ open, onClose, onCreate }) {
  const { db } = useDB()
  const [form, setForm] = useState({ sku: '', name: '', category: '窗帘布', price: '', gsm: '', width: 148, stock: '', safety: 150 })
  const [err, setErr] = useState('')
  const set = (k) => (e) => { setErr(''); setForm((f) => ({ ...f, [k]: e.target.value })) }
  const submit = () => {
    const sku = form.sku.trim().toUpperCase()
    if (!sku || !form.name.trim()) return
    // UC-3.1.1-01 异常流程：编号全局唯一，重复时提示并阻止
    if (db.fabrics.some((x) => x.sku === sku)) {
      setErr(`编号已存在：「${sku}」已被「${db.fabrics.find((x) => x.sku === sku)?.name}」占用，样料编号不可复用，请更换。`)
      return
    }
    onCreate({
      sku,
      name: form.name.trim(),
      category: form.category,
      sub: '新品',
      price: Number(form.price) || 0,
      gsm: Number(form.gsm) || 200,
      width: Number(form.width) || 148,
      stock: Number(form.stock) || 0,
      safety: Number(form.safety) || 150,
      colorFam: '大地系',
      colors: [],
      styles: ['现代简约'],
      scenes: form.category === '服装面料' ? ['服装'] : ['客厅'],
      perf: [],
      img: null,
      hue: Math.floor(Math.random() * 360),
      sat: 15,
      views: 0,
      story: '（新产品，产品故事待补充）',
      craft: { process: '待补充', fastness: '—', shrinkage: '—', strength: '—', eco: '—' },
    })
    onClose()
  }
  return (
    <Modal open={open} onClose={onClose} title="新建面料">
      {err && <div className="mb-4 rounded-lg bg-clay-50 border border-clay-200 text-clay-600 text-[12.5px] px-3.5 py-2.5">{err}</div>}
      <div className="grid grid-cols-2 gap-4">
        <Field label="SKU 编号（唯一）">
          <input className="input" placeholder={`如 ${CATEGORY_PREFIX[form.category]}-031`} value={form.sku} onChange={set('sku')} />
        </Field>
        <Field label="面料名称">
          <input className="input" placeholder="如 轻奢绒面窗帘" value={form.name} onChange={set('name')} />
        </Field>
        <Field label="品类">
          <select className="input" value={form.category} onChange={set('category')}>{TAGS.category.map((c) => <option key={c}>{c}</option>)}</select>
        </Field>
        <Field label="价格（元/米）">
          <input className="input" type="number" value={form.price} onChange={set('price')} />
        </Field>
        <Field label="克重 gsm">
          <input className="input" type="number" value={form.gsm} onChange={set('gsm')} />
        </Field>
        <Field label="门幅 cm">
          <input className="input" type="number" value={form.width} onChange={set('width')} />
        </Field>
        <Field label="初始色卡（张）">
          <input className="input" type="number" value={form.stock} onChange={set('stock')} />
        </Field>
        <Field label="安全库存线（张）">
          <input className="input" type="number" value={form.safety} onChange={set('safety')} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button className="btn-ghost" onClick={onClose}>取消</button>
        <button className="btn-primary" disabled={!form.sku.trim() || !form.name.trim()} onClick={submit}>创建面料档案</button>
      </div>
    </Modal>
  )
}
