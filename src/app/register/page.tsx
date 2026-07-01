"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Mail, Phone, Lock, Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, Shield } from "lucide-react";

const C = { bg:"#060A12", s1:"#0C1220", s2:"#101829", s3:"#162035", cyan:"#00D4FF", green:"#00E5A0", gold:"#FFB800", red:"#FF4D6D", txt:"#EEF2FF", txt2:"#7D8BAA", txt3:"#4A5470" };

interface ChannelInfo { channelName: string; estTime: string; jobPassFee: number; }

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#060A12" }} />}>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const channelId    = searchParams.get("channel") ?? "";

  const [channel, setChannel]   = useState<ChannelInfo | null>(null);
  const [chError, setChError]   = useState("");
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [terms,    setTerms]    = useState(false);
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (!channelId) { router.push("/"); return; }
    fetch(`/api/channel/${channelId}`)
      .then((r) => r.json())
      .then((d) => { if (d.error) setChError(d.error); else setChannel(d); })
      .catch(() => setChError("Failed to load channel info."));
  }, [channelId, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return; }
    if (!terms) { setError("Please accept the terms and conditions"); return; }
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim().toLowerCase(), phone: phone.trim(), password, channelId }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); return; }
      router.push(`/register/job-pass?channel=${channelId}`);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = { width:"100%", background:"transparent", border:"none", padding:"11px 11px 11px 38px", color:C.txt, fontSize:14, outline:"none" };
  const wrap: React.CSSProperties = { position:"relative", background:C.s2, border:`1px solid ${C.s3}`, borderRadius:9 };

  if (chError) return (
    <PageShell step={1} channelName="?">
      <div style={{ textAlign:"center", color:C.red, padding:24 }}>{chError} <a href="/" style={{ color:C.cyan }}>← Back</a></div>
    </PageShell>
  );

  return (
    <PageShell step={1} channelName={channel?.channelName ?? "…"}>
      <h2 style={{ color:C.txt, fontSize:20, fontWeight:700, margin:"0 0 4px" }}>Personal Details</h2>
      <p style={{ color:C.txt2, fontSize:13, margin:"0 0 22px" }}>Create your DEELAI account</p>

      <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
        <Field label="Full Name" required>
          <div style={wrap}>
            <User size={15} color={C.txt3} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Chidi Okonkwo" required style={inp} />
          </div>
        </Field>

        <Field label="Email Address" required>
          <div style={wrap}>
            <Mail size={15} color={C.txt3} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={inp} />
          </div>
        </Field>

        <Field label="Phone Number" required>
          <div style={wrap}>
            <Phone size={15} color={C.txt3} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+234 800 000 0000" required style={inp} />
          </div>
        </Field>

        {/* Password — 2-col on tablet+, 1-col on mobile */}
        <div className="pw-grid">
          <Field label="Password" required>
            <div style={wrap}>
              <Lock size={15} color={C.txt3} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
              <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 chars" required style={{ ...inp, paddingRight:36 }} />
              <button type="button" onClick={() => setShowPw((p) => !p)} style={{ position:"absolute", right:9, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer" }}>
                {showPw ? <EyeOff size={14} color={C.txt3} /> : <Eye size={14} color={C.txt3} />}
              </button>
            </div>
          </Field>
          <Field label="Confirm Password" required>
            <div style={wrap}>
              <Lock size={15} color={C.txt3} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
              <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat password" required style={inp} />
            </div>
          </Field>
        </div>

        {/* Terms */}
        <label style={{ display:"flex", alignItems:"flex-start", gap:10, cursor:"pointer", background: terms ? `${C.green}08` : C.s2, border:`1px solid ${terms ? C.green+"40" : C.s3}`, borderRadius:9, padding:"11px 13px" }}>
          <div
            onClick={() => setTerms((p) => !p)}
            style={{ width:18, height:18, borderRadius:4, border:`2px solid ${terms ? C.green : C.s3}`, background: terms ? C.green : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:1, cursor:"pointer" }}
          >
            {terms && <CheckCircle2 size={11} color="#060A12" />}
          </div>
          <span style={{ color:C.txt2, fontSize:13, lineHeight:1.5 }}>
            I accept the{" "}
            <a href="#" style={{ color:C.cyan, textDecoration:"none" }}>Terms &amp; Conditions</a>
            {" "}and{" "}
            <a href="#" style={{ color:C.cyan, textDecoration:"none" }}>Privacy Policy</a>
          </span>
        </label>

        {error && (
          <div style={{ display:"flex", gap:7, background:`${C.red}11`, border:`1px solid ${C.red}33`, borderRadius:8, padding:"9px 11px" }}>
            <AlertCircle size={14} color={C.red} style={{ flexShrink:0 }} />
            <span style={{ color:C.red, fontSize:13 }}>{error}</span>
          </div>
        )}

        <button type="submit" disabled={loading} style={{
          background: loading ? C.s3 : `linear-gradient(135deg,${C.cyan},#0099BB)`,
          color: loading ? C.txt3 : "#060A12", border:"none", borderRadius:9,
          padding:"12px", fontSize:15, fontWeight:800, cursor: loading ? "not-allowed" : "pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginTop:4,
        }}>
          {loading ? <><Loader2 size={16} className="spin-icon" /> Creating account…</> : "Continue to Job Pass →"}
        </button>
      </form>

      <p style={{ textAlign:"center", color:C.txt3, fontSize:12, marginTop:16 }}>
        Already have an account?{" "}
        <a href="/login" style={{ color:C.cyan, textDecoration:"none" }}>Sign in</a>
      </p>
    </PageShell>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ color:C.txt3, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:5 }}>
        {label}{required && <span style={{ color:C.red, marginLeft:3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const STEPS = ["Personal Details", "Job Pass", "Verify Account"];

function PageShell({ step, channelName, children }: { step: number; channelName: string; children: React.ReactNode }) {
  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"20px 14px" }}>
      <div style={{ maxWidth:520, margin:"0 auto 20px", display:"flex", alignItems:"center", gap:9 }}>
        <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:30, height:30, borderRadius:8, background:"linear-gradient(135deg,#00D4FF,#0055DD)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:13, fontFamily:"system-ui", flexShrink:0 }}>D</div>
          <span style={{ fontWeight:900, fontSize:17, color:C.txt, fontFamily:"system-ui" }}>DEEL<span style={{ color:C.cyan }}>Ai</span></span>
        </a>
      </div>

      <div style={{ maxWidth:520, margin:"0 auto" }}>
        {/* Stepper */}
        <div className="reg-stepper" style={{ marginBottom:20 }}>
          {STEPS.map((s, i) => (
            <div key={s} className="reg-step-item">
              <div style={{
                width:24, height:24, borderRadius:"50%", flexShrink:0,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:11, fontWeight:700,
                background: i+1<step ? C.green : i+1===step ? C.cyan : C.s3,
                color: i+1<=step ? "#060A12" : C.txt3,
              }}>
                {i+1 < step ? "✓" : i+1}
              </div>
              <span className="reg-step-label" style={{ color: i+1===step ? C.txt : C.txt3, fontSize:12, fontWeight: i+1===step ? 600 : 400, whiteSpace:"nowrap" }}>{s}</span>
              {i < 2 && <div className="reg-step-sep" />}
            </div>
          ))}
        </div>

        {/* Channel badge */}
        <div style={{ display:"flex", alignItems:"center", gap:8, background:`${C.cyan}10`, border:`1px solid ${C.cyan}25`, borderRadius:8, padding:"8px 12px", marginBottom:18 }}>
          <Shield size={13} color={C.cyan} style={{ flexShrink:0 }} />
          <span style={{ color:C.txt2, fontSize:12, wordBreak:"break-all" }}>Registering under <strong style={{ color:C.cyan }}>Channel {channelName}</strong></span>
        </div>

        <div style={{ background:C.s1, border:`1px solid ${C.s3}`, borderRadius:14, padding:"22px 18px" }}>
          {children}
        </div>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @keyframes spin-anim { to { transform: rotate(360deg); } }
        .spin-icon { animation: spin-anim 1s linear infinite; }
        input:focus { outline: none; }

        /* Stepper — compact on mobile, full on wider */
        .reg-stepper { display: flex; align-items: center; gap: 3px; overflow: hidden; }
        .reg-step-item { display: flex; align-items: center; gap: 5px; min-width: 0; }
        .reg-step-label { display: none; }
        .reg-step-sep { width: 12px; height: 1px; background: ${C.s3}; flex-shrink: 0; }
        @media (min-width: 400px) {
          .reg-step-label { display: inline; overflow: hidden; text-overflow: ellipsis; }
          .reg-step-sep { flex: 1; min-width: 8px; max-width: 32px; }
        }

        /* Password grid — 1 col on mobile, 2 col on wider */
        .pw-grid { display: grid; grid-template-columns: 1fr; gap: 14px; }
        @media (min-width: 440px) { .pw-grid { grid-template-columns: 1fr 1fr; } }
      `}</style>
    </div>
  );
}
