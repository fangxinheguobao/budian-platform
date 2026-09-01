import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, QrCode, Download, Pencil, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { useDB, fabricStatus, priceFor } from '../store/db'
import { PageHead, Modal, Field, StatusBadge, Empty } from '../components/kit'
import { fabricImg, weaveSwatch, qrDataUri, fmtNum, fmtMoney } from '../lib/visual'

const TABS = ['产品故事', '工艺信息', '参数详情', '应用场景', '相似款与主配布']

export default function FabricDetail() {
  const { sku } = useParams()
  const nav = useNavigate()
  const { db, trackView, addFlow } = useDB()
  const f = db.fabrics.find((x) => x.sku === sku)
  const [tab, setTab] = useState(0)
  const [shot, setShot] = useState(0)
  const [qrOpen, setQrOpen] = useState(false)
  const [flowOpen, setFlowOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    setTab(0); setShot(0)
    if (f) trackView(f.sku)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sku])

  const gallery = useMemo(() => {
    if (!f) return []
    const g = []
    if (f.img) g.push({ type: '主图', src: f.img })
    g.push({ type: '平铺图', src: weaveSwatch(f.sku + '-flat', f.hue ?? 220, (f.sat ?? 12) + 6) })
    g.push({ type: '微距纹理', src: weaveSwatch(f.sku + '-macro', (f.hue ?? 220) + 12, (f.sat ?? 12) + 10) })
    const scenes = ['scene-curtain-sofa', 'scene-living-room', 'scene-gray-curtain', 'scene-lounge', 'scene-showroom', 'scene-beige-curtain', 'scene-showroom-blue']
    const seedNum = f.sku.split('').reduce((a, ch) => a + ch.charCodeAt(0), 0)
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
        let s = 0
        s += x.category === f.category ? 2 : 0
        s += x.styles.filter((y) => f.styles.includes(y)).length * 1.5
        s += x.perf.filter((y) => f.perf.includes(y)).length
        s += x.colorFam === f.colorFam ? 1 : 0
        return { x, s }
      })
      .filter((v) => v.s >= 3)
      .sort((a, b) => b.s - a.s)
      .slice(0, 4)
      .map((v) => v.x)
  }, [f, db.fabrics])

  if (!f) return <div className="card"><Empty text="面料不存在或已被删除" /></div>

  const st = fabricStatus(f)
  const flows = db.flows.filter((x) => x.sku === f.sku)

  return (
    <div>
      <div className="flex items-center gap-3 mb-4 rise">
        <button className="btn-ghost !py-1.5" onClick={() => nav(-1)}><ArrowLeft size={14} /> 返回列表</button>
        <nav className="text-xs text-ink-400">面料库 <span className="mx-1 text-linen-300">/</span> {f.name}</nav>
        <div className="ml-auto flex gap-2">
          <button className="btn-ghost !py-1.5" onClick={() => setQrOpen(true)}><QrCode size={14} /> 扫码查料</button>
          <button className="btn-ghost !py-1.5" onClick={() => window.alert('演示环境：资料打包下载功能在正式版中提供（含档案PDF+图片素材）')}><Download size={14} /> 下载资料</button>
          <button className="btn-primary !py-1.5" onClick={() => setEditOpen(true)}><Pencil size={14} /> 编辑面料</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* 画廊 */}
        <div className="col-span-5 rise-1">
          <div className="card overflow-hidden">
            <div className="swatch aspect-[4/3] relative">
              <img src={gallery[shot]?.src} alt={gallery[shot]?.type} className="w-full h-full object-cover fadein" key={shot} />
              <div className="absolute bottom-3 left-3 badge bg-ink-900/70 text-linen-50">{gallery[shot]?.type}</div>
              {gallery.length > 1 && (
                <>
                  <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cotton/90 shadow-card flex items-center justify-center hover:bg-cotton"
                    onClick={() => setShot((shot - 1 + gallery.length) % gallery.length)}><ChevronLeft size={16} /></button>
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-cotton/90 shadow-card flex items-center justify-center hover:bg-cotton"
                    onClick={() => setShot((shot + 1) % gallery.length)}><ChevronRight size={16} /></button>
                  <div className="absolute bottom-3 right-3 text-[11px] text-white/90 bg-ink-900/60 rounded px-1.5">{shot + 1} / {gallery.length}</div>
                </>
              )}
            </div>
            <div className="p-3 grid grid-cols-6 gap-2">
              {gallery.map((g, i) => (
                <button key={i} onClick={() => setShot(i)}
                  className={`swatch aspect-square rounded-lg overflow-hidden border-2 transition ${i === shot ? 'border-indigo-500' : 'border-transparent hover:border-linen-300'}`}>
                  <img src={g.src} alt={g.type} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
            <div className="px-4 pb-4">
              <div className="text-xs font-semibold text-ink-400 mb-2">图片资料管理</div>
              <div className="grid grid-cols-4 gap-2 text-center">
                {['主图', '平铺图', '微距纹理', '场景效果图'].map((t) => (
                  <div key={t} className="rounded-lg bg-linen-100 py-2">
                    <div className="text-[12px] font-medium">{t}</div>
                    <div className="text-[10.5px] text-ink-300">{gallery.filter((g) => g.type === t).length} 张</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 档案 */}
        <div className="col-span-7 rise-2">
          <div className="card p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-ink-300 font-mono">{f.sku} · {f.category}{f.sub ? ` / ${f.sub}` : ''}</div>
                <h2 className="font-display text-[24px] font-bold mt-0.5">{f.name}</h2>
                <div className="text-xs text-ink-400 mt-1">{fmtNum(f.views)} 次浏览 · 更新于 {db.flows.find((x) => x.sku === f.sku)?.time?.slice(0, 10) || '2024-03-20'}</div>
              </div>
              <div className="text-right">
                <div className="font-display font-bold text-clay-500 text-[26px]">{fmtMoney(f.price)}<span className="text-sm text-ink-400 font-body"> / 米</span></div>
                <div className="mt-1.5 flex gap-1.5 justify-end"><StatusBadge f={f} /></div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mt-5">
              {[['成分', '—'], ['克重', `${f.gsm} gsm`], ['门幅', `${f.width} cm`], ['可选颜色', `${f.colors.length} 色`]].map(([k, v]) => (
                <div key={k} className="rounded-lg bg-linen-100 px-3 py-2.5">
                  <div className="text-[10.5px] text-ink-400">{k}</div>
                  <div className="text-[13.5px] font-medium mt-0.5">{v === '—' && f.craft ? (f.craft.comp || defaultComp(f)) : v}</div>
                </div>
              ))}
            </div>

            {!!f.colors.length && (
              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs text-ink-400">色卡：</span>
                {f.colors.map((cl, i) => (
                  <span key={i} className="w-6 h-6 rounded-full border border-linen-300 shadow-sm" style={{ background: cl }} title={`色号 ${i + 1}`} />
                ))}
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 mt-4">
              {f.styles.map((t) => <span key={t} className="badge bg-clay-50 text-clay-500">{t}</span>)}
              {f.perf.map((t) => <span key={t} className="badge bg-indigo-50 text-indigo-500">{t}</span>)}
            </div>

            {/* 库存状态 */}
            <div className="mt-6 pt-5 border-t border-linen-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-bold">库存状态</h3>
                <button className="btn-clay !py-1.5" onClick={() => setFlowOpen(true)}>登记出入库</button>
              </div>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2 rounded-lg bg-linen-100 p-3">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-display text-[22px] font-bold">{f.stock}</span>
                    <span className="text-xs text-ink-400">米 · {st.label}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-linen-200 mt-2 overflow-hidden">
                    <div className={`h-full rounded-full ${f.stock < f.safety ? 'bg-clay-400' : 'bg-indigo-500'}`} style={{ width: `${Math.min(100, (f.stock / (f.safety * 1.5)) * 100)}%` }} />
                  </div>
                  <div className="text-[10.5px] text-ink-300 mt-1.5">安全库存线：{f.safety} 米</div>
                </div>
                {[
                  ['本月入库', flows.filter((x) => x.type === '入库').reduce((a, b) => a + b.qty, 0) || '—'],
                  ['本月出库', flows.filter((x) => x.type === '出库').reduce((a, b) => a + b.qty, 0) || '—'],
                  ['待归还', flows.filter((x) => x.type === '借用' || x.type === '转借').reduce((a, b) => a + b.qty, 0) || '—'],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-lg bg-linen-100 p-3 text-center">
                    <div className="text-[10.5px] text-ink-400">{k}</div>
                    <div className="font-display font-bold text-[17px] mt-1">{v}<span className="text-[11px] text-ink-300 font-body"> 米</span></div>
                  </div>
                ))}
              </div>
            </div>

            {/* 流水 */}
            <div className="mt-6 pt-5 border-t border-linen-200">
              <h3 className="font-display font-bold mb-3">出入库流水 <span className="text-xs text-ink-300 font-body">最近 {Math.min(flows.length, 5)} 条</span></h3>
              {flows.length ? (
                <div className="space-y-2.5">
                  {flows.slice(0, 5).map((fl) => (
                    <div key={fl.id} className="flex items-start gap-3">
                      <span className={`badge w-12 justify-center ${fl.type === '入库' ? 'bg-indigo-50 text-indigo-600' : fl.type === '出库' ? 'bg-linen-200 text-ink-500' : 'bg-clay-50 text-clay-500'}`}>{fl.type}</span>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12.5px]">
                          <b className={fl.type === '入库' ? 'text-indigo-600' : 'text-clay-500'}>{fl.type === '入库' ? '+' : '-'}{fl.qty} 米</b>
                          <span className="text-ink-400"> · {fl.person} · {fl.time}</span>
                        </div>
                        <div className="text-[11.5px] text-ink-400 truncate">{fl.note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : <div className="text-xs text-ink-300 py-2">暂无流水记录</div>}
            </div>
          </div>

          {/* 五页签 */}
          <div className="card mt-5 rise-3">
            <div className="flex border-b border-linen-200 px-2">
              {TABS.map((t, i) => (
                <button key={t} onClick={() => setTab(i)}
                  className={`px-4 py-3 text-[13.5px] font-medium transition relative ${tab === i ? 'text-indigo-600' : 'text-ink-400 hover:text-ink-700'}`}>
                  {t}
                  {tab === i && <span className="absolute left-4 right-4 bottom-0 h-[2.5px] bg-indigo-600 rounded-full" />}
                </button>
              ))}
            </div>
            <div className="p-6 min-h-[150px]">
              {tab === 0 && (
                <div>
                  <p className="text-[14px] leading-[1.9] text-ink-700">{f.story}</p>
                  <div className="mt-4 rounded-lg bg-linen-100 p-3.5">
                    <div className="text-xs font-semibold text-ink-400 mb-1">设计灵感</div>
                    <div className="text-[12.5px] text-ink-500">源自{f.styles.join('、')}风格的经典美学，每一寸面料都承载着设计师对美好生活的诠释。</div>
                  </div>
                </div>
              )}
              {tab === 1 && (
                <div>
                  <p className="text-[13.5px] text-ink-700 mb-4">{f.craft.process}</p>
                  <div className="grid grid-cols-4 gap-3">
                    {[['色牢度', f.craft.fastness], ['缩水率', f.craft.shrinkage], ['断裂强力', f.craft.strength], ['环保认证', f.craft.eco]].map(([k, v]) => (
                      <div key={k} className="rounded-lg bg-linen-100 p-3 text-center">
                        <div className="text-[10.5px] text-ink-400">{k}</div>
                        <div className="font-display font-bold text-[15px] mt-1">{v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {tab === 2 && (
                <div className="grid grid-cols-2 gap-x-8 gap-y-2.5 text-[13.5px]">
                  {[['型号 SKU', f.sku], ['品类', `${f.category}${f.sub ? ' / ' + f.sub : ''}`], ['克重', `${f.gsm} gsm`], ['门幅（幅宽）', `${f.width} cm`], ['可选颜色', `${f.colors.length} 色`], ['价格', `${fmtMoney(f.price)} / 米`], ['库存', `${f.stock} 米`], ['状态', st.label], ['创建时间', '2024-03-01'], ['浏览量', `${fmtNum(f.views)} 次`]].map(([k, v]) => (
                    <div key={k} className="flex justify-between border-b border-dashed border-linen-200 py-1.5">
                      <span className="text-ink-400">{k}</span><span className="font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              )}
              {tab === 3 && (
                <div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {f.scenes.map((s) => <span key={s} className="badge bg-indigo-50 text-indigo-600">{s}</span>)}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {gallery.filter((g) => g.type === '场景效果图').map((g, i) => (
                      <div key={i} className="swatch aspect-video rounded-lg overflow-hidden">
                        <img src={g.src} alt={g.type} className="w-full h-full object-cover" loading="lazy" />
                      </div>
                    ))}
                  </div>
                  <Link to="/admin/rehash" className="inline-flex items-center gap-1 text-[12.5px] text-indigo-500 hover:underline mt-4">
                    在 AI 换布演示中查看该面料的应用效果 <ArrowRight size={13} />
                  </Link>
                </div>
              )}
              {tab === 4 && (
                <div>
                  <h4 className="text-[13.5px] font-semibold mb-3">相似推荐 · 主配布组合</h4>
                  {similar.length ? (
                    <div className="grid grid-cols-4 gap-3">
                      {similar.map((x) => (
                        <Link key={x.sku} to={`/admin/fabrics/${x.sku}`} className="card card-hover overflow-hidden">
                          <div className="swatch aspect-[4/3]"><img src={fabricImg(x)} alt={x.name} className="w-full h-full object-cover" loading="lazy" /></div>
                          <div className="p-2.5">
                            <div className="text-[12.5px] font-medium truncate">{x.name}</div>
                            <div className="text-[11px] text-ink-300 font-mono">{x.sku}</div>
                            <div className="text-[12px] text-clay-500 font-medium">{fmtMoney(x.price)}/米</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : <div className="text-xs text-ink-300">暂无相似推荐</div>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 扫码弹层 */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="面料二维码 · 扫码查料" width={420}>
        <div className="text-center">
          <img src={qrDataUri(f.sku)} alt="qr" className="w-52 h-52 mx-auto rounded-xl border border-linen-200" />
          <div className="font-medium mt-3">{f.name}</div>
          <div className="text-xs text-ink-400 font-mono">{f.sku}</div>
          <p className="text-[12px] text-ink-400 mt-3 leading-relaxed">客户扫描样品上的二维码，即可在小程序中打开本页电子档案：参数、效果图、场景展示与库存状态一目了然。</p>
        </div>
      </Modal>

      {/* 出入库登记 */}
      <FlowModal open={flowOpen} onClose={() => setFlowOpen(false)} f={f} onSubmit={(v) => { addFlow(v); setFlowOpen(false) }} />
      <EditModal open={editOpen} onClose={() => setEditOpen(false)} f={f} />
    </div>
  )
}

function defaultComp(f) {
  const map = { 窗帘布: '涤纶100%', 沙发布: '涤纶100%', 服装面料: '聚酯纤维100%', 床品面料: '棉100%', 装饰面料: '涤纶100%' }
  return map[f.category] || '—'
}

export function FlowModal({ open, onClose, f, onSubmit }) {
  const types = ['入库', '出库', '借用', '领用', '转借', '归还']
  const [v, setV] = useState({ type: '入库', qty: 10, person: '张库管', note: '' })
  useEffect(() => { if (open) setV({ type: '入库', qty: 10, person: '张库管', note: '' }) }, [open, f?.sku])
  if (!f) return null
  return (
    <Modal open={open} onClose={onClose} title={`库存操作 · ${f.name}`} width={480}>
      <div className="space-y-4">
        <div>
          <label className="label">操作类型</label>
          <div className="flex flex-wrap gap-1.5">
            {types.map((t) => (
              <button key={t} className={`chip ${v.type === t ? 'chip-on' : 'hover:border-indigo-300'}`}
                onClick={() => setV((s) => ({ ...s, type: t }))}>{t}</button>
            ))}
          </div>
          <div className="text-[11px] text-ink-300 mt-1.5">
            {v.type === '入库' || v.type === '归还' ? '该操作将增加库存' : '该操作将扣减库存'} · 当前库存 {f.stock} 米
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="数量（米）">
            <input className="input" type="number" min="1" value={v.qty} onChange={(e) => setV((s) => ({ ...s, qty: Math.max(1, Number(e.target.value) || 1) }))} />
          </Field>
          <Field label="经手人">
            <input className="input" value={v.person} onChange={(e) => setV((s) => ({ ...s, person: e.target.value }))} />
          </Field>
        </div>
        <Field label="备注说明">
          <textarea className="input" rows="2" placeholder="如：订单出库，客户：锦华软装" value={v.note} onChange={(e) => setV((s) => ({ ...s, note: e.target.value }))} />
        </Field>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <button className="btn-ghost" onClick={onClose}>取消</button>
        <button className="btn-primary" onClick={() => onSubmit({ sku: f.sku, ...v, note: v.note || `${v.type}操作（演示）` })}>确认登记</button>
      </div>
    </Modal>
  )
}

function EditModal({ open, onClose, f }) {
  const { upsertFabric } = useDB()
  const [form, setForm] = useState(f)
  useEffect(() => setForm(f), [f])
  if (!f) return null
  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value }))
  return (
    <Modal open={open} onClose={onClose} title={`编辑面料 · ${f.sku}`} width={620}>
      <div className="grid grid-cols-2 gap-4">
        <Field label="面料名称"><input className="input" value={form.name} onChange={set('name')} /></Field>
        <Field label="价格（元/米）"><input className="input" type="number" value={form.price} onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value) || 0 }))} /></Field>
        <Field label="克重 gsm"><input className="input" type="number" value={form.gsm} onChange={(e) => setForm((s) => ({ ...s, gsm: Number(e.target.value) || 0 }))} /></Field>
        <Field label="门幅 cm"><input className="input" type="number" value={form.width} onChange={(e) => setForm((s) => ({ ...s, width: Number(e.target.value) || 0 }))} /></Field>
        <Field label="当前库存（米）"><input className="input" type="number" value={form.stock} onChange={(e) => setForm((s) => ({ ...s, stock: Number(e.target.value) || 0 }))} /></Field>
        <Field label="安全库存线（米）"><input className="input" type="number" value={form.safety} onChange={(e) => setForm((s) => ({ ...s, safety: Number(e.target.value) || 0 }))} /></Field>
      </div>
      <Field label="产品故事">
        <textarea className="input" rows="3" value={form.story} onChange={set('story')} />
      </Field>
      <div className="flex justify-end gap-2 mt-5">
        <button className="btn-ghost" onClick={onClose}>取消</button>
        <button className="btn-primary" onClick={() => { upsertFabric(form); onClose() }}>保存修改</button>
      </div>
    </Modal>
  )
}
