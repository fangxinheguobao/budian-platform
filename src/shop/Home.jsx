import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, ShieldCheck, Timer, QrCode } from 'lucide-react'
import { useDB } from '../store/db'
import { fabricImg, fmtNum } from '../lib/visual'
import { IMG } from '../data/seed'

export default function Home() {
  const { db } = useDB()
  const hot = [...db.fabrics].sort((a, b) => b.views - a.views).slice(0, 8)
  const groups = [
    { name: '窗帘布', kw: '光影入帘，家有了温度', tag: '窗帘' },
    { name: '沙发布', kw: '客厅的灵魂，坐感的讲究', tag: '沙发' },
    { name: '床品面料', kw: '一夜好眠，从亲肤开始', tag: '床品' },
    { name: '服装面料', kw: '裁一寸时光，做一身衣裳', tag: '服装' },
  ]

  return (
    <div className="max-w-[1280px] mx-auto px-6">
      {/* Hero */}
      <section className="relative rounded-2xl overflow-hidden mt-6 rise" style={{ minHeight: 340 }}>
        <img src={IMG.sceneCurtainSofa} alt="hero" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(100deg, rgba(28,32,40,.82) 0%, rgba(28,32,40,.55) 46%, rgba(28,32,40,.05) 78%)' }} />
        <div className="relative p-10 py-14 max-w-[560px] text-linen-50">
          <div className="badge bg-white/15 text-linen-50 backdrop-blur mb-4"><Sparkles size={12} /> AI 驱动的面料可视化选样</div>
          <h1 className="font-display text-[34px] font-black leading-[1.3]">
            从想象到现实<br />一键焕新您的空间
          </h1>
          <p className="text-[14px] opacity-85 mt-4 leading-relaxed">
            高清纹理、真实参数、场景效果一站浏览。选中心仪面料，一键提交选样需求或询价单，布典人生团队 10 分钟内响应。
          </p>
          <div className="flex gap-3 mt-7">
            <Link to="/shop/fabrics" className="btn bg-linen-50 text-ink-900 hover:bg-white !px-5 !py-2.5">浏览面料库 <ArrowRight size={15} /></Link>
            <Link to="/shop/mall" className="btn border border-white/40 text-linen-50 hover:bg-white/10 !px-5 !py-2.5">进入 B2B 商城</Link>
          </div>
        </div>
      </section>

      {/* 三个保障 */}
      <section className="grid grid-cols-3 gap-4 mt-6">
        {[
          [<QrCode key="1" size={18} />, '扫码自助查料', '扫描产品或色卡二维码，自助查看资料、应用效果与搭配方案'],
          [<Timer key="2" size={18} />, '10 分钟响应', '前端需求实时传达，后台 AI 团队按客户要求快速呈现方案'],
          [<ShieldCheck key="3" size={18} />, '价格分级透明', 'VIP会员 / 一二级经销商享受对应档位专属价格'],
        ].map(([icon, t, d], i) => (
          <div key={t} className={`card p-5 flex gap-3.5 rise-${i + 1}`}>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">{icon}</div>
            <div>
              <div className="font-medium text-[14.5px]">{t}</div>
              <div className="text-xs text-ink-400 mt-1 leading-relaxed">{d}</div>
            </div>
          </div>
        ))}
      </section>

      {/* 风格分区 */}
      <section className="mt-10">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-[22px] font-bold">按用途选购</h2>
          <Link to="/shop/fabrics" className="text-[13px] text-indigo-500 hover:underline flex items-center gap-0.5">全部面料 <ArrowRight size={13} /></Link>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {groups.map((g, i) => {
            const list = db.fabrics.filter((f) => f.scenes.includes(g.tag))
            const cover = list[0]
            return (
              <Link key={g.name} to={`/shop/fabrics?scene=${g.tag}`} className={`card card-hover overflow-hidden relative group rise-${(i % 4) + 1}`}>
                <div className="swatch aspect-[4/3]">
                  {cover && <img src={fabricImg(cover)} alt={g.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                </div>
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,32,40,.72), transparent 60%)' }} />
                <div className="absolute bottom-0 p-4 text-linen-50">
                  <div className="font-display font-bold text-[16px]">{g.name} <span className="text-xs font-body opacity-70">{list.length} 款</span></div>
                  <div className="text-[11.5px] opacity-80">{g.kw}</div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* 热门 */}
      <section className="mt-10 mb-4">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-[22px] font-bold">热门面料 <span className="text-xs text-ink-300 font-body">按浏览量 · 本周</span></h2>
        </div>
        <div className="grid grid-cols-4 gap-4">
          {hot.slice(0, 4).map((f, i) => (
            <Link key={f.sku} to={`/shop/fabrics/${f.sku}`} className={`card card-hover overflow-hidden group rise-${(i % 4) + 1}`}>
              <div className="swatch aspect-[4/3] relative">
                <img src={fabricImg(f)} alt={f.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute top-2.5 left-2.5 badge bg-clay-400 text-white">No.{i + 1} · {fmtNum(f.views)} 次浏览</span>
              </div>
              <div className="p-3.5">
                <div className="font-medium text-[14px] truncate">{f.name}</div>
                <div className="text-[11.5px] text-ink-400 mt-0.5">{f.styles.join(' · ')} · {f.gsm}gsm</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
