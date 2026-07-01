"use client";
import { useState } from "react";
import { Banknote, BarChart2, Building2, Bitcoin, CreditCard, Calendar, ArrowDownToLine, ArrowUpFromLine, CheckCircle, AlertTriangle, ChevronRight, ArrowLeft } from "lucide-react";
import { User } from "@/lib/types";

interface Props {
  user: User;
  setUser: (fn: (u: User) => User) => void;
}

type Step = "main" | "method" | "amount" | "confirm" | "success";

const methods = [
  { id: "bank", Icon: Building2, label: "Bank Transfer", sub: "1–2 business days", c: "#00D4FF" },
  { id: "crypto", Icon: Bitcoin, label: "USDT / Crypto", sub: "Within 2 hours", c: "#F7931A" },
  { id: "paypal", Icon: CreditCard, label: "PayPal", sub: "Same day", c: "#0079C1" },
];

const txns = [
  { type: "earn", desc: "Annotation Job #A-2291", amt: "+$12.50", date: "Today, 10:02 AM", c: "#00E5A0" },
  { type: "earn", desc: "Annotation Job #A-2290", amt: "+$12.50", date: "Today, 9:44 AM", c: "#00E5A0" },
  { type: "earn", desc: "Recruit Bonus — Fatima Bello", amt: "+$40.00", date: "Yesterday", c: "#00D4FF" },
  { type: "debit", desc: "Annotation Lens Activation", amt: "-$3.80", date: "May 17, 2026", c: "#FF4D6D" },
  { type: "withdraw", desc: "Bank Transfer Withdrawal", amt: "-$1,023.80", date: "May 16, 2026", c: "#FF4D6D" },
];

export default function WalletScreen({ user, setUser }: Props) {
  const [step, setStep] = useState<Step>("main");
  const [method, setMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [bank, setBank] = useState("");
  const [acct, setAcct] = useState("");

  const canWithdraw = user.trainingDone && user.lensActivated && user.salary >= 10;
  const parsedAmt = parseFloat(amount || "0");

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "13px 14px", borderRadius: 12,
    background: "var(--s2)", border: "1px solid var(--b2)",
    color: "#fff", fontSize: 14, outline: "none",
  };

  function BackBtn({ to }: { to: Step }) {
    return (
      <button
        onClick={() => setStep(to)}
        className="flex items-center gap-1 mb-5"
        style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer", fontSize: 13 }}
      >
        <ArrowLeft size={14} /> Back
      </button>
    );
  }

  if (step === "success") return (
    <div style={{ padding: "40px 18px", textAlign: "center" }} className="animate-fadeUp">
      <CheckCircle size={60} color="#00E5A0" className="mx-auto" />
      <div
        className="font-black mt-4"
        style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 24, color: "#00E5A0" }}
      >
        Withdrawal Submitted!
      </div>
      <div style={{ color: "var(--txt2)", marginTop: 8, fontSize: 14 }}>
        <strong style={{ color: "#fff" }}>${parsedAmt.toFixed(2)}</strong> is being processed.
        Delivery: <strong style={{ color: "#fff" }}>1–2 business days</strong>
      </div>
      <div
        style={{
          margin: "24px 0", background: "var(--s1)", borderRadius: 16, padding: "18px",
          border: "1px solid var(--b2)", textAlign: "left",
        }}
      >
        <div className="font-mono" style={{ fontSize: 10, color: "var(--txt2)", letterSpacing: 1, marginBottom: 8 }}>
          TRANSACTION REF
        </div>
        <div className="font-mono" style={{ color: "var(--cyan)", fontSize: 13 }}>
          TXN-{Date.now().toString().slice(-8)}
        </div>
      </div>
      <button
        onClick={() => { setStep("main"); setAmount(""); setBank(""); setAcct(""); setMethod(null); }}
        style={{
          padding: "14px 40px", borderRadius: 12, border: "none",
          background: "linear-gradient(135deg,#00D4FF,#0055DD)", color: "#fff",
          fontFamily: "-apple-system-ui-serif,sans-serif", fontWeight: 700, fontSize: 15, cursor: "pointer",
        }}
      >
        Back to Wallet
      </button>
    </div>
  );

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
      <div style={{ padding: "24px 18px" }} className="animate-fadeUp">
        <BackBtn to="amount" />
        <div className="font-black mb-5" style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 22 }}>
          Confirm Withdrawal
        </div>
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between py-3" style={{ borderBottom: "1px solid var(--b1)" }}>
            <span style={{ color: "var(--txt2)", fontSize: 14 }}>{k}</span>
            <span className="font-semibold" style={{ fontSize: 14 }}>{v}</span>
          </div>
        ))}
        <button
          onClick={() => {
            setUser(u => ({ ...u, salary: Math.max(0, u.salary - parsedAmt) }));
            setStep("success");
          }}
          className="w-full font-bold mt-6"
          style={{
            padding: "15px", borderRadius: 12, border: "none",
            background: "linear-gradient(135deg,#00E5A0,#00B37E)", color: "#000",
            fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 15, cursor: "pointer",
          }}
        >
          Confirm & Submit →
        </button>
      </div>
    );
  }

  if (step === "amount") return (
    <div style={{ padding: "24px 18px" }} className="animate-fadeUp">
      <BackBtn to="method" />
      <div className="font-black mb-[18px]" style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 22 }}>
        Enter Amount
      </div>
      <div className="mb-3.5">
        <div className="font-mono mb-1.5" style={{ fontSize: 10, color: "var(--txt2)", letterSpacing: 1 }}>
          WITHDRAWAL AMOUNT
        </div>
        <div className="relative">
          <span
            className="absolute font-bold font-mono"
            style={{ left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, color: "var(--cyan)" }}
          >
            $
          </span>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="0.00"
            style={{ ...inputStyle, paddingLeft: 36, fontSize: 22, fontWeight: 700 }}
          />
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: "var(--txt2)" }}>
          Available: <strong style={{ color: "#00E5A0" }}>${user.salary.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> · Min: $10.00
        </div>
      </div>
      {method === "bank" && (
        <>
          <div className="mb-3">
            <div className="font-mono mb-1.5" style={{ fontSize: 10, color: "var(--txt2)", letterSpacing: 1 }}>BANK NAME</div>
            <input value={bank} onChange={e => setBank(e.target.value)} placeholder="e.g. Zenith Bank, GTBank..." style={inputStyle} />
          </div>
          <div className="mb-[18px]">
            <div className="font-mono mb-1.5" style={{ fontSize: 10, color: "var(--txt2)", letterSpacing: 1 }}>ACCOUNT NUMBER</div>
            <input value={acct} onChange={e => setAcct(e.target.value)} placeholder="10-digit account number" style={inputStyle} />
          </div>
        </>
      )}
      <button
        disabled={!amount || parsedAmt < 10 || parsedAmt > user.salary}
        onClick={() => setStep("confirm")}
        className="w-full font-bold"
        style={{
          padding: "15px", borderRadius: 12, border: "none",
          background: amount && parsedAmt >= 10 && parsedAmt <= user.salary ? "linear-gradient(135deg,#00D4FF,#0055DD)" : "var(--s3)",
          color: amount && parsedAmt >= 10 ? "#fff" : "var(--txt3)",
          fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 15, cursor: "pointer",
        }}
      >
        Continue →
      </button>
    </div>
  );

  if (step === "method") return (
    <div style={{ padding: "24px 18px" }} className="animate-fadeUp">
      <BackBtn to="main" />
      <div className="font-black mb-1.5" style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 22 }}>
        Choose Method
      </div>
      <div style={{ fontSize: 13, color: "var(--txt2)", marginBottom: 22 }}>Select your preferred withdrawal channel.</div>
      {methods.map(m => (
        <div
          key={m.id}
          onClick={() => { setMethod(m.id); setStep("amount"); }}
          className="flex items-center gap-3.5 cursor-pointer mb-2.5"
          style={{
            background: "var(--s1)",
            border: `1px solid ${method === m.id ? m.c + "55" : "var(--b1)"}`,
            borderRadius: 14, padding: "16px",
          }}
        >
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 46, height: 46, borderRadius: 12,
              background: `${m.c}18`, border: `1px solid ${m.c}30`,
            }}
          >
            <m.Icon size={22} color={m.c} />
          </div>
          <div className="flex-1">
            <div className="font-semibold" style={{ fontSize: 15 }}>{m.label}</div>
            <div style={{ fontSize: 12, color: "var(--txt2)", marginTop: 2 }}>{m.sub}</div>
          </div>
          <ChevronRight size={16} color="var(--txt2)" />
        </div>
      ))}
    </div>
  );

  // main
  return (
    <div className="animate-fadeUp">
      <div
        style={{
          background: "linear-gradient(150deg,#081428,#0C2044,#081830)",
          padding: "26px 18px 24px",
          borderRadius: "0 0 24px 24px",
          marginBottom: 20,
        }}
      >
        <div className="font-black mb-4" style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 22 }}>
          My Wallet
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: "var(--txt2)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 6 }}>
          Salary Balance
        </div>
        <div
          className="font-black"
          style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 46, letterSpacing: -1.5, lineHeight: 1 }}
        >
          <span style={{ fontSize: 22, color: "var(--cyan)", verticalAlign: "top", marginTop: 10, display: "inline-block" }}>$</span>
          {user.salary.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: 12, color: "var(--txt2)", marginTop: 8 }}>
          Total earned: <strong style={{ color: "#00E5A0" }}>${(user.salary + 1023.8).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong>
          {" · "}Withdrawn: <strong style={{ color: "#FF4D6D" }}>$1,023.80</strong>
        </div>

        <div className="flex gap-2.5 mt-[18px]">
          <button
            onClick={() => canWithdraw && setStep("method")}
            className="flex-1 flex items-center justify-center gap-2 font-bold"
            style={{
              padding: "13px", borderRadius: 12, border: "none",
              background: canWithdraw ? "linear-gradient(135deg,#00E5A0,#00B37E)" : "var(--s3)",
              color: canWithdraw ? "#000" : "var(--txt3)",
              fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 14,
              cursor: canWithdraw ? "pointer" : "not-allowed",
            }}
          >
            <Banknote size={16} /> Withdraw
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 font-semibold"
            style={{
              padding: "13px", borderRadius: 12,
              border: "1px solid var(--b2)", background: "var(--s1)",
              color: "var(--txt)", fontSize: 14, cursor: "pointer",
            }}
          >
            <BarChart2 size={16} /> Report
          </button>
        </div>

        {!canWithdraw && (
          <div className="flex items-center gap-1.5 mt-2.5 font-mono" style={{ fontSize: 11, color: "var(--txt3)" }}>
            <AlertTriangle size={11} />
            {!user.trainingDone ? "Complete training first" : !user.lensActivated ? "Activate your Annotation Lens" : "Min withdrawal: $10.00"}
          </div>
        )}
      </div>

      <div style={{ padding: "0 18px" }}>
        {/* Stats row */}
        <div className="flex gap-2 mb-4">
          {([
            ["This Month", `$${(user.salary * 0.6).toFixed(2)}`, "#00D4FF"],
            ["Withdrawn", "$1,023.80", "#FF4D6D"],
            ["Pending", "$0.00", "#FFB800"],
          ] as [string, string, string][]).map(([l, v, c]) => (
            <div
              key={l}
              className="flex-1 rounded-xl"
              style={{ background: "var(--s1)", border: "1px solid var(--b1)", padding: "10px 11px" }}
            >
              <div className="font-mono" style={{ fontSize: 9, color: "var(--txt2)", letterSpacing: 1 }}>{l.toUpperCase()}</div>
              <div
                className="font-bold mt-1"
                style={{ fontFamily: "-apple-system-ui-serif,sans-serif", color: c, fontSize: 15 }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>

        {/* Next payout */}
        <div
          className="flex items-center gap-2.5 mb-4"
          style={{ background: "rgba(0,229,160,.07)", border: "1px solid rgba(0,229,160,.22)", borderRadius: 12, padding: "12px 14px" }}
        >
          <Calendar size={18} color="#00E5A0" className="flex-shrink-0" />
          <div>
            <div className="font-semibold" style={{ fontSize: 13, color: "#00E5A0" }}>Next Payout: Friday, May 23</div>
            <div style={{ fontSize: 11, color: "var(--txt2)", marginTop: 1 }}>Your salary will be processed automatically</div>
          </div>
        </div>

        {/* Transaction history */}
        <div className="font-bold mb-3" style={{ fontFamily: "-apple-system-ui-serif,sans-serif", fontSize: 15 }}>
          Transaction History
        </div>
        {txns.map((t, i) => (
          <div
            key={i}
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: "1px solid var(--b1)" }}
          >
            <div
              className="flex items-center justify-center flex-shrink-0"
              style={{
                width: 38, height: 38, borderRadius: 10,
                background: t.type === "earn" ? "rgba(0,229,160,.1)" : "rgba(255,77,109,.1)",
              }}
            >
              {t.type === "earn"
                ? <ArrowDownToLine size={16} color="#00E5A0" />
                : <ArrowUpFromLine size={16} color="#FF4D6D" />
              }
            </div>
            <div className="flex-1">
              <div className="font-medium" style={{ fontSize: 13 }}>{t.desc}</div>
              <div style={{ fontSize: 11, color: "var(--txt2)", marginTop: 2 }}>{t.date}</div>
            </div>
            <div className="font-mono font-semibold" style={{ color: t.c, fontSize: 13 }}>{t.amt}</div>
          </div>
        ))}
        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
