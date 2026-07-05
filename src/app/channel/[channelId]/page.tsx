"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2, AlertCircle, Loader2, Upload, X,
  Clock, Briefcase, Shield, User, Mail, Phone, Lock, Eye, EyeOff,
  ArrowLeft, ArrowRight, FileText,
} from "lucide-react";

const C = {
  bg: "#060A12", s1: "#0C1220", s2: "#101829", s3: "#162035",
  b1: "#1E2A42", cyan: "#00D4FF", green: "#00E5A0",
  gold: "#FFB800", red: "#FF4D6D", purple: "#8B5CF6",
  txt: "#EEF2FF", txt2: "#7D8BAA", txt3: "#4A5470",
};

interface ChannelInfo {
  id: string; channelName: string; estTime: string;
  paystackPublicKey: string; jobPassFee: number;
  isActive: boolean; ownerAvatarUrl?: string | null;
}

type RegStep = "details" | "permit" | "cv";
type PermitType = "full-time" | "part-time";
type SessionStatus = "pending" | "approved" | "rejected" | null;

declare global {
  interface Window {
    PaystackPop?: { setup: (o: Record<string, unknown>) => { openIframe: () => void }; };
  }
}

const STEP_LABELS = ["Personal Details", "Work Permit & Terms", "Final Step"];

export default function ChannelRegistrationPage() {
  const { channelId } = useParams() as { channelId: string };
  const router = useRouter();

  const [channel, setChannel]             = useState<ChannelInfo | null>(null);
  const [loading, setLoading]             = useState(true);
  const [channelError, setChannelError]   = useState("");
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(null);
  const [submitting, setSubmitting]       = useState(false);

  // Multi-step state
  const [step, setStep] = useState<RegStep>("details");

  // Form fields — all lifted here so data persists across steps
  const [name,        setName]        = useState("");
  const [email,       setEmail]       = useState("");
  const [phone,       setPhone]       = useState("");
  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPw,      setShowPw]      = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [permitType,  setPermitType]  = useState<PermitType>("full-time");
  const [terms,       setTerms]       = useState(false);
  const [cvFile,      setCvFile]      = useState<File | null>(null);
  const [cvUrl,       setCvUrl]       = useState("");
  const [stepError,   setStepError]   = useState("");

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!channelId) return;
    Promise.all([
      fetch(`/api/channel/${channelId}`).then((r) => r.json()),
      fetch("/api/auth/session").then((r) => r.json()),
    ]).then(([d, sess]) => {
      if (d.error) { setChannelError(d.error); return; }
      if (!d.isActive) { setChannelError("This channel is not currently accepting registrations."); return; }
      setChannel(d);
      if (sess?.loggedIn) {
        const st = sess.accountStatus as SessionStatus;
        if (st === "approved") { router.push("/dashboard"); return; }
        setSessionStatus(st);
      }
    })
    .catch(() => setChannelError("Failed to load channel info."))
    .finally(() => setLoading(false));
  }, [channelId, router]);

  useEffect(() => {
    if (!channel?.paystackPublicKey) return;
    if (document.querySelector('script[src*="paystack"]')) return;
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js";
    s.async = true;
    document.body.appendChild(s);
  }, [channel]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setStepError("CV file must be under 5MB"); return; }
    setCvFile(f);
    setCvUrl(`cv://${f.name}`);
    setStepError("");
  }

  // Step 1 → Step 2
  function continueStep1() {
    if (!name.trim())   return setStepError("Full name is required");
    if (!phone.trim())  return setStepError("Phone number is required");
    if (!email.trim())  return setStepError("Email is required");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setStepError("Enter a valid email address");
    if (password.length < 6) return setStepError("Password must be at least 6 characters");
    if (password !== confirm) return setStepError("Passwords do not match");
    setStepError("");
    setStep("permit");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Step 2 → Step 3
  function continueStep2() {
    if (!terms) return setStepError("You must accept the Terms of Service and Privacy Policy to continue");
    setStepError("");
    setStep("cv");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Step 3 → Submit
  async function handleSubmit() {
    if (!channel) return;
    setSubmitting(true);
    setStepError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(), email: email.trim().toLowerCase(),
          phone: phone.trim(), password, channelId,
          cvUrl: cvUrl || undefined, permitType,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setStepError(data.error ?? "Registration failed"); return; }
      router.push(`/register/job-pass?channel=${channelId}`);
    } catch {
      setStepError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Loading ─────────────────────────────────────────────────────── */
  if (loading) return (
    <PageShell>
      <div style={{ textAlign:"center", padding:"60px 24px" }}>
        <Loader2 size={36} color={C.cyan} style={{ animation:"spin 1s linear infinite" }} />
        <p style={{ color:C.txt2, marginTop:16 }}>Loading channel…</p>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </PageShell>
  );

  if (channelError || !channel) return (
    <PageShell>
      <div style={{ background:`${C.red}11`, border:`1px solid ${C.red}33`, borderRadius:12, padding:24, textAlign:"center" }}>
        <AlertCircle size={32} color={C.red} style={{ marginBottom:12 }} />
        <p style={{ color:C.red, fontWeight:600 }}>{channelError || "Channel not found"}</p>
        <a href="/" style={{ color:C.cyan, fontSize:"13px", marginTop:8, display:"block" }}>← Back to DEELAI</a>
      </div>
    </PageShell>
  );

  /* ── Already-registered status screens ──────────────────────────── */
  if (sessionStatus === "pending") return (
    <PageShell>
      <div style={{ background:`${C.gold}11`, border:`1px solid ${C.gold}33`, borderRadius:16, padding:"40px 28px", textAlign:"center" }}>
        <div style={{ width:60, height:60, borderRadius:"50%", background:`${C.gold}20`, border:`2px solid ${C.gold}50`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
          <Clock size={28} color={C.gold} />
        </div>
        <h2 style={{ color:C.txt, fontSize:"20px", fontWeight:700, marginBottom:8 }}>Registration Under Review</h2>
        <p style={{ color:C.txt2, fontSize:"13px", lineHeight:1.6, marginBottom:20 }}>
          Your application to <strong style={{ color:C.cyan }}>{channel.channelName}</strong> is pending admin approval.
          You&apos;ll be notified once a decision is made.
        </p>
        <div style={{ background:C.s2, borderRadius:10, padding:"10px 14px", border:`1px solid ${C.s3}`, display:"flex", alignItems:"center", gap:8 }}>
          <Clock size={14} color={C.gold} />
          <span style={{ color:C.txt2, fontSize:"12px" }}>Est. review time: <strong style={{ color:C.gold }}>{channel.estTime}</strong></span>
        </div>
        <a href="/login" style={{ display:"block", marginTop:20, color:C.cyan, fontSize:"13px" }}>Log in to check status →</a>
      </div>
    </PageShell>
  );

  if (sessionStatus === "rejected") return (
    <PageShell>
      <div style={{ background:`${C.red}11`, border:`1px solid ${C.red}33`, borderRadius:16, padding:"40px 28px", textAlign:"center" }}>
        <AlertCircle size={36} color={C.red} style={{ margin:"0 auto 16px" }} />
        <h2 style={{ color:C.txt, fontSize:"20px", fontWeight:700, marginBottom:8 }}>Application Not Approved</h2>
        <p style={{ color:C.txt2, fontSize:"13px", lineHeight:1.6 }}>
          Your application to <strong style={{ color:C.cyan }}>{channel.channelName}</strong> was not approved.
          Contact the channel admin for more details.
        </p>
      </div>
    </PageShell>
  );

  if (submitting) return (
    <PageShell>
      <div style={{ textAlign:"center", padding:"60px 24px" }}>
        <Loader2 size={36} color={C.cyan} style={{ animation:"spin 1s linear infinite" }} />
        <p style={{ color:C.txt2, marginTop:16 }}>Creating your account…</p>
      </div>
      <style>{`@keyframes spin { to { transform:rotate(360deg); } }`}</style>
    </PageShell>
  );

  /* ── Derived step index for progress bar ─────────────────────────── */
  const stepIndex = step === "details" ? 0 : step === "permit" ? 1 : 2;

  /* ── Shared channel header ───────────────────────────────────────── */
  const ChannelHeader = (
    <div style={{
      background:`linear-gradient(145deg,${C.s1},${C.s2})`,
      border:`1px solid ${C.s3}`, borderRadius:14, padding:"16px 20px", marginBottom:20,
      display:"flex", alignItems:"center", gap:12,
    }}>
      <div style={{
        width:40, height:40, borderRadius:10, background:`${C.cyan}15`,
        border:`1px solid ${C.cyan}30`, display:"flex", alignItems:"center",
        justifyContent:"center", flexShrink:0, overflow:"hidden",
      }}>
        {channel.ownerAvatarUrl
          ? <Image src={channel.ownerAvatarUrl} alt={channel.channelName} width={40} height={40} style={{ width:"100%", height:"100%", objectFit:"cover" }} unoptimized />
          : <Shield size={20} color={C.cyan} />}
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ color:C.txt3, fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>DEELAI Channel</div>
        <div style={{ color:C.txt, fontSize:"16px", fontWeight:800, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
          {channel.channelName}
        </div>
      </div>
      {channel.jobPassFee > 0 && (
        <div style={{ background:`${C.cyan}12`, border:`1px solid ${C.cyan}30`, borderRadius:6, padding:"3px 9px", flexShrink:0 }}>
          <span style={{ color:C.cyan, fontSize:"11px", fontWeight:700 }}>${channel.jobPassFee.toLocaleString()} fee</span>
        </div>
      )}
    </div>
  );

  /* ── Step progress indicator ─────────────────────────────────────── */
  const StepProgress = (
    <div style={{ display:"flex", alignItems:"center", marginBottom:28 }}>
      {STEP_LABELS.map((label, i) => {
        const done = i < stepIndex;
        const active = i === stepIndex;
        return (
          <div key={i} style={{ display:"flex", alignItems:"center", flex: i < 2 ? 1 : "none" }}>
            {/* Circle */}
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, flexShrink:0 }}>
              <div style={{
                width:30, height:30, borderRadius:"50%",
                background: done ? C.green : active ? C.cyan : C.s3,
                border: `2px solid ${done ? C.green : active ? C.cyan : C.s3}`,
                display:"flex", alignItems:"center", justifyContent:"center",
                transition:"all 0.3s",
              }}>
                {done
                  ? <svg width="13" height="11" viewBox="0 0 13 11" fill="none"><path d="M1.5 5.5L5 9L11.5 1.5" stroke="#060A12" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  : <span style={{ color: active ? "#060A12" : C.txt3, fontSize:"12px", fontWeight:800 }}>{i + 1}</span>
                }
              </div>
              <span style={{ fontSize:"10px", fontWeight: active ? 700 : 500, color: done ? C.green : active ? C.cyan : C.txt3, whiteSpace:"nowrap" }}>
                {label}
              </span>
            </div>
            {/* Connector */}
            {i < 2 && (
              <div style={{ flex:1, height:2, margin:"0 6px 16px", background: done ? C.green : C.s3, transition:"background 0.3s" }} />
            )}
          </div>
        );
      })}
    </div>
  );

  /* ── Error block (shared) ────────────────────────────────────────── */
  const ErrorBlock = stepError ? (
    <div style={{
      display:"flex", gap:8, alignItems:"flex-start",
      background:`${C.red}11`, border:`1px solid ${C.red}33`,
      borderRadius:8, padding:"10px 12px", marginTop:16,
    }}>
      <AlertCircle size={14} color={C.red} style={{ marginTop:1, flexShrink:0 }} />
      <span style={{ color:C.red, fontSize:"13px" }}>{stepError}</span>
    </div>
  ) : null;

  /* ════════════════════════════════════════════════════════════════════
     STEP 1 — Personal Details
  ════════════════════════════════════════════════════════════════════ */
  if (step === "details") return (
    <PageShell>
      {ChannelHeader}
      {StepProgress}
      <div style={{ background:C.s1, border:`1px solid ${C.s3}`, borderRadius:16, padding:"28px", animation:"fadeUp 0.3s ease" }}>
        <h2 style={{ color:C.txt, fontSize:"18px", fontWeight:800, marginBottom:4, fontFamily:"system-ui" }}>Personal Details</h2>
        <p style={{ color:C.txt2, fontSize:"13px", marginBottom:22, lineHeight:1.5 }}>
          Enter your information to create your DEELAI account.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          <FormField label="Full Name" required>
            <InputIcon icon={<User size={15} color={C.txt3} />}>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chidi Okonkwo" style={inputStyle} autoComplete="name" />
            </InputIcon>
          </FormField>

          <FormField label="Email Address" required>
            <InputIcon icon={<Mail size={15} color={C.txt3} />}>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" style={inputStyle} autoComplete="email" />
            </InputIcon>
          </FormField>

          <FormField label="Phone Number" required>
            <InputIcon icon={<Phone size={15} color={C.txt3} />}>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000" style={inputStyle} autoComplete="tel" />
            </InputIcon>
          </FormField>

          <FormField label="Password" required>
            <InputIcon icon={<Lock size={15} color={C.txt3} />}>
              <input type={showPw ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                style={{ ...inputStyle, paddingRight:38 }} autoComplete="new-password" />
              <button type="button" onClick={() => setShowPw(v => !v)}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:2 }}>
                {showPw ? <EyeOff size={15} color={C.txt3} /> : <Eye size={15} color={C.txt3} />}
              </button>
            </InputIcon>
          </FormField>

          <FormField label="Confirm Password" required>
            <InputIcon icon={<Lock size={15} color={C.txt3} />}>
              <input type={showConfirm ? "text" : "password"} value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                style={{ ...inputStyle, paddingRight:38 }} autoComplete="new-password" />
              <button type="button" onClick={() => setShowConfirm(v => !v)}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:2 }}>
                {showConfirm ? <EyeOff size={15} color={C.txt3} /> : <Eye size={15} color={C.txt3} />}
              </button>
            </InputIcon>
          </FormField>
        </div>

        {ErrorBlock}

        <button onClick={continueStep1} style={primaryBtn}>
          Continue <ArrowRight size={16} />
        </button>

        <p style={{ textAlign:"center", color:C.txt3, fontSize:"12px", marginTop:14 }}>
          Already have an account?{" "}
          <a href="/login" style={{ color:C.cyan }}>Log in →</a>
        </p>
      </div>
      <GlobalStyles />
    </PageShell>
  );

  /* ════════════════════════════════════════════════════════════════════
     STEP 2 — Work Permit & Terms
  ════════════════════════════════════════════════════════════════════ */
  if (step === "permit") return (
    <PageShell>
      {ChannelHeader}
      {StepProgress}
      <div style={{ background:C.s1, border:`1px solid ${C.s3}`, borderRadius:16, padding:"28px", animation:"fadeUp 0.3s ease" }}>
        <h2 style={{ color:C.txt, fontSize:"18px", fontWeight:800, marginBottom:4, fontFamily:"system-ui" }}>Work Permit &amp; Agreement</h2>
        <p style={{ color:C.txt2, fontSize:"13px", marginBottom:22, lineHeight:1.5 }}>
          Choose your schedule and agree to the platform terms before continuing.
        </p>

        {/* Permit Type */}
        <div style={{ marginBottom:20 }}>
          <label style={labelStyle}>Permit Type <span style={{ color:C.red }}>*</span></label>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:8 }}>
            {([
              { type:"full-time" as PermitType, title:"Full-Time", desc:"40 hrs/week · Higher earning cap · Priority allocation", color:C.cyan },
              { type:"part-time" as PermitType, title:"Part-Time", desc:"Up to 20 hrs/week · Flexible · Upgrade anytime", color:C.purple },
            ]).map((opt) => (
              <button key={opt.type} type="button" onClick={() => setPermitType(opt.type)}
                style={{
                  padding:"16px 12px", borderRadius:12, cursor:"pointer", textAlign:"left",
                  background: permitType===opt.type ? `${opt.color}12` : C.s2,
                  border: `1.5px solid ${permitType===opt.type ? opt.color+"60" : C.s3}`,
                  transition:"all 0.2s",
                }}
              >
                <div style={{
                  width:34, height:34, borderRadius:9, display:"flex", alignItems:"center", justifyContent:"center",
                  background: permitType===opt.type ? `${opt.color}22` : C.s3,
                  marginBottom:10,
                }}>
                  <Briefcase size={16} color={permitType===opt.type ? opt.color : C.txt3} />
                </div>
                <div style={{ color: permitType===opt.type ? opt.color : C.txt, fontWeight:700, fontSize:"14px", marginBottom:4 }}>
                  {opt.title}
                </div>
                <div style={{ color:C.txt3, fontSize:"11px", lineHeight:1.5 }}>{opt.desc}</div>
                {permitType===opt.type && (
                  <div style={{ marginTop:8, display:"flex", alignItems:"center", gap:4 }}>
                    <CheckCircle2 size={13} color={opt.color} />
                    <span style={{ color:opt.color, fontSize:"11px", fontWeight:700 }}>Selected</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Terms & Conditions */}
        <div style={{ marginBottom:20 }}>
          <label style={labelStyle}>Terms &amp; Conditions <span style={{ color:C.red }}>*</span></label>
          <div
            role="checkbox"
            aria-checked={terms}
            tabIndex={0}
            onClick={() => { setTerms(v => !v); setStepError(""); }}
            onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setTerms(v => !v); setStepError(""); } }}
            style={{
              display:"flex", alignItems:"flex-start", gap:14, cursor:"pointer",
              background: terms ? `${C.green}08` : C.s2,
              border: `1.5px solid ${terms ? C.green+"60" : stepError ? C.red+"60" : C.s3}`,
              borderRadius:12, padding:"16px",
              transition:"all 0.2s",
              marginTop:8, outline:"none",
            }}
          >
            {/* Custom checkbox */}
            <div style={{
              width:22, height:22, borderRadius:6, flexShrink:0,
              border: `2px solid ${terms ? C.green : stepError ? C.red+"80" : C.txt3}`,
              background: terms ? C.green : "transparent",
              display:"flex", alignItems:"center", justifyContent:"center",
              transition:"all 0.2s",
            }}>
              {terms && (
                <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1" stroke="#060A12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ color: terms ? C.txt : C.txt2, fontSize:"13px", lineHeight:1.7, fontWeight: terms ? 600 : 400 }}>
                I have read and agree to the{" "}
                <a href="/terms" target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color:C.cyan, textDecoration:"underline", fontWeight:600 }}>
                  Terms of Service
                </a>
                {" "}and{" "}
                <a href="/privacy" target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  style={{ color:C.cyan, textDecoration:"underline", fontWeight:600 }}>
                  Privacy Policy
                </a>
              </div>
              <div style={{ color:C.txt3, fontSize:"11px", marginTop:4, lineHeight:1.5 }}>
                Includes acknowledgement that registration fees are non-refundable once training resources have been accessed.
              </div>
            </div>
          </div>
          {!terms && stepError && (
            <div style={{ color:C.red, fontSize:"12px", marginTop:6, display:"flex", alignItems:"center", gap:5 }}>
              <AlertCircle size={12} color={C.red} /> {stepError}
            </div>
          )}
        </div>

        {/* Generic error (only shown if not terms-specific) */}
        {stepError && terms && (
          <div style={{ display:"flex", gap:8, alignItems:"flex-start", background:`${C.red}11`, border:`1px solid ${C.red}33`, borderRadius:8, padding:"10px 12px", marginBottom:16 }}>
            <AlertCircle size={14} color={C.red} style={{ marginTop:1, flexShrink:0 }} />
            <span style={{ color:C.red, fontSize:"13px" }}>{stepError}</span>
          </div>
        )}

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={() => { setStep("details"); setStepError(""); }} style={backBtn}>
            <ArrowLeft size={15} /> Back
          </button>
          <button onClick={continueStep2} style={{ ...primaryBtn, flex:1 }}>
            Continue <ArrowRight size={16} />
          </button>
        </div>
      </div>
      <GlobalStyles />
    </PageShell>
  );

  /* ════════════════════════════════════════════════════════════════════
     STEP 3 — CV Upload & Submit
  ════════════════════════════════════════════════════════════════════ */
  return (
    <PageShell>
      {ChannelHeader}
      {StepProgress}
      <div style={{ background:C.s1, border:`1px solid ${C.s3}`, borderRadius:16, padding:"28px", animation:"fadeUp 0.3s ease" }}>
        <h2 style={{ color:C.txt, fontSize:"18px", fontWeight:800, marginBottom:4, fontFamily:"system-ui" }}>Almost There!</h2>
        <p style={{ color:C.txt2, fontSize:"13px", marginBottom:22, lineHeight:1.5 }}>
          Optionally upload your CV, then submit your application.
        </p>

        {/* Summary of selections */}
        <div style={{ background:C.s2, border:`1px solid ${C.s3}`, borderRadius:12, padding:"14px 16px", marginBottom:20 }}>
          <div style={{ color:C.txt3, fontSize:"10px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Application Summary</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <SummaryRow label="Name" value={name} />
            <SummaryRow label="Email" value={email} />
            <SummaryRow label="Phone" value={phone} />
            <SummaryRow label="Permit" value={permitType === "full-time" ? "Full-Time (40 hrs/week)" : "Part-Time (up to 20 hrs/week)"} highlight />
          </div>
        </div>

        {/* CV Upload */}
        <FormField label="Upload CV / Resume" hint="PDF, DOC, DOCX — max 5MB (optional)">
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              background:C.s2, border:`1.5px dashed ${cvFile ? C.green+"60" : C.s3}`,
              borderRadius:10, padding:"20px 16px", cursor:"pointer", textAlign:"center",
              transition:"border-color 0.2s",
            }}
          >
            {cvFile ? (
              <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <FileText size={18} color={C.green} />
                <span style={{ color:C.green, fontSize:"13px", fontWeight:600 }}>{cvFile.name}</span>
                <button type="button" onClick={(e) => { e.stopPropagation(); setCvFile(null); setCvUrl(""); }}
                  style={{ background:"none", border:"none", cursor:"pointer", padding:2 }}>
                  <X size={14} color={C.txt3} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={22} color={C.txt3} style={{ marginBottom:8 }} />
                <div style={{ color:C.txt2, fontSize:"13px" }}>Click to upload your CV</div>
                <div style={{ color:C.txt3, fontSize:"11px", marginTop:3 }}>PDF, DOC, DOCX up to 5MB</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleFileChange} style={{ display:"none" }} />
        </FormField>

        {channel.jobPassFee > 0 && (
          <div style={{ background:`${C.gold}08`, border:`1px solid ${C.gold}25`, borderRadius:9, padding:"10px 14px", marginTop:16, display:"flex", gap:8, alignItems:"flex-start" }}>
            <Clock size={13} color={C.gold} style={{ flexShrink:0, marginTop:2 }} />
            <p style={{ color:C.txt3, fontSize:"12px", margin:0, lineHeight:1.6 }}>
              After submitting, you&apos;ll be prompted to pay the{" "}
              <strong style={{ color:C.gold }}>${channel.jobPassFee.toLocaleString()}</strong> registration fee via Paystack to activate your account.
            </p>
          </div>
        )}

        {ErrorBlock}

        <div style={{ display:"flex", gap:10, marginTop:20 }}>
          <button onClick={() => { setStep("permit"); setStepError(""); }} style={backBtn}>
            <ArrowLeft size={15} /> Back
          </button>
          <button onClick={handleSubmit} disabled={submitting} style={{ ...primaryBtn, flex:1, opacity: submitting ? 0.7 : 1 }}>
            {submitting
              ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> Creating Account…</>
              : <>Create Account &amp; Apply <ArrowRight size={16} /></>
            }
          </button>
        </div>
      </div>
      <GlobalStyles />
    </PageShell>
  );
}

/* ── Shared styles ───────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width:"100%", background:"transparent", border:"none",
  padding:"11px 11px 11px 38px", color:"#EEF2FF", fontSize:"14px", outline:"none",
};

const labelStyle: React.CSSProperties = {
  display:"block", color:"#7D8BAA", fontSize:"11px", fontWeight:700,
  textTransform:"uppercase", letterSpacing:"0.06em",
};

const primaryBtn: React.CSSProperties = {
  width:"100%", marginTop:20,
  background:`linear-gradient(135deg,#00D4FF,#0099BB)`,
  color:"#060A12", border:"none", borderRadius:10, padding:"14px",
  fontSize:"15px", fontWeight:800, cursor:"pointer",
  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
  transition:"all 0.2s", fontFamily:"system-ui",
};

const backBtn: React.CSSProperties = {
  marginTop:20, background:C.s2, color:C.txt2,
  border:`1px solid ${C.s3}`, borderRadius:10, padding:"14px 18px",
  fontSize:"14px", fontWeight:600, cursor:"pointer",
  display:"flex", alignItems:"center", gap:6,
  transition:"all 0.2s",
};

/* ── Helper components ───────────────────────────────────────────── */
function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight:"100vh", background:"#060A12", padding:"24px 16px 60px" }}>
      <div style={{ maxWidth:520, margin:"0 auto 24px", display:"flex", alignItems:"center", gap:10 }}>
        <a href="/" style={{ display:"flex", alignItems:"center", gap:10, textDecoration:"none" }}>
          <div style={{ width:34, height:34, borderRadius:9, background:"linear-gradient(135deg,#00D4FF,#0055DD)", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:900, color:"#fff", fontSize:"16px", fontFamily:"system-ui" }}>D</div>
          <span style={{ fontWeight:900, fontSize:"20px", color:"#fff", fontFamily:"system-ui" }}>DEEL<span style={{ color:"#00D4FF" }}>Ai</span></span>
        </a>
      </div>
      <div style={{ maxWidth:520, margin:"0 auto" }}>{children}</div>
    </div>
  );
}

function FormField({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display:"block", color:"#7D8BAA", fontSize:"11px", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>
        {label}{required && <span style={{ color:"#FF4D6D", marginLeft:3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ color:"#4A5470", fontSize:"11px", marginTop:4 }}>{hint}</div>}
    </div>
  );
}

function InputIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ position:"relative", background:"#101829", border:"1px solid #162035", borderRadius:9, display:"flex", alignItems:"center", transition:"border-color 0.2s" }}>
      <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>{icon}</span>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:"13px" }}>
      <span style={{ color:C.txt3, flexShrink:0, width:44 }}>{label}</span>
      <span style={{ color: highlight ? C.cyan : C.txt2, fontWeight: highlight ? 600 : 400 }}>{value}</span>
    </div>
  );
}

function GlobalStyles() {
  return (
    <style>{`
      @keyframes spin    { to { transform: rotate(360deg); } }
      @keyframes fadeUp  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:none; } }
      input:focus { border-color: #00D4FF55 !important; outline: none; }
      * { box-sizing: border-box; }
    `}</style>
  );
}
