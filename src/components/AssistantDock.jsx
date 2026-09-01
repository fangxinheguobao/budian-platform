import React, { useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { useDB } from '../store/db'
import { aiReply, QUICK_PROMPTS } from '../lib/ai'
import { fabricImg } from '../lib/visual'

// AI 助手悬浮面板：本地规则引擎，真实可用
export default function AssistantDock({ mode = 'sales' }) {
  const { db } = useDB()
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([])
  const [input, setInput] = useState('')
  const bodyRef = useRef(null)

  const send = (text) => {
    const q = (text || input).trim()
    if (!q) return
    const reply = aiReply(q, db.fabrics)
    setMsgs((m) => [...m, { role: 'user', text: q }, { role: 'ai', ...reply }])
    setInput('')
    setTimeout(() => bodyRef.current?.scrollTo({ top: 1e6, behavior: 'smooth' }), 60)
  }

  const title = mode === 'sales' ? 'AI 销售助手' : 'AI 选样助手'
  const sub = mode === 'sales' ? '规则引擎 · 秒级响应' : '规则引擎 · 秒级响应'
  const hello = useMemo(() => ({
    role: 'ai',
    text: mode === 'sales'
      ? '您好，我是布典人生的 AI 销售助手。告诉我您的客户需求（风格、场景、预算等），我即刻为您匹配面料，并可一键生成选样清单或电子册。'
      : '您好，我是布典人生的 AI 选样助手。描述您想要的面料（风格、用途、预算），我来帮您挑选，还能直接加入询价单。',
    hits: [],
  }), [mode])

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
        <div className="fixed bottom-6 right-6 z-40 w-[400px] card popup overflow-hidden flex flex-col" style={{ height: 560 }}>
          <div className="flex items-center justify-between px-4 py-3 bg-indigo-600 text-linen-50">
            <div className="flex items-center gap-2">
              <Bot size={18} />
              <div>
                <div className="text-sm font-semibold leading-tight">{title}</div>
                <div className="text-[10.5px] opacity-75">{sub}</div>
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
                        <Link key={f.sku} to={`${mode === 'sales' ? '/admin' : '/shop'}/fabrics/${f.sku}`} onClick={() => setOpen(false)}
                          className="flex gap-3 card card-hover p-2.5 items-center">
                          <img src={fabricImg(f)} alt={f.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0 flex-1">
                            <div className="text-[13px] font-medium truncate">{f.name}</div>
                            <div className="text-[11px] text-ink-400 font-mono">{f.sku} · ¥{f.price}/米</div>
                            <div className="text-[11px] text-indigo-500 truncate">匹配：{reasons.join(' / ')}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            ))}

            {msgs.length <= 1 && (
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
            <div className="text-[10.5px] text-ink-300 mt-1.5">演示环境：规则引擎本地匹配，结果仅供参考</div>
          </div>
        </div>
      )}
    </>
  )
}
