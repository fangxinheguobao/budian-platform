import React, { useState } from 'react'
import { Users, ShieldCheck, Zap } from 'lucide-react'
import { useDB } from '../store/db'
import { PageHead } from '../components/kit'
import { ROLES, PERMISSIONS } from '../data/seed'

// 系统管理（US-3.5.1 角色与权限 / US-3.5.2 数据资产管理与算力配置）
export default function SystemAdmin() {
  const { db, updateUserRole, updateAiConfig } = useDB()
  const [tab, setTab] = useState('users')
  const cfg = db.aiConfig
  const allScenes = ['客厅', '卧室', '书房', '餐厅']
  const roleKeys = [
    ['stock', '库存可见'],
    ['aiGen', 'AI生成'],
    ['leadPush', '询价推送'],
    ['pricing', '定价管理'],
  ]
  const roleList = ['admin', 'artist', 'sales', 'vip', 'dealer_l1', 'dealer_l2', 'registered']

  const toggleScene = (s) => {
    const has = cfg.scenes.includes(s)
    if (has && cfg.scenes.length <= 1) return window.alert('至少保留一个固定场景')
    updateAiConfig({ scenes: has ? cfg.scenes.filter((x) => x !== s) : [...cfg.scenes, s] })
  }
  const toggleRole = (r) => {
    const has = cfg.openRoles.includes(r)
    updateAiConfig({ openRoles: has ? cfg.openRoles.filter((x) => x !== r) : [...cfg.openRoles, r] })
  }

  return (
    <div>
      <PageHead title="系统管理" desc="角色权限（US-3.5.1）· 数据资产管理与算力配置（US-3.5.2）" />

      <div className="flex items-center gap-2 mb-4 rise-1">
        {[[<Users key="1" size={14} />, 'users', '用户与角色'], [<ShieldCheck key="2" size={14} />, 'perm', '权限矩阵'], [<Zap key="3" size={14} />, 'ai', '算力配置']].map(([Icon, k, label]) => (
          <button key={k} className={`btn ${tab === k ? 'bg-indigo-600 text-white' : 'btn-ghost'}`} onClick={() => setTab(k)}>{Icon}{label}</button>
        ))}
      </div>

      {tab === 'users' && (
        <div className="card overflow-hidden rise-2">
          <table className="w-full">
            <thead className="bg-linen-100/70 border-b border-linen-200">
              <tr><th className="th">账号</th><th className="th">手机号</th><th className="th">大区（IP归属）</th><th className="th">剩余算力点</th><th className="th">注册时间</th><th className="th">角色</th></tr>
            </thead>
            <tbody className="divide-y divide-linen-200/80">
              {db.users.map((u) => (
                <tr key={u.id} className="hover:bg-linen-100/50">
                  <td className="td">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-linen-200 font-display font-bold text-sm flex items-center justify-center">{u.name[0]}</div>
                      <span className="font-medium">{u.name}</span>
                    </div>
                  </td>
                  <td className="td font-mono text-[12.5px]">{u.phone}</td>
                  <td className="td text-[12.5px]">{u.region} <span className="text-ink-300 font-mono text-[11px]">({u.ip})</span></td>
                  <td className="td">{u.role === 'admin' ? '—' : `${u.points} 点`}</td>
                  <td className="td text-[12.5px] text-ink-400">{u.registeredAt}</td>
                  <td className="td">
                    <select className="input !w-auto !py-1.5 text-[12.5px]" value={u.role} onChange={(e) => updateUserRole(u.id, e.target.value)}>
                      {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'perm' && (
        <div className="card p-6 rise-2">
          <h3 className="h-panel mb-2">角色权限矩阵</h3>
          <p className="text-xs text-ink-400 mb-4">库存对游客/注册客户隐藏（商业机密保护，US-3.3.3）；AI生成一期仅向业务员/经销商/VIP开放（US-3.4.3）。</p>
          <table className="w-full">
            <thead className="bg-linen-100/70 border-b border-linen-200">
              <tr><th className="th">角色</th>{roleKeys.map(([k, label]) => <th key={k} className="th text-center">{label}</th>)}</tr>
            </thead>
            <tbody className="divide-y divide-linen-200/80">
              {roleList.map((r) => (
                <tr key={r} className="hover:bg-linen-100/50">
                  <td className="td font-medium">{ROLES[r].label}</td>
                  {roleKeys.map(([k]) => (
                    <td key={k} className="td text-center">
                      {PERMISSIONS[r]?.[k]
                        ? <span className="badge bg-indigo-50 text-indigo-600">✓</span>
                        : <span className="badge bg-linen-200 text-ink-300">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[11px] text-ink-300 mt-3">演示环境：权限矩阵为系统预置；正式版支持按角色自定义勾选并实时生效。</p>
        </div>
      )}

      {tab === 'ai' && (
        <div className="grid grid-cols-2 gap-5">
          <div className="card p-6 rise-2">
            <h3 className="h-panel mb-1">固定场景（ADR-03）</h3>
            <p className="text-xs text-ink-400 mb-4">场景「框死」以控制算力消耗——多图合并生成单次成本预估超10元。</p>
            <div className="flex flex-wrap gap-2">
              {allScenes.map((s) => (
                <button key={s} className={`chip !px-4 !py-2 ${cfg.scenes.includes(s) ? 'chip-on' : 'hover:border-indigo-300'}`} onClick={() => toggleScene(s)}>
                  {s} {cfg.scenes.includes(s) ? '✓ 已开放' : '已关闭'}
                </button>
              ))}
            </div>
            <h3 className="h-panel mt-6 mb-3">开放对象（分阶段开放）</h3>
            <div className="flex flex-wrap gap-2">
              {['sales', 'dealer_l1', 'dealer_l2', 'vip', 'registered'].map((r) => (
                <button key={r} className={`chip !px-4 !py-2 ${cfg.openRoles.includes(r) ? 'chip-on' : 'hover:border-indigo-300'}`} onClick={() => toggleRole(r)}>
                  {ROLES[r].label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-ink-300 mt-3">首期仅向业务员/经销商/VIP开放；运行稳定后可售卖算力点或按消耗统一结算（成本中心 → 利润点）。</p>
          </div>
          <div className="card p-6 rise-3">
            <h3 className="h-panel mb-4">消耗规则</h3>
            <div className="space-y-4">
              <label className="block">
                <span className="label">单次生成消耗（算力点）</span>
                <input className="input w-full" type="number" value={cfg.costPerGen} onChange={(e) => updateAiConfig({ costPerGen: Math.max(0, Number(e.target.value) || 0) })} />
              </label>
              <label className="block">
                <span className="label">每月总算力上限（点）</span>
                <input className="input w-full" type="number" value={cfg.monthlyLimit} onChange={(e) => updateAiConfig({ monthlyLimit: Math.max(1, Number(e.target.value) || 1) })} />
              </label>
              <label className="block">
                <span className="label">管控说明</span>
                <textarea className="input w-full" rows="3" value={cfg.note} onChange={(e) => updateAiConfig({ note: e.target.value })} />
              </label>
            </div>
            <div className="mt-4 rounded-lg bg-linen-100 p-3.5 text-[12px] text-ink-500">
              本月已消耗：<b className="text-clay-500">{db.aiRequests.filter((a) => a.status === '已交付').reduce((s, a) => s + (a.cost || 0), 0)}</b> 算力点 · 各账号剩余点数见「用户与角色」
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
