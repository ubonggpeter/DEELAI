"use client";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, CheckCircle, Clock, Lightbulb, Building2, CreditCard, Search, AlertCircle, CheckCircle2, Loader2, ChevronDown } from "lucide-react";
import { User } from "@/lib/types";

interface Props {
  onBack: () => void;
  user?: User;
  setUser?: (fn: (u: User) => User) => void;
}

const schedule = [
  { date: "Friday, May 23, 2026", status: "Upcoming", amt: "$14,750", color: "#FFB800" },
  { date: "Friday, May 16, 2026", status: "Paid",     amt: "$13,200", color: "#00E5A0" },
  { date: "Friday, May 9, 2026",  status: "Paid",     amt: "$12,800", color: "#00E5A0" },
  { date: "Friday, May 2, 2026",  status: "Paid",     amt: "$11,500", color: "#00E5A0" },
  { date: "Friday, Apr 25, 2026", status: "Paid",     amt: "$10,900", color: "#00E5A0" },
];

interface Bank { name: string; code: string; }

export default function PayoutScreen({ onBack, user, setUser }: Props) {
  const [banks,      setBanks]      = useState<Bank[]>([]);
  const [banksErr,   setBanksErr]   = useState("");
  const [bankCode,   setBankCode]   = useState(user?.bankCode ?? "");
  const [bankName,   setBankName]   = useState(user?.bankName ?? "");
  const [accNum,     setAccNum]     = useState(user?.bankAccountNumber ?? "");
  const [accName,    setAccName]    = useState(user?.bankAccountName ?? "");
  const [verifying,  setVerifying]  = useState(false);
  const [verifyErr,  setVerifyErr]  = useState("");
  const [verified,   setVerified]   = useState(!!user?.bankAccountNumber);
  const [saving,     setSaving]     = useState(false);
  const [saveOk,     setSaveOk]     = useState(false);
  const [bankSearch, setBankSearch] = useState("");
  const [dropOpen,   setDropOpen]   = useState(false);

  useEffect(() => {
    fetch("/api/auth/banks")
      .then(r => r.json())
      .then(d => { if (d.banks) setBanks(d.banks); else setBanksErr(d.error ?? "Failed to load banks"); })
      .catch(() => setBanksErr("Failed to load banks"));
  }, []);

  const filteredBanks = banks.filter(b => b.name.toLowerCase().includes(bankSearch.toLowerCase()));

  function selectBank(b: Bank) {
    setBankCode(b.code); setBankName(b.name);
    setBankSearch(b.name); setDropOpen(false);
    setAccName(""); setVerified(false); setVerifyErr("");
  }

  async function verifyAccount() {
    if (!accNum || accNum.length < 10) { setVerifyErr("Enter a valid 10-digit account number"); return; }
    if (!bankCode) { setVerifyErr("Select a bank first"); return; }
    setVerifying(true); setVerifyErr(""); setAccName(""); setVerified(false);
    try {
      const res = await fetch("/api/auth/verify-bank", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountNumber: accNum, bankCode }),
      });
      const d = await res.json();
      if (!res.ok) { setVerifyErr(d.error ?? "Verification failed"); return; }
      setAccName(d.accountName); setVerified(true);
    } catch { setVerifyErr("Network error"); } finally { setVerifying(false); }
  }

  async function saveBank() {
    if (!verified || !accName) return;
    setSaving(true);
    const res = await fetch("/api/auth/save-bank", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bankCode, bankName, bankAccountNumber: accNum, bankAccountName: accName }),
    });
    if (res.ok) {
      setSaveOk(true);
      if (setUser) setUser(u => ({ ...u, bankCode, bankName, bankAccountNumber: accNum, bankAccountName: accName }));
      setTimeout(() => setSaveOk(false), 3000);
    }
    setSaving(false);
  }

  const inp: React.CSSProperties = {
    width: "100%", background: "var(--s2)", border: "1px solid var(--b2)",
    borderRadius: 9, padding: "10px 12px", color: "var(--txt)",
    fontSize: 14, outline: "none",
  };

  return (
    <div className="animate-fadeUp w-full" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(145deg,#081428,#0C1E40)" }} className="rounded-b-3xl mb-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-6">
          <div className="flex items-center gap-3 mb-5">
            <button onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl min-h-[44px] min-w-[44px]"
              style={{ background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={18} />
            </button>
            <div className="text-xl sm:text-2xl font-black text-white">Payout</div>
          </div>
          <div className="text-center rounded-2xl p-4 sm:p-6"
            style={{ background: "rgba(0,229,160,.08)", border: "1px solid rgba(0,229,160,.25)" }}>
            <Calendar size={36} className="mx-auto mb-2" style={{ color: "#00E5A0" }} />
            <div className="text-base sm:text-lg font-bold mb-1.5" style={{ color: "#00E5A0" }}>Every Friday</div>
            <div className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--txt2)" }}>
              Salaries are processed every Friday by 5PM GMT. Funds arrive within 24 hours.
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">

        {/* ── Bank Account Setup ──────────────────────────────── */}
        <div className="rounded-2xl overflow-hidden mb-6"
          style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
          <div className="flex items-center gap-3 px-4 sm:px-5 pt-4 pb-3"
            style={{ borderBottom: "1px solid var(--b1)" }}>
            <Building2 size={18} style={{ color: "var(--cyan)" }} />
            <div className="font-bold text-sm sm:text-base text-white">Bank Account</div>
            {user?.bankAccountNumber && (
              <span className="ml-auto text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: "rgba(0,229,160,.15)", color: "#00E5A0", border: "1px solid rgba(0,229,160,.3)" }}>
                ✓ Verified
              </span>
            )}
          </div>

          <div className="p-4 sm:p-5">
            {banksErr && (
              <div className="flex items-center gap-2 text-sm mb-4 rounded-xl px-3 py-2.5"
                style={{ background: "rgba(255,184,0,.1)", border: "1px solid rgba(255,184,0,.3)", color: "#FFB800" }}>
                <AlertCircle size={14} /> {banksErr} — Bank verification requires your channel&apos;s Paystack to be configured.
              </div>
            )}

            {/* Bank selector */}
            <div className="mb-3">
              <label className="block text-[11px] font-bold tracking-widest mb-1.5" style={{ color: "var(--txt3)", textTransform: "uppercase" }}>
                Select Bank
              </label>
              <div className="relative">
                <div className="flex items-center rounded-xl" style={{ background: "var(--s2)", border: "1px solid var(--b2)" }}>
                  <Search size={14} color="var(--txt3)" style={{ marginLeft: 10, flexShrink: 0 }} />
                  <input
                    value={bankSearch}
                    onChange={e => { setBankSearch(e.target.value); setDropOpen(true); }}
                    onFocus={() => setDropOpen(true)}
                    placeholder="Search bank name…"
                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", padding: "10px 8px", color: "var(--txt)", fontSize: 14 }}
                  />
                  <ChevronDown size={14} color="var(--txt3)" style={{ marginRight: 10, flexShrink: 0 }} />
                </div>
                {dropOpen && filteredBanks.length > 0 && (
                  <div className="absolute z-20 w-full mt-1 rounded-xl overflow-y-auto shadow-xl"
                    style={{ background: "var(--s1)", border: "1px solid var(--b2)", maxHeight: 220 }}>
                    {filteredBanks.slice(0, 40).map(b => (
                      <div key={b.code}
                        onClick={() => selectBank(b)}
                        className="cursor-pointer px-4 py-2.5 text-sm hover:bg-[var(--s2)] transition-colors"
                        style={{ borderBottom: "1px solid var(--b1)", color: "var(--txt)" }}>
                        {b.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Account number */}
            <div className="mb-3">
              <label className="block text-[11px] font-bold tracking-widest mb-1.5" style={{ color: "var(--txt3)", textTransform: "uppercase" }}>
                Account Number
              </label>
              <div className="flex gap-2">
                <input
                  value={accNum}
                  onChange={e => { setAccNum(e.target.value.replace(/\D/g, "").slice(0, 10)); setVerified(false); setAccName(""); setVerifyErr(""); }}
                  placeholder="10-digit account number"
                  style={{ ...inp, flex: 1 }}
                  maxLength={10}
                />
                <button onClick={verifyAccount} disabled={verifying || accNum.length < 10}
                  style={{
                    background: verifying || accNum.length < 10 ? "var(--s3)" : "var(--cyan)",
                    color: verifying || accNum.length < 10 ? "var(--txt3)" : "#060A12",
                    border: "none", borderRadius: 9, padding: "0 14px", fontWeight: 700, fontSize: 13,
                    cursor: verifying || accNum.length < 10 ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 5, whiteSpace: "nowrap",
                  }}>
                  {verifying ? <><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Checking…</> : <><Search size={13} /> Verify</>}
                </button>
              </div>
            </div>

            {verifyErr && (
              <div className="flex items-center gap-2 text-sm mb-3 rounded-xl px-3 py-2"
                style={{ background: "rgba(255,77,109,.1)", border: "1px solid rgba(255,77,109,.3)", color: "#FF4D6D" }}>
                <AlertCircle size={13} /> {verifyErr}
              </div>
            )}

            {/* Verified account name */}
            {verified && accName && (
              <div className="mb-4 rounded-xl p-3"
                style={{ background: "rgba(0,229,160,.08)", border: "1px solid rgba(0,229,160,.3)" }}>
                <div className="text-[11px] font-bold tracking-widest mb-1" style={{ color: "#00E5A0", textTransform: "uppercase" }}>
                  Account Holder
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={15} color="#00E5A0" />
                  <span className="font-semibold text-white">{accName}</span>
                </div>
                <div className="text-[11px] mt-1" style={{ color: "var(--txt3)" }}>
                  Confirm this is your name before saving
                </div>
              </div>
            )}

            {saveOk && (
              <div className="flex items-center gap-2 text-sm mb-3 rounded-xl px-3 py-2"
                style={{ background: "rgba(0,229,160,.1)", border: "1px solid rgba(0,229,160,.3)", color: "#00E5A0" }}>
                <CheckCircle2 size={13} /> Bank account saved successfully!
              </div>
            )}

            <button onClick={saveBank} disabled={!verified || saving || !accName}
              style={{
                width: "100%", border: "none", borderRadius: 9, padding: "11px",
                background: verified && accName ? "linear-gradient(135deg,#00E5A0,#00B37E)" : "var(--s3)",
                color: verified && accName ? "#060A12" : "var(--txt3)",
                fontWeight: 700, fontSize: 14, cursor: verified && accName ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}>
              {saving ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Saving…</> : <><CreditCard size={14} /> Save Bank Account</>}
            </button>
          </div>
        </div>

        {/* Payout History */}
        <div className="text-sm sm:text-base font-bold mb-4 text-white">Payout History</div>
        <div className="flex flex-col gap-2 mb-4">
          {schedule.map((s, i) => (
            <div key={i} className="flex items-center gap-3 rounded-2xl p-3 sm:p-4"
              style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
              <div className="flex items-center justify-center rounded-xl flex-shrink-0"
                style={{ width: 44, height: 44,
                  background: s.status === "Upcoming" ? "rgba(255,184,0,.1)" : "rgba(0,229,160,.1)",
                  color: s.color }}>
                {s.status === "Upcoming" ? <Clock size={20} /> : <CheckCircle size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm sm:text-base font-semibold truncate">{s.date}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: s.color }}>{s.status}</div>
              </div>
              <div className="font-mono font-bold text-sm sm:text-base flex-shrink-0" style={{ color: s.color }}>
                {s.amt}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl p-4 sm:p-5 flex gap-3 items-start"
          style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
          <Lightbulb size={18} style={{ color: "#FFB800", flexShrink: 0, marginTop: 1 }} />
          <div className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--txt2)" }}>
            <strong className="text-white">Tip:</strong> Complete more annotation jobs before Thursday midnight to maximise your Friday payout.
          </div>
        </div>

        <div className="h-8" />
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
