import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Check, Scissors, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { useDB, priceFor } from '../store/db'
import { useBasket } from '../basket'
import { fabricImg, weaveSwatch, fmtMoney } from '../lib/visual'
import { IMG, TIER_MAP } from '../data/seed'

export default function FabricDetail() {
  const { sku } = useParams()
  const nav = useNavigate()
  const { db, trackView } = useDB()
  const basket = useBasket()
  const [shot, setShot] = useState(0)
  const [askOpen, setAskOpen] = useState(false)
  const [sampleQty, setSampleQty] = useState(10)
  const [added, setAdded] = useState(false)

  const f = db.fabrics.find((x) => x.sku === sku)
  const me = db.customers.find((c) => c.id === basket?.myId)

  useEffect(() => {
    setShot(0)
    if (f) trackView(f.sku)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku])

  const gallery = useMemo(() => {
    if (!f) return []
    const scenes = ['scene-curtain-sofa', 'scene-living-room', 'scene-gray-curtain', 'scene-lounge', 'scene-showroom', 'scene-beige-curtain']
    const seedNum = f.sku.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)
    const g = [{ type: '主图', src: f.img || weaveSwatch(f.sku, f.hue ?? 220, f.sat ?? 12) }]
    for (let i = 0; i < 3; i++) {
      const name = scenes[(seedNum + i * 2) % scenes.length]
      g.push({ type: '场景效果图', src: `img/${name}.jpg` })
    }
    return g
  }, [f])

  const similar = useMemo(() => {
    if (!f) return []
    return db.fabrics
      .filter((x) => x.sku !== f.sku)
      .map((x) => {
        let s = x.category === f.category ? 2 : 0
        s += x.styles.filter((y) => f.styles.includes(y)).length * 1.5
        s += x.perf.filter((y) => f.perf.includes(y)).length
        return { x, s }
      })
      .filter((v) => v.s >= 3).sort((a, b) => b.s - a.s).slice(0, 4).map((v) => v.x)
  }, [f, db.fabrics])

  if (!f) return <div className="max-w-[1280px] mx-auto px-6 py-16 text-center text-ink-300">面料不存在</div>

  const price = priceFor(f, me?.tier)
  const inBasket = basket?.basket.some((b) => b.sku === f.sku)

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      <button className="btn-ghost !py-1.5 mb-4 rise" onClick={() => nav(-1)}><ArrowLeft size={14} /> 返回</button>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 rise-1">
          <div className="card overflow-hidden">
            <div className="swatch aspect-[4/3] relative">
              <img key={shot} src={gallery[shot]?.src} alt={gallery[shot]?.type} className="w-full h-full object-cover fadein" />
              <div className="absolute bottom-3 left-3 badge bg-ink-900/65 text-linen-50">{gallery[shot]?.type}</div>
              {gallery.length > 1 && <>
                <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cotton/90 shadow-card flex items-center justify-center"
                  onClick={() => setShot((shot - 1 + gallery.length) % gallery.length)}><ChevronLeft size={16} /></button>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cotton/90 shadow-card flex items-center justify-center"
                  onClick={() => setShot((shot + 1) % gallery.length)}><ChevronRight size={16} /></button>
              </>}
            </div>
            <div className="p-3 grid grid-cols-4 gap-2">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setShot(i)}
                  className={`swatch aspect-square rounded-lg overflow-hidden border-2 transition ${i === shot ? 'border-indigo-500' : 'border-transparent hover:border-linen-300'}`}>
                  <img src={g.src} alt={g.type} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-6 rise-2">
          <div className="card p-7">
            <div className="text-xs text-ink-300 font-mono">{f.sku} · {f.category}{f.sub ? ` / ${f.sub}` : ''}</div>
            <h1 className="font-display text-[26px] font-bold mt-1">{f.name}</h1>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="font-display font-bold text-clay-500 text-[28px]">{fmtMoney(price)}</span>
              <span className="text-sm text-ink-400">/ 米</span>
              {me && <span className="badge bg-clay-100 text-clay-600">{TIER_MAP[me.tier]?.priceTier}</span>}
            </div>

            <div className="grid grid-cols-3 gap-3 mt-5">
              {[['克重', `${f.gsm} gsm`], ['门幅', `${f.width} cm`], ['可选颜色', `${f.colors.length} 色`]].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-linen-100 px-3.5 py-2.5">
                  <div className="text-[10.5px] text-ink-400">{k}</div>
                  <div className="text-[14px] font-medium mt-0.5">{v}</div>
                </div>
              ))}
            </div>

            {!!f.colors.length && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs text-ink-400">色卡：</span>
                {f.colors.map((cl, i) => <span key={i} className="w-6 h-6 rounded-full border border-linen-300 shadow-sm" style={{ background: cl }} />)}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-4">
              {f.styles.map((t) => <span key={t} className="badge bg-clay-50 text-clay-500">{t}</span>)}
              {f.perf.map((t) => <span key={t} className="badge bg-indigo-50 text-indigo-500">{t}</span>)}
            </div>

            <p className="text-[13.5px] leading-[1.9] text-ink-600 mt-5">{f.story}</p>

            <div className="flex gap-2.5 mt-6">
              <button className={`flex-1 ${inBasket ? 'btn bg-indigo-50 text-indigo-600 border border-indigo-200' : 'btn-primary'}`}
                onClick={() => basket?.add(f.sku)}>
                {inBasket ? <><Check size={15} /> 已在询价篮</> : <><Plus size={15} /> 加入询价篮</>}
              </button>
              <button className="btn-clay flex-1" onClick={() => setAskOpen(true)}><Scissors size={15} /> 申请样品</button>
              <button className="btn-ghost" onClick={() => setAskOpen(true)}><MessageCircle size={15} /> 咨询</button>
            </div>
            <div className="text-[11.5px] text-ink-300 mt-3">提交后布典人生团队将在 10 分钟内与您联系 · 样品寄送免费</div>
          </div>
        </div>
      </div>

      {/* 相似推荐 */}
      {similar.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-[20px] font-bold mb-4">相似推荐</h2>
          <div className="grid grid-cols-4 gap-4">
            {similar.map((x) => (
              <Link key={x.sku} to={`/shop/fabrics/${x.sku}`} className="card card-hover overflow-hidden group">
                <div className="swatch aspect-[4/3]">
                  <img src={fabricImg(x)} alt={x.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-3.5">
                  <div className="font-medium text-[14px] truncate">{x.name}</div>
                  <div className="text-xs text-ink-400 mt-0.5">{fmtMoney(priceFor(x, me?.tier))}/米 · {x.styles.join(' · ')}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 申请样品弹层 */}
      {askOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center fadein" style={{ background: 'rgba(34,38,45,.42)' }} onClick={() => setAskOpen(false)}>
          <div className="card popup p-6 w-[440px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-[17px]">申请样品 · {f.name}</h3>
            <p className="text-xs text-ink-400 mt-1">我们将按您的档位价格核算并安排寄样（演示环境：提交后进入管理端「客户选样」队列）</p>
            <div className="flex items-center gap-3 mt-5">
              <span className="text-[13px] text-ink-500">样布数量（米）</span>
              <input className="input !w-24" type="number" min="1" value={sampleQty} onChange={(e) => setSampleQty(Math.max(1, Number(e.target.value) || 1))} />
              <span className="text-[13px] text-ink-400">× {fmtMoney(price)}/米</span>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button className="btn-ghost" onClick={() => setAskOpen(false)}>取消</button>
              <button className="btn-primary" onClick={() => {
                basket?.addRequest?.(f.sku, sampleQty)
                setAskOpen(false)
                nav('/shop/my-samples')
              }}>提交申请</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
