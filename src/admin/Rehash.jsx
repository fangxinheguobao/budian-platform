import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Wand2, Shuffle, Download, Info } from 'lucide-react'
import { useDB } from '../store/db'
import { PageHead } from '../components/kit'
import { fabricImg } from '../lib/visual'
import { IMG } from '../data/seed'

// 场景模板：mask 为需换布区域（相对坐标，多层羽化矩形）
const SCENES = [
  { id: 'curtain', name: '客厅窗帘', img: IMG.sceneCurtainSofa, masks: [{ x: 0, y: 0, w: 0.56, h: 1 }, { x: 0.63, y: 0.6, w: 0.37, h: 0.4 }] },
  { id: 'living', name: '整屋软装', img: IMG.sceneLivingRoom, masks: [{ x: 0.37, y: 0.2, w: 0.3, h: 0.38 }, { x: 0.56, y: 0.5, w: 0.46, h: 0.5 }] },
  { id: 'gray', name: '现代客厅', img: IMG.sceneGrayCurtain, masks: [{ x: -0.02, y: -0.02, w: 0.3, h: 1.04 }, { x: 0.33, y: -0.02, w: 0.42, h: 0.8 }] },
  { id: 'beige', name: '落地窗帘', img: IMG.sceneBeigeCurtain, masks: [{ x: -0.02, y: 0.04, w: 1.04, h: 0.74 }] },
  { id: 'showroom', name: '展厅大屏', img: IMG.sceneShowroomBlue, masks: [{ x: 0.28, y: 0.12, w: 0.44, h: 0.62 }] },
]

const loadImg = (src) => new Promise((res, rej) => {
  const im = new Image()
  im.crossOrigin = 'anonymous'
  im.onload = () => res(im)
  im.onerror = rej
  im.src = src
})

// 核心合成：场景保明暗，织物提供色彩与纹理（color 混合 + overlay 纹理），mask 羽化
async function composite(scene, fabric, canvas, beforeCanvas) {
  const sceneImg = await loadImg(scene.img)
  const W = 1200
  const H = Math.round((sceneImg.naturalHeight / sceneImg.naturalWidth) * W)
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  ctx.drawImage(sceneImg, 0, 0, W, H)
  if (beforeCanvas) {
    beforeCanvas.width = W
    beforeCanvas.height = H
    beforeCanvas.getContext('2d').drawImage(sceneImg, 0, 0, W, H)
  }

  // 织物平铺贴片
  const fabImg = await loadImg(fabricImg(fabric))
  const tile = document.createElement('canvas')
  const TS = 260
  tile.width = TS; tile.height = TS
  const tctx = tile.getContext('2d')
  const ratio = Math.max(TS / fabImg.naturalWidth, TS / fabImg.naturalHeight)
  const tw = fabImg.naturalWidth * ratio, th = fabImg.naturalHeight * ratio
  tctx.drawImage(fabImg, (TS - tw) / 2, (TS - th) / 2, tw, th)

  // 换布图层：以场景为底（保留明暗），color 混合织物色相，再叠一层织物纹理
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

  // 蒙版：白色矩形高斯羽化 → destination-in 抠出换布区
  const mask = document.createElement('canvas')
  mask.width = W; mask.height = H
  const mc = mask.getContext('2d')
  mc.filter = 'blur(28px)'
  mc.fillStyle = '#fff'
  scene.masks.forEach((m) => {
    mc.beginPath()
    mc.roundRect(m.x * W, m.y * H, m.w * W, m.h * H, 40)
    mc.fill()
  })
  lc.globalCompositeOperation = 'destination-in'
  lc.drawImage(mask, 0, 0)

  // 贴回主画布
  ctx.drawImage(layer, 0, 0)
}

export default function Rehash() {
  const { db } = useDB()
  const [sceneId, setSceneId] = useState(SCENES[0].id)
  const [sku, setSku] = useState('XXF-001')
  const [pos, setPos] = useState(50)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const canvasRef = useRef(null)
  const beforeRef = useRef(null)

  const scene = SCENES.find((s) => s.id === sceneId)
  const fabric = db.fabrics.find((f) => f.sku === sku)

  useEffect(() => {
    if (!canvasRef.current || !scene || !fabric) return
    let dead = false
    setBusy(true); setErr('')
    composite(scene, fabric, canvasRef.current, beforeRef.current)
      .catch(() => setErr('合成失败，请重试其他面料或场景'))
      .finally(() => !dead && setBusy(false))
    return () => { dead = true }
  }, [sceneId, sku])

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
      <PageHead title="AI 换布演示" desc="实景智能换布 · 所见即所得 —— 从想象到现实，一键焕新（演示：Canvas 本地合成）">
        <button className="btn-ghost" onClick={randomPair}><Shuffle size={14} /> 随机搭配</button>
        <button className="btn-clay" onClick={savePng}><Download size={14} /> 保存效果图</button>
      </PageHead>

      <div className="grid grid-cols-12 gap-5">
        {/* 选择器 */}
        <div className="col-span-3 space-y-5">
          <div className="card p-4 rise-1">
            <h3 className="text-xs font-semibold text-ink-400 tracking-wide mb-2.5">① 选择场景模板</h3>
            <div className="space-y-2">
              {SCENES.map((s) => (
                <button key={s.id} onClick={() => setSceneId(s.id)}
                  className={`w-full flex items-center gap-2.5 rounded-lg border p-1.5 transition ${sceneId === s.id ? 'border-indigo-500 bg-indigo-50/60' : 'border-linen-200 hover:border-linen-300'}`}>
                  <img src={s.img} alt={s.name} className="w-16 h-10 rounded-md object-cover" />
                  <span className="text-[12.5px] font-medium">{s.name}</span>
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

        {/* 画布 */}
        <div className="col-span-9 rise-2">
          <div className="card p-4">
            <div className="relative rounded-xl overflow-hidden select-none bg-linen-200">
              <canvas ref={canvasRef} className="w-full block" />
              {/* 滑块左侧显示原场景（与结果画布同尺寸，天然对齐） */}
              <div className="absolute inset-0 overflow-hidden" style={{ width: `${pos}%` }}>
                <canvas ref={beforeRef} className="absolute top-0 left-0 h-full w-auto block" style={{ aspectRatio: 'auto' }} />
              </div>
              {/* 分割线 */}
              <div className="absolute top-0 bottom-0 w-[2px] bg-white/90 shadow" style={{ left: `${pos}%` }}>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-lift flex items-center justify-center">
                  <Wand2 size={15} className="text-indigo-600" />
                </div>
              </div>
              <div className="absolute top-3 left-3 badge bg-ink-900/65 text-linen-50">原始场景</div>
              <div className="absolute top-3 right-3 badge bg-indigo-600/90 text-white">{fabric?.name}</div>
              {busy && (
                <div className="absolute inset-0 grid place-items-center bg-ink-900/30 backdrop-blur-[2px]">
                  <div className="text-linen-50 text-sm bg-ink-900/70 rounded-full px-5 py-2">AI 合成中…</div>
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
                演示环境说明：本页使用 Canvas 图像合成模拟 AI 换布效果（保留场景明暗、映射面料色彩与纹理）。
                正式版将接入 AI 大模型，支持上传客户实拍图、自动识别家具/软装区域并精准替换材质花色，
                生成商用级效果图可直接用于客户提案与合同附件。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
