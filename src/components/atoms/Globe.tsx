"use client";
import { useEffect, useRef } from "react";
import { GLOBE_DOTS } from "@/lib/data";

function drawGlobe(canvas: HTMLCanvasElement, rot: number, pulse: number, accentColor: string) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const S = canvas.width;
  const cx = S / 2, cy = S / 2, r = S / 2 - 8;
  ctx.clearRect(0, 0, S, S);

  const og = ctx.createRadialGradient(cx, cy, r * 0.8, cx, cy, r + 20);
  og.addColorStop(0, accentColor + "28");
  og.addColorStop(1, "transparent");
  ctx.beginPath(); ctx.arc(cx, cy, r + 20, 0, Math.PI * 2); ctx.fillStyle = og; ctx.fill();

  const sg = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
  sg.addColorStop(0, "#1E3A6E"); sg.addColorStop(0.6, "#0C1E40"); sg.addColorStop(1, "#050C1A");
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = sg; ctx.fill();

  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.clip();

  for (let lat = -75; lat <= 75; lat += 25) {
    const latR = lat * Math.PI / 180, ry = r * Math.sin(latR), rx = r * Math.cos(latR);
    const b = 1 - Math.abs(lat) / 90;
    ctx.strokeStyle = `rgba(0,212,255,${0.05 + b * 0.08})`; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.ellipse(cx, cy + ry, rx, rx * 0.18, 0, 0, Math.PI * 2); ctx.stroke();
  }
  for (let lng = 0; lng < 360; lng += 25) {
    const angle = ((lng + rot) % 360) * Math.PI / 180, sx = Math.cos(angle), a = (sx + 1) / 2;
    ctx.strokeStyle = `rgba(0,212,255,${a * 0.1})`; ctx.lineWidth = 0.5;
    ctx.beginPath(); ctx.ellipse(cx, cy, Math.abs(sx) * r, r, 0, 0, Math.PI * 2); ctx.stroke();
  }
  ctx.fillStyle = "rgba(0,212,255,0.04)";
  ([[0.15, 20, 0.1, 0.2, 0.2], [0.3, -70, 0.09, 0.24, 0.15], [0.2, 90, 0.18, 0.13, 0], [-0.1, -20, 0.06, 0.1, 0]] as number[][]).forEach(([xm, lng, rx2, ry2]) => {
    const x = cx + r * xm * Math.sin(((lng + rot) % 360) * Math.PI / 180);
    ctx.beginPath(); ctx.ellipse(x, cy, r * rx2, r * ry2, 0, 0, Math.PI * 2); ctx.fill();
  });
  ctx.restore();

  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = accentColor + "88"; ctx.lineWidth = 1.2; ctx.stroke();

  const hi = ctx.createRadialGradient(cx - r * 0.35, cy - r * 0.35, 0, cx - r * 0.35, cy - r * 0.35, r * 0.4);
  hi.addColorStop(0, "rgba(255,255,255,0.14)"); hi.addColorStop(1, "transparent");
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fillStyle = hi; ctx.fill();

  const pv = (Math.sin(pulse * 0.07) + 1) / 2;
  GLOBE_DOTS.forEach((dot) => {
    const la = ((dot.lng + rot) % 360 + 360) % 360;
    const lr = la * Math.PI / 180;
    const latR = dot.lat * Math.PI / 180;
    const sinL = Math.sin(lr - Math.PI);
    if (sinL < -0.15) return;
    const vis = Math.max(0, Math.min(1, (sinL + 0.15) / 0.5));
    const x = cx + r * Math.cos(latR) * Math.sin(lr - Math.PI);
    const y = cy - r * Math.sin(latR);
    const pr = 5 + pv * 6;
    const rg = ctx.createRadialGradient(x, y, 1, x, y, pr + 3);
    rg.addColorStop(0, dot.color + Math.round(vis * 100).toString(16).padStart(2, "0"));
    rg.addColorStop(1, "transparent");
    ctx.beginPath(); ctx.arc(x, y, pr + 3, 0, Math.PI * 2); ctx.fillStyle = rg; ctx.fill();
    ctx.beginPath(); ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fillStyle = dot.color + Math.round(vis * 255).toString(16).padStart(2, "0");
    ctx.shadowColor = dot.color; ctx.shadowBlur = 6; ctx.fill(); ctx.shadowBlur = 0;
  });
}

export function SmallGlobe({ color }: { color: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const rot = useRef(180), pulse = useRef(0), frame = useRef<number>(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    c.width = 150; c.height = 150;
    const tick = () => {
      drawGlobe(c, rot.current, pulse.current, color);
      rot.current += 0.3; pulse.current += 1;
      frame.current = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(frame.current);
  }, [color]);
  return <canvas ref={ref} style={{ display: "block", width: 160, height: 160 }} />;
}

export function LargeGlobe() {
  const ref = useRef<HTMLCanvasElement>(null);
  const rot = useRef(0), pulse = useRef(0), frame = useRef<number>(0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const resize = () => {
      const p = c.parentElement;
      const s = Math.min(p ? p.offsetWidth : 300, 300);
      c.width = s; c.height = s;
    };
    resize();
    window.addEventListener("resize", resize);
    const tick = () => {
      drawGlobe(c, rot.current, pulse.current, "#00D4FF");
      rot.current += 0.25; pulse.current += 1;
      frame.current = requestAnimationFrame(tick);
    };
    tick();
    return () => { cancelAnimationFrame(frame.current); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <div className="w-full max-w-[260px] mx-auto mb-2 relative">
      <canvas ref={ref} style={{ display: "block", width: "100%", height: "auto" }} />
    </div>
  );
}
