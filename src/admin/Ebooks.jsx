import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Share2, Trash2, ExternalLink } from 'lucide-react'
import { useDB, customerById } from '../store/db'
import { PageHead, Empty, Modal } from '../components/kit'
import { fabricImg } from '../lib/visual'

export default function Ebooks() {
  const { db, removeEbook } = useDB()
  const [shareId, setShareId] = useState(null)
  const shareUrl = shareId ? `${location.origin}${location.pathname}#/ebook/${shareId}` : ''

  return (
    <div>
      <PageHead title="电子册" desc="将分散的产品资料整合为可搜索、可组册、可分享、可追踪的智能销售工具">
        <Link to="/admin/ebooks/new" className="btn-primary"><Plus size={15} /> 新建电子册</Link>
      </PageHead>

      {db.ebooks.length ? (
        <div className="grid grid-cols-3 gap-4">
          {db.ebooks.map((eb) => {
            const cu = customerById(db, eb.customerId)
            const fabs = eb.skus.map((s) => db.fabrics.find((f) => f.sku === s)).filter(Boolean)
            return (
              <div key={eb.id} className="card card-hover overflow-hidden rise-1">
                <Link to={`/admin/ebooks/${eb.id}`} className="block relative">
                  <div className="grid grid-cols-3 h-36">
                    {(fabs.length ? fabs : [null, null, null]).slice(0, 3).map((f, i) => (
                      <div key={i} className="swatch">
                        {f && <img src={fabricImg(f)} alt={f.name} className="w-full h-full object-cover" loading="lazy" />}
                      </div>
                    ))}
                  </div>
                  <span className="absolute top-2.5 left-2.5 badge bg-ink-900/70 text-linen-50">{eb.skus.length} 款面料</span>
                </Link>
                <div className="p-4">
                  <Link to={`/admin/ebooks/${eb.id}`} className="font-display font-bold text-[15.5px] hover:text-indigo-600 transition-colors">{eb.name}</Link>
                  <p className="text-xs text-ink-400 mt-1 line-clamp-2 h-8">{eb.desc}</p>
                  <div className="flex items-center justify-between mt-2.5 text-[11.5px] text-ink-400">
                    <span>{cu?.name}</span>
                    <span>{eb.date} · {eb.views} 次浏览</span>
                  </div>
                  <div className="flex gap-2 mt-3 pt-3 border-t border-linen-200">
                    <Link to={`/admin/ebooks/${eb.id}`} className="btn-light flex-1 !py-1.5">编辑</Link>
                    <button className="btn-light flex-1 !py-1.5" onClick={() => setShareId(eb.id)}><Share2 size={13} /> 分享</button>
                    <button className="btn-ghost !py-1.5 hover:!text-clay-500" onClick={() => window.confirm(`确定删除电子册《${eb.name}》？`) && removeEbook(eb.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="card"><Empty text="还没有电子册，点击右上角新建" /></div>
      )}

      <Modal open={!!shareId} onClose={() => setShareId(null)} title="分享电子册" width={520}>
        <p className="text-[13px] text-ink-500 mb-3">将链接或二维码发送给客户，客户打开即可在线浏览这本电子册（演示环境数据存于本浏览器）。</p>
        <div className="flex gap-2">
          <input className="input flex-1 font-mono !text-xs" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
          <button className="btn-primary shrink-0" onClick={() => { navigator.clipboard?.writeText(shareUrl); window.alert('链接已复制') }}>复制链接</button>
        </div>
        <div className="flex gap-3 mt-4 items-center">
          <a className="btn-ghost" href={shareUrl} target="_blank" rel="noreferrer"><ExternalLink size={14} /> 打开预览</a>
          <span className="text-[11px] text-ink-300">客户浏览、收藏等行为将被记录，辅助销售精准跟进</span>
        </div>
      </Modal>
    </div>
  )
}
