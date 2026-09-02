import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Timer, ScanSearch, ArrowRight, Phone, Building2, User } from 'lucide-react'
import { useDB } from './store/db'
import { useAuth } from './auth'
import { ROLES, IMG } from './data/seed'

// 落地页：注册验证留资方可进入平台（US-3.3.1 准入机制）
export default function Landing() {
  const { db, register } = useDB()
  const { loginById, session, user } = useAuth()
  const nav = useNavigate()
  const [tab, setTab] = useState('login')
  const [codeSent, setCodeSent] = useState(false)
  const [reg, setReg] = useState({ company: '', name: '', phone: '', code: '' })
  const [err, setErr] = useState('')

  React.useEffect(() => {
    if (session && user) nav(ROLES[user.role]?.home || '/shop', { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, user])

  const doLogin = (u) => { loginById(u.id) }
  const doRegister = () => {
    if (!reg.phone.match(/^1[3-9]\d{9}$/) && !reg.phone.includes('****')) { setErr('请输入正确的手机号'); return }
    if (!reg.code) { setErr('请输入验证码'); return }
    const id = register(reg)
    loginById(id)
  }
  const sendCode = () => {
    setCodeSent(true)
    window.alert('演示环境：短信验证码已发送 —— 123456')
  }

  const demoAccounts = db.users

  return (
    <div className="min-h-screen grid grid-cols-2">
      {/* 左侧品牌区 */}
      <div className="relative hidden md:block overflow-hidden">
        <img src={IMG.sceneCurtainSofa} alt="布典人生" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(28,32,40,.88), rgba(51,80,122,.72))' }} />
        <div className="relative p-12 text-linen-50 flex flex-col h-full">
          <div className="flex items-center gap-3">
            <img src="./favicon.svg" alt="" className="w-11 h-11" />
            <div>
              <div className="font-display font-bold text-[22px] leading-tight">布典人生</div>
              <div className="text-[11px] tracking-[.3em] opacity-60">面料企业数字化平台</div>
            </div>
          </div>
          <div className="my-auto max-w-md">
            <h1 className="font-display text-[34px] font-black leading-[1.35]">面料数字资产为底座<br />打通样料管理 · 电子画册<br />B2B获客与AI协同</h1>
            <div className="space-y-3.5 mt-8 text-[13.5px] opacity-90">
              <div className="flex items-center gap-3"><ShieldCheck size={17} className="text-clay-200 shrink-0" /> 样料档案 · 货架追踪 · 扫码查料</div>
              <div className="flex items-center gap-3"><ScanSearch size={17} className="text-clay-200 shrink-0" /> 以图搜图 · 电子画册 · 双端同步</div>
              <div className="flex items-center gap-3"><Timer size={17} className="text-clay-200 shrink-0" /> 询价线索实时推送 · 打样单直连ERP</div>
            </div>
          </div>
          <div className="text-[11px] opacity-50">注册即代表同意《用户协议》与《隐私政策》 · IP用于划分大区归属</div>
        </div>
      </div>

      {/* 右侧登录/注册 */}
      <div className="flex items-center justify-center p-8 bg-linen-100">
        <div className="w-full max-w-[440px]">
          <div className="md:hidden flex items-center gap-2.5 mb-6">
            <img src="./favicon.svg" alt="" className="w-9 h-9" />
            <div className="font-display font-bold text-lg">布典人生</div>
          </div>

          <div className="flex gap-1 mb-6 bg-linen-200/70 rounded-xl p-1">
            <button className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${tab === 'login' ? 'bg-cotton shadow-card text-ink-900' : 'text-ink-400'}`} onClick={() => setTab('login')}>账号登录</button>
            <button className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${tab === 'reg' ? 'bg-cotton shadow-card text-ink-900' : 'text-ink-400'}`} onClick={() => setTab('reg')}>注册留资</button>
          </div>

          {err && <div className="mb-3 rounded-lg bg-clay-50 border border-clay-200 text-clay-600 text-[12.5px] px-3.5 py-2.5">{err}</div>}

          {tab === 'login' ? (
            <div className="card p-6 rise">
              <h2 className="font-display font-bold text-[18px] mb-1">欢迎回来</h2>
              <p className="text-xs text-ink-400 mb-5">演示环境：点击演示账号即可一键登录对应角色</p>
              <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
                {demoAccounts.map((u) => (
                  <button key={u.id} onClick={() => doLogin(u)}
                    className="w-full flex items-center gap-3 rounded-xl border border-linen-200 bg-cotton px-4 py-3 text-left hover:border-indigo-300 hover:shadow-card transition group">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-display font-bold text-sm shrink-0 ${['admin', 'artist', 'sales'].includes(u.role) ? 'bg-ink-900 text-linen-50' : 'bg-indigo-50 text-indigo-600'}`}>
                      {u.name[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[13.5px] font-medium">{u.name}</div>
                      <div className="text-[11px] text-ink-300">{u.phone} · {ROLES[u.role]?.label}</div>
                    </div>
                    <span className="badge bg-linen-200/80 text-ink-500 group-hover:bg-indigo-600 group-hover:text-white transition">{ROLES[u.role]?.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="card p-6 rise">
              <h2 className="font-display font-bold text-[18px] mb-1">注册留资</h2>
              <p className="text-xs text-ink-400 mb-5">注册验证后方可进入平台 · 系统将记录IP并划分大区（演示）</p>
              <div className="space-y-3.5">
                <label className="block">
                  <span className="label">公司名称</span>
                  <div className="relative">
                    <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                    <input className="input !pl-9 w-full" placeholder="如：和家窗帘店" value={reg.company} onChange={(e) => setReg({ ...reg, company: e.target.value })} />
                  </div>
                </label>
                <label className="block">
                  <span className="label">联系人</span>
                  <div className="relative">
                    <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                    <input className="input !pl-9 w-full" placeholder="您的称呼" value={reg.name} onChange={(e) => setReg({ ...reg, name: e.target.value })} />
                  </div>
                </label>
                <label className="block">
                  <span className="label">手机号（用于验证与预约演示）</span>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
                      <input className="input !pl-9 w-full" placeholder="13x xxxx xxxx" value={reg.phone} onChange={(e) => setReg({ ...reg, phone: e.target.value })} />
                    </div>
                    <button className="btn-ghost shrink-0" onClick={sendCode}>{codeSent ? '已发送' : '获取验证码'}</button>
                  </div>
                </label>
                <label className="block">
                  <span className="label">验证码</span>
                  <input className="input w-full" placeholder="演示环境固定为 123456" value={reg.code} onChange={(e) => setReg({ ...reg, code: e.target.value })} />
                </label>
                <button className="btn-primary w-full !py-2.5" onClick={doRegister}>
                  注册并进入平台 <ArrowRight size={15} />
                </button>
                <p className="text-[11px] text-ink-300 leading-relaxed">注册后默认为「注册客户」角色；库存等敏感数据将在授权后开放，VIP/分销商权益请联系业务员升级。</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
