"use client";
import { useEffect, useRef } from "react";

// Lightweight canvas network animation — DEELAI cyan/blue palette.
// ~30fps cap, <0.5ms/frame on modern hardware, no external dependencies.
export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    if (!ctx) return;

    let W = 0, H = 0, rafId = 0, lastTs = 0;

    // ── Node type ───────────────────────────────────────────────────
    interface Node {
      x: number; y: number;
      vx: number; vy: number;
      r: number;        // core radius (simulates z-depth by size)
      phase: number;    // glow pulse phase offset
      depth: number;    // 0 = far, 1 = near (affects speed + alpha)
    }

    let nodes: Node[] = [];

    // ── Init ────────────────────────────────────────────────────────
    function buildNodes() {
      const count = Math.min(38, Math.max(16, Math.round((W * H) / 22000)));
      nodes = Array.from({ length: count }, () => {
        const depth = Math.random();               // 0 = far/dim, 1 = near/bright
        const speed = 0.12 + depth * 0.28;        // near nodes move faster
        const angle = Math.random() * Math.PI * 2;
        return {
          x: Math.random() * W,
          y: Math.random() * H,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 1.0 + depth * 2.2,
          phase: Math.random() * Math.PI * 2,
          depth,
        };
      });
    }

    function resize() {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas!.width  = W;
      canvas!.height = H;
      buildNodes();
    }

    resize();
    window.addEventListener("resize", resize, { passive: true });

    // ── Colors ──────────────────────────────────────────────────────
    const C  = [0, 212, 255];   // #00D4FF cyan
    const C2 = [0, 85, 221];    // #0055DD blue (accent)

    function rgba(r: number, g: number, b: number, a: number) {
      return `rgba(${r},${g},${b},${a.toFixed(3)})`;
    }

    // ── Draw ────────────────────────────────────────────────────────
    const MAX_DIST  = 190;
    const MAX_DIST2 = MAX_DIST * MAX_DIST;
    const TRI_DIST2 = 120 * 120;
    const FPS_CAP   = 33; // ~30fps

    function draw(ts: number) {
      rafId = requestAnimationFrame(draw);
      if (ts - lastTs < FPS_CAP) return;
      lastTs = ts;

      ctx.clearRect(0, 0, W, H);

      // Update positions + wrap
      for (const n of nodes) {
        n.x    += n.vx;
        n.y    += n.vy;
        n.phase += 0.010 + n.depth * 0.008;
        if (n.x < -60) n.x = W + 60;
        else if (n.x > W + 60) n.x = -60;
        if (n.y < -60) n.y = H + 60;
        else if (n.y > H + 60) n.y = -60;
      }

      // ── Crystal triangle fills ───────────────────────────────────
      // Only fill triangles when all 3 nodes are within TRI_DIST
      for (let i = 0; i < nodes.length - 2; i++) {
        const ni = nodes[i];
        for (let j = i + 1; j < nodes.length - 1; j++) {
          const nj = nodes[j];
          const dxij = ni.x - nj.x, dyij = ni.y - nj.y;
          if (dxij * dxij + dyij * dyij > TRI_DIST2) continue;
          for (let k = j + 1; k < nodes.length; k++) {
            const nk = nodes[k];
            const dxik = ni.x - nk.x, dyik = ni.y - nk.y;
            if (dxik * dxik + dyik * dyik > TRI_DIST2) continue;
            const dxjk = nj.x - nk.x, dyjk = nj.y - nk.y;
            if (dxjk * dxjk + dyjk * dyjk > TRI_DIST2) continue;

            const avgDepth = (ni.depth + nj.depth + nk.depth) / 3;
            // Alternate cyan / blue tint per triangle using index parity
            const tc = (i + j + k) % 3 === 0 ? C2 : C;
            ctx.fillStyle = rgba(tc[0], tc[1], tc[2], avgDepth * 0.055);
            ctx.beginPath();
            ctx.moveTo(ni.x, ni.y);
            ctx.lineTo(nj.x, nj.y);
            ctx.lineTo(nk.x, nk.y);
            ctx.closePath();
            ctx.fill();
          }
        }
      }

      // ── Connection lines ─────────────────────────────────────────
      for (let i = 0; i < nodes.length - 1; i++) {
        const ni = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const nj = nodes[j];
          const dx = ni.x - nj.x, dy = ni.y - nj.y;
          const d2 = dx * dx + dy * dy;
          if (d2 > MAX_DIST2) continue;

          const d        = Math.sqrt(d2);
          const falloff  = 1 - d / MAX_DIST;
          const avgDepth = (ni.depth + nj.depth) / 2;
          const lineA    = falloff * 0.22 * (0.4 + avgDepth * 0.6);

          ctx.strokeStyle = rgba(C[0], C[1], C[2], lineA);
          ctx.lineWidth   = falloff * 1.4;
          ctx.beginPath();
          ctx.moveTo(ni.x, ni.y);
          ctx.lineTo(nj.x, nj.y);
          ctx.stroke();
        }
      }

      // ── Nodes: glow + core ───────────────────────────────────────
      for (const n of nodes) {
        const pulse    = 0.55 + Math.sin(n.phase) * 0.28;
        const glowR    = n.r * 9;
        const coreA    = (0.45 + n.depth * 0.4) * pulse;
        const glowA    = n.depth * 0.18 * pulse;

        // Glow halo (radial gradient)
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, glowR);
        grd.addColorStop(0, rgba(C[0], C[1], C[2], glowA));
        grd.addColorStop(1, rgba(C[0], C[1], C[2], 0));
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(n.x, n.y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Core dot — slight blue tint on smaller (far) nodes
        const nc = n.depth > 0.5 ? C : C2;
        ctx.fillStyle = rgba(nc[0], nc[1], nc[2], coreA);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
