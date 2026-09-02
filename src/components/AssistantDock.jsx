import React, { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Send, Sparkles, X, Wand2, CheckCircle2 } from 'lucide-react'
import { useDB } from '../store/db'
import { useAuth } from '../auth'
import { aiReply, QUICK_PROMPTS } from '../lib/ai'
import { fabricImg } from '../lib/visual'
import { PERMISSIONS } from '../data/seed'

// AI 助手（US-3.4.2/3.4.3）：本地匹配推荐 + 成品效果需求转后台美工（固定场景、算力管控）
export default function AssistantDock({ mode = 'sales' }) {
  const { db, addAiRequest, addTrack } = useDB()
  const { session, user, can } = useAuth()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const [aiForm, setAiForm] = useState(null) // {text, scene, sku}
  const [aiDone, setAiDone] = useState(false)
  const bodyRef = useRef(null)

  const title = mode === 'sales' ? 'AI 销售助手' : 'AI 选样助手'
  const hello = useMemo(() => ({
    role: 'ai',
    text: mode === 'sales'
      ? '您好，我是布典人生的 AI 销售助手。告诉我客户需求（风格/场景/预算），我即刻匹配面料；需要成品效果图时，我会把需求转交后台美工，按固定场景（客厅/卧室）10分钟内交付。'
      : '您好，我是布典人生的 AI 选样助手。描述想要的面料（风格/用途/预算），我来帮您挑选；需要成品效果图也可以直接告诉我，后台美工10分钟内出图。',
    hits: [],
  }), [mode])

  const send = (text) => {
    const q = (text || input).trim()
    if (!q) return
    const reply = aiReply(q, db.fabrics)
    setMsgs((m) => [...m, { role: 'user', text: q }, { role: 'ai', ...reply }])
    setInput('')
    setTimeout(() => bodyRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }), 60)
  }

  const openAiForm = (text) => {
    // US-3.4.3 算力管控：开放对象校验
    if (!can('aiGen')) {
      setMsgs((m) => [...m, { role: 'user', text: text || '我想生成成品效果图' }, { role: 'ai', text: '抱歉，AI成品效果生成一期仅向「业务员 / 经销商 / VIP」开放（算力成本管控）。升级权益请联系您的业务员。', hits: [] }])
      setTimeout(() => bodyRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }), 60)
      return
    }
    if ((user?.points ?? 0) < db.aiConfig.costPerGen) {
      setMsgs((m) => [...m, { role: 'user', text: text || '我想生成成品效果图' }, { role: 'ai', text: `您的算力点不足（剩余 ${user?.points ?? 0} 点，单次消耗 ${db.aiConfig.costPerGen} 点），请联系管理员充值。`, hits: [] }])
      setTimeout(() => bodyRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }), 60)
      return
    }
    setAiForm({ text: text || '', scene: db.aiConfig.scenes[0], sku: db.fabrics[0]?.sku })
  }

  const submitAi = () => {
    if (!aiForm) return
    addAiRequest({ fromUser: user.id, fromName: user.name, text: aiForm.text || '生成成品效果图', scene: aiForm.scene, sku: aiForm.sku })
    if (session) addTrack(aiForm.sku, 'AI需求', session)
    setAiForm(null)
    setAiDone(true)
    setMsgs((m) => [...m, { role: 'ai', text: '需求已转交后台美工，将按固定场景在 10 分钟内生成效果图并回传给您，请在「需求进度」中留意。', hits: [] }])
    setTimeout(() => bodyRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }), 60)
  }

  const skuLink = (sku) => (mode === 'sales' ? `/admin/fabrics/${sku}` : `/shop/fabrics/${sku}`)

  return (
    <>
      {!open && (
        <button
          onClick={() => { setOpen(true); if (!msgs.length) setMsgs([hello]) }}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-indigo-600 text-linen-50 pl-4 pr-5 py-3 shadow-lift hover:bg-indigo-700 transition-all hover:scale-[1.03]"
        >
          <Sparkles size={17} />
          <span className="text-sm font-medium">{title}</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[400px] card popup overflow-hidden flex flex-col" style={{ height: 580 }}>
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-linen-50">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <div>
                <div className="text-sm font-semibold leading-tight">{title}</div>
                <div className="text-[10.5px] opacity-75">本地匹配 · 效果图转后台美工 10 分钟内交付</div>
              </div>
            </div>
            <button className="p-1.5 rounded-md hover:bg-white/15" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>

          <div ref={bodyRef} className="flex-1 overflow-auto p-4 space-y-4 bg-linen-100/60">
            {msgs.map((m, i) => (
              m.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-xl rounded-tr-sm bg-indigo-600 text-linen-50 px-3.5 py-2.5 text-[13px]">{m.text}</div>
                </div>
              ) : (
                <div key={i} className="space-y-2">
                  <div className="max-w-[92%] rounded-xl rounded-tl-sm bg-cotton border border-linen-200 px-3.5 py-2.5 text-[13px] text-ink-700 leading-relaxed shadow-card">{m.text}</div>
                  {!!m.hits?.length && (
                    <div className="space-y-2">
                      {m.hits.map(({ f, reasons }) => (
                        <Link key={f.sku} to={skuLink(f.sku)} onClick={() => setOpen(false)}
                          className="flex gap-3 card card-hover p-2.5 items-center">
                          <img src={fabricImg(f)} alt={f.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-medium truncate">{f.name}</div>
                            <div className="text-[11px] text-ink-400 font-mono">{f.sku} · ¥{f.price}/米</div>
                            <div className="text-[11px] text-indigo-500 truncate">匹配：{reasons.join(' / ')}</div>
                          </div>
                        </Link>
                      ))}
                      <button className="btn-clay w-full !py-2" onClick={() => openAiForm(m.hits[0]?.f?.sku)}>
                        <Wand2 size={13} /> 用「{m.hits[0]?.f?.name}」生成成品效果图（转后台美工）
                      </button>
                    </div>
                  )}
                </div>
              )
            ))}

            {aiForm && (
              <div className="card p-3.5 space-y-2.5">
                <div className="text-[12.5px] font-semibold flex items-center gap-1.5"><Wand2 size={13} className="text-clay-500" /> 成品效果需求单（US-3.4.2）</div>
                <textarea className="input w-full" rows="2" placeholder="描述效果需求，选填" value={aiForm.text} onChange={(e) => setAiForm({ ...aiForm, text: e.target.value })} />
                <div>
                  <div className="text-[11px] text-ink-400 mb-1">固定场景（算力管控，不可自由设计）</div>
                  <div className="flex gap-1.5">
                    {db.aiConfig.scenes.map((s) => (
                      <button key={s} className={`chip ${aiForm.scene === s ? 'chip-on' : ''}`} onClick={() => setAiForm({ ...aiForm, scene: s })}>{s}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-ink-400 mb-1">参考面料</div>
                  <select className="input w-full !py-1.5 text-[12px]" value={aiForm.sku} onChange={(e) => setAiForm({ ...aiForm, sku: e.target.value })}>
                    {db.fabrics.map((f) => <option key={f.sku} value={f.sku}>{f.sku} {f.name}</option>)}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10.5px] text-ink-300">单次消耗 {db.aiConfig.costPerGen} 算力点 · 剩余 {user?.points ?? 0} 点</span>
                  <button className="btn-primary !py-1.5" onClick={submitAi}><CheckCircle2 size={13} /> 提交需求</button>
                </div>
              </div>
            )}

            {aiDone && (
              <div className="rounded-lg border border-indigo-200 bg-indigo-50/60 px-3.5 py-2.5 text-[12px] text-indigo-600">
                ✓ 已交付的历史需求可在管理端「AI协同工作台」查看结果图（演示环境即时可看）。
              </div>
            )}

            {msgs.length <= 1 && !aiForm && (
              <div className="pt-1">
                <div className="text-[11px] text-ink-400 mb-2">试试这些需求：</div>
                <div className="space-y-1.5">
                  {QUICK_PROMPTS.map((p) => (
                    <button key={p} onClick={() => send(p)}
                      className="block w-full text-left text-[12.5px] rounded-lg border border-linen-300 bg-cotton px-3 py-2 text-ink-500 hover:border-indigo-300 hover:text-indigo-600 transition">
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="p-3 border-t border-linen-200 bg-cotton">
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder={mode === 'sales' ? '描述客户需求，如风格、场景、预算…' : '想要什么面料？如：北欧窗帘 50元内'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <button className="btn-primary !px-3" disabled={!input.trim()} onClick={() => send()}><Send size={15} /></button>
            </div>
            <div className="text-[10.5px] text-ink-300 mt-1.5">演示环境：规则引擎本地匹配 · 效果图由后台美工按固定场景人工生成</div>
          </div>
        </div>
      )}
    </>
  )
}
