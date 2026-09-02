import React, { useEffect, useRef, useState } from 'react'
import { Wand2, CheckCircle2, Clock, Zap, Download, Info } from 'lucide-react'
import { useDB } from '../store/db'
import { useAuth } from '../auth'
import { PageHead, Empty } from '../components/kit'
import { SCENES, composite } from '../lib/composite'
import { fabricImg } from '../lib/visual'
import { ROLES } from '../data/seed'

// AI协同工作台（US-3.4.2 后台人工协同生成「边聊边做」）
// 前台聊天框需求 → 后台美工按固定场景（客厅/卧室）生成 → 10分钟内交付；算力管控见右侧（US-3.4.3）
export default function AIStudio() {
  const { db, deliverAi } = useDB()
  const [activeId, setActiveId] = useState(db.aiRequests[0]?.id)
  const [sceneId, setSceneId] = useState(null)
  const [sku, setSku] = useState('')
  const [busy, setBusy] = useState(false)
  const [pos, setPos] = useState(50)
  const [err, setErr] = useState('')
  const canvasRef = useRef(null)
  const beforeRef = useRef(null)
  const resultRef = useRef('')

  const active = db.aiRequests.find((a) => a.id === activeId)
  const cfg = db.aiConfig
  // 固定场景（ADR-03：暂定客厅、卧室，场景「框死」控制算力）
  const allowedScenes = SCENES.filter((s) => cfg.scenes.some((n) => s.name.includes(n)))
  const curScene = allowedScenes.find((s) => s.id === sceneId) || null
  const fabric = db.fabrics.find((f) => f.sku === (sku || active?.sku))
  const queue = db.aiRequests
  const delivered = db.aiRequests.filter((a) => a.status === '已交付')
  const totalCost = delivered.reduce((s, a) => s + (a.cost || 0), 0)

  useEffect(() => {
    // 工单默认带入其场景与面料
    if (!active) return
    const match = allowedScenes.find((s) => active.scene && s.name.includes(active.scene)) || allowedScenes[0]
    setSceneId(match?.id || null)
    setSku(active.sku || db.fabrics[0]?.sku)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId])

  useEffect(() => {
    if (!canvasRef.current || !curScene || !fabric) return
    let dead = false
    setBusy(true); setErr('')
    composite(curScene, fabric, canvasRef.current, beforeRef.current)
      .then(() => {
        if (!dead) resultRef.current = canvasRef.current.toDataURL('image/jpeg', 0.85)
      })
      .catch(() => setErr('生成失败，请重试'))
      .finally(() => !dead && setBusy(false))
    return () => { dead = true }
  }, [sceneId, sku])

  const deliver = () => {
    if (!active) return
    deliverAi(active.id, resultRef.current, cfg.costPerGen)
  }

  return (
    <div>
      <PageHead title="AI 协同工作台" desc="后台人工协同生成（边聊边做）· 前台聊天框需求 → 后台按固定场景出图 → 10分钟内交付（US-3.4.2）" />

      <div className="grid grid-cols-12 gap-5">
        {/* 需求队列 */}
        <div className="col-span-3 space-y-2.5">
          <div className="card p-4 rise-1">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-[14px]">成品效果需求</h3>
              <span className="badge bg-clay-100 text-clay-600">{queue.filter((a) => a.status === '待处理').length} 待处理</span>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-auto pr-0.5">
              {queue.map((a) => (
                <button key={a.id} onClick={() => setActiveId(a.id)}
                  className={`w-full text-left rounded-lg border p-2.5 transition ${activeId === a.id ? 'border-indigo-500 bg-indigo-50/60' : 'border-linen-200 hover:border-linen-300 bg-cotton'}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-medium">{a.fromName}</span>
                    <span className={`badge ${a.status === '待处理' ? 'bg-clay-100 text-clay-600' : 'bg-indigo-50 text-indigo-600'}`}>{a.status}</span>
                  </div>
                  <div className="text-[11.5px] text-ink-400 mt-1 line-clamp-2">{a.text}</div>
                  <div className="text-[10.5px] text-ink-300 mt-1">{a.time} · 场景：{a.scene}</div>
                </button>
              ))}
              {!queue.length && <div className="text-xs text-ink-300 text-center py-4">暂无需求</div>}
            </div>
          </div>

          {/* 算力管控 */}
          <div className="card p-4 rise-2">
            <h3 className="font-display font-bold text-[14px] flex items-center gap-1.5 mb-3"><Zap size={14} className="text-clay-400" /> 算力管控</h3>
            <div className="space-y-2 text-[12px]">
              <div className="flex justify-between"><span className="text-ink-400">固定场景</span><span className="font-medium">{cfg.scenes.join(' / ')}（框死）</span></div>
              <div className="flex justify-between"><span className="text-ink-400">单次消耗</span><span className="font-medium">{cfg.costPerGen} 算力点（≈¥{cfg.costPerGen}）</span></div>
              <div className="flex justify-between"><span className="text-ink-400">本月已耗</span><span className="font-medium text-clay-500">{totalCost} / {cfg.monthlyLimit} 点</span></div>
              <div className="h-1.5 rounded-full bg-linen-200 overflow-hidden mt-1">
                <div className="h-full bg-clay-400 rounded-full" style={{ width: `${Math.min(100, (totalCost / cfg.monthlyLimit) * 100)}%` }} />
              </div>
              <div className="flex justify-between"><span className="text-ink-400">开放对象</span><span className="font-medium">业务员 / 经销商 / VIP</span></div>
            </div>
            <p className="text-[10.5px] text-ink-300 mt-2.5 leading-relaxed">{cfg.note}</p>
          </div>
        </div>

        {/* 生成工作区 */}
        <div className="col-span-9">
          {active ? (
            <div className="card p-5 rise-2">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-xs text-ink-300">{active.id} · 来自「{active.fromName}」（{ROLES[db.users.find((u) => u.id === active.fromUser)?.role || 'registered']?.label}）· {active.time}</div>
                  <p className="text-[14px] font-medium mt-1">「{active.text}」</p>
                  <div className="text-[11.5px] text-ink-400 mt-1">指定场景：{active.scene} · 参考面料：{active.sku} {fabric?.name}</div>
                </div>
                {active.status === '待处理' ? (
                  <button className="btn-primary shrink-0" disabled={!curScene || busy || !resultRef.current} onClick={deliver}>
                    <CheckCircle2 size={14} /> 交付前台（扣 {cfg.costPerGen} 算力点）
                  </button>
                ) : (
                  <span className="badge bg-indigo-50 text-indigo-600 shrink-0">已交付 · {active.doneAt} · 消耗{active.cost}点</span>
                )}
              </div>

              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-3 space-y-3">
                  <div>
                    <h4 className="text-xs font-semibold text-ink-400 mb-2">固定场景（不可自由设计）</h4>
                    <div className="space-y-1.5">
                      {allowedScenes.map((s) => (
                        <button key={s.id} onClick={() => setSceneId(s.id)}
                          className={`w-full flex items-center gap-2 rounded-lg border p-1.5 transition ${sceneId === s.id ? 'border-indigo-500 bg-indigo-50/60' : 'border-linen-200 hover:border-linen-300'}`}>
                          <img src={s.img} alt={s.name} className="w-14 h-9 rounded object-cover" />
                          <span className="text-[12px] font-medium">{s.name}</span>
                        </button>
                      ))}
                    </div>
                    {db.aiConfig.scenes.length < SCENES.length && (
                      <p className="text-[10.5px] text-ink-300 mt-1.5">其余场景已按算力管控策略关闭</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-ink-400 mb-2">选面料</h4>
                    <div className="grid grid-cols-3 gap-1.5 max-h-[220px] overflow-auto pr-0.5">
                      {db.fabrics.map((f) => (
                        <button key={f.sku} onClick={() => setSku(f.sku)} title={f.name}
                          className={`swatch aspect-square rounded-lg overflow-hidden border-2 transition ${sku === f.sku ? 'border-indigo-500' : 'border-transparent hover:border-linen-300'}`}>
                          <img src={fabricImg(f)} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="col-span-9">
                  <div className="relative rounded-xl overflow-hidden select-none bg-linen-200">
                    <canvas ref={canvasRef} className="w-full block" />
                    <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
                      <canvas ref={beforeRef} className="absolute top-0 left-0 h-full w-auto block" />
                    </div>
                    <div className="absolute top-0 bottom-0 w-[2px] bg-white/90 shadow" style={{ left: `${pos}%` }}>
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lift flex items-center justify-center">
                        <Wand2 size={14} className="text-indigo-600" />
                      </div>
                    </div>
                    <div className="absolute top-2.5 left-2.5 badge bg-ink-900/65 text-linen-50">原始</div>
                    <div className="absolute top-2.5 right-2.5 badge bg-indigo-600/90 text-white">{fabric?.name}</div>
                    {busy && <div className="absolute inset-0 grid place-items-center bg-ink-900/30 backdrop-blur-[2px]"><div className="text-linen-50 text-sm bg-ink-900/70 rounded-full px-5 py-2">AI 生成中…（正式版≤10分钟）</div></div>}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-[11px] text-ink-400 shrink-0">对比</span>
                    <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(Number(e.target.value))} className="flex-1 accent-indigo-600" />
                  </div>
                  {err && <div className="text-clay-500 text-[12.5px] mt-2">{err}</div>}
                  <div className="flex items-start gap-2 mt-3 rounded-lg bg-linen-100 p-3">
                    <Info size={14} className="text-ink-300 mt-0.5 shrink-0" />
                    <p className="text-[11.5px] text-ink-400 leading-relaxed">
                      流程：前台业务员在AI助手提交成品效果需求 → 本工作台接单 → 按<b>固定场景</b>生成 → 交付后效果图自动返回前台并扣减算力点。
                      曾提议由前台业务员直接操作AI，因业务员缺乏精准描述能力已被驳回（后台重、前端轻）。
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="card"><Empty text="选择左侧需求开始生成" /></div>
          )}
        </div>
      </div>
    </div>
  )
}
