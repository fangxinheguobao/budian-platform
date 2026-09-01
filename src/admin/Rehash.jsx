import React, { useEffect, useRef, useState } from 'react'
import { Wand2, Shuffle, Download, Info, ScanSearch } from 'lucide-react'
import { useDB } from '../store/db'
import { PageHead } from '../components/kit'
import { fabricImg } from '../lib/visual'
import { IMG } from '../data/seed'

// 场景模板：keys 为布艺面料的 HSL 颜色识别范围（从场景实拍采样），
// rects 限定搜索区域，excludes 排除（如过亮的窗户）。识别结果即换布蒙版。
const SCENES = [
  {
    id: 'curtain', name: '客厅窗帘', img: IMG.sceneCurtainSofa,
    groups: [
      { name: '窗帘', keys: [{ h: [0, 360], s: [0, 20], l: [5, 48] }], rects: [{ x: -0.02, y: -0.02, w: 0.30, h: 1.04 }, { x: 0.32, y: -0.02, w: 0.26, h: 1.04 }] },
      { name: '沙发', keys: [{ h: [0, 360], s: [0, 14], l: [36, 62] }], rects: [{ x: 0.58, y: 0.5, w: 0.44, h: 0.42 }] },
    ],
  },
  {
    id: 'living', name: '整屋软装', img: IMG.sceneLivingRoom,
    groups: [
      { name: '窗帘', keys: [{ h: [15, 60], s: [4, 30], l: [42, 85] }], rects: [{ x: 0.34, y: 0.16, w: 0.36, h: 0.44 }] },
      { name: '沙发', keys: [{ h: [25, 60], s: [14, 45], l: [14, 45] }], rects: [{ x: 0.6, y: 0.52, w: 0.3, h: 0.32 }] },
    ],
  },
  {
    id: 'gray', name: '现代客厅', img: IMG.sceneGrayCurtain,
    groups: [
      { name: '窗帘', keys: [{ h: [0, 360], s: [0, 20], l: [5, 42] }], rects: [{ x: -0.02, y: -0.02, w: 0.30, h: 0.88 }, { x: 0.27, y: -0.02, w: 0.33, h: 0.86 }, { x: 0.75, y: -0.02, w: 0.17, h: 0.85 }] },
      { name: '沙发', keys: [{ h: [0, 360], s: [0, 12], l: [50, 76] }], rects: [{ x: 0.63, y: 0.56, w: 0.39, h: 0.31 }] },
    ],
  },
  {
    id: 'beige', name: '落地窗帘', img: IMG.sceneBeigeCurtain, portrait: true,
    groups: [
      { name: '窗帘纱帘', keys: [{ h: [20, 60], s: [5, 45], l: [55, 96] }], rects: [{ x: 0.3, y: 0.04, w: 0.46, h: 0.72 }] },
      { name: '沙发盖布', keys: [{ h: [20, 60], s: [5, 45], l: [55, 96] }], rects: [{ x: -0.02, y: 0.5, w: 0.48, h: 0.36 }] },
    ],
  },
  {
    id: 'showroom', name: '展厅大屏', img: IMG.sceneShowroomBlue,
    groups: [
      { name: '绒布大屏', keys: [{ h: [195, 230], s: [28, 90], l: [5, 48] }], rects: [{ x: 0.12, y: 0.06, w: 0.52, h: 0.62 }] },
    ],
  },
]

const loadImg = (src) => new Promise((res, rej) => {
  const im = new Image()
  im.crossOrigin = 'anonymous'
  im.onload = () => res(im)
  im.onerror = rej
  im.src = src
})

// 颜色范围隶属度：范围内=1，向外 margin 内线性衰减
function band(v, lo, hi, m) {
  if (v >= lo && v <= hi) return 1
  if (v < lo) return Math.max(0, 1 - (lo - v) / m)
  return Math.max(0, 1 - (v - hi) / m)
}
function keyScore(h, s, l, k) {
  // 色相是环形值，h:0-360
  let hd = Math.min(Math.abs(h - (k.h[0] + k.h[1]) / 2), 360 - Math.abs(h - (k.h[0] + k.h[1]) / 2))
  const half = (k.h[1] - k.h[0]) / 2
  if (k.h[0] <= 0 || k.h[1] >= 360) return band(s, k.s[0], k.s[1], 4) * band(l, k.l[0], k.l[1], 6)
  const hs = Math.max(0, 1 - Math.max(0, hd - half) / 10)
  return hs * band(s, k.s[0], k.s[1], 4) * band(l, k.l[0], k.l[1], 6)
}
function rectScore(rx, ry, r) {
  const mx = 0.015, my = 0.02
  const a = band(rx, r.x, r.x + r.w, mx * r.w * 8)
  const b = band(ry, r.y, r.y + r.h, my)
  return a * b
}
function rgb2hsl(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  const l = (max + min) / 2
  if (max === min) return [0, 0, l]
  const d = max - min
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
  let h
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0))
  else if (max === g) h = (b - r) / d + 2
  else h = (r - g) / d + 4
  return [h * 60, s, l]
}

// 生成布艺识别蒙版：白=识别到的面料像素
function buildMask(sceneImg, scene, W, H) {
  const cnv = document.createElement('canvas')
  cnv.width = W; cnv.height = H
  const ctx = cnv.getContext('2d', { willReadFrequently: true })
  ctx.drawImage(sceneImg, 0, 0, W, H)
  const img = ctx.getImageData(0, 0, W, H)
  const px = img.data
  const out = ctx.createImageData(W, H)
  const op = out.data
  for (let y = 0; y < H; y++) {
    const ry = y / H
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4
      const rx = x / W
      let best = 0
      for (const g of scene.groups) {
        let rs = 0
        for (const r of g.rects) rs = Math.max(rs, rectScore(rx, ry, r))
        if (rs <= 0) continue
        const h = px[i] / 255, s = px[i + 1] / 255, l = px[i + 2] / 255
        const [hh, ss, ll] = rgb2hsl(h, s, l)
        let ks = 0
        for (const k of g.keys) ks = Math.max(ks, keyScore(hh * 1, ss * 100, ll * 100, k))
        const v = ks * rs
        if (v > best) best = v
      }
      const j = i
      op[j] = 255; op[j + 1] = 255; op[j + 2] = 255
      op[j + 3] = Math.round(Math.min(1, best) * 255)
    }
  }
  ctx.putImageData(out, 0, 0)
  // 羽化 + 低alpha截断（消除高斯尾巴导致的整图浮纹）+ 内部实心化
  const blurred = document.createElement('canvas')
  blurred.width = W; blurred.height = H
  const bc = blurred.getContext('2d', { willReadFrequently: true })
  bc.filter = `blur(${Math.round(W / 90)}px)`
  bc.drawImage(cnv, 0, 0)
  const md = bc.getImageData(0, 0, W, H)
  for (let i = 3; i < md.data.length; i += 4) {
    const t = Math.min(1, Math.max(0, (md.data[i] - 26) / 84))
    md.data[i] = Math.round(t * t * (3 - 2 * t) * 255)
  }
  bc.putImageData(md, 0, 0)
  return blurred
}

async function composite(scene, fabric, canvas, beforeCanvas, maskOut) {
  const sceneImg = await loadImg(scene.img)
  const ratio = sceneImg.naturalHeight / sceneImg.naturalWidth
  let W, H
  if (ratio > 1.2) { H = 1400; W = Math.round(H / ratio) } else { W = 1200; H = Math.round(ratio * W) }
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.drawImage(sceneImg, 0, 0, W, H)
  if (beforeCanvas) {
    beforeCanvas.width = W; beforeCanvas.height = H
    beforeCanvas.getContext('2d').drawImage(sceneImg, 0, 0, W, H)
  }

  // 1. 识别布艺区域（颜色识别 ∩ 区域约束 → 羽化蒙版）
  const mask = buildMask(sceneImg, scene, W, H)
  if (maskOut) maskOut(mask)

  // 2. 织物平铺贴片
  const fabImg = await loadImg(fabricImg(fabric))
  const tile = document.createElement('canvas')
  const TS = 260
  tile.width = TS; tile.height = TS
  const tctx = tile.getContext('2d')
  const tr = Math.max(TS / fabImg.naturalWidth, TS / fabImg.naturalHeight)
  const tw = fabImg.naturalWidth * tr, th = fabImg.naturalHeight * tr
  tctx.drawImage(fabImg, (TS - tw) / 2, (TS - th) / 2, tw, th)

  // 3. 换布图层：保场景明暗（color 混合取织物色相），叠一层织物纹理（overlay）
  const layer = document.createElement('canvas')
  layer.width = W; layer.height = H
  const lc = layer.getContext('2d')
  lc.drawImage(sceneImg, 0, 0, W, H)
  const pat = lc.createPattern(tile, 'repeat')
  lc.globalCompositeOperation = 'color'
  lc.fillStyle = pat
  lc.fillRect(0, 0, W, H)
  lc.globalCompositeOperation = 'overlay'
  lc.globalAlpha = 0.55
  lc.fillStyle = pat
  lc.fillRect(0, 0, W, H)
  lc.globalAlpha = 1

  // 4. 用识别蒙版抠出布艺区域（destination-in）
  lc.globalCompositeOperation = 'destination-in'
  lc.drawImage(mask, 0, 0)
  lc.globalCompositeOperation = 'source-over'

  // 5. 贴回主画布
  ctx.drawImage(layer, 0, 0)
}

export default function Rehash() {
  const { db } = useDB()
  const [sceneId, setSceneId] = useState(SCENES[0].id)
  const [sku, setSku] = useState('XXF-001')
  const [pos, setPos] = useState(55)
  const [showMask, setShowMask] = useState(false)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const canvasRef = useRef(null)
  const beforeRef = useRef(null)
  const maskRef = useRef(null)

  const scene = SCENES.find((s) => s.id === sceneId)
  const fabric = db.fabrics.find((f) => f.sku === sku)

  useEffect(() => {
    if (!canvasRef.current || !scene || !fabric) return
    let dead = false
    setBusy(true); setErr('')
    composite(scene, fabric, canvasRef.current, beforeRef.current, (m) => { maskRef.current = m })
      .then(() => { if (!dead && showMask) applyMaskTint() })
      .catch(() => setErr('合成失败，请重试其他面料或场景'))
      .finally(() => !dead && setBusy(false))
    return () => { dead = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId, sku, showMask])

  // showMask 开启时把蒙版以红色半透明叠加显示
  function applyMaskTint() {
    const canvas = canvasRef.current
    const mask = maskRef.current
    if (!canvas || !mask) return
    const ctx = canvas.getContext('2d')
    const tint = document.createElement('canvas')
    tint.width = mask.width; tint.height = mask.height
    const tc = tint.getContext('2d')
    tc.drawImage(mask, 0, 0)
    tc.globalCompositeOperation = 'source-in'
    tc.fillStyle = 'rgba(224,82,60,.5)'
    tc.fillRect(0, 0, tint.width, tint.height)
    ctx.drawImage(tint, 0, 0)
  }

  const randomPair = () => {
    setSceneId(SCENES[Math.floor(Math.random() * SCENES.length)].id)
    const f = db.fabrics[Math.floor(Math.random() * db.fabrics.length)]
    setSku(f.sku)
  }

  const savePng = () => {
    const url = canvasRef.current?.toDataURL('image/png')
    if (!url) return
    const a = document.createElement('a')
    a.href = url
    a.download = `布典人生-AI换布-${fabric?.sku}-${scene?.name}.png`
    a.click()
  }

  return (
    <div>
      <PageHead title="AI 换布演示" desc="实景智能换布 · 颜色识别锁定窗帘/沙发等布艺区域，只换布样不伤场景（Canvas 本地合成）">
        <button className={`btn ${showMask ? 'bg-indigo-600 text-white' : 'btn-ghost'}`} onClick={() => setShowMask(!showMask)}>
          <ScanSearch size={14} /> {showMask ? '隐藏识别区域' : '显示AI识别区域'}
        </button>
        <button className="btn-ghost" onClick={randomPair}><Shuffle size={14} /> 随机搭配</button>
        <button className="btn-clay" onClick={savePng}><Download size={14} /> 保存效果图</button>
      </PageHead>

      <div className="grid grid-cols-12 gap-5">
        <div className="col-span-3 space-y-5">
          <div className="card p-4 rise-1">
            <h3 className="text-xs font-semibold text-ink-400 tracking-wide mb-2.5">① 选择场景模板</h3>
            <div className="space-y-2">
              {SCENES.map((s) => (
                <button key={s.id} onClick={() => setSceneId(s.id)}
                  className={`w-full flex items-center gap-2.5 rounded-lg border p-1.5 transition ${sceneId === s.id ? 'border-indigo-500 bg-indigo-50/60' : 'border-linen-200 hover:border-linen-300'}`}>
                  <img src={s.img} alt={s.name} className="w-16 h-10 rounded-md object-cover" />
                  <span className="text-[12.5px] font-medium text-left">{s.name}<div className="text-[10px] text-ink-300">识别：{s.groups.map((g) => g.name).join('、')}</div></span>
                </button>
              ))}
            </div>
          </div>
          <div className="card p-4 rise-2">
            <h3 className="text-xs font-semibold text-ink-400 tracking-wide mb-2.5">② 选择面料 <span className="normal-case">（{db.fabrics.length}款可选）</span></h3>
            <div className="grid grid-cols-3 gap-1.5 max-h-[330px] overflow-auto pr-0.5">
              {db.fabrics.map((f) => (
                <button key={f.sku} onClick={() => setSku(f.sku)} title={`${f.name} ¥${f.price}/米`}
                  className={`swatch aspect-square rounded-lg overflow-hidden border-2 transition ${sku === f.sku ? 'border-indigo-500' : 'border-transparent hover:border-linen-300'}`}>
                  <img src={fabricImg(f)} alt={f.name} className="w-full h-full object-cover" loading="lazy" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-span-9 rise-2">
          <div className="card p-4">
            <div className="relative rounded-xl overflow-hidden select-none bg-linen-200">
              <canvas ref={canvasRef} className="w-full block" />
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
                <canvas ref={beforeRef} className="absolute top-0 left-0 h-full w-auto block" />
              </div>
              <div className="absolute top-0 bottom-0 w-[2px] bg-white/90 shadow" style={{ left: `${pos}%` }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lift flex items-center justify-center">
                  <Wand2 size={15} className="text-indigo-600" />
                </div>
              </div>
              <div className="absolute top-3 left-3 badge bg-ink-900/65 text-linen-50">原始场景</div>
              <div className="absolute top-3 right-3 badge bg-indigo-600/90 text-white">{fabric?.name}</div>
              {busy && (
                <div className="absolute inset-0 grid place-items-center bg-ink-900/30 backdrop-blur-[2px]">
                  <div className="text-linen-50 text-sm bg-ink-900/70 rounded-full px-5 py-2">AI 识别布艺区域并换布中…</div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4 mt-4">
              <span className="text-[11px] text-ink-400 shrink-0">拖动对比</span>
              <input type="range" min="0" max="100" value={pos} onChange={(e) => setPos(Number(e.target.value))}
                className="flex-1 accent-indigo-600" />
              <span className="text-[11px] text-ink-400 shrink-0">换布后</span>
            </div>

            {err && <div className="text-clay-500 text-[12.5px] mt-2">{err}</div>}
            <div className="flex items-start gap-2 mt-3 rounded-lg bg-linen-100 p-3">
              <Info size={14} className="text-ink-300 mt-0.5 shrink-0" />
              <p className="text-[11.5px] text-ink-400 leading-relaxed">
                演示环境说明：系统对场景做逐像素颜色识别（色相/饱和度/明度 ∩ 区域约束），仅锁定窗帘、沙发等布艺面料区域进行换色换纹理，
                保留原场景光影与遮挡关系；「显示AI识别区域」可查看识别蒙版。正式版将接入 AI 大模型分割，
                支持上传客户实拍图与任意软装对象，效果更精准。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
