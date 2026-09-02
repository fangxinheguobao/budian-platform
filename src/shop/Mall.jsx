import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Store, MessageSquareText, Flame } from 'lucide-react'
import { useDB, priceFor } from '../store/db'
import { useAuth } from '../auth'
import { FabricCard, AskModal } from '../components/kit'
import { TIER_MAP } from '../data/seed'

// B2B商城（US-3.3.2）：商城化陈列 + 单品询价触发高意向线索；摒弃购物车
export default function Mall() {
  const { db } = useDB()
  const { user, can } = useAuth()
  const [askSku, setAskSku] = useState(null)
  const myCustomer = db.customers.find((c) => c.id === user?.customerId)
  const tier = myCustomer?.tier
  const showStock = can('stock')
  const hot = useMemo(() => [...db.fabrics].sort((a, b) => (a.salesRank || 99) - (b.salesRank || 99)).slice(0, 4), [db.fabrics])

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-6">
      <div className="flex items-end justify-between mb-5 rise">
        <div>
          <h1 className="font-display text-[26px] font-bold leading-tight flex items-center gap-2.5">
            <Store size={24} className="text-indigo-600" /> B2B 商城
          </h1>
          <p className="text-ink-400 text-[13px] mt-1">商城化陈列 · 后台定价 · 无购物车：选中面料直接「询价」，高意向线索实时推送业务员/区域分销商（US-3.3.2）</p>
        </div>
        <div className="badge bg-indigo-50 text-indigo-600 !px-3 !py-1.5">
          {myCustomer ? `${myCustomer.name} · ${TIER_MAP[tier]?.priceTier}` : roleLabelOf(user)}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {db.fabrics.slice(0, 16).map((f) => (
          <FabricCard key={f.sku} f={f} price={tier ? priceFor(f, tier) : undefined} showStock={showStock} to={`/shop/fabrics/${f.sku}`}
            footer={
              <button className="btn-ghost w-full mt-3 !py-1.5" onClick={() => setAskSku(f.sku)}>
                <MessageSquareText size={13} /> 询价
              </button>
            } />
        ))}
      </div>

      <section className="mt-10">
        <h2 className="font-display text-[20px] font-bold mb-4 flex items-center gap-2"><Flame size={17} className="text-clay-400" /> 畅销榜</h2>
        <div className="grid grid-cols-4 gap-4">
          {hot.map((f) => (
            <FabricCard key={f.sku} f={f} price={tier ? priceFor(f, tier) : undefined} showStock={showStock} to={`/shop/fabrics/${f.sku}`} />
          ))}
        </div>
      </section>

      <AskModal open={!!askSku} onClose={() => setAskSku(null)} sku={askSku} tier={tier} />
    </div>
  )
}

function roleLabelOf(user) {
  const map = { admin: '管理员', artist: '后台美工', sales: '业务员', registered: '注册客户' }
  return map[user?.role] || '注册客户'
}
