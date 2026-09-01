import React, { useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { useDB } from '../store/db'
import { PageHead, Modal, Field, TierBadge, Empty } from '../components/kit'
import { TIER_MAP, SALESPEOPLE } from '../data/seed'

const EMPTY = { name: '', contact: '', phone: '', tier: 'normal', sales: '李销售', status: '活跃', note: '' }

export default function Customers() {
  const { db, upsertCustomer, removeCustomer } = useDB()
  const [editing, setEditing] = useState(null) // null | {} | customer
  const [q, setQ] = useState('')

  const list = db.customers.filter((c) => !q.trim() || (c.name + c.contact + c.sales).includes(q.trim()))

  const save = () => {
    if (!editing.name.trim()) return
    upsertCustomer(editing.id ? editing : { ...editing, id: 'C' + Date.now() })
    setEditing(null)
  }

  return (
    <div>
      <PageHead title="客户管理" desc="分销商（代理商）准入 · 等级与价格档位联动">
        <button className="btn-primary" onClick={() => setEditing({ ...EMPTY })}><Plus size={15} /> 新建客户</button>
      </PageHead>

      <div className="flex items-center gap-3 mb-4 rise-1">
        <input className="input w-72" placeholder="搜索客户名称、联系人、销售员…" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="text-xs text-ink-400">共 {list.length} 个客户 · 等级决定价格档位：VIP→A类专属价 · 一级→B类 · 二级→C类 · 普通→标准价</div>
      </div>

      <div className="card overflow-hidden rise-2">
        <table className="w-full">
          <thead className="bg-linen-100/70 border-b border-linen-200">
            <tr>
              <th className="th">客户名称</th>
              <th className="th">联系人</th>
              <th className="th">联系电话</th>
              <th className="th">等级</th>
              <th className="th">价格档位</th>
              <th className="th">销售员</th>
              <th className="th">状态</th>
              <th className="th text-right">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-linen-200/80">
            {list.map((cu) => (
              <tr key={cu.id} className="hover:bg-linen-100/50 transition">
                <td className="td">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-linen-200 font-display font-bold flex items-center justify-center">{cu.name[0]}</div>
                    <div>
                      <div className="font-medium">{cu.name}</div>
                      <div className="text-[11px] text-ink-300 truncate max-w-[200px]">{cu.note}</div>
                    </div>
                  </div>
                </td>
                <td className="td">{cu.contact}</td>
                <td className="td font-mono text-[12.5px]">{cu.phone}</td>
                <td className="td"><TierBadge tier={cu.tier} /></td>
                <td className="td text-[12.5px]">{TIER_MAP[cu.tier]?.priceTier}</td>
                <td className="td">{cu.sales}</td>
                <td className="td">
                  <span className={`badge ${cu.status === '活跃' ? 'bg-indigo-50 text-indigo-600' : cu.status === '休眠' ? 'bg-linen-200 text-ink-500' : 'bg-clay-100 text-clay-600'}`}>{cu.status}</span>
                </td>
                <td className="td text-right">
                  <div className="flex gap-1 justify-end">
                    <button className="btn-ghost !px-2 !py-1.5" onClick={() => setEditing({ ...cu })}><Pencil size={13} /></button>
                    <button className="btn-ghost !px-2 !py-1.5 hover:!text-clay-500" onClick={() => window.confirm(`确定删除客户「${cu.name}」？`) && removeCustomer(cu.id)}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!list.length && <Empty text="没有匹配的客户" />}
      </div>

      <Modal open={!!editing} onClose={() => setEditing(null)} title={editing?.id ? '编辑客户' : '新建客户'} width={560}>
        {editing && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Field label="客户名称"><input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="联系人"><input className="input" value={editing.contact} onChange={(e) => setEditing({ ...editing, contact: e.target.value })} /></Field>
              <Field label="联系电话"><input className="input" value={editing.phone} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} /></Field>
              <Field label="客户等级">
                <select className="input" value={editing.tier} onChange={(e) => setEditing({ ...editing, tier: e.target.value })}>
                  {Object.entries(TIER_MAP).map(([k, v]) => <option key={k} value={k}>{v.label}（{v.priceTier}）</option>)}
                </select>
              </Field>
              <Field label="销售员">
                <select className="input" value={editing.sales} onChange={(e) => setEditing({ ...editing, sales: e.target.value })}>
                  {SALESPEOPLE.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="状态">
                <select className="input" value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value })}>
                  {['活跃', '休眠', '停用'].map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
            </div>
            <Field label="备注"><textarea className="input" rows="2" value={editing.note} onChange={(e) => setEditing({ ...editing, note: e.target.value })} /></Field>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn-ghost" onClick={() => setEditing(null)}>取消</button>
              <button className="btn-primary" disabled={!editing.name.trim()} onClick={save}>保存</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
