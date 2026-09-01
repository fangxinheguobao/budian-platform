import React, { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Plus, Minus } from 'lucide-react'
import { useDB, customerById } from '../store/db'
import { PageHead, Field, Empty } from '../components/kit'
import { fabricImg } from '../lib/visual'
import { TIER_MAP } from '../data/seed'

// 电子册编辑器：选择客户 + 勾选面料 → 生成/编辑电子册
export default function EbookEditor() {
  const { id } = useParams()
  const nav = useNavigate()
  const { db, createEbook, updateEbook } = useDB()
  const editing = id && id !== 'new' ? db.ebooks.find((e) => e.id === id) : null

  const [name, setName] = useState(editing?.name || '')
  const [customerId, setCustomerId] = useState(editing?.customerId || db.customers[0]?.id || '')
  const [desc, setDesc] = useState(editing?.desc || '')
  const [picked, setPicked] = useState(editing?.skus || [])
  const [q, setQ] = useState('')

  const pool = useMemo(() => {
    let arr = db.fabrics
    if (q.trim()) {
      const kw = q.trim().toLowerCase()
      arr = arr.filter((f) => (f.name + f.sku).toLowerCase().includes(kw))
    }
    return arr
  }, [db.fabrics, q])

  const cu = customerById(db, customerId)
  const toggle = (sku) => setPicked((p) => (p.includes(sku) ? p.filter((x) => x !== sku) : [...p, sku]))

  const save = () => {
    if (!name.trim() || !picked.length) return
    if (editing) {
      updateEbook(editing.id, { name, desc, skus: picked })
      nav(`/admin/ebooks`)
      window.alert('电子册已更新')
    } else {
      const newId = createEbook({ name: name.trim(), customerId, skus: picked, desc: desc.trim() || '客户专属电子选样方案' })
      nav(`/admin/ebooks`)
      window.alert(`电子册已创建（${newId}），可在列表中分享给客户`)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 rise">
        <Link to="/admin/ebooks" className="btn-ghost !py-1.5"><ArrowLeft size={14} /> 返回列表</Link>
        <span className="text-xs text-ink-400">{editing ? `编辑电子册 ${editing.id}` : '新建电子册'}</span>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-7 rise-1">
          <div className="card p-5">
            <h3 className="h-panel mb-4">选择面料 <span className="text-xs text-ink-300 font-body">已选 {picked.length} 款</span></h3>
            <input className="input mb-3" placeholder="搜索面料…" value={q} onChange={(e) => setQ(e.target.value)} />
            <div className="grid grid-cols-2 gap-2.5 max-h-[480px] overflow-auto pr-1">
              {pool.map((f) => {
                const on = picked.includes(f.sku)
                return (
                  <button key={f.sku} onClick={() => toggle(f.sku)}
                    className={`flex gap-2.5 p-2 rounded-xl border text-left transition ${on ? 'border-indigo-500 bg-indigo-50/60' : 'border-linen-200 hover:border-linen-300 bg-cotton'}`}>
                    <img src={fabricImg(f)} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-[12.5px] font-medium truncate">{f.name}</div>
                      <div className="text-[11px] text-ink-300 font-mono">{f.sku} · ¥{f.price}/米</div>
                    </div>
                    <span className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${on ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-linen-300'}`}>
                      {on && <Check size={12} />}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <div className="col-span-5 space-y-4 rise-2">
          <div className="card p-5 space-y-4">
            <h3 className="h-panel">册子信息</h3>
            <Field label="电子册名称"><input className="input" placeholder="如：春季新品推荐" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="关联客户">
              <select className="input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                {db.customers.map((c) => <option key={c.id} value={c.id}>{c.name}（{TIER_MAP[c.tier]?.label}）</option>)}
              </select>
            </Field>
            <Field label="方案说明"><textarea className="input" rows="2" placeholder="一句话描述这本方案" value={desc} onChange={(e) => setDesc(e.target.value)} /></Field>
          </div>

          <div className="card p-5">
            <h3 className="h-panel mb-3">封面预览</h3>
            {picked.length ? (
              <div className="grid grid-cols-3 gap-1.5 rounded-xl overflow-hidden">
                {picked.slice(0, 3).map((s) => {
                  const f = db.fabrics.find((x) => x.sku === s)
                  return <img key={s} src={fabricImg(f)} alt="" className="aspect-square object-cover w-full" />
                })}
              </div>
            ) : (
              <div className="text-xs text-ink-300 py-6 text-center border border-dashed border-linen-300 rounded-xl">从左侧勾选面料生成封面</div>
            )}
            <button className="btn-primary w-full mt-4" disabled={!name.trim() || !picked.length} onClick={save}>
              {editing ? '保存修改' : '生成电子册'}
            </button>
            {!picked.length && <div className="text-[11px] text-ink-300 text-center mt-2">至少选择 1 款面料</div>}
          </div>

          {!!picked.length && (
            <div className="card p-5">
              <h3 className="h-panel mb-3">已选清单</h3>
              <div className="space-y-2 max-h-56 overflow-auto">
                {picked.map((s) => {
                  const f = db.fabrics.find((x) => x.sku === s)
                  const price = f ? Math.round(f.price * (TIER_MAP[cu?.tier]?.discount ?? 1)) : 0
                  return (
                    <div key={s} className="flex items-center gap-2 text-[12.5px]">
                      <img src={fabricImg(f)} alt="" className="w-8 h-8 rounded-md object-cover" />
                      <span className="flex-1 truncate">{f?.name}</span>
                      <span className="text-ink-400">¥{price}</span>
                      <button className="text-ink-300 hover:text-clay-500" onClick={() => toggle(s)}><Minus size={14} /></button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
