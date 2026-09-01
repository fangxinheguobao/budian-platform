import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, Trash2, Plus, Minus, Send, Store } from 'lucide-react'
import { useDB, priceFor, customerById } from '../store/db'
import { useBasket } from '../basket'
import { FabricCard, Field, Empty } from '../components/kit'
import { fabricImg, fmtMoney } from '../lib/visual'
import { TIER_MAP } from '../data/seed'

// B2B 商城：商城化陈列 + 询价单提交（流转到管理端「B2B询价单」）
export default function Mall() {
  const { db, addInquiry } = useDB()
  const basket = useBasket()
  const [checkout, setCheckout] = useState(false)
  const [note, setNote] = useState('')
  const [done, setDone] = useState(false)

  const me = customerById(db, basket?.myId)
  const items = basket?.basket || []
  const rows = items.map((it) => {
    const f = db.fabrics.find((x) => x.sku === it.sku)
    return f ? { ...it, f, price: priceFor(f, me?.tier) } : null
  }).filter(Boolean)
  const total = rows.reduce((s, r) => s + r.price * r.qty, 0)

  const hot = useMemo(() => [...db.fabrics].sort((a, b) => b.views - a.views).slice(0, 4), [db.fabrics])

  const submit = () => {
    addInquiry({
      customerId: basket.myId,
      items: items.map((it) => ({ sku: it.sku, qty: it.qty })),
      note: note || '商城询价单',
    })
    basket.clear()
    setCheckout(false)
    setDone(true)
  }

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      <div className="flex items-end justify-between mb-5 rise">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-tight flex items-center gap-2.5">
            <Store size={24} className="text-indigo-600" /> B2B 商城
          </h1>
          <p className="text-ink-400 text-[13px] mt-1">商城化产品陈列 · 按档位价格透明报价 · 询价单实时送达布典人生业务后台</p>
        </div>
        <div className="badge bg-indigo-50 text-indigo-600 !px-3 !py-1.5">
          当前身份：{me?.name} · {TIER_MAP[me?.tier]?.priceTier}
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-8">
          <div className="grid grid-cols-3 gap-4">
            {db.fabrics.slice(0, 12).map((f) => {
              const price = priceFor(f, me?.tier)
              const inBasket = items.some((b) => b.sku === f.sku)
              return (
                <FabricCard key={f.sku} f={f} price={price} showStock={false} to={`/shop/fabrics/${f.sku}`}
                  footer={
                    <button className={`btn w-full mt-3 !py-1.5 ${inBasket ? 'bg-indigo-50 text-indigo-600 border border-indigo-200' : 'btn-ghost'}`}
                      onClick={() => basket?.add(f.sku)}>
                      {inBasket ? '已在询价篮 +1' : <><Plus size={13} /> 加入询价篮</>}
                    </button>
                  } />
              )
            })}
          </div>
        </div>

        {/* 询价篮 */}
        <div className="col-span-4">
          <div className="card p-5 sticky top-[80px] rise-1">
            <h3 className="h-panel flex items-center gap-2"><ShoppingCart size={16} className="text-indigo-600" /> 询价篮 <span className="text-xs text-ink-300 font-body">{items.length} 项</span></h3>
            {rows.length ? (
              <>
                <div className="space-y-2.5 mt-4 max-h-[300px] overflow-auto pr-0.5">
                  {rows.map((r) => (
                    <div key={r.sku} className="flex items-center gap-2.5">
                      <img src={fabricImg(r.f)} alt="" className="w-10 h-10 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px] font-medium truncate">{r.f.name}</div>
                        <div className="text-[11px] text-ink-300">¥{r.price}/米 × {r.qty}米</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button className="btn-ghost !px-1.5 !py-1" onClick={() => basket?.setQty(r.sku, r.qty - 1)}><Minus size={12} /></button>
                        <span className="text-[12.5px] w-7 text-center">{r.qty}</span>
                        <button className="btn-ghost !px-1.5 !py-1" onClick={() => basket?.setQty(r.sku, r.qty + 1)}><Plus size={12} /></button>
                        <button className="text-ink-300 hover:text-clay-500 ml-1" onClick={() => basket?.remove(r.sku)}><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-linen-200">
                  <span className="text-[13px] text-ink-400">预估金额</span>
                  <b className="font-display text-clay-500 text-[19px]">{fmtMoney(total)}</b>
                </div>
                <button className="btn-primary w-full mt-3" onClick={() => setCheckout(true)}><Send size={14} /> 提交询价单</button>
              </>
            ) : (
              <div className="text-center py-8">
                <div className="text-ink-300 text-xs">询价篮是空的</div>
                <div className="text-[11px] text-ink-300 mt-1">从左侧选择面料加入询价篮</div>
              </div>
            )}
          </div>

          <div className="card p-5 mt-4 rise-2">
            <h3 className="h-panel text-[15px] mb-3">热销推荐</h3>
            <div className="space-y-2.5">
              {hot.map((f, i) => (
                <Link key={f.sku} to={`/shop/fabrics/${f.sku}`} className="flex items-center gap-2.5 group">
                  <span className="font-display font-bold text-ink-300 w-4">{i + 1}</span>
                  <img src={fabricImg(f)} alt="" className="w-9 h-9 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] truncate group-hover:text-indigo-600 transition-colors">{f.name}</div>
                    <div className="text-[10.5px] text-ink-300">¥{priceFor(f, me?.tier)}/米</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 提交弹层 */}
      {checkout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center fadein" style={{ background: 'rgba(34,38,45,.42)' }} onClick={() => setCheckout(false)}>
          <div className="card popup p-6 w-[480px]" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display font-bold text-[17px]">提交询价单</h3>
            <div className="text-[13px] text-ink-500 mt-2">
              {me?.name}（{TIER_MAP[me?.tier]?.label}）· {items.length} 项 · 预估 {fmtMoney(total)}
            </div>
            <Field label="备注需求（交期、含税、用途等）">
              <textarea className="input mt-2" rows="3" placeholder="如：酒店翻新项目，含税含运费报价，望3天内回复" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-ghost" onClick={() => setCheckout(false)}>再看看</button>
              <button className="btn-primary" onClick={submit}><Send size={14} /> 确认提交</button>
            </div>
          </div>
        </div>
      )}

      {/* 成功提示 */}
      {done && (
        <div className="fixed inset-0 z-50 flex items-center justify-center fadein" style={{ background: 'rgba(34,38,45,.42)' }} onClick={() => setDone(false)}>
          <div className="card popup p-8 w-[420px] text-center" onClick={(e) => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto text-2xl">✓</div>
            <h3 className="font-display font-bold text-[18px] mt-4">询价单已提交</h3>
            <p className="text-[13px] text-ink-400 mt-2 leading-relaxed">
              询价单已实时送达布典人生业务后台（可在管理端「B2B询价单」查看）。<br />
              业务团队将按您的档位价格回复正式报价单。
            </p>
            <button className="btn-primary mt-5" onClick={() => setDone(false)}>好的</button>
          </div>
        </div>
      )}
    </div>
  )
}
