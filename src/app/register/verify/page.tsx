"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2, X, Loader2, Clock, AlertCircle, Shield, PartyPopper } from "lucide-react";

const C = { bg:"#060A12", s1:"#0C1220", s2:"#101829", s3:"#162035", cyan:"#00D4FF", green:"#00E5A0", gold:"#FFB800", red:"#FF4D6D", txt:"#EEF2FF", txt2:"#7D8BAA", txt3:"#4A5470" };

interface Session {
  loggedIn: boolean; name?: string; email?: string;
  accountStatus?: string; channelId?: string; jobPassPaid?: boolean;
}

export default function VerifyPage() {
  const router = useRouter();
  const [session,    setSession]    = useState<Session | null>(null);
  const [channelName, setChannelName] = useState("A");
  const [cvFile,     setCvFile]     = useState<File | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState("");
  const [isPending,  setIsPending]  = useState(false);
  const [isRejected, setIsRejected] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/auth/session").then((r) => r.json()).then((sess: Session) => {
      if (!sess.loggedIn) { router.push("/login"); return; }
      setSession(sess);
      if (sess.accountStatus === "approved") { router.push("/dashboard"); return; }
      if (sess.accountStatus === "rejected") { setIsRejected(true); return; }
      if (sess.accountStatus === "pending")  { setIsPending(true); }
      if (sess.channelId) {
        fetch(`/api/channel/${sess.channelId}`)
          .then((r) => r.json())
          .then((ch) => { if (!ch.error) setChannelName(ch.channelName); });
      }
    });
  }, [router]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setError("File must be under 5MB"); return; }
    setCvFile(f);
    setError("");
  }

  async function handleVerify() {
    setError(""); setLoading(true);
    try {
      const res  = await fetch("/api/auth/notify-admin", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvUrl: cvFile ? `cv://${cvFile.name}` : undefined }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Error sending notification"); return; }
      setSubmitted(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const firstName = session?.name?.split(" ")[0] ?? "";
  const lastName  = session?.name?.split(" ").slice(1).join(" ") ?? "";

  /* ── Approved (redirect handled above, but catch-all) ─────────────── */
  if (session?.accountStatus === "approved") return null;

  /* ── Rejected ─────────────────────────────────────────────────────── */
  if (isRejected) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ background:`${C.red}10`, border:`1px solid ${C.red}30`, borderRadius:16, padding:"36px 28px", maxWidth:420, textAlign:"center" }}>
        <AlertCircle size={40} color={C.red} style={{ marginBottom:16 }} />
        <h2 style={{ color:C.red, fontSize:20, fontWeight:700, margin:"0 0 12px" }}>Application Not Approved</h2>
        <p style={{ color:C.txt2, fontSize:14, lineHeight:1.6, margin:"0 0 20px" }}>
          Your application to Channel {channelName} was not approved.
          Please contact your channel admin or support for more information.
        </p>
        <a href="mailto:support@deelai.uk" style={{ color:C.cyan, fontSize:13, textDecoration:"none" }}>Contact Support</a>
      </div>
    </div>
  );

  /* ── Success state ───────────────────────────────────────────────── */
  if (submitted || (isPending && session)) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ maxWidth:480, width:"100%", textAlign:"center", animation:"fadeUp 0.5s ease" }}>
          {/* Confetti icon */}
          <div style={{ width:72, height:72, borderRadius:"50%", background:`${C.green}15`, border:`2px solid ${C.green}40`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px" }}>
            {submitted ? <PartyPopper size={34} color={C.green} /> : <Clock size={34} color={C.gold} />}
          </div>

          <h1 style={{ color:C.txt, fontSize:"clamp(22px,5vw,30px)", fontWeight:900, margin:"0 0 12px", lineHeight:1.2 }}>
            {submitted
              ? `Welcome ${firstName} ${lastName},`
              : `Hi ${firstName},`}
          </h1>
          <p style={{ color:C.txt2, fontSize:15, lineHeight:1.7, margin:"0 auto 28px", maxWidth:420 }}>
            {submitted
              ? "Account verification takes 1–24 hours. It is sometimes faster. Thank you for joining us!"
              : "Your application is pending review. You will receive an email once your channel admin approves your account."}
          </p>

          <div style={{ display:"flex", flexDirection:"column", gap:10, maxWidth:340, margin:"0 auto" }}>
            <div style={{ background:C.s1, border:`1px solid ${C.s3}`, borderRadius:10, padding:"12px 16px", display:"flex", gap:10, alignItems:"center" }}>
              <Clock size={16} color={C.gold} />
              <span style={{ color:C.txt2, fontSize:13 }}>Review takes <strong style={{ color:C.gold }}>1–24 hours</strong></span>
            </div>
            <div style={{ background:C.s1, border:`1px solid ${C.s3}`, borderRadius:10, padding:"12px 16px", display:"flex", gap:10, alignItems:"center" }}>
              <CheckCircle2 size={16} color={C.green} />
              <span style={{ color:C.txt2, fontSize:13 }}>You&apos;ll receive an <strong style={{ color:C.green }}>email on approval</strong></span>
            </div>
          </div>

          <div style={{ marginTop:32, display:"flex", gap:10, justifyContent:"center", flexWrap:"wrap" }}>
            <a href="/login" style={{ background:C.cyan, color:"#060A12", padding:"10px 22px", borderRadius:8, fontWeight:700, fontSize:14, textDecoration:"none" }}>
              Check My Status
            </a>
            <a href="/" style={{ background:C.s1, border:`1px solid ${C.s3}`, color:C.txt2, padding:"10px 22px", borderRadius:8, fontSize:14, textDecoration:"none" }}>
              Back to Home
            </a>
          </div>
        </div>
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}} *{box-sizing:border-box}`}</style>
      </div>
    );
  }

  /* ── CV upload form ──────────────────────────────────────────────── */
  return (
    <PageShell step={3} channelName={channelName}>
      <h2 style={{ color:C.txt, fontSize:20, fontWeight:700, margin:"0 0 4px" }}>Verify Your Account</h2>
      <p style={{ color:C.txt2, fontSize:13, margin:"0 0 22px", lineHeight:1.5 }}>
        Optionally upload your CV to speed up approval. Then click "Verify My Account" to notify the admin.
      </p>

      {/* CV Upload */}
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          background:C.s2, border:`1.5px dashed ${cvFile ? C.green+"60" : C.s3}`,
          borderRadius:10, padding:"20px", cursor:"pointer", textAlign:"center",
          marginBottom:18, transition:"border-color 0.2s",
        }}
      >
        {cvFile ? (
          <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            <CheckCircle2 size={18} color={C.green} />
            <span style={{ color:C.green, fontSize:14, fontWeight:600 }}>{cvFile.name}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); setCvFile(null); }} style={{ background:"none", border:"none", cursor:"pointer" }}>
              <X size={14} color={C.txt3} />
            </button>
          </div>
        ) : (
          <>
            <Upload size={24} color={C.txt3} style={{ marginBottom:6 }} />
            <div style={{ color:C.txt2, fontSize:14 }}>Click to upload CV / Resume</div>
            <div style={{ color:C.txt3, fontSize:11, marginTop:3 }}>PDF, DOC, DOCX · max 5MB · Optional</div>
          </>
        )}
      </div>
      <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" onChange={handleFile} style={{ display:"none" }} />

      {error && (
        <div style={{ display:"flex", gap:7, background:`${C.red}11`, border:`1px solid ${C.red}33`, borderRadius:8, padding:"9px 11px", marginBottom:14 }}>
          <AlertCircle size={14} color={C.red} style={{ flexShrink:0 }} />
          <span style={{ color:C.red, fontSize:13 }}>{error}</span>
        </div>
      )}

      <button onClick={handleVerify} disabled={loading} style={{
        width:"100%", background: loading ? C.s3 : `linear-gradient(135deg,${C.cyan},#0099BB)`,
        color: loading ? C.txt3 : "#060A12", border:"none", borderRadius:9,
        padding:"13px", fontSize:15, fontWeight:800, cursor: loading ? "not-allowed" : "pointer",
        display:"flex", alignItems:"center", justifyContent:"center", gap:8,
      }}>
        {loading ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> Submitting…</> : "Verify My Account →"}
      </button>

      <p style={{ textAlign:"center", color:C.txt3, fontSize:12, marginTop:14, lineHeight:1.6 }}>
        The channel admin will review your application within 1–24 hours.
      </p>
    </PageShell>
  );
}

function PageShell({ step, channelName, children }: { step: number; channelName: string; children: React.ReactNode }) {
  const steps = ["Personal Details","Job Pass","Verify Account"];
  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"24px 16px" }}>
      <div style={{ maxWidth:520, margin:"0 auto 24px", display:"flex", alignItems:"center", gap:9 }}>
        <a href="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:9 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:"linear-gradient(135deg,#00D4FF,#0055DD)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:14, fontFamily:"system-ui" }}>D</div>
          <span style={{ fontWeight:900, fontSize:18, color:C.txt, fontFamily:"system-ui" }}>DEEL<span style={{ color:C.cyan }}>Ai</span></span>
        </a>
      </div>
      <div style={{ maxWidth:520, margin:"0 auto" }}>
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
            {steps.map((s, i) => (
              <div key={s} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, background: i+1<step ? C.green : i+1===step ? C.cyan : C.s3, color: i+1<=step ? "#060A12" : C.txt3 }}>
                  {i+1 < step ? "✓" : i+1}
                </div>
                <span style={{ color: i+1===step ? C.txt : C.txt3, fontSize:12, fontWeight: i+1===step ? 600 : 400 }}>{s}</span>
                {i < 2 && <div style={{ width:24, height:1, background:C.s3, marginLeft:4 }} />}
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, background:`${C.cyan}10`, border:`1px solid ${C.cyan}25`, borderRadius:8, padding:"8px 12px", marginBottom:20 }}>
          <Shield size={14} color={C.cyan} />
          <span style={{ color:C.txt2, fontSize:12 }}>Registering under <strong style={{ color:C.cyan }}>Channel {channelName}</strong></span>
        </div>
        <div style={{ background:C.s1, border:`1px solid ${C.s3}`, borderRadius:14, padding:"24px 22px" }}>{children}</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}} *{box-sizing:border-box}`}</style>
    </div>
  );
}
