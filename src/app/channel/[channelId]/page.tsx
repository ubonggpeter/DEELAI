"use client";
import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import {
  CheckCircle2, AlertCircle, Loader2, Upload, X,
  Clock, Briefcase, Shield, User, Mail, Phone, Lock, Eye, EyeOff,
} from "lucide-react";

const C = {
  bg: "#060A12", s1: "#0C1220", s2: "#101829", s3: "#162035",
  b1: "#1E2A42", cyan: "#00D4FF", green: "#00E5A0",
  gold: "#FFB800", red: "#FF4D6D", purple: "#8B5CF6",
  txt: "#EEF2FF", txt2: "#7D8BAA", txt3: "#4A5470",
};

interface ChannelInfo {
  id: string;
  channelName: string;
  estTime: string;
  paystackPublicKey: string;
  jobPassFee: number;
  isActive: boolean;
  ownerAvatarUrl?: string | null;
}

type Step = "form" | "payment" | "success" | "error";
type PermitType = "full-time" | "part-time";

declare global {
  interface Window {
    PaystackPop?: {
      setup: (opts: Record<string, unknown>) => { openIframe: () => void };
    };
  }
}

type SessionStatus = "pending" | "approved" | "rejected" | null;

export default function ChannelRegistrationPage() {
  const { channelId } = useParams() as { channelId: string };
  const router = useRouter();

  const [channel, setChannel]           = useState<ChannelInfo | null>(null);
  const [loading, setLoading]           = useState(true);
  const [channelError, setChannelError] = useState("");
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>(null);

  const [step, setStep]               = useState<Step>("form");
  const [submitting, setSubmitting]   = useState(false);

  // Form fields
  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [phone, setPhone]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPw, setShowPw]           = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [terms, setTerms]             = useState(false);
  const [permitType, setPermitType]   = useState<PermitType>("full-time");
  const [cvFile, setCvFile]           = useState<File | null>(null);
  const [cvUrl, setCvUrl]             = useState("");
  const [formError, setFormError]     = useState("");

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
    const existing = document.querySelector('script[src*="paystack"]');
    if (existing) return;
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
  }, [channel]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) { setFormError("CV file must be under 5MB"); return; }
    setCvFile(f);
    setCvUrl(`cv://${f.name}`);
    setFormError("");
  }

  function validateForm(): string {
    if (!name.trim())    return "Full name is required";
    if (!phone.trim())   return "Phone number is required";
    if (!email.trim())   return "Email is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Enter a valid email address";
    if (password.length < 6)  return "Password must be at least 6 characters";
    if (password !== confirm)  return "Passwords do not match";
    if (!terms)                return "You must accept the terms and conditions";
    return "";
  }

  async function submitRegistration() {
    if (!channel) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:      name.trim(),
          email:     email.trim().toLowerCase(),
          phone:     phone.trim(),
          password,
          channelId,
          cvUrl:     cvUrl || undefined,
          permitType,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setFormError(data.error ?? "Registration failed"); setStep("form"); return; }
      // Cookie is set server-side. Redirect to job-pass page (handles fee payment then pending screen).
      router.push(`/register/job-pass?channel=${channelId}`);
    } catch {
      setFormError("Network error. Please try again.");
      setStep("form");
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit() {
    const err = validateForm();
    if (err) { setFormError(err); return; }
    setFormError("");
    submitRegistration();
  }

  /* ── Loading / error states ──────────────────────────────────────── */
  if (loading) {
    return (
      <PageShell>
        <div style={{ textAlign:"center", padding:"60px 24px" }}>
          <Loader2 size={36} color={C.cyan} style={{ animation:"spin 1s linear infinite" }} />
          <p style={{ color:C.txt2, marginTop:16 }}>Loading channel…</p>
        </div>
      </PageShell>
    );
  }

  if (channelError || !channel) {
    return (
      <PageShell>
        <div style={{
          background:`${C.red}11`, border:`1px solid ${C.red}33`,
          borderRadius:12, padding:24, textAlign:"center", maxWidth:400, margin:"0 auto",
        }}>
          <AlertCircle size={32} color={C.red} style={{ marginBottom:12 }} />
          <p style={{ color:C.red, fontWeight:600 }}>{channelError || "Channel not found"}</p>
          <a href="/" style={{ color:C.cyan, fontSize:"13px", marginTop:8, display:"block" }}>
            ← Back to DEELAI
          </a>
        </div>
      </PageShell>
    );
  }

  /* ── Already-registered status screens ──────────────────────────── */
  if (sessionStatus === "pending" && channel) {
    return (
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
  }

  if (sessionStatus === "rejected" && channel) {
    return (
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
  }

  /* ── Submitting overlay ──────────────────────────────────────────── */
  if (step === "payment" || submitting) {
    return (
      <PageShell>
        <div style={{ textAlign:"center", padding:"60px 24px" }}>
          <Loader2 size={36} color={C.cyan} style={{ animation:"spin 1s linear infinite" }} />
          <p style={{ color:C.txt2, marginTop:16 }}>Creating your account…</p>
        </div>
      </PageShell>
    );
  }

  /* ── Main registration form ──────────────────────────────────────── */
  return (
    <PageShell>
      {/* Channel header */}
      <div style={{
        background:`linear-gradient(145deg, ${C.s1}, ${C.s2})`,
        border:`1px solid ${C.s3}`, borderRadius:16,
        padding:"24px 28px", marginBottom:24,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:12 }}>
          <div style={{
            width:44, height:44, borderRadius:11,
            background:`${C.cyan}15`, border:`1px solid ${C.cyan}30`,
            display:"flex", alignItems:"center", justifyContent:"center",
            flexShrink:0, overflow:"hidden",
          }}>
            {channel.ownerAvatarUrl
              ? <Image src={channel.ownerAvatarUrl} alt={channel.channelName} width={44} height={44} style={{ width:"100%", height:"100%", objectFit:"cover" }} unoptimized />
              : <Shield size={22} color={C.cyan} />}
          </div>
          <div>
            <div style={{ color:C.txt3, fontSize:"11px", fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em" }}>
              DEELAI Channel
            </div>
            <div style={{ color:C.txt, fontSize:"20px", fontWeight:800 }}>
              {channel.channelName}
            </div>
          </div>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
          <InfoChip icon={<Clock size={12} color={C.gold} />} label={`Est. ${channel.estTime} review`} color={C.gold} />
          <InfoChip icon={<Briefcase size={12} color={C.green} />} label="Accepting Applications" color={C.green} />
          {channel.jobPassFee > 0 && (
            <InfoChip icon={<span style={{ fontSize:12, color:C.cyan }}>$</span>} label={`$${channel.jobPassFee.toLocaleString()} registration fee`} color={C.cyan} />
          )}
        </div>
      </div>

      {/* Form */}
      <div style={{
        background:C.s1, border:`1px solid ${C.s3}`, borderRadius:16, padding:"28px",
        animation:"fadeUp 0.35s ease",
      }}>
        <h2 style={{ color:C.txt, fontSize:"18px", fontWeight:700, marginBottom:4 }}>
          Register Your Account
        </h2>
        <p style={{ color:C.txt2, fontSize:"13px", marginBottom:24, lineHeight:1.5 }}>
          Fill in your details below. Your application will be reviewed by the channel administrator.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
          {/* Name */}
          <FormField label="Full Name" required>
            <InputIcon icon={<User size={15} color={C.txt3} />}>
              <input
                type="text" value={name} onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chidi Okonkwo"
                style={inputStyle}
              />
            </InputIcon>
          </FormField>

          {/* Email */}
          <FormField label="Email Address" required>
            <InputIcon icon={<Mail size={15} color={C.txt3} />}>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={inputStyle}
              />
            </InputIcon>
          </FormField>

          {/* Phone */}
          <FormField label="Phone Number" required>
            <InputIcon icon={<Phone size={15} color={C.txt3} />}>
              <input
                type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="+234 800 000 0000"
                style={inputStyle}
              />
            </InputIcon>
          </FormField>

          {/* Password */}
          <FormField label="Password" required>
            <InputIcon icon={<Lock size={15} color={C.txt3} />}>
              <input
                type={showPw ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                style={{ ...inputStyle, paddingRight:38 }}
              />
              <button type="button" onClick={() => setShowPw((v) => !v)}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:2 }}>
                {showPw ? <EyeOff size={15} color={C.txt3} /> : <Eye size={15} color={C.txt3} />}
              </button>
            </InputIcon>
          </FormField>

          {/* Confirm password */}
          <FormField label="Confirm Password" required>
            <InputIcon icon={<Lock size={15} color={C.txt3} />}>
              <input
                type={showConfirm ? "text" : "password"} value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter your password"
                style={{ ...inputStyle, paddingRight:38 }}
              />
              <button type="button" onClick={() => setShowConfirm((v) => !v)}
                style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", padding:2 }}>
                {showConfirm ? <EyeOff size={15} color={C.txt3} /> : <Eye size={15} color={C.txt3} />}
              </button>
            </InputIcon>
          </FormField>

          {/* Permit type */}
          <FormField label="Permit Type" required>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
              {(["full-time","part-time"] as PermitType[]).map((pt) => (
                <button
                  key={pt}
                  onClick={() => setPermitType(pt)}
                  type="button"
                  style={{
                    padding:"12px 8px", borderRadius:10, cursor:"pointer",
                    background: permitType===pt ? `${C.cyan}18` : C.s2,
                    border: `1px solid ${permitType===pt ? C.cyan+"50" : C.s3}`,
                    display:"flex", flexDirection:"column", alignItems:"center", gap:4,
                  }}
                >
                  <div style={{
                    width:28, height:28, borderRadius:"50%", display:"flex",
                    alignItems:"center", justifyContent:"center",
                    background: permitType===pt ? `${C.cyan}25` : C.s3,
                  }}>
                    <Briefcase size={14} color={permitType===pt ? C.cyan : C.txt3} />
                  </div>
                  <span style={{
                    fontSize:"12px", fontWeight:700,
                    color: permitType===pt ? C.cyan : C.txt2,
                    textTransform:"capitalize",
                  }}>
                    {pt}
                  </span>
                </button>
              ))}
            </div>
          </FormField>

          {/* Terms */}
          <div style={{ display:"flex", alignItems:"flex-start", gap:10 }}>
            <input
              type="checkbox" id="terms" checked={terms} onChange={(e) => setTerms(e.target.checked)}
              style={{ marginTop:3, accentColor:C.cyan, width:15, height:15, cursor:"pointer", flexShrink:0 }}
            />
            <label htmlFor="terms" style={{ color:C.txt2, fontSize:"13px", lineHeight:1.5, cursor:"pointer" }}>
              I agree to the{" "}
              <a href="/terms" target="_blank" style={{ color:C.cyan, textDecoration:"underline" }}>Terms of Service</a>
              {" "}and{" "}
              <a href="/privacy" target="_blank" style={{ color:C.cyan, textDecoration:"underline" }}>Privacy Policy</a>
            </label>
          </div>

          {/* CV Upload */}
          <FormField label="Upload CV / Resume" hint="PDF, DOC, DOCX — max 5MB (optional)">
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                background:C.s2, border:`1.5px dashed ${cvFile ? C.green+"60" : C.s3}`,
                borderRadius:10, padding:"16px", cursor:"pointer", textAlign:"center",
                transition:"border-color 0.2s",
              }}
            >
              {cvFile ? (
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                  <CheckCircle2 size={16} color={C.green} />
                  <span style={{ color:C.green, fontSize:"13px", fontWeight:600 }}>{cvFile.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setCvFile(null); setCvUrl(""); }}
                    style={{ background:"none", border:"none", cursor:"pointer", padding:2 }}
                  >
                    <X size={14} color={C.txt3} />
                  </button>
                </div>
              ) : (
                <>
                  <Upload size={20} color={C.txt3} style={{ marginBottom:6 }} />
                  <div style={{ color:C.txt2, fontSize:"13px" }}>Click to upload your CV</div>
                  <div style={{ color:C.txt3, fontSize:"11px", marginTop:3 }}>PDF, DOC, DOCX up to 5MB</div>
                </>
              )}
            </div>
            <input
              ref={fileRef} type="file"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
              style={{ display:"none" }}
            />
          </FormField>
        </div>

        {/* Error */}
        {formError && (
          <div style={{
            display:"flex", gap:8, alignItems:"flex-start",
            background:`${C.red}11`, border:`1px solid ${C.red}33`,
            borderRadius:8, padding:"10px 12px", marginTop:16,
          }}>
            <AlertCircle size={14} color={C.red} style={{ marginTop:1, flexShrink:0 }} />
            <span style={{ color:C.red, fontSize:"13px" }}>{formError}</span>
          </div>
        )}

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          style={{
            width:"100%", marginTop:20,
            background: submitting ? C.s3 : `linear-gradient(135deg, ${C.cyan}, #0099BB)`,
            color: submitting ? C.txt3 : "#060A12",
            border:"none", borderRadius:10, padding:"14px",
            fontSize:"15px", fontWeight:800, cursor: submitting ? "not-allowed" : "pointer",
            display:"flex", alignItems:"center", justifyContent:"center", gap:8,
            transition:"all 0.2s",
          }}
        >
          {submitting ? (
            <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> Creating Account…</>
          ) : (
            "Create Account & Apply"
          )}
        </button>

        {channel.jobPassFee > 0 && (
          <p style={{ textAlign:"center", color:C.txt3, fontSize:"11px", marginTop:10 }}>
            A registration fee of ${channel.jobPassFee.toLocaleString()} applies — you will be prompted to pay after account creation.
          </p>
        )}
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        input:focus, select:focus { border-color: #00D4FF55 !important; outline: none; }
        * { box-sizing: border-box; }
      `}</style>
    </PageShell>
  );
}

/* ── Helpers ─────────────────────────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width:"100%", background:"transparent", border:"none",
  padding:"10px 10px 10px 36px", color:"#EEF2FF", fontSize:"14px", outline:"none",
};

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight:"100vh", background:"#060A12", padding:"24px 16px" }}>
      {/* Brand header */}
      <div style={{ maxWidth:520, margin:"0 auto 28px", display:"flex", alignItems:"center", gap:10 }}>
        <div style={{
          width:34, height:34, borderRadius:9,
          background:"linear-gradient(135deg,#00D4FF,#0055DD)",
          display:"flex", alignItems:"center", justifyContent:"center",
          fontWeight:900, color:"#fff", fontSize:"16px", fontFamily:"system-ui",
        }}>D</div>
        <span style={{ fontWeight:900, fontSize:"20px", color:"#fff", fontFamily:"system-ui" }}>
          DEEL<span style={{ color:"#00D4FF" }}>Ai</span>
        </span>
      </div>
      <div style={{ maxWidth:520, margin:"0 auto" }}>{children}</div>
    </div>
  );
}

function FormField({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{
        display:"block", color:"#7D8BAA", fontSize:"11px", fontWeight:700,
        textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6,
      }}>
        {label}{required && <span style={{ color:"#FF4D6D", marginLeft:3 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ color:"#4A5470", fontSize:"11px", marginTop:4 }}>{hint}</div>}
    </div>
  );
}

function InputIcon({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{
      position:"relative", background:"#101829",
      border:"1px solid #162035", borderRadius:9, display:"flex", alignItems:"center",
      transition:"border-color 0.2s",
    }}>
      <span style={{ position:"absolute", left:11, top:"50%", transform:"translateY(-50%)", pointerEvents:"none" }}>
        {icon}
      </span>
      {children}
    </div>
  );
}

function InfoChip({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div style={{
      display:"inline-flex", alignItems:"center", gap:5,
      background:`${color}12`, border:`1px solid ${color}30`,
      borderRadius:6, padding:"3px 9px",
    }}>
      {icon}
      <span style={{ color, fontSize:"11px", fontWeight:600 }}>{label}</span>
    </div>
  );
}
