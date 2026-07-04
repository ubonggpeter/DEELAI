"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import {
  ArrowLeft, User, Globe, Calendar, Share2, CreditCard, Microscope, Flame,
  Edit2, Check, X, Camera, Loader2, ChevronDown, Building2, CheckCircle2, AlertCircle,
} from "lucide-react";
import { User as UserType } from "@/lib/types";

const COUNTRIES = [
  "Nigeria","Ghana","Kenya","South Africa","Ethiopia","Tanzania","Uganda","Cameroon","Côte d'Ivoire","Senegal",
  "Egypt","Morocco","Algeria","Tunisia","Rwanda","Zambia","Zimbabwe","Mozambique","Angola","Mali",
  "United States","United Kingdom","Canada","Australia","India","Pakistan","Bangladesh","Indonesia","Philippines","Vietnam",
  "Brazil","Mexico","Colombia","Argentina","Germany","France","Spain","Italy","Netherlands","Sweden",
  "Turkey","Saudi Arabia","UAE","Qatar","Jordan","Lebanon","Iran","Iraq","Malaysia","Singapore",
  "Other",
];

interface Props {
  user: UserType;
  onBack: () => void;
  setUser?: (fn: (u: UserType) => UserType) => void;
}

export default function ProfileScreen({ user, onBack, setUser }: Props) {
  const [editing,       setEditing]       = useState(false);
  const [editName,      setEditName]      = useState(user.name);
  const [saving,        setSaving]        = useState(false);
  const [saveErr,       setSaveErr]       = useState("");
  const [editCountry,   setEditCountry]   = useState(user.country ?? "");
  const [savingCountry, setSavingCountry] = useState(false);
  const [uploading,     setUploading]     = useState(false);
  const [uploadErr,     setUploadErr]     = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Bank setup state
  const [showBankSetup, setShowBankSetup] = useState(false);
  const [banks,         setBanks]         = useState<{ name: string; code: string }[]>([]);
  const [banksLoading,  setBanksLoading]  = useState(false);
  const [bankCode,      setBankCode]      = useState(user.bankCode ?? "");
  const [bankName,      setBankName]      = useState(user.bankName ?? "");
  const [acctNum,       setAcctNum]       = useState(user.bankAccountNumber ?? "");
  const [acctName,      setAcctName]      = useState(user.bankAccountName ?? "");
  const [resolving,     setResolving]     = useState(false);
  const [resolveErr,    setResolveErr]    = useState("");
  const [bankSaving,    setBankSaving]    = useState(false);
  const [bankSaved,     setBankSaved]     = useState(false);

  useEffect(() => {
    if (!showBankSetup || banks.length > 0) return;
    setBanksLoading(true);
    fetch("/api/auth/banks")
      .then((r) => r.json())
      .then((d) => setBanks(d.banks ?? []))
      .catch(() => {})
      .finally(() => setBanksLoading(false));
  }, [showBankSetup, banks.length]);

  // Auto-resolve account name when bank + 10-digit account number are filled
  useEffect(() => {
    if (!bankCode || acctNum.length !== 10) { setAcctName(""); return; }
    setResolving(true); setResolveErr("");
    const t = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/verify-bank", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountNumber: acctNum, bankCode }),
        });
        const d = await res.json();
        if (res.ok) setAcctName(d.accountName ?? "");
        else setResolveErr(d.error ?? "Could not resolve account");
      } catch { setResolveErr("Network error"); }
      finally { setResolving(false); }
    }, 600);
    return () => clearTimeout(t);
  }, [bankCode, acctNum]);

  async function saveBank() {
    if (!bankCode || !bankName || !acctNum || !acctName) return;
    setBankSaving(true);
    const res = await fetch("/api/auth/save-bank", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankCode, bankName, bankAccountNumber: acctNum, bankAccountName: acctName }),
    });
    setBankSaving(false);
    if (res.ok) {
      if (setUser) setUser((u) => ({ ...u, bankCode, bankName, bankAccountNumber: acctNum, bankAccountName: acctName }));
      setBankSaved(true); setTimeout(() => setBankSaved(false), 2500);
      setShowBankSetup(false);
    }
  }

  async function saveName() {
    if (!editName.trim()) return;
    setSaving(true); setSaveErr("");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });
      if (!res.ok) { const d = await res.json(); setSaveErr(d.error ?? "Save failed"); return; }
      if (setUser) setUser((u) => ({ ...u, name: editName.trim() }));
      setEditing(false);
    } catch { setSaveErr("Network error"); } finally { setSaving(false); }
  }

  async function uploadAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setUploadErr("");
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/auth/upload-avatar", { method: "POST", body: form });
      const d = await res.json();
      if (!res.ok) { setUploadErr(d.error ?? "Upload failed"); return; }
      if (d.url && setUser) setUser((u) => ({ ...u, avatarUrl: d.url }));
    } catch { setUploadErr("Network error"); } finally { setUploading(false); }
  }

  async function saveCountry(country: string) {
    if (country === (user.country ?? "")) return;
    setSavingCountry(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ country }),
      });
      if (res.ok && setUser) setUser((u) => ({ ...u, country }));
    } catch { } finally { setSavingCountry(false); }
  }

  const stats = [
    { label: "SALARY",   value: `$${user.salary.toLocaleString()}`,  color: "#00E5A0" },
    { label: "JOBS",     value: user.jobsDone.toLocaleString(),       color: "#00D4FF" },
    { label: "ACCURACY", value: `${user.accuracy}%`,                  color: "#FFB800" },
    { label: "STREAK",   value: `${user.streak}d`,                    color: "#FF4D6D", icon: <Flame size={12} /> },
  ];

  const bankDisplay = user.bankAccountNumber
    ? `${user.bankName} ···${user.bankAccountNumber.slice(-4)}`
    : "Not set";

  const infoRows = [
    { Icon: Calendar,   label: "Member Since", value: "January 2026" },
    { Icon: Share2,     label: "Recruit Code", value: user.refCode },
    { Icon: CreditCard, label: "Payout Bank",  value: bankDisplay, action: () => setShowBankSetup((s) => !s) },
  ];

  const fs = "w-full rounded-xl bg-[#101829] border border-white/10 text-white text-sm outline-none px-3 py-2.5";

  return (
    <div className="animate-fadeUp w-full" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(145deg,#081428,#0C1E40)" }} className="rounded-b-3xl mb-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8 text-center relative">
          <button onClick={onBack}
            className="absolute top-6 left-4 sm:left-6 lg:left-8 flex items-center justify-center w-9 h-9 rounded-xl min-h-[44px] min-w-[44px]"
            style={{ background: "var(--b1)", color: "var(--txt2)" }}>
            <ArrowLeft size={18} />
          </button>

          <div className="text-xl sm:text-2xl font-black mb-6 text-white">My Profile</div>

          {/* Avatar with upload */}
          <div className="relative inline-block mb-3">
            <div className="flex items-center justify-center rounded-3xl w-20 h-20 sm:w-24 sm:h-24 overflow-hidden"
              style={{ background: "linear-gradient(135deg,#1a3060,#0d2040)", border: "3px solid rgba(0,212,255,.4)", color: "var(--txt2)" }}>
              {user.avatarUrl
                ? <Image src={user.avatarUrl} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                : <User size={38} className="sm:w-11 sm:h-11" />}
            </div>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 flex items-center justify-center rounded-full"
              style={{ width: 26, height: 26, background: "var(--cyan)", border: "2px solid var(--bg)", cursor: "pointer" }}>
              {uploading ? <Loader2 size={12} color="#000" style={{ animation: "spin 1s linear infinite" }} /> : <Camera size={12} color="#000" />}
            </button>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={uploadAvatar} />
          </div>
          {uploadErr && (
            <div className="flex items-center justify-center gap-1.5 text-xs mb-2" style={{ color: "#FF4D6D" }}>
              <AlertCircle size={12} /> {uploadErr}
            </div>
          )}

          {/* Name with inline edit */}
          {editing ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6, marginBottom:4 }}>
              <input value={editName} onChange={(e) => setEditName(e.target.value)}
                style={{ background:"rgba(255,255,255,.08)", border:"1px solid rgba(0,212,255,.4)", borderRadius:8, padding:"6px 10px", color:"#fff", fontSize:18, fontWeight:700, textAlign:"center", outline:"none", maxWidth:200 }} />
              <button onClick={saveName} disabled={saving} style={{ background:"none", border:"none", cursor:"pointer" }}><Check size={18} color="#00E5A0" /></button>
              <button onClick={() => { setEditing(false); setEditName(user.name); setSaveErr(""); }} style={{ background:"none", border:"none", cursor:"pointer" }}><X size={18} color="#FF4D6D" /></button>
            </div>
          ) : (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, marginBottom:4 }}>
              <div className="text-2xl sm:text-3xl font-bold text-white">{user.name}</div>
              <button onClick={() => { setEditName(user.name); setEditing(true); }} style={{ background:"none", border:"none", cursor:"pointer", padding:4 }}>
                <Edit2 size={14} color="var(--txt3)" />
              </button>
            </div>
          )}
          {saveErr && <div style={{ color:"#FF4D6D", fontSize:12, marginBottom:4 }}>{saveErr}</div>}

          <div className="text-xs font-mono tracking-widest mt-1" style={{ color: "var(--txt2)" }}>{user.level}</div>

          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            <span className="rounded-lg px-3 py-1.5 text-[11px] font-mono font-bold tracking-wider border"
              style={user.isPermanent
                ? { background: "rgba(0,229,160,.15)", borderColor: "rgba(0,229,160,.4)", color: "#00E5A0" }
                : { background: "rgba(255,184,0,.15)", borderColor: "rgba(255,184,0,.4)", color: "#FFB800" }}>
              {user.isPermanent ? "PERMANENT STAFF" : "ASSOCIATE STAFF"}
            </span>
            {user.kycDone && (
              <span className="rounded-lg px-3 py-1.5 text-[11px] font-mono font-bold border"
                style={{ background: "rgba(0,229,160,.15)", borderColor: "rgba(0,229,160,.4)", color: "#00E5A0" }}>
                ✓ VERIFIED
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {stats.map(({ label, value, color, icon }) => (
            <div key={label} className="rounded-xl text-center p-3 sm:p-4"
              style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
              <div className="text-[9px] font-mono tracking-widest mb-1.5" style={{ color: "var(--txt2)" }}>{label}</div>
              <div className="flex items-center justify-center gap-1 font-bold text-sm sm:text-base" style={{ color }}>
                {icon}{value}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop two-col */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          <div className="rounded-2xl overflow-hidden mb-5 lg:mb-0"
            style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
            {/* Country / region picker */}
            <div className="flex items-center gap-3 p-4 sm:p-5" style={{ borderBottom: "1px solid var(--b1)" }}>
              <Globe size={16} style={{ color: "var(--txt3)", flexShrink: 0 }} />
              <span className="text-sm flex-1" style={{ color: "var(--txt2)" }}>Region</span>
              <div className="relative flex items-center gap-1">
                {savingCountry && <Loader2 size={12} style={{ color: "var(--txt3)", animation: "spin 1s linear infinite" }} />}
                <div className="relative">
                  <select
                    value={editCountry}
                    onChange={(e) => { setEditCountry(e.target.value); saveCountry(e.target.value); }}
                    className="appearance-none text-sm font-medium pr-5 pl-0 bg-transparent outline-none border-none cursor-pointer"
                    style={{ color: editCountry ? "#fff" : "var(--txt3)" }}>
                    <option value="" disabled>Select region</option>
                    {COUNTRIES.map(c => <option key={c} value={c} style={{ background: "#0C1422" }}>{c}</option>)}
                  </select>
                  <ChevronDown size={12} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", color: "var(--txt3)", pointerEvents: "none" }} />
                </div>
              </div>
            </div>
            {infoRows.map(({ Icon, label, value, action }, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 p-4 sm:p-5${action ? " cursor-pointer" : ""}`}
                style={{ borderBottom: i < infoRows.length - 1 ? "1px solid var(--b1)" : "none" }}
                onClick={action}
              >
                <Icon size={16} style={{ color: "var(--txt3)", flexShrink: 0 }} />
                <span className="text-sm flex-1" style={{ color: "var(--txt2)" }}>{label}</span>
                <span className="text-sm font-medium truncate max-w-[140px]"
                  style={{ color: action ? "var(--cyan)" : "white" }}>
                  {value}
                  {action && <Edit2 size={11} style={{ display:"inline", marginLeft:4, color:"var(--txt3)" }} />}
                </span>
              </div>
            ))}
          </div>

          {user.lensActivated ? (
            <div className="flex items-start gap-3 rounded-2xl p-4 sm:p-5 h-fit"
              style={{ background: "rgba(0,212,255,.06)", border: "1px solid rgba(0,212,255,.22)" }}>
              <Microscope size={24} style={{ color: "var(--cyan)", flexShrink: 0 }} />
              <div>
                <div className="font-semibold text-sm sm:text-base mb-1" style={{ color: "var(--cyan)" }}>Annotation Lens Active</div>
                <div className="text-xs sm:text-sm" style={{ color: "var(--txt2)" }}>Permanent tool · Lens activated</div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl p-4 sm:p-5 h-fit"
              style={{ background: "rgba(255,184,0,.06)", border: "1px solid rgba(255,184,0,.2)" }}>
              <div className="text-xs sm:text-sm" style={{ color: "var(--txt2)" }}>
                Complete training and activate your Annotation Lens to unlock all annotation jobs.
              </div>
            </div>
          )}
        </div>

        {/* Bank Setup */}
        {showBankSetup && (
          <div className="mt-5 rounded-2xl p-5" style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Building2 size={16} style={{ color: "var(--cyan)" }} />
                <span className="font-semibold text-sm text-white">Set Up Payout Bank</span>
              </div>
              <button onClick={() => setShowBankSetup(false)} style={{ background:"none", border:"none", cursor:"pointer" }}>
                <X size={16} style={{ color: "var(--txt3)" }} />
              </button>
            </div>

            {/* Bank selector */}
            <div className="mb-3">
              <label className="text-[10px] font-mono tracking-wider mb-1.5 block" style={{ color: "var(--txt3)" }}>SELECT BANK</label>
              {banksLoading ? (
                <div className="flex items-center gap-2 py-2" style={{ color: "var(--txt3)" }}>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  <span className="text-sm">Loading banks…</span>
                </div>
              ) : banks.length === 0 ? (
                <p className="text-sm" style={{ color: "var(--txt3)" }}>Bank list unavailable — your channel Paystack key may not be set.</p>
              ) : (
                <select
                  value={bankCode}
                  onChange={(e) => {
                    const b = banks.find((b) => b.code === e.target.value);
                    setBankCode(e.target.value);
                    setBankName(b?.name ?? "");
                    setAcctName("");
                  }}
                  className={fs}
                  style={{ cursor: "pointer" }}
                >
                  <option value="">Choose your bank…</option>
                  {banks.map((b) => <option key={b.code} value={b.code}>{b.name}</option>)}
                </select>
              )}
            </div>

            {/* Account number */}
            <div className="mb-3">
              <label className="text-[10px] font-mono tracking-wider mb-1.5 block" style={{ color: "var(--txt3)" }}>ACCOUNT NUMBER</label>
              <input
                type="text" inputMode="numeric" maxLength={10}
                value={acctNum} onChange={(e) => { setAcctNum(e.target.value.replace(/\D/g, "")); setAcctName(""); setResolveErr(""); }}
                placeholder="10-digit account number"
                className={fs}
              />
            </div>

            {/* Resolved name */}
            <div className="mb-4 min-h-[40px] flex items-center">
              {resolving ? (
                <div className="flex items-center gap-2" style={{ color: "var(--txt3)" }}>
                  <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
                  <span className="text-sm">Verifying account…</span>
                </div>
              ) : acctName ? (
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={16} style={{ color: "#00E5A0" }} />
                  <span className="text-sm font-semibold" style={{ color: "#00E5A0" }}>{acctName}</span>
                </div>
              ) : resolveErr ? (
                <div className="flex items-center gap-2">
                  <AlertCircle size={14} style={{ color: "#FF4D6D" }} />
                  <span className="text-xs" style={{ color: "#FF4D6D" }}>{resolveErr}</span>
                </div>
              ) : null}
            </div>

            <button
              onClick={saveBank}
              disabled={!acctName || bankSaving}
              className="w-full rounded-xl py-3 font-bold text-sm flex items-center justify-center gap-2"
              style={{
                background: bankSaved ? "#00E5A0" : acctName ? "var(--cyan)" : "var(--s3)",
                color: acctName ? "#060A12" : "var(--txt3)",
                cursor: acctName ? "pointer" : "default",
                border: "none",
              }}
            >
              {bankSaving ? <><Loader2 size={14} style={{ animation:"spin 1s linear infinite" }} /> Saving…</> :
               bankSaved  ? <><CheckCircle2 size={14} /> Saved!</> :
                            <><Building2 size={14} /> Save Payout Bank</>}
            </button>
          </div>
        )}

        <div className="h-8" />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
