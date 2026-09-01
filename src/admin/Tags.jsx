import React, { useState } from 'react'
import { Plus, MoreHorizontal, X } from 'lucide-react'
import { useDB } from '../store/db'
import { PageHead, Modal, Field } from '../components/kit'
import { CATEGORY_PREFIX } from '../data/seed'

const DIM_LABEL = { category: '品类', style: '风格', scene: '场景', perf: '性能', color: '颜色' }

export default function Tags() {
  const { db, addTag, removeTag } = useDB()
  const [dim, setDim] = useState('category')
  const [showNew, setShowNew] = useState(false)
  const [newTag, setNewTag] = useState('')

  const countOf = (t) => db.fabrics.filter((f) =>
    dim === 'category' ? f.category === t
      : dim === 'color' ? f.colorFam === t
        : (f.styles.includes(t) || f.perf.includes(t) || f.scenes.includes(t))
  ).length

  const submit = () => {
    const t = newTag.trim()
    if (t) addTag(dim, t)
    setNewTag('')
    setShowNew(false)
  }

  return (
    <div>
      <PageHead title="标签体系管理" desc="多维度精准描述面料 · 标签驱动筛选、检索与AI推荐">
        <button className="btn-primary" onClick={() => setShowNew(true)}><Plus size={15} /> 新建标签</button>
      </PageHead>

      <div className="flex items-center gap-2 mb-5 rise-1">
        {Object.entries(DIM_LABEL).map(([k, label]) => (
          <button key={k} className={`chip !px-4 !py-1.5 ${dim === k ? 'chip-on' : 'hover:border-indigo-300'}`} onClick={() => setDim(k)}>{label}</button>
        ))}
        <span className="text-xs text-ink-300 ml-2">共 {db.tags[dim].length} 个{DIM_LABEL[dim]}标签</span>
      </div>

      <div className="card p-5 rise-2">
        <div className="grid grid-cols-4 gap-3">
          {db.tags[dim].map((t) => (
            <div key={t} className="group flex items-center gap-3 rounded-xl border border-linen-200 bg-linen-100/60 px-4 py-3 hover:border-indigo-200 transition">
              <div className="min-w-0 flex-1">
                <div className="font-medium text-[14px] flex items-center gap-2">
                  {t}
                  {dim === 'category' && <span className="badge bg-indigo-50 text-indigo-500 font-mono">{CATEGORY_PREFIX[t] || ''}</span>}
                </div>
                <div className="text-[11px] text-ink-300 mt-0.5">{countOf(t)} 款面料</div>
              </div>
              <button className="opacity-0 group-hover:opacity-100 text-ink-300 hover:text-clay-500 transition" title="删除标签"
                onClick={() => window.confirm(`确定删除标签「${t}」？`) && removeTag(dim, t)}>
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showNew} onClose={() => setShowNew(false)} title={`新建${DIM_LABEL[dim]}标签`} width={420}>
        <Field label="标签名称">
          <input className="input" autoFocus placeholder={`输入${DIM_LABEL[dim]}标签，如「奶油风」`} value={newTag}
            onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && submit()} />
        </Field>
        <div className="flex justify-end gap-2 mt-4">
          <button className="btn-ghost" onClick={() => setShowNew(false)}>取消</button>
          <button className="btn-primary" disabled={!newTag.trim()} onClick={submit}>添加</button>
        </div>
      </Modal>
    </div>
  )
}
