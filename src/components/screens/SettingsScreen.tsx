"use client";
import { useState } from "react";
import { ArrowLeft, Bell, ShieldCheck, Lock, Mail, Key, Trash2, ChevronRight, X, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { User } from "@/lib/types";

interface Props {
  onBack: () => void;
  user?: User;
  setUser?: (fn: (u: User) => User) => void;
}

function Toggle({ val, fn }: { val: boolean; fn: () => void }) {
  return (
    <div onClick={fn} className="relative flex-shrink-0 cursor-pointer transition-colors duration-200 rounded-full"
      style={{ width: 46, height: 26, background: val ? "var(--cyan)" : "var(--s3)" }}>
      <div className="absolute top-[3px] w-5 h-5 rounded-full bg-white transition-all duration-200" style={{ left: val ? 22 : 3 }} />
    </div>
  );
}

export default function SettingsScreen({ onBack }: Props) {
  const [notif, setNotif] = useState(true);
  const [bio,   setBio]   = useState(false);
  const [twofa, setTwofa] = useState(true);

  // Change password state
  const [pwOpen,    setPwOpen]    = useState(false);
  const [curPw,     setCurPw]     = useState("");
  const [newPw,     setNewPw]     = useState("");
  const [confPw,    setConfPw]    = useState("");
  const [showCur,   setShowCur]   = useState(false);
  const [showNew,   setShowNew]   = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwErr,     setPwErr]     = useState("");
  const [pwOk,      setPwOk]      = useState(false);

  const toggleRows = [
    { Icon: Bell,        title: "Push Notifications", desc: "Get alerts for job approvals & payouts", val: notif, fn: () => setNotif(!notif) },
    { Icon: ShieldCheck, title: "Biometric Login",     desc: "Use fingerprint or Face ID to log in",  val: bio,   fn: () => setBio(!bio) },
    { Icon: Lock,        title: "Two-Factor Auth",     desc: "Extra security for withdrawals",         val: twofa, fn: () => setTwofa(!twofa) },
  ];

  async function handleChangePw(e: React.FormEvent) {
    e.preventDefault();
    setPwErr("");
    if (newPw !== confPw) { setPwErr("New passwords don't match"); return; }
    if (newPw.length < 6)  { setPwErr("Password must be at least 6 characters"); return; }
    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: curPw, newPassword: newPw }),
      });
      const d = await res.json();
      if (!res.ok) { setPwErr(d.error ?? "Failed to change password"); return; }
      setPwOk(true);
      setCurPw(""); setNewPw(""); setConfPw("");
      setTimeout(() => { setPwOk(false); setPwOpen(false); }, 2500);
    } catch { setPwErr("Network error"); } finally { setPwLoading(false); }
  }

  const inp: React.CSSProperties = {
    width: "100%", background: "var(--s2)", border: "1px solid var(--b2)",
    borderRadius: 9, padding: "10px 38px 10px 11px", color: "var(--txt)",
    fontSize: 14, outline: "none",
  };

  return (
    <div className="animate-fadeUp w-full" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(145deg,#081428,#0C1E40)" }} className="rounded-b-3xl mb-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <button onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl min-h-[44px] min-w-[44px]"
              style={{ background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={18} />
            </button>
            <div className="text-xl sm:text-2xl font-black text-white">Settings</div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Toggle Rows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {toggleRows.map(({ Icon, title, desc, val, fn }) => (
            <div key={title} className="flex items-center gap-3 rounded-2xl p-4 sm:p-5"
              style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
              <Icon size={22} style={{ color: "var(--txt2)", flexShrink: 0 }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold">{title}</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>{desc}</div>
              </div>
              <Toggle val={val} fn={fn} />
            </div>
          ))}
        </div>

        {/* Account Section */}
        <div className="text-sm sm:text-base font-bold mb-3 text-white">Account</div>
        <div className="rounded-2xl overflow-hidden" style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
          {/* Change Email (static) */}
          <div className="flex items-center gap-3 cursor-pointer p-4 sm:p-5 transition-colors"
            style={{ borderBottom: "1px solid var(--b1)" }}>
            <Mail size={20} style={{ color: "var(--txt2)", flexShrink: 0 }} />
            <span className="text-sm sm:text-base flex-1">Change Email</span>
            <ChevronRight size={16} style={{ color: "var(--txt3)" }} />
          </div>

          {/* Change Password — expandable */}
          <div style={{ borderBottom: "1px solid var(--b1)" }}>
            <div className="flex items-center gap-3 cursor-pointer p-4 sm:p-5" onClick={() => { setPwOpen(o => !o); setPwErr(""); setPwOk(false); }}>
              <Key size={20} style={{ color: "var(--txt2)", flexShrink: 0 }} />
              <span className="text-sm sm:text-base flex-1">Change Password</span>
              {pwOpen ? <X size={16} style={{ color: "var(--txt3)" }} /> : <ChevronRight size={16} style={{ color: "var(--txt3)" }} />}
            </div>
            {pwOpen && (
              <form onSubmit={handleChangePw} className="px-4 sm:px-5 pb-5" style={{ borderTop: "1px solid var(--b1)" }}>
                {pwOk && (
                  <div className="flex items-center gap-2 mt-4 mb-3 text-sm rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(0,229,160,.1)", border: "1px solid rgba(0,229,160,.3)", color: "#00E5A0" }}>
                    <CheckCircle2 size={14} /> Password changed successfully!
                  </div>
                )}
                {pwErr && (
                  <div className="flex items-center gap-2 mt-4 mb-3 text-sm rounded-xl px-3 py-2.5"
                    style={{ background: "rgba(255,77,109,.1)", border: "1px solid rgba(255,77,109,.3)", color: "#FF4D6D" }}>
                    <AlertCircle size={14} /> {pwErr}
                  </div>
                )}
                {/* Current password */}
                <div className="mt-4 mb-3">
                  <label className="block text-[11px] font-bold tracking-widest mb-1.5" style={{ color: "var(--txt3)", textTransform: "uppercase" }}>Current Password</label>
                  <div className="relative">
                    <input type={showCur ? "text" : "password"} value={curPw} onChange={e => setCurPw(e.target.value)} required style={inp} />
                    <button type="button" onClick={() => setShowCur(p => !p)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer" }}>
                      {showCur ? <EyeOff size={14} color="var(--txt3)" /> : <Eye size={14} color="var(--txt3)" />}
                    </button>
                  </div>
                </div>
                {/* New password */}
                <div className="mb-3">
                  <label className="block text-[11px] font-bold tracking-widest mb-1.5" style={{ color: "var(--txt3)", textTransform: "uppercase" }}>New Password</label>
                  <div className="relative">
                    <input type={showNew ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} required style={inp} />
                    <button type="button" onClick={() => setShowNew(p => !p)} style={{ position:"absolute", right:10, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer" }}>
                      {showNew ? <EyeOff size={14} color="var(--txt3)" /> : <Eye size={14} color="var(--txt3)" />}
                    </button>
                  </div>
                </div>
                {/* Confirm */}
                <div className="mb-4">
                  <label className="block text-[11px] font-bold tracking-widest mb-1.5" style={{ color: "var(--txt3)", textTransform: "uppercase" }}>Confirm New Password</label>
                  <input type="password" value={confPw} onChange={e => setConfPw(e.target.value)} required style={inp} />
                </div>
                <button type="submit" disabled={pwLoading}
                  style={{
                    width: "100%", background: pwLoading ? "var(--s3)" : "linear-gradient(135deg,#00D4FF,#0099BB)",
                    color: pwLoading ? "var(--txt3)" : "#060A12", border: "none", borderRadius: 9,
                    padding: "11px", fontSize: 14, fontWeight: 700, cursor: pwLoading ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  }}>
                  {pwLoading ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> Changing…</> : "Change Password"}
                </button>
              </form>
            )}
          </div>

          {/* Delete Account (static) */}
          <div className="flex items-center gap-3 cursor-pointer p-4 sm:p-5">
            <Trash2 size={20} style={{ color: "var(--txt2)", flexShrink: 0 }} />
            <span className="text-sm sm:text-base flex-1">Delete Account</span>
            <ChevronRight size={16} style={{ color: "var(--txt3)" }} />
          </div>
        </div>

        <div className="h-8" />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
