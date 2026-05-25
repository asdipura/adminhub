'use client'

import { useEffect, useRef } from 'react'

export default function HeroSection() {
  const gridCanvasRef = useRef<HTMLCanvasElement>(null)
  const hoverCanvasRef = useRef<HTMLCanvasElement>(null)
  const noiseCanvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const CFG = {
      squareSize: 44,
      speed: 0.25,
      borderColor: 'rgba(160, 175, 200, 0.20)',
      vignette: true,
      hoverFill: 'rgba(200, 210, 225, 0.08)',
      hoverStroke: 'rgba(210, 220, 240, 0.65)',
      hoverGlow: 'rgba(190, 205, 230, 0.25)',
    }

    const offset = { x: 0, y: 0 }

    function setHiDPI(canvas: HTMLCanvasElement) {
      const p = canvas.parentElement
      const cw = ((p ? p.clientWidth : window.innerWidth) | 0)
      const ch = ((p ? p.clientHeight : window.innerHeight) | 0)
      const dpr = Math.min(2, Math.max(1, window.devicePixelRatio || 1))
      canvas.width = Math.floor(cw * dpr)
      canvas.height = Math.floor(ch * dpr)
      canvas.style.width = cw + 'px'
      canvas.style.height = ch + 'px'
      const ctx = canvas.getContext('2d')!
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      return ctx
    }

    function origin(cell: number) {
      return {
        x: -((offset.x % cell) + cell) % cell,
        y: -((offset.y % cell) + cell) % cell,
      }
    }

    const gridCanvas = gridCanvasRef.current!
    const hCanvas = hoverCanvasRef.current!
    const noiseCanvas = noiseCanvasRef.current!

    let gridCtx = setHiDPI(gridCanvas)
    let hCtx = setHiDPI(hCanvas)

    const NOISE_SIZE = 1024
    const NOISE_ALPHA = 11
    let noiseFrame = 0

    noiseCanvas.width = NOISE_SIZE
    noiseCanvas.height = NOISE_SIZE
    const noiseCtx = noiseCanvas.getContext('2d', { alpha: true })!

    const hovered = { active: false, gx: 0, gy: 0 }

    function drawGrid() {
      const cw = gridCanvas.clientWidth
      const ch = gridCanvas.clientHeight
      gridCtx.clearRect(0, 0, cw, ch)
      const o = origin(CFG.squareSize)
      gridCtx.strokeStyle = CFG.borderColor
      gridCtx.lineWidth = 1
      for (let x = o.x; x < cw + CFG.squareSize; x += CFG.squareSize) {
        gridCtx.beginPath(); gridCtx.moveTo(x + 0.5, 0); gridCtx.lineTo(x + 0.5, ch); gridCtx.stroke()
      }
      for (let y = o.y; y < ch + CFG.squareSize; y += CFG.squareSize) {
        gridCtx.beginPath(); gridCtx.moveTo(0, y + 0.5); gridCtx.lineTo(cw, y + 0.5); gridCtx.stroke()
      }
      if (CFG.vignette) {
        const grad = gridCtx.createRadialGradient(cw / 2, ch / 2, 0, cw / 2, ch / 2, Math.sqrt(cw * cw + ch * ch) / 2)
        grad.addColorStop(0, 'rgba(0,0,0,0)')
        grad.addColorStop(1, 'rgba(0,0,0,0.45)')
        gridCtx.fillStyle = grad
        gridCtx.fillRect(0, 0, cw, ch)
      }
    }

    function drawHover() {
      const cw = hCanvas.clientWidth
      const ch = hCanvas.clientHeight
      hCtx.clearRect(0, 0, cw, ch)
      if (!hovered.active) return
      const o = origin(CFG.squareSize)
      const cellX = o.x + hovered.gx * CFG.squareSize
      const cellY = o.y + hovered.gy * CFG.squareSize
      const s = CFG.squareSize
      hCtx.save()
      hCtx.shadowBlur = 18
      hCtx.shadowColor = CFG.hoverGlow
      hCtx.fillStyle = CFG.hoverFill
      hCtx.fillRect(cellX, cellY, s, s)
      hCtx.restore()
      hCtx.lineWidth = 1
      hCtx.strokeStyle = CFG.hoverStroke
      hCtx.strokeRect(cellX + 0.5, cellY + 0.5, s - 1, s - 1)
      const sheen = hCtx.createLinearGradient(cellX, cellY, cellX, cellY + s)
      sheen.addColorStop(0, 'rgba(255,255,255,0.07)')
      sheen.addColorStop(1, 'rgba(255,255,255,0.02)')
      hCtx.fillStyle = sheen
      hCtx.fillRect(cellX, cellY, s, s)
    }

    function drawNoise() {
      const img = noiseCtx.createImageData(NOISE_SIZE, NOISE_SIZE)
      const d = img.data
      for (let i = 0; i < d.length; i += 4) {
        const v = Math.random() * 255
        d[i] = v; d[i + 1] = v; d[i + 2] = v; d[i + 3] = NOISE_ALPHA
      }
      noiseCtx.putImageData(img, 0, 0)
    }

    function onMouseMove(e: MouseEvent) {
      const rect = hCanvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      const o = origin(CFG.squareSize)
      hovered.gx = Math.floor((mx - o.x) / CFG.squareSize)
      hovered.gy = Math.floor((my - o.y) / CFG.squareSize)
      hovered.active = true
    }

    function onMouseLeave() { hovered.active = false }
    function onTouchEnd() { hovered.active = false }

    hCanvas.addEventListener('mousemove', onMouseMove)
    hCanvas.addEventListener('mouseleave', onMouseLeave)
    hCanvas.addEventListener('touchend', onTouchEnd)

    function tick() {
      const v = Math.max(CFG.speed, 0.1)
      const s = CFG.squareSize
      offset.x = (offset.x - v + s) % s
      offset.y = (offset.y - v + s) % s
      drawGrid()
      drawHover()
      if (noiseFrame % 2 === 0) drawNoise()
      noiseFrame++
      rafRef.current = requestAnimationFrame(tick)
    }

    function onResize() {
      gridCtx = setHiDPI(gridCanvas)
      hCtx = setHiDPI(hCanvas)
    }

    window.addEventListener('resize', onResize)
    tick()

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', onResize)
      hCanvas.removeEventListener('mousemove', onMouseMove)
      hCanvas.removeEventListener('mouseleave', onMouseLeave)
      hCanvas.removeEventListener('touchend', onTouchEnd)
    }
  }, [])

  return (
    <section id="hero">
      <div id="spotlight"></div>
      <canvas id="canvas-grid" ref={gridCanvasRef}></canvas>
      <canvas id="canvas-hover" ref={hoverCanvasRef}></canvas>
      <canvas id="canvas-noise" ref={noiseCanvasRef}></canvas>
      <div id="vignette-bottom"></div>

      <div id="hero-content">
        <div id="logo-wrap">
          <img src="/assets/logos/himaide-logo.svg" alt="HIMA IDE" />
        </div>
        <img
          id="adminhub-svg"
          src="/assets/adminhub-wordmark.svg"
          alt="Admin Hub"
        />
        <p id="tagline">Pusat Informasi Administrasi HIMAIDE.</p>
        <div className="divider"></div>
      </div>

      <div id="scroll-hint">
        <span>SCROLL</span>
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>
    </section>
  )
}
