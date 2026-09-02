import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Scissors, MessageSquareText, Share2, ShoppingBag, ChevronLeft, ChevronRight, Copy, Check, Heart } from 'lucide-react'
import { useDB, priceFor } from '../store/db'
import { useAuth } from '../auth'
import { fabricImg, weaveSwatch, fmtMoney } from '../lib/visual'
import { TIER_MAP } from '../data/seed'
import { AskModal } from '../components/kit'

export default function FabricDetail() {
  const { sku } = useParams()
  const [sp] = useSearchParams()
  const nav = useNavigate()
  const { db, trackView, addTrack, addProof } = useDB()
  const { user, can, session } = useAuth()
  const [shot, setShot] = useState(0)
  const [askOpen, setAskOpen] = useState(false)
  const [proofOpen, setProofOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [proofQty, setProofQty] = useState(10)
  const [proofNote, setProofNote] = useState('')
  const [copied, setCopied] = useState(false)
  const [faved, setFaved] = useState(false)
  const sharedOnce = useRef(false)

  const f = db.fabrics.find((x) => x.sku === sku)
  const myCustomer = db.customers.find((c) => c.id === user?.customerId)
  const tier = myCustomer?.tier

  useEffect(() => {
    setShot(0)
    if (f) {
      trackView(f.sku)
      if (session) {
        addTrack(f.sku, '浏览', session)
        // 收藏状态恢复（按用户持久化）
        try {
          const favs = JSON.parse(localStorage.getItem('budian_v6_fav_' + user.id) || '[]')
          setFaved(favs.includes(f.sku))
        } catch { /* ignore */ }
      }
    }
    // 分享链路追踪：带 share 参数的访问记录为「分享访问」（US-3.3.3 裂变入口）
    if (f && sp.get('share') && !sharedOnce.current) {
      sharedOnce.current = true
      addTrack(f.sku, '分享访问', session)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku])

  const toggleFav = () => {
    if (!user) return
    let favs = []
    try { favs = JSON.parse(localStorage.getItem('budian_v6_fav_' + user.id) || '[]') } catch { /* ignore */ }
    const next = faved ? favs.filter((x) => x !== f.sku) : [...favs, f.sku]
    localStorage.setItem('budian_v6_fav_' + user.id, JSON.stringify(next))
    setFaved(!faved)
    if (session) addTrack(f.sku, faved ? '浏览' : '收藏', session)
  }

  const gallery = useMemo(() => {
    if (!f) return []
    const scenes = ['scene-curtain-sofa', 'scene-living-room', 'scene-gray-curtain', 'scene-beige-curtain']
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

  const showStock = can('stock')
  const price = priceFor(f, tier)
  const shareUrl = `${location.origin}${location.pathname}#/shop/fabrics/${f.sku}?share=${f.sku}&by=${user?.id || ''}`

  const submitProof = () => {
    addProof({ customerId: user?.customerId || myCustomer?.id, items: [{ sku: f.sku, qty: proofQty }], note: proofNote })
    addTrack(f.sku, '打样', session)
    setProofOpen(false)
    nav('/shop/proofs')
  }

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
                <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cotton/90 shadow-card flex items-center justify-center" onClick={() => setShot((shot - 1 + gallery.length) % gallery.length)}><ChevronLeft size={16} /></button>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cotton/90 shadow-card flex items-center justify-center" onClick={() => setShot((shot + 1) % gallery.length)}><ChevronRight size={16} /></button>
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
              {tier ? (
                <>
                  <span className="font-display font-bold text-clay-500 text-[28px]">{fmtMoney(price)}</span>
                  <span className="text-sm text-ink-400">/ 米</span>
                  <span className="badge bg-clay-100 text-clay-600">{TIER_MAP[tier]?.priceTier}</span>
                </>
              ) : (
                <>
                  <span className="font-display font-bold text-ink-500 text-[22px]">询价获取报价</span>
                  <span className="badge bg-linen-200 text-ink-400">注册客户请联系业务员升级获取专属价</span>
                </>
              )}
            </div>

            {showStock ? (
              <div className="mt-4 rounded-lg bg-linen-100 px-4 py-2.5 text-[12.5px] text-ink-500 flex items-center justify-between">
                <span>当前库存：<b className="text-ink-700">{f.stock} 米</b>（安全线 {f.safety} 米）</span>
                {f.clearance && <span className="badge bg-ink-900 text-linen-50">清仓特价</span>}
              </div>
            ) : (
              <div className="mt-4 rounded-lg bg-linen-100 px-4 py-2.5 text-[12.5px] text-ink-400 flex items-center gap-2">
                <span>库存与现货数据对非授权角色隐藏（商业机密保护，US-3.3.3）</span>
              </div>
            )}

            <div className="grid grid-cols-3 gap-3 mt-4">
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

            <div className="grid grid-cols-2 gap-2.5 mt-6">
              <button className="btn-primary" onClick={() => setAskOpen(true)}><MessageSquareText size={15} /> 询价（触发线索推送）</button>
              <button className="btn-clay" onClick={() => setProofOpen(true)}><Scissors size={15} /> 申请打样</button>
              <button className="btn-ghost" onClick={() => setShareOpen(true)}><Share2 size={15} /> 分享给客户</button>
              <button className={`btn ${faved ? 'bg-clay-50 text-clay-500 border border-clay-200' : 'btn-ghost'}`} onClick={toggleFav}>
                <Heart size={15} fill={faved ? 'currentColor' : 'none'} /> {faved ? '已收藏' : '收藏'}
              </button>
            </div>
            <div className="grid grid-cols-1 mt-2.5">
              <button className="btn bg-linen-200 text-ink-300 cursor-not-allowed border border-linen-300" onClick={() => window.alert('交易功能一期搁置，仅保留下单入口；正式版将开放在线下单。')}>
                <ShoppingBag size={15} /> 在线下单（二期开放）
              </button>
            </div>
            <div className="text-[11.5px] text-ink-300 mt-3">询价后线索将实时推送至您的专属业务员 · 打样单直连ERP双向同步进度</div>
          </div>
        </div>
      </div>

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
                  <div className="text-xs text-ink-400 mt-0.5">{tier ? `${fmtMoney(priceFor(x, tier))}/米` : '询价'} · {x.styles.join(' · ')}</div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <AskModal open={askOpen} onClose={() => setAskOpen(false)} sku={f.sku} tier={tier} />

      {proofOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center fadein" style={{ background: 'rgba(34,38,45,.42)' }} onClick={() => setProofOpen(false)}>
          <div className="card popup p-6 w-[460px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-[17px]">打样单下达 · {f.name}</h3>
            <p className="text-xs text-ink-400 mt-1">打样为需求工单（非交易订单），提交后经平台推送ERP，进度反向回传可实时跟踪（US-3.3.4）。</p>
            <div className="flex items-center gap-3 mt-4">
              <span className="text-[13px] text-ink-500 shrink-0">打样数量（米）</span>
              <input className="input !w-24" type="number" min="1" value={proofQty} onChange={(e) => setProofQty(Math.max(1, Number(e.target.value) || 1))} />
            </div>
            <textarea className="input w-full mt-3" rows="2" placeholder="打样需求说明（款式/规格/用途，选填）" value={proofNote} onChange={(e) => setProofNote(e.target.value)} />
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-ghost" onClick={() => setProofOpen(false)}>取消</button>
              <button className="btn-primary" onClick={submitProof}>提交打样单</button>
            </div>
          </div>
        </div>
      )}

      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center fadein" style={{ background: 'rgba(34,38,45,.42)' }} onClick={() => setShareOpen(false)}>
          <div className="card popup p-6 w-[480px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-[17px]">分享产品</h3>
            <p className="text-xs text-ink-400 mt-1 leading-relaxed">分享链接可作为拉新入口：新用户需<b>注册留资</b>后方可查看内容，层层裂变扩充客户池（US-3.3.3）。</p>
            <div className="flex gap-2 mt-4">
              <input className="input flex-1 font-mono !text-xs" readOnly value={shareUrl} onFocus={(e) => e.target.select()} />
              <button className="btn-primary shrink-0" onClick={() => { navigator.clipboard?.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1500) }}>
                {copied ? <><Check size={13} /> 已复制</> : <><Copy size={13} /> 复制</>}
              </button>
            </div>
            <div className="text-[11px] text-ink-300 mt-3">对方打开链接 → 引导注册 → 注册登录后查看产品详情，系统自动记录其IP大区与浏览轨迹。</div>
          </div>
        </div>
      )}
    </div>
  )
}
