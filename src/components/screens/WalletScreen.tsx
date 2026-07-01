"use client";
import { useState } from "react";
import {
  Banknote, BarChart2, Building2, Bitcoin, CreditCard,
  Calendar, ArrowDownToLine, ArrowUpFromLine, CheckCircle,
  AlertTriangle, ChevronRight, ArrowLeft,
} from "lucide-react";
import { User } from "@/lib/types";

interface Props {
  user: User;
  setUser: (fn: (u: User) => User) => void;
}

type Step = "main" | "method" | "amount" | "confirm" | "success";

const methods = [
  { id: "bank",   Icon: Building2,  label: "Bank Transfer",  sub: "1–2 business days", c: "#00D4FF" },
  { id: "crypto", Icon: Bitcoin,    label: "USDT / Crypto",  sub: "Within 2 hours",    c: "#F7931A" },
  { id: "paypal", Icon: CreditCard, label: "PayPal",         sub: "Same day",           c: "#0079C1" },
];

const txns = [
  { type: "earn",     desc: "Annotation Job #A-2291",        amt: "+$12.50",     date: "Today, 10:02 AM",  c: "#00E5A0" },
  { type: "earn",     desc: "Annotation Job #A-2290",        amt: "+$12.50",     date: "Today, 9:44 AM",   c: "#00E5A0" },
  { type: "earn",     desc: "Recruit Bonus — Fatima Bello",  amt: "+$40.00",     date: "Yesterday",        c: "#00D4FF" },
  { type: "debit",    desc: "Annotation Lens Activation",    amt: "-$3.80",      date: "May 17, 2026",     c: "#FF4D6D" },
  { type: "withdraw", desc: "Bank Transfer Withdrawal",       amt: "-$1,023.80",  date: "May 16, 2026",     c: "#FF4D6D" },
];

const inputCls = "w-full rounded-xl bg-[#101829] border border-white/10 text-white text-sm sm:text-base outline-none px-3.5 py-3 sm:py-3.5";

export default function WalletScreen({ user, setUser }: Props) {
  const [step,   setStep]   = useState<Step>("main");
  const [method, setMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [bank,   setBank]   = useState("");
  const [acct,   setAcct]   = useState("");

  const canWithdraw = user.trainingDone && user.lensActivated && user.salary >= 10;
  const parsedAmt   = parseFloat(amount || "0");

  function BackBtn({ to }: { to: Step }) {
    return (
      <button
        onClick={() => setStep(to)}
        className="flex items-center gap-1.5 mb-5 text-sm min-h-[44px]"
        style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer" }}
      >
        <ArrowLeft size={15} /> Back
      </button>
    );
  }

  /* ── Success ── */
  if (step === "success") return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 text-center animate-fadeUp">
      <CheckCircle size={64} color="#00E5A0" className="mx-auto mb-4" />
      <h2 className="font-black text-2xl sm:text-3xl mb-2" style={{ color: "#00E5A0" }}>Withdrawal Submitted!</h2>
      <p className="text-sm sm:text-base mb-6" style={{ color: "var(--txt2)" }}>
        <strong className="text-white">${parsedAmt.toFixed(2)}</strong> is being processed.
        Delivery: <strong className="text-white">1–2 business days</strong>
      </p>
      <div className="rounded-2xl p-5 text-left mb-6" style={{ background: "var(--s1)", border: "1px solid var(--b2)" }}>
        <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: "var(--txt2)" }}>TRANSACTION REF</div>
        <div className="font-mono text-sm" style={{ color: "var(--cyan)" }}>TXN-{Date.now().toString().slice(-8)}</div>
      </div>
      <button
        onClick={() => { setStep("main"); setAmount(""); setBank(""); setAcct(""); setMethod(null); }}
        className="min-h-[50px] px-8 rounded-xl font-bold text-base text-white cursor-pointer border-none"
        style={{ background: "linear-gradient(135deg,#00D4FF,#0055DD)" }}
      >
        Back to Wallet
      </button>
    </div>
  );

  /* ── Confirm ── */
  if (step === "confirm") {
    const meth = methods.find(m => m.id === method);
    const rows = [
      ["Amount", `$${parsedAmt.toFixed(2)}`],
      ["Method", meth?.label || "—"],
      ["Destination", bank || "—"],
      ["Account", acct || "—"],
      ["Processing Fee", "$0.00"],
      ["You Receive", `$${parsedAmt.toFixed(2)}`],
    ];
    return (
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeUp">
        <BackBtn to="amount" />
        <h2 className="font-black text-xl sm:text-2xl mb-6">Confirm Withdrawal</h2>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-3 text-sm sm:text-base" style={{ borderBottom: "1px solid var(--b1)" }}>
            <span style={{ color: "var(--txt2)" }}>{k}</span>
            <span className="font-semibold">{v}</span>
          </div>
        ))}
        <button
          onClick={() => { setUser(u => ({ ...u, salary: Math.max(0, u.salary - parsedAmt) })); setStep("success"); }}
          className="w-full font-bold text-black text-base min-h-[50px] rounded-xl border-none cursor-pointer mt-6"
          style={{ background: "linear-gradient(135deg,#00E5A0,#00B37E)" }}
        >
          Confirm &amp; Submit →
        </button>
      </div>
    );
  }

  /* ── Amount ── */
  if (step === "amount") return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeUp">
      <BackBtn to="method" />
      <h2 className="font-black text-xl sm:text-2xl mb-5">Enter Amount</h2>
      <div className="mb-4">
        <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: "var(--txt2)" }}>WITHDRAWAL AMOUNT</div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg font-mono" style={{ color: "var(--cyan)" }}>$</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className={inputCls} style={{ paddingLeft: 30, fontSize: 22, fontWeight: 700 }} />
        </div>
        <p className="text-xs mt-1.5" style={{ color: "var(--txt2)" }}>
          Available: <strong style={{ color: "#00E5A0" }}>${user.salary.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> · Min: $10.00
        </p>
      </div>
      {method === "bank" && (
        <>
          <div className="mb-3">
            <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: "var(--txt2)" }}>BANK NAME</div>
            <input value={bank} onChange={e => setBank(e.target.value)} placeholder="e.g. Zenith Bank, GTBank..." className={inputCls} />
          </div>
          <div className="mb-5">
            <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: "var(--txt2)" }}>ACCOUNT NUMBER</div>
            <input value={acct} onChange={e => setAcct(e.target.value)} placeholder="10-digit account number" className={inputCls} />
          </div>
        </>
      )}
      <button
        disabled={!amount || parsedAmt < 10 || parsedAmt > user.salary}
        onClick={() => setStep("confirm")}
        className="w-full font-bold text-base min-h-[50px] rounded-xl border-none cursor-pointer"
        style={{
          background: amount && parsedAmt >= 10 && parsedAmt <= user.salary ? "linear-gradient(135deg,#00D4FF,#0055DD)" : "var(--s3)",
          color: amount && parsedAmt >= 10 ? "#fff" : "var(--txt3)",
        }}
      >
        Continue →
      </button>
    </div>
  );

  /* ── Method ── */
  if (step === "method") return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeUp">
      <BackBtn to="main" />
      <h2 className="font-black text-xl sm:text-2xl mb-1">Choose Method</h2>
      <p className="text-sm mb-6" style={{ color: "var(--txt2)" }}>Select your preferred withdrawal channel.</p>
      <div className="space-y-3">
        {methods.map(m => (
          <div
            key={m.id}
            onClick={() => { setMethod(m.id); setStep("amount"); }}
            className="flex items-center gap-4 rounded-2xl p-4 sm:p-5 cursor-pointer transition-colors"
            style={{ background: "var(--s1)", border: `1px solid ${method === m.id ? m.c + "55" : "var(--b1)"}` }}
          >
            <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 48, height: 48, background: `${m.c}18`, border: `1px solid ${m.c}30` }}>
              <m.Icon size={22} color={m.c} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm sm:text-base">{m.label}</div>
              <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>{m.sub}</div>
            </div>
            <ChevronRight size={16} color="var(--txt2)" />
          </div>
        ))}
      </div>
    </div>
  );

  /* ── Main ── */
  return (
    <div className="animate-fadeUp">
      {/* Header */}
      <div className="rounded-b-3xl mb-6" style={{ background: "linear-gradient(150deg,#081428,#0C2044,#081830)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="font-black text-2xl sm:text-3xl mb-4" style={{ fontFamily: "system-ui,sans-serif" }}>My Wallet</h1>
          <div className="font-mono text-[10px] tracking-widest uppercase mb-1.5" style={{ color: "var(--txt2)" }}>Salary Balance</div>
          <div className="font-black leading-none mb-2 text-4xl sm:text-5xl lg:text-6xl tracking-tight">
            <span className="text-xl sm:text-2xl align-top mt-2 inline-block" style={{ color: "var(--cyan)" }}>$</span>
            {user.salary.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs sm:text-sm mb-5" style={{ color: "var(--txt2)" }}>
            Total earned: <strong style={{ color: "#00E5A0" }}>${(user.salary + 1023.8).toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong>
            {" · "}Withdrawn: <strong style={{ color: "#FF4D6D" }}>$1,023.80</strong>
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => canWithdraw && setStep("method")}
              className="flex-1 flex items-center justify-center gap-2 font-bold text-sm sm:text-base rounded-xl border-none min-h-[50px] sm:min-h-[54px] transition-all"
              style={{ background: canWithdraw ? "linear-gradient(135deg,#00E5A0,#00B37E)" : "var(--s3)", color: canWithdraw ? "#000" : "var(--txt3)", cursor: canWithdraw ? "pointer" : "not-allowed" }}
            >
              <Banknote size={16} /> Withdraw
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 font-semibold text-sm sm:text-base rounded-xl min-h-[50px] sm:min-h-[54px] cursor-pointer"
              style={{ border: "1px solid var(--b2)", background: "var(--s1)", color: "var(--txt)" }}
            >
              <BarChart2 size={16} /> Report
            </button>
          </div>
          {!canWithdraw && (
            <div className="flex items-center gap-1.5 mt-3 font-mono text-xs" style={{ color: "var(--txt3)" }}>
              <AlertTriangle size={11} />
              {!user.trainingDone ? "Complete training first" : !user.lensActivated ? "Activate your Annotation Lens" : "Min withdrawal: $10.00"}
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Desktop two-column */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Left: stats + payout */}
          <div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {([
                ["This Month", `$${(user.salary * 0.6).toFixed(2)}`, "#00D4FF"],
                ["Withdrawn", "$1,023.80", "#FF4D6D"],
                ["Pending", "$0.00", "#FFB800"],
              ] as [string, string, string][]).map(([l, v, c]) => (
                <div key={l} className="rounded-xl p-3 sm:p-4" style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
                  <div className="font-mono text-[9px] sm:text-[10px] tracking-widest mb-1" style={{ color: "var(--txt2)" }}>{l.toUpperCase()}</div>
                  <div className="font-bold text-sm sm:text-base mt-1" style={{ color: c }}>{v}</div>
                </div>
              ))}
            </div>

            <div
              className="flex items-center gap-3 rounded-xl p-3 sm:p-4 mb-6 lg:mb-0"
              style={{ background: "rgba(0,229,160,.07)", border: "1px solid rgba(0,229,160,.22)" }}
            >
              <Calendar size={18} color="#00E5A0" className="shrink-0" />
              <div>
                <div className="font-semibold text-sm" style={{ color: "#00E5A0" }}>Next Payout: Friday, May 23</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>Your salary will be processed automatically</div>
              </div>
            </div>
          </div>

          {/* Right: transactions */}
          <div>
            <h2 className="font-bold text-base sm:text-lg mb-3">Transaction History</h2>
            <div className="space-y-0">
              {txns.map((t, i) => (
                <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid var(--b1)" }}>
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0"
                    style={{ width: 40, height: 40, background: t.type === "earn" ? "rgba(0,229,160,.1)" : "rgba(255,77,109,.1)" }}
                  >
                    {t.type === "earn" ? <ArrowDownToLine size={16} color="#00E5A0" /> : <ArrowUpFromLine size={16} color="#FF4D6D" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{t.desc}</div>
                    <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>{t.date}</div>
                  </div>
                  <div className="font-mono font-semibold text-sm shrink-0" style={{ color: t.c }}>{t.amt}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
