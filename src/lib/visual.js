// 程序化织纹 / 二维码 / 通用工具
function hashCode(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0
  return Math.abs(h)
}

// 无实拍图时，按 sku 生成布纹 SVG data-uri
export function weaveSwatch(sku, hue = 220, sat = 12, w = 560, h = 420) {
  const seed = hashCode(sku)
  const h1 = hue
  const h2 = (hue + 18 + (seed % 14)) % 360
  const l1 = 52 + (seed % 18)
  const l2 = l1 - 16 - (seed % 10)
  const s1 = Math.max(6, sat)
  const s2 = s1 + 8
  const c1 = `hsl(${h1} ${s1}% ${l1}%)`
  const c2 = `hsl(${h2} ${s2}% ${l2}%)`
  const c3 = `hsl(${h1} ${s1 + 10}% ${Math.max(18, l2 - 14)}%)`
  const gid = 'g' + (seed % 9999)
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}'>
<defs>
<linearGradient id='${gid}' x1='0' y1='0' x2='1' y2='1'>
<stop offset='0' stop-color='${c1}'/><stop offset='1' stop-color='${c2}'/>
</linearGradient>
<pattern id='w${gid}' width='14' height='14' patternUnits='userSpaceOnUse' patternTransform='rotate(${(seed % 40) - 20})'>
<rect width='14' height='14' fill='none'/>
<path d='M0 3.5h14M0 10.5h14' stroke='rgba(255,255,255,.10)' stroke-width='1.6'/>
<path d='M3.5 0v14M10.5 0v14' stroke='rgba(0,0,0,.10)' stroke-width='1.6'/>
</pattern>
<pattern id='n${gid}' width='7' height='7' patternUnits='userSpaceOnUse'>
<circle cx='1.5' cy='1.5' r='.9' fill='rgba(255,255,255,.12)'/>
<circle cx='5' cy='4.5' r='.7' fill='rgba(0,0,0,.10)'/>
</pattern>
</defs>
<rect width='${w}' height='${h}' fill='url(#${gid})'/>
<rect width='${w}' height='${h}' fill='url(#w${gid})'/>
<rect width='${w}' height='${h}' fill='url(#n${gid})'/>
<ellipse cx='${w * 0.72}' cy='${h * 0.2}' rx='${w * 0.5}' ry='${h * 0.42}' fill='rgba(255,255,255,.10)'/>
<ellipse cx='${w * 0.2}' cy='${h * 0.9}' rx='${w * 0.45}' ry='${h * 0.4}' fill='rgba(0,0,0,.12)'/>
<path d='M0 ${h * 0.62} Q ${w * 0.3} ${h * 0.5} ${w * 0.55} ${h * 0.66} T ${w} ${h * 0.58}' stroke='${c3}' stroke-width='${h * 0.05}' fill='none' opacity='.5'/>
</svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

// 面料主图兜底：实拍图或织纹
export function fabricImg(f) {
  if (f?.img) return f.img
  return weaveSwatch(f?.sku || 'BD', f?.hue ?? 220, f?.sat ?? 12)
}

// 伪二维码（演示用）
export function qrDataUri(text, size = 21) {
  const seed = hashCode(text)
  let s = seed || 1
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff }
  const cell = 8
  const pad = 2
  const dim = (size + pad * 2) * cell
  let rects = ''
  const isFinder = (x, y) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7)
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (isFinder(x, y)) continue
      if (rnd() > 0.52) rects += `<rect x='${(x + pad) * cell}' y='${(y + pad) * cell}' width='${cell}' height='${cell}'/>`
    }
  }
  const finder = (fx, fy) => `
    <rect x='${(fx + pad) * cell}' y='${(fy + pad) * cell}' width='${7 * cell}' height='${7 * cell}' fill='none' stroke='#22262d' stroke-width='${cell}'/>
    <rect x='${(fx + 2 + pad) * cell}' y='${(fy + 2 + pad) * cell}' width='${3 * cell}' height='${3 * cell}' fill='#22262d'/>`
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${dim}' height='${dim}' viewBox='0 0 ${dim} ${dim}'>
    <rect width='${dim}' height='${dim}' fill='#fff'/>
    <g fill='#22262d'>${rects}</g>
    ${finder(0, 0)}${finder(size - 7, 0)}${finder(0, size - 7)}
  </svg>`
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
}

export const fmtMoney = (n) => '¥' + (Number(n) || 0).toLocaleString('zh-CN')
export const fmtNum = (n) => (Number(n) || 0).toLocaleString('zh-CN')
