"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, AlertCircle, Eye, EyeOff, KeyRound, ArrowLeft } from "lucide-react";

const C = { bg:"#060A12", s1:"#0C1220", s2:"#101829", s3:"#162035", cyan:"#00D4FF", green:"#00E5A0", gold:"#FFB800", red:"#FF4D6D", txt:"#EEF2FF", txt2:"#7D8BAA", txt3:"#4A5470" };

export default function LoginPage() {
  const router  = useRouter();
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [statusMsg, setStatusMsg] = useState<{ type: "pending" | "rejected"; name: string } | null>(null);

  // Forgot-password flow
  const [forgotMode,    setForgotMode]    = useState(false);
  const [forgotEmail,   setForgotEmail]   = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSent,    setForgotSent]    = useState(false);

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() }),
    });
    setForgotLoading(false);
    setForgotSent(true);
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setStatusMsg(null); setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed"); return; }

      if (data.redirect) {
        router.push(data.redirect);
        return;
      }
      // No redirect = pending/rejected
      if (data.accountStatus === "pending")  setStatusMsg({ type: "pending",  name: data.user?.name ?? "" });
      if (data.accountStatus === "rejected") setStatusMsg({ type: "rejected", name: data.user?.name ?? "" });
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inp: React.CSSProperties = {
    width:"100%", background:"transparent", border:"none",
    padding:"11px 11px 11px 38px", color:C.txt, fontSize:15, outline:"none",
  };

  if (forgotMode) {
    return (
      <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
        <div style={{ width:"100%", maxWidth:400 }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ width:52, height:52, borderRadius:14, background:`${C.gold}18`, border:`1px solid ${C.gold}33`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <KeyRound size={24} color={C.gold} />
            </div>
            <h1 style={{ color:C.txt, fontSize:22, fontWeight:700, margin:0 }}>Forgot Password</h1>
            <p style={{ color:C.txt2, fontSize:14, marginTop:6 }}>Your channel admin will reset it for you</p>
          </div>

          <div style={{ background:C.s1, border:`1px solid ${C.s3}`, borderRadius:14, padding:"28px 24px" }}>
            {forgotSent ? (
              <div style={{ textAlign:"center" }}>
                <div style={{ color:C.green, fontWeight:700, fontSize:16, marginBottom:8 }}>Request Submitted</div>
                <p style={{ color:C.txt2, fontSize:13, lineHeight:1.6, margin:"0 0 20px" }}>
                  Your password reset request has been sent to your channel admin.
                  They will set a new password for you within 24 hours. Check back and log in once they confirm.
                </p>
                <button
                  onClick={() => { setForgotMode(false); setForgotSent(false); setForgotEmail(""); }}
                  style={{ background:C.cyan, color:"#060A12", border:"none", borderRadius:9, padding:"10px 20px", fontWeight:700, fontSize:14, cursor:"pointer" }}
                >
                  Back to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword}>
                <div style={{ marginBottom:20 }}>
                  <label style={{ color:C.txt3, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Your Email</label>
                  <div style={{ position:"relative", background:C.s2, border:`1px solid ${C.s3}`, borderRadius:9 }}>
                    <Mail size={15} color={C.txt3} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="you@example.com" required style={inp} />
                  </div>
                </div>
                <button type="submit" disabled={forgotLoading} style={{
                  width:"100%", background: forgotLoading ? C.s3 : `linear-gradient(135deg,${C.gold},#CC8800)`,
                  color: forgotLoading ? C.txt3 : "#060A12", border:"none", borderRadius:9,
                  padding:"12px", fontSize:15, fontWeight:800, cursor: forgotLoading ? "not-allowed" : "pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:14,
                }}>
                  {forgotLoading ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> Sending…</> : "Send Reset Request"}
                </button>
                <button type="button" onClick={() => setForgotMode(false)} style={{ width:"100%", background:"none", border:`1px solid ${C.s3}`, borderRadius:9, padding:"10px", color:C.txt2, fontSize:14, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                  <ArrowLeft size={14} /> Back to Login
                </button>
              </form>
            )}
          </div>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box} input:focus{border-color:#00D4FF55!important;outline:none}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
      <div style={{ width:"100%", maxWidth:400 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <a href="/" style={{ textDecoration:"none", display:"inline-flex", alignItems:"center", gap:9, marginBottom:24 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:"linear-gradient(135deg,#00D4FF,#0055DD)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:16, fontFamily:"system-ui" }}>D</div>
            <span style={{ fontWeight:900, fontSize:20, color:"#fff", fontFamily:"system-ui" }}>DEEL<span style={{ color:C.cyan }}>Ai</span></span>
          </a>
          <h1 style={{ color:C.txt, fontSize:22, fontWeight:700, margin:0 }}>Welcome back</h1>
          <p style={{ color:C.txt2, fontSize:14, marginTop:6 }}>Sign in to your DEELAI account</p>
        </div>

        {/* Status messages */}
        {statusMsg?.type === "pending" && (
          <div style={{ background:`${C.gold}11`, border:`1px solid ${C.gold}33`, borderRadius:10, padding:"14px 16px", marginBottom:16, textAlign:"center" }}>
            <div style={{ color:C.gold, fontWeight:700, fontSize:14, marginBottom:4 }}>Account Pending Approval</div>
            <p style={{ color:C.txt2, fontSize:13, margin:0, lineHeight:1.5 }}>
              Hi {statusMsg.name.split(" ")[0]}, your account is still being reviewed by your channel admin.
              You will receive an email once approved.
            </p>
          </div>
        )}
        {statusMsg?.type === "rejected" && (
          <div style={{ background:`${C.red}11`, border:`1px solid ${C.red}33`, borderRadius:10, padding:"14px 16px", marginBottom:16, textAlign:"center" }}>
            <div style={{ color:C.red, fontWeight:700, fontSize:14, marginBottom:4 }}>Application Not Approved</div>
            <p style={{ color:C.txt2, fontSize:13, margin:0 }}>Your application was not approved. Contact support for assistance.</p>
          </div>
        )}

        {/* Form */}
        <div style={{ background:C.s1, border:`1px solid ${C.s3}`, borderRadius:14, padding:"28px 24px" }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom:14 }}>
              <label style={{ color:C.txt3, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>Email</label>
              <div style={{ position:"relative", background:C.s2, border:`1px solid ${C.s3}`, borderRadius:9 }}>
                <Mail size={15} color={C.txt3} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required style={inp} />
              </div>
            </div>

            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:6 }}>
                <label style={{ color:C.txt3, fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em" }}>Password</label>
                <button type="button" onClick={() => setForgotMode(true)} style={{ background:"none", border:"none", cursor:"pointer", color:C.cyan, fontSize:12, padding:0 }}>
                  Forgot Password?
                </button>
              </div>
              <div style={{ position:"relative", background:C.s2, border:`1px solid ${C.s3}`, borderRadius:9 }}>
                <Lock size={15} color={C.txt3} style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)" }} />
                <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required style={{ ...inp, paddingRight:38 }} />
                <button type="button" onClick={() => setShowPw((p) => !p)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:2 }}>
                  {showPw ? <EyeOff size={15} color={C.txt3} /> : <Eye size={15} color={C.txt3} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ display:"flex", gap:7, background:`${C.red}11`, border:`1px solid ${C.red}33`, borderRadius:8, padding:"9px 11px", marginBottom:14 }}>
                <AlertCircle size={14} color={C.red} style={{ flexShrink:0, marginTop:1 }} />
                <span style={{ color:C.red, fontSize:13 }}>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width:"100%", background: loading ? C.s3 : `linear-gradient(135deg,${C.cyan},#0099BB)`,
              color: loading ? C.txt3 : "#060A12", border:"none", borderRadius:9,
              padding:"12px", fontSize:15, fontWeight:800, cursor: loading ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            }}>
              {loading ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> Signing in…</> : "Sign In"}
            </button>
          </form>
        </div>

        <p style={{ textAlign:"center", color:C.txt2, fontSize:13, marginTop:20 }}>
          Don&apos;t have an account?{" "}
          <a href="/" style={{ color:C.cyan, textDecoration:"none", fontWeight:600 }}>Choose a channel →</a>
        </p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box} input:focus{border-color:#00D4FF55!important;outline:none}`}</style>
    </div>
  );
}
