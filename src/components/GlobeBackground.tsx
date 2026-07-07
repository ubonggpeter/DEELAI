"use client";
import { useEffect, useRef } from "react";

// City dots [lat, lng, radius-multiplier]
const CITIES: [number, number, number][] = [
  [6.5,   3.4,   1.8],   // Lagos
  [-1.3,  36.8,  1.4],   // Nairobi
  [30.1,  31.2,  1.4],   // Cairo
  [-26,   28,    1.2],   // Johannesburg
  [40.7, -74.0,  2.0],   // New York
  [-23.5,-46.6,  1.5],   // São Paulo
  [19.4, -99.1,  1.3],   // Mexico City
  [34.0,-118.2,  1.5],   // Los Angeles
  [51.5,  -0.1,  1.8],   // London
  [48.9,   2.3,  1.4],   // Paris
  [52.5,  13.4,  1.3],   // Berlin
  [55.7,  37.6,  1.3],   // Moscow
  [35.7, 139.7,  1.8],   // Tokyo
  [39.9, 116.4,  1.8],   // Beijing
  [19.1,  72.9,  1.3],   // Mumbai
  [1.4,  103.8,  1.3],   // Singapore
  [-33.9,151.2,  1.3],   // Sydney
  [37.6,  55.0,  1.2],   // Tehran
  [25.2,  55.3,  1.3],   // Dubai
  [59.9,  30.3,  1.2],   // St. Petersburg
];

export default function GlobeBackground() {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!wrapRef.current || !canvasRef.current) return;
    // Capture as non-null so TypeScript doesn't complain inside nested closures
    const wrap:   HTMLDivElement    = wrapRef.current;
    const canvas: HTMLCanvasElement = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    let raf    = 0;
    let rot    = 1.0;   // initial rotation (radians)
    let lastTs = 0;

    function resize() {
      const s   = Math.min(wrap.clientWidth, wrap.clientHeight);
      canvas.width  = s;
      canvas.height = s;
    }

    const obs = new ResizeObserver(resize);
    obs.observe(wrap);
    resize();

    // Orthographic Y-axis projection
    function project(latDeg: number, lngDeg: number) {
      const lat = latDeg * (Math.PI / 180);
      const lng = lngDeg * (Math.PI / 180) + rot;
      const x = Math.cos(lat) * Math.sin(lng);
      const y = -Math.sin(lat);
      const z = Math.cos(lat) * Math.cos(lng);
      const R  = canvas.width * 0.47;
      const cx = canvas.width  / 2;
      const cy = canvas.height / 2;
      return { sx: cx + x * R, sy: cy + y * R, z, R, cx, cy };
    }

    function drawLatLine(lat: number, alpha: number, width: number) {
      const pts = Array.from({ length: 73 }, (_, i) => project(lat, i * 5 - 180));
      ctx.beginPath();
      let pen = false;
      for (const p of pts) {
        if (p.z < -0.1) { pen = false; continue; }
        if (!pen) { ctx.moveTo(p.sx, p.sy); pen = true; } else ctx.lineTo(p.sx, p.sy);
      }
      ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
      ctx.lineWidth   = width;
      ctx.stroke();
    }

    function drawLngLine(lng: number, alpha: number) {
      const pts = Array.from({ length: 37 }, (_, i) => project(i * 5 - 90, lng));
      ctx.beginPath();
      let pen = false;
      for (const p of pts) {
        if (p.z < -0.1) { pen = false; continue; }
        if (!pen) { ctx.moveTo(p.sx, p.sy); pen = true; } else ctx.lineTo(p.sx, p.sy);
      }
      ctx.strokeStyle = `rgba(0,212,255,${alpha})`;
      ctx.lineWidth   = 0.5;
      ctx.stroke();
    }

    function draw(ts: number) {
      raf = requestAnimationFrame(draw);
      if (ts - lastTs < 33) return;
      lastTs = ts;
      rot   += 0.003;

      const W = canvas.width, H = canvas.height;
      if (W === 0) return;
      ctx.clearRect(0, 0, W, H);

      const first = project(0, 0);
      const { R, cx, cy } = first;

      // ── Sphere fill (subtle) ──────────────────────────────────────
      const fill = ctx.createRadialGradient(cx - R * 0.2, cy - R * 0.2, 0, cx, cy, R);
      fill.addColorStop(0,   "rgba(0,50,100,0.12)");
      fill.addColorStop(0.7, "rgba(0,20,50,0.06)");
      fill.addColorStop(1,   "rgba(0,212,255,0.04)");
      ctx.fillStyle = fill;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      // ── Clip to sphere ────────────────────────────────────────────
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.clip();

      // Latitude lines
      for (const lat of [-60, -30, 0, 30, 60]) {
        drawLatLine(lat, lat === 0 ? 0.14 : 0.07, lat === 0 ? 0.9 : 0.5);
      }
      // Longitude lines (every 30°)
      for (let l = 0; l < 360; l += 30) drawLngLine(l, 0.07);

      ctx.restore();

      // ── Sphere edge ring ─────────────────────────────────────────
      ctx.strokeStyle = "rgba(0,212,255,0.20)";
      ctx.lineWidth   = 1.2;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

      // Atmospheric glow at edges
      const atmo = ctx.createRadialGradient(cx, cy, R * 0.75, cx, cy, R * 1.08);
      atmo.addColorStop(0, "rgba(0,212,255,0)");
      atmo.addColorStop(1, "rgba(0,212,255,0.10)");
      ctx.fillStyle = atmo;
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.08, 0, Math.PI * 2); ctx.fill();

      // ── City dots ─────────────────────────────────────────────────
      for (const [lat, lng, sz] of CITIES) {
        const p = project(lat, lng);
        if (p.z < 0.0) continue;
        const depth  = p.z;
        const pulse  = 0.55 + 0.38 * Math.sin(ts * 0.0008 + lat * 0.3 + lng * 0.1);
        const dotR   = sz * depth * 1.5;
        const coreA  = depth * 0.9 * pulse;
        const glowR  = dotR * 6;

        // Glow
        const g = ctx.createRadialGradient(p.sx, p.sy, 0, p.sx, p.sy, glowR);
        g.addColorStop(0, `rgba(0,212,255,${coreA * 0.35})`);
        g.addColorStop(1, "rgba(0,212,255,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, glowR, 0, Math.PI * 2); ctx.fill();

        // Core dot
        ctx.fillStyle = `rgba(0,212,255,${coreA})`;
        ctx.beginPath(); ctx.arc(p.sx, p.sy, dotR, 0, Math.PI * 2); ctx.fill();

        // Bright pinpoint highlight
        ctx.fillStyle = `rgba(180,240,255,${coreA * 0.7})`;
        ctx.beginPath(); ctx.arc(p.sx - dotR * 0.3, p.sy - dotR * 0.3, dotR * 0.35, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); obs.disconnect(); };
  }, []);

  return (
    <div ref={wrapRef} style={{ width: "100%", height: "100%" }}>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{ display: "block", width: "100%", height: "100%" }}
      />
    </div>
  );
}
