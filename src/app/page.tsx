// Server component — no "use client".
// HeroCarousel + ChannelList are client components, imported here.
import HeroCarousel from "@/components/HeroCarousel";
import ChannelList from "@/components/ChannelList";
import NetworkBackground from "@/components/NetworkBackground";

const C = {
  bg: "#060A12", s1: "#0C1220", s2: "#101829", s3: "#162035",
  cyan: "#00D4FF", green: "#00E5A0", gold: "#FFB800",
  txt: "#EEF2FF", txt2: "#7D8BAA", txt3: "#4A5470",
};

export default function LandingPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.txt, position: "relative" }}>
      <NetworkBackground />

      {/* Content above canvas */}
      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── Nav ──────────────────────────────────────────────────────── */}
        <nav style={{
          position: "sticky", top: 0, zIndex: 50,
          background: `${C.bg}e8`, backdropFilter: "blur(12px)",
          borderBottom: `1px solid ${C.s3}`,
          padding: "0 16px",
        }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", alignItems: "center", height: 56, gap: 10, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8, flexShrink: 0,
                background: "linear-gradient(135deg,#00D4FF,#0055DD)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 900, color: "#fff", fontSize: 14, fontFamily: "system-ui",
              }}>D</div>
              <span style={{ fontWeight: 900, fontSize: 17, fontFamily: "system-ui", whiteSpace: "nowrap" }}>
                DEEL<span style={{ color: C.cyan }}>Ai</span>
              </span>
            </div>
            <div style={{ flex: 1 }} />
            <a href="/login" className="nav-signin" style={{
              color: C.txt2, fontSize: 13, textDecoration: "none",
              padding: "6px 12px", borderRadius: 7, border: `1px solid ${C.s3}`,
              whiteSpace: "nowrap", flexShrink: 0,
            }}>Sign In</a>
            <a href="#channels" style={{
              background: C.cyan, color: "#060A12",
              fontSize: 13, fontWeight: 700, textDecoration: "none",
              padding: "7px 14px", borderRadius: 7, whiteSpace: "nowrap", flexShrink: 0,
            }}>Join Now</a>
          </div>
        </nav>

        {/* ── Hero Carousel (3 slides, horizontal scroll) ───────────────── */}
        <HeroCarousel />

        {/* ── Channel selection — normal vertical, below carousel ─────── */}
        <div id="channels" style={{ background: C.bg, borderTop: `1px solid ${C.s3}` }}>
          <div style={{ maxWidth: 1100, margin: "0 auto", padding: "56px 16px 64px" }}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h2 style={{ fontSize: "clamp(22px, 5vw, 38px)", fontWeight: 800, margin: "0 0 10px" }}>
                Choose Your Channel
              </h2>
              <p style={{ color: C.txt2, fontSize: 14, maxWidth: 480, margin: "0 auto" }}>
                Channels are managed by regional agents. Find your region and click Join to register.
              </p>
            </div>
            <ChannelList />
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${C.s3}`, padding: "20px 16px", textAlign: "center" }}>
          <div style={{ color: C.txt3, fontSize: 12 }}>
            © 2026 DEELAI · Remote Work Platform ·{" "}
            <a href="/login" style={{ color: C.txt2, textDecoration: "none" }}>Sign In</a>
          </div>
        </div>

      </div>{/* /content wrapper */}

      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        html { scroll-behavior: smooth; }
        body { overflow-x: hidden; }
        @media (max-width: 340px) { .nav-signin { display: none; } }
        .agent-row { transition: border-color 0.15s, background 0.15s; }
        .agent-row:hover { border-color: #00D4FF60 !important; }
        @media (max-width: 380px) { .agent-join-btn { padding: 8px 10px; } }
      `}</style>
    </div>
  );
}
