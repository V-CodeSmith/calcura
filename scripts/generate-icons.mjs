/**
 * Generates the PWA icons as real PNG files with no image dependencies:
 * a few rounded rectangles are rasterised with 4x4 supersampling and encoded
 * through Node's zlib.
 *
 * Usage: npm run icons
 */
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const outputDirectory = join(here, '..', 'public', 'icons')

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buffer) {
  let crc = 0xffffffff
  for (const byte of buffer) crc = CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length, 0)
  const typeBuffer = Buffer.from(type, 'ascii')
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0)
  return Buffer.concat([length, typeBuffer, data, crc])
}

function encodePng(size, rgba) {
  const stride = size * 4 + 1
  const raw = Buffer.alloc(stride * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * stride] = 0 // filter type: none
    rgba.copy(raw, y * stride + 1, y * size * 4, (y + 1) * size * 4)
  }

  const header = Buffer.alloc(13)
  header.writeUInt32BE(size, 0)
  header.writeUInt32BE(size, 4)
  header[8] = 8 // bit depth
  header[9] = 6 // colour type: RGBA
  header[10] = 0
  header[11] = 0
  header[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

const GRADIENT_FROM = [79, 70, 229]
const GRADIENT_TO = [139, 92, 246]
const CARD = [255, 255, 255]
const SCREEN = [30, 27, 75]
const KEY = [99, 102, 241]
const KEY_ACCENT = [139, 92, 246]

const KEYS = [
  [0.3, 0.47],
  [0.5, 0.47],
  [0.7, 0.47],
  [0.3, 0.6],
  [0.5, 0.6],
  [0.7, 0.6],
  [0.3, 0.73],
  [0.5, 0.73],
  [0.7, 0.73],
]

function mix(from, to, t) {
  return [
    Math.round(from[0] + (to[0] - from[0]) * t),
    Math.round(from[1] + (to[1] - from[1]) * t),
    Math.round(from[2] + (to[2] - from[2]) * t),
  ]
}

function insideRoundedRect(x, y, left, top, right, bottom, radius) {
  if (x < left || x > right || y < top || y > bottom) return false
  const cx = Math.min(Math.max(x, left + radius), right - radius)
  const cy = Math.min(Math.max(y, top + radius), bottom - radius)
  const dx = x - cx
  const dy = y - cy
  return dx * dx + dy * dy <= radius * radius
}

/** Returns a premultiplied RGBA sample for a normalised coordinate. */
function shade(u, v, padding, rounded) {
  if (rounded && !insideRoundedRect(u, v, 0, 0, 1, 1, 0.23)) return [0, 0, 0, 0]

  const background = mix(GRADIENT_FROM, GRADIENT_TO, (u + v) / 2)
  const cu = (u - padding) / (1 - 2 * padding)
  const cv = (v - padding) / (1 - 2 * padding)

  if (cu < 0 || cu > 1 || cv < 0 || cv > 1) {
    return [background[0], background[1], background[2], 1]
  }

  if (insideRoundedRect(cu, cv, 0.18, 0.16, 0.82, 0.84, 0.09)) {
    if (insideRoundedRect(cu, cv, 0.26, 0.23, 0.74, 0.34, 0.035)) {
      return [SCREEN[0], SCREEN[1], SCREEN[2], 1]
    }
    for (let i = 0; i < KEYS.length; i += 1) {
      const [kx, ky] = KEYS[i]
      const isAccent = i === KEYS.length - 1
      const colour = isAccent ? KEY_ACCENT : KEY
      const dx = cu - kx
      const dy = cv - ky
      if (dx * dx + dy * dy <= 0.05 * 0.05) return [colour[0], colour[1], colour[2], 1]
    }
    return [CARD[0], CARD[1], CARD[2], 1]
  }

  return [background[0], background[1], background[2], 1]
}

function render(size, { padding, rounded }) {
  const samples = 4
  const rgba = Buffer.alloc(size * size * 4)

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0
      let g = 0
      let b = 0
      let alpha = 0

      for (let sy = 0; sy < samples; sy += 1) {
        for (let sx = 0; sx < samples; sx += 1) {
          const u = (x + (sx + 0.5) / samples) / size
          const v = (y + (sy + 0.5) / samples) / size
          const [sr, sg, sb, sa] = shade(u, v, padding, rounded)
          r += sr * sa
          g += sg * sa
          b += sb * sa
          alpha += sa
        }
      }

      const total = samples * samples
      const offset = (y * size + x) * 4
      rgba[offset] = alpha > 0 ? Math.round(r / alpha) : 0
      rgba[offset + 1] = alpha > 0 ? Math.round(g / alpha) : 0
      rgba[offset + 2] = alpha > 0 ? Math.round(b / alpha) : 0
      rgba[offset + 3] = Math.round((alpha / total) * 255)
    }
  }

  return encodePng(size, rgba)
}

const targets = [
  { file: 'icon-192.png', size: 192, padding: 0.06, rounded: true },
  { file: 'icon-512.png', size: 512, padding: 0.06, rounded: true },
  { file: 'maskable-512.png', size: 512, padding: 0.14, rounded: false },
  { file: 'apple-touch-icon.png', size: 180, padding: 0.06, rounded: false },
]

mkdirSync(outputDirectory, { recursive: true })

for (const target of targets) {
  const png = render(target.size, { padding: target.padding, rounded: target.rounded })
  writeFileSync(join(outputDirectory, target.file), png)
  console.log(`generated public/icons/${target.file} (${png.length} bytes)`)
}
