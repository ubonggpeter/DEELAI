"use client";
import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, Clock, AlertCircle, Loader2, CheckCircle2, Shield } from "lucide-react";

const C = { bg:"#060A12", s1:"#0C1220", s2:"#101829", s3:"#162035", cyan:"#00D4FF", green:"#00E5A0", gold:"#FFB800", red:"#FF4D6D", purple:"#8B5CF6", txt:"#EEF2FF", txt2:"#7D8BAA", txt3:"#4A5470" };

type PermitType = "full-time" | "part-time";

interface ChannelInfo {
  id: string; channelName: string; estTime: string;
  paystackPublicKey: string; jobPassFee: number;
}
interface Session { loggedIn: boolean; name?: string; channelId?: string; }

declare global {
  interface Window {
    PaystackPop?: { setup: (o: Record<string, unknown>) => { openIframe: () => void } };
  }
}

export default function JobPassPage() {
  return (
    <Suspense fallback={<div style={{ minHeight:"100vh", background:"#060A12" }} />}>
      <JobPassPageInner />
    </Suspense>
  );
}

function JobPassPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const channelId    = searchParams.get("channel") ?? "";

  const [channel,   setChannel]   = useState<ChannelInfo | null>(null);
  const [session,   setSession]   = useState<Session | null>(null);
  const [permit,    setPermit]    = useState<PermitType>("full-time");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [paying,    setPaying]    = useState(false);
  const channelRef = useRef<ChannelInfo | null>(null);

  useEffect(() => {
    if (!channelId) { router.push("/"); return; }
    Promise.all([
      fetch(`/api/channel/${channelId}`).then((r) => r.json()),
      fetch("/api/auth/session").then((r) => r.json()),
    ]).then(([ch, sess]) => {
      if (ch.error) { router.push("/"); return; }
      setChannel(ch); channelRef.current = ch;
      if (!sess.loggedIn) { router.push(`/register?channel=${channelId}`); return; }
      setSession(sess);
    });
  }, [channelId, router]);

  // Load Paystack
  useEffect(() => {
    if (!channel?.paystackPublicKey) return;
    const s = document.createElement("script");
    s.src = "https://js.paystack.co/v1/inline.js"; s.async = true;
    document.body.appendChild(s);
  }, [channel]);

  async function handleBuyJobPass() {
    if (!channel || !session) return;
    setError("");

    // No fee configured → skip payment, mark as free pass
    if (!channel.jobPassFee || channel.jobPassFee <= 0 || !channel.paystackPublicKey) {
      await recordJobPass(false, "");
      return;
    }

    setPaying(true);
    setTimeout(() => {
      if (!window.PaystackPop) { setPaying(false); recordJobPass(false, ""); return; }
      const handler = window.PaystackPop.setup({
        key:      channel.paystackPublicKey,
        email:    session.name ?? "user@deelai.uk",
        amount:   channel.jobPassFee * 100,
        currency: "NGN",
        ref:      `DEELAI-JP-${Date.now()}`,
        metadata: { permit_type: permit, channel_id: channelId },
        callback: async (resp: { reference: string }) => {
          setPaying(false);
          await recordJobPass(true, resp.reference);
        },
        onClose: () => { setPaying(false); setError("Payment cancelled. You can try again."); },
      });
      handler.openIframe();
    }, 150);
  }

  async function recordJobPass(paid: boolean, ref: string) {
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/job-pass", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permitType: permit, paystackRef: ref }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Failed to record job pass"); return; }
      void paid;
      router.push("/register/verify");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!channel || !session) return (
    <div style={{ minHeight:"100vh", background:C.bg, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <Loader2 size={28} color={C.cyan} style={{ animation:"spin 1s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const options: { type: PermitType; title: string; desc: string; color: string }[] = [
    { type:"full-time", title:"Full-Time Permit", desc:"40 hrs/week · Higher earning cap · Priority task allocation · Fast-track to Permanent Staff", color:C.cyan },
    { type:"part-time", title:"Part-Time Permit", desc:"Up to 20 hrs/week · Flexible schedule · Ideal for side income · Upgrade anytime",            color:C.purple },
  ];

  return (
    <PageShell step={2} channelName={channel.channelName}>
      <h2 style={{ color:C.txt, fontSize:20, fontWeight:700, margin:"0 0 4px" }}>Get Your Job Pass</h2>
      <p style={{ color:C.txt2, fontSize:13, margin:"0 0 22px" }}>
        Choose your work schedule. Your job pass gives you access to the DEELAI task platform.
      </p>

      {/* Options */}
      <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:20 }}>
        {options.map((opt) => (
          <button
            key={opt.type}
            onClick={() => setPermit(opt.type)}
            type="button"
            style={{
              background: permit===opt.type ? `${opt.color}12` : C.s2,
              border: `1.5px solid ${permit===opt.type ? opt.color+"50" : C.s3}`,
              borderRadius:12, padding:"16px", cursor:"pointer", textAlign:"left",
              transition:"all 0.2s", width:"100%",
            }}
          >
            <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
              <div style={{
                width:36, height:36, borderRadius:9, flexShrink:0,
                background: permit===opt.type ? `${opt.color}20` : C.s3,
                border:`1px solid ${permit===opt.type ? opt.color+"40" : C.s3}`,
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                <Briefcase size={18} color={permit===opt.type ? opt.color : C.txt3} />
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <span style={{ color: permit===opt.type ? opt.color : C.txt, fontWeight:700, fontSize:15 }}>{opt.title}</span>
                  {channel.jobPassFee > 0 && (
                    <span style={{ color: permit===opt.type ? opt.color : C.txt2, fontWeight:800, fontSize:16 }}>
                      ₦{channel.jobPassFee.toLocaleString()}
                    </span>
                  )}
                </div>
                <p style={{ color:C.txt3, fontSize:12, margin:"5px 0 0", lineHeight:1.6 }}>{opt.desc}</p>
              </div>
              {permit===opt.type && (
                <CheckCircle2 size={18} color={opt.color} style={{ flexShrink:0 }} />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Fee info */}
      {channel.jobPassFee > 0 ? (
        <div style={{ background:`${C.gold}08`, border:`1px solid ${C.gold}25`, borderRadius:9, padding:"10px 14px", marginBottom:18, display:"flex", gap:8, alignItems:"flex-start" }}>
          <Clock size={14} color={C.gold} style={{ flexShrink:0, marginTop:2 }} />
          <p style={{ color:C.txt3, fontSize:12, margin:0, lineHeight:1.6 }}>
            One-time registration fee of <strong style={{ color:C.gold }}>₦{channel.jobPassFee.toLocaleString()}</strong> paid via Paystack. Your earnings will cover this in your first few tasks.
          </p>
        </div>
      ) : (
        <div style={{ background:`${C.green}08`, border:`1px solid ${C.green}25`, borderRadius:9, padding:"10px 14px", marginBottom:18, display:"flex", gap:8 }}>
          <CheckCircle2 size={14} color={C.green} style={{ flexShrink:0 }} />
          <span style={{ color:C.green, fontSize:12, fontWeight:600 }}>This channel has no registration fee — your job pass is free!</span>
        </div>
      )}

      {error && (
        <div style={{ display:"flex", gap:7, background:`${C.red}11`, border:`1px solid ${C.red}33`, borderRadius:8, padding:"9px 11px", marginBottom:14 }}>
          <AlertCircle size={14} color={C.red} style={{ flexShrink:0 }} />
          <span style={{ color:C.red, fontSize:13 }}>{error}</span>
        </div>
      )}

      <button
        onClick={handleBuyJobPass}
        disabled={loading || paying}
        style={{
          width:"100%", background: (loading||paying) ? C.s3 : `linear-gradient(135deg,${C.cyan},#0099BB)`,
          color: (loading||paying) ? C.txt3 : "#060A12", border:"none", borderRadius:9,
          padding:"13px", fontSize:15, fontWeight:800, cursor:(loading||paying)?"not-allowed":"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:8,
        }}
      >
        {loading || paying
          ? <><Loader2 size={16} style={{ animation:"spin 1s linear infinite" }} /> {paying ? "Opening payment…" : "Recording…"}</>
          : channel.jobPassFee > 0
            ? `Pay ₦${channel.jobPassFee.toLocaleString()} & Activate Job Pass`
            : "Activate Job Pass — Free"}
      </button>
      {channel.jobPassFee > 0 && (
        <p style={{ textAlign:"center", color:C.txt3, fontSize:11, marginTop:8 }}>Secure payment via Paystack</p>
      )}
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} *{box-sizing:border-box}`}</style>
    </div>
  );
}
