import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Printer, ArrowLeft } from 'lucide-react'
import { useDB, customerById, priceFor } from '../store/db'
import { fabricImg, fmtMoney } from '../lib/visual'

// 电子册在线浏览（分享页）：管理端分享给客户，支持打印导出 PDF
export default function EbookView() {
  const { id } = useParams()
  const { db, trackEbook } = useDB()
  const eb = db.ebooks.find((e) => e.id === id)
  const cu = eb ? customerById(db, eb.customerId) : null

  useEffect(() => { if (eb) trackEbook(eb.id) /* eslint-disable-line */ }, [id])

  if (!eb) {
    return (
      <div className="min-h-screen grid place-items-center bg-linen-100">
        <div className="card p-10 text-center">
          <div className="font-display text-xl font-bold">电子册不存在</div>
          <p className="text-xs text-ink-400 mt-2">链接可能已失效</p>
          <Link to="/shop" className="btn-primary mt-5">进入平台</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linen-100">
      <header className="no-print sticky top-0 bg-cotton/90 backdrop-blur border-b border-linen-200 z-10">
        <div className="max-w-[1080px] mx-auto px-6 h-[58px] flex items-center gap-4">
          <Link to="/shop" className="btn-ghost !py-1.5"><ArrowLeft size={14} /> 返回</Link>
          <div className="font-display font-bold">布典人生 · 电子选样册</div>
          <button className="btn-primary !py-1.5 ml-auto" onClick={() => window.print()}><Printer size={14} /> 打印 / 导出 PDF</button>
        </div>
      </header>

      <div className="max-w-[1080px] mx-auto px-6 py-8">
        {/* 封面 */}
        <div className="card overflow-hidden print-page">
          <div className="relative" style={{ minHeight: 300 }}>
            <div className="grid grid-cols-3 h-[300px]">
              {eb.skus.slice(0, 3).map((s) => {
                const f = db.fabrics.find((x) => x.sku === s)
                return f ? <img key={s} src={fabricImg(f)} alt="" className="w-full h-full object-cover" /> : <div key={s} className="bg-linen-200" />
              })}
            </div>
            <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,32,40,.8), rgba(28,32,40,.15) 60%)' }} />
            <div className="absolute bottom-0 p-8 text-linen-50">
              <div className="text-[11px] tracking-[.3em] opacity-75">BUDIAN LIFE · 面料电子选样册</div>
              <h1 className="font-display text-[32px] font-black mt-2">{eb.name}</h1>
              <div className="text-[13px] opacity-85 mt-2">{eb.desc}</div>
              <div className="text-[11.5px] opacity-65 mt-3">致：{cu?.name} · 呈递日期 {eb.date} · 共 {eb.skus.length} 款面料</div>
            </div>
          </div>
        </div>

        {/* 每款面料一页 */}
        {eb.skus.map((s) => {
          const f = db.fabrics.find((x) => x.sku === s)
          if (!f) return null
          const price = priceFor(f, cu?.tier)
          return (
            <div key={s} className="card p-8 mt-5 print-page">
              <div className="grid grid-cols-2 gap-8 items-center">
                <div className="swatch aspect-[4/3] rounded-xl overflow-hidden">
                  <img src={fabricImg(f)} alt={f.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <div className="text-[11px] text-ink-300 font-mono">{f.sku} · {f.category}</div>
                  <h2 className="font-display text-[24px] font-bold mt-1">{f.name}</h2>
                  <div className="font-display text-clay-500 font-bold text-[20px] mt-2">{fmtMoney(price)}<span className="text-xs text-ink-400 font-body"> / 米（{cu ? '贵司专属价' : '参考价'}）</span></div>
                  <p className="text-[13px] leading-[1.9] text-ink-600 mt-4">{f.story}</p>
                  <div className="grid grid-cols-3 gap-2.5 mt-5">
                    {[['克重', `${f.gsm} gsm`], ['门幅', `${f.width} cm`], ['颜色', `${f.colors.length} 色`]].map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-linen-100 px-3 py-2 text-center">
                        <div className="text-[10px] text-ink-400">{k}</div>
                        <div className="text-[13px] font-medium">{v}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {f.styles.map((t) => <span key={t} className="badge bg-clay-50 text-clay-500">{t}</span>)}
                    {f.perf.map((t) => <span key={t} className="badge bg-indigo-50 text-indigo-500">{t}</span>)}
                  </div>
                </div>
              </div>
              {!!f.colors.length && (
                <div className="flex items-center gap-2.5 mt-6 pt-5 border-t border-linen-200">
                  <span className="text-xs text-ink-400">可选色卡</span>
                  {f.colors.map((cl, i) => (
                    <span key={i} className="flex items-center gap-1.5">
                      <span className="w-7 h-7 rounded-full border border-linen-300" style={{ background: cl }} />
                      <span className="text-[10.5px] text-ink-300">No.{i + 1}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div className="no-print text-center text-xs text-ink-300 mt-8 pb-4">
          本电子册由布典人生面料管理协同平台生成 · 客户浏览记录将辅助销售精准跟进 · 询价请联系统属销售
        </div>
      </div>
    </div>
  )
}
