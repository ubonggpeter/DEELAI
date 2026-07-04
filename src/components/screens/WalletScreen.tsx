"use client";
import { useState, useEffect, useRef } from "react";
import {
  Banknote, BarChart2, Building2, Bitcoin, CreditCard,
  Calendar, ArrowDownToLine, ArrowUpFromLine, CheckCircle,
  AlertTriangle, ChevronRight, ArrowLeft, Briefcase, Users,
  Download, QrCode,
} from "lucide-react";
import { User } from "@/lib/types";

interface Props {
  user: User;
  setUser: (fn: (u: User) => User) => void;
}

type Step = "main" | "wallet-select" | "method" | "amount" | "confirm" | "receipt";

const methods = [
  { id: "Bank Transfer",  Icon: Building2,  label: "Bank Transfer",  sub: "1–2 business days", c: "#00D4FF" },
  { id: "USDT / Crypto",  Icon: Bitcoin,    label: "USDT / Crypto",  sub: "Within 2 hours",    c: "#F7931A" },
  { id: "PayPal",         Icon: CreditCard, label: "PayPal",         sub: "Same day",           c: "#0079C1" },
];

const inputCls = "w-full rounded-xl bg-[#101829] border border-white/10 text-white text-sm sm:text-base outline-none px-3.5 py-3 sm:py-3.5";

export default function WalletScreen({ user, setUser }: Props) {
  const [step,         setStep]         = useState<Step>("main");
  const [walletType,   setWalletType]   = useState<"work" | "recruit">("work");
  const [method,       setMethod]       = useState<string | null>(null);
  const [amount,       setAmount]       = useState("");
  const [bank,         setBank]         = useState("");
  const [acct,         setAcct]         = useState("");
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState("");
  const [txnRef,       setTxnRef]       = useState("");
  const [qrDataUrl,    setQrDataUrl]    = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const workBalance    = user.salary;
  const recruitBalance = user.recruitWallet ?? 0;
  const activeBalance  = walletType === "work" ? workBalance : recruitBalance;
  const parsedAmt      = parseFloat(amount || "0");
  const canWithdraw    = user.trainingDone && user.lensActivated;

  // Generate QR code whenever txnRef changes
  useEffect(() => {
    if (!txnRef) return;
    import("qrcode").then((QRCode) => {
      QRCode.toDataURL(txnRef, { width: 200, margin: 2, color: { dark: "#00D4FF", light: "#060A12" } })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(""));
    });
  }, [txnRef]);

  function BackBtn({ to }: { to: Step }) {
    return (
      <button
        onClick={() => { setStep(to); setError(""); }}
        className="flex items-center gap-1.5 mb-5 text-sm min-h-[44px]"
        style={{ background: "none", border: "none", color: "var(--txt2)", cursor: "pointer" }}
      >
        <ArrowLeft size={15} /> Back
      </button>
    );
  }

  async function confirmWithdraw() {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletType, amount: parsedAmt, method }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Withdrawal failed"); setLoading(false); return; }
      setUser(u => ({
        ...u,
        salary:        data.newWorkWallet    ?? u.salary,
        recruitWallet: data.newRecruitWallet ?? u.recruitWallet,
      }));
      setTxnRef(data.ref ?? `TXN-${Date.now()}`);
      setStep("receipt");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function downloadReceipt() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const W = 420, H = 560;
    canvas.width = W; canvas.height = H;
    ctx.fillStyle = "#060A12";
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#1E2A42";
    ctx.lineWidth = 1;
    ctx.strokeRect(10, 10, W - 20, H - 20);
    ctx.fillStyle = "#00D4FF";
    ctx.font = "bold 22px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("DEELAi", W / 2, 52);
    ctx.fillStyle = "#7D8BAA";
    ctx.font = "12px system-ui";
    ctx.fillText("WITHDRAWAL RECEIPT", W / 2, 74);
    ctx.fillStyle = "#EEF2FF";
    ctx.font = "bold 32px system-ui";
    ctx.fillText(`$${parsedAmt.toFixed(2)}`, W / 2, 128);
    ctx.fillStyle = "#7D8BAA";
    ctx.font = "11px monospace";
    ctx.fillText(txnRef, W / 2, 155);
    const rows = [
      ["Method",     method ?? ""],
      ["Wallet",     walletType === "work" ? "Work Wallet" : "Recruit Earnings"],
      ["Status",     "Pending"],
      ["Date",       new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" })],
    ];
    rows.forEach(([k, v], i) => {
      const y = 200 + i * 40;
      ctx.fillStyle = "#7D8BAA";
      ctx.font = "11px system-ui";
      ctx.textAlign = "left";
      ctx.fillText(k, 40, y);
      ctx.fillStyle = "#EEF2FF";
      ctx.font = "bold 13px system-ui";
      ctx.textAlign = "right";
      ctx.fillText(v, W - 40, y);
      ctx.strokeStyle = "#1E2A42";
      ctx.beginPath(); ctx.moveTo(40, y + 10); ctx.lineTo(W - 40, y + 10); ctx.stroke();
    });
    if (qrDataUrl) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, W / 2 - 60, 380, 120, 120);
        ctx.fillStyle = "#4A5470";
        ctx.font = "10px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("Scan QR to verify transaction", W / 2, 516);
        const link = document.createElement("a");
        link.download = `receipt-${txnRef}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      };
      img.src = qrDataUrl;
    } else {
      const link = document.createElement("a");
      link.download = `receipt-${txnRef}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    }
  }

  /* ── Receipt ── */
  if (step === "receipt") return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 text-center animate-fadeUp">
      <CheckCircle size={64} color="#00E5A0" className="mx-auto mb-4" />
      <h2 className="font-black text-2xl sm:text-3xl mb-2" style={{ color: "#00E5A0" }}>Withdrawal Submitted!</h2>
      <p className="text-sm sm:text-base mb-6" style={{ color: "var(--txt2)" }}>
        <strong className="text-white">${parsedAmt.toFixed(2)}</strong> from your{" "}
        <strong className="text-white">{walletType === "work" ? "Work Wallet" : "Recruit Earnings"}</strong> is being processed.
      </p>

      {/* Receipt card */}
      <div className="rounded-2xl p-5 text-left mb-4" style={{ background: "var(--s1)", border: "1px solid var(--b2)" }}>
        <div className="font-mono text-[10px] tracking-widest mb-3 text-center" style={{ color: "var(--txt2)" }}>TRANSACTION RECEIPT</div>
        {[
          ["Reference",  txnRef],
          ["Amount",     `$${parsedAmt.toFixed(2)}`],
          ["Method",     method ?? ""],
          ["Wallet",     walletType === "work" ? "Work Wallet" : "Recruit Earnings"],
          ["Status",     "Pending"],
          ["Date",       new Date().toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" })],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between py-2 text-sm" style={{ borderBottom: "1px solid var(--b1)" }}>
            <span style={{ color: "var(--txt2)" }}>{k}</span>
            <span className="font-mono font-semibold" style={{ color: k === "Reference" ? "var(--cyan)" : "var(--txt)" }}>{v}</span>
          </div>
        ))}

        {/* QR code */}
        {qrDataUrl && (
          <div className="flex flex-col items-center mt-5">
            <div className="font-mono text-[9px] tracking-widest mb-2" style={{ color: "var(--txt3)" }}>
              <QrCode size={11} className="inline mr-1" style={{ verticalAlign: "middle" }} />
              SCAN TO VERIFY
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrDataUrl} alt="QR Code" className="rounded-xl" style={{ width: 140, height: 140, border: "1px solid var(--b2)" }} />
            <div className="font-mono text-[9px] mt-2" style={{ color: "var(--txt3)" }}>Encodes: {txnRef}</div>
          </div>
        )}
      </div>

      <button
        onClick={downloadReceipt}
        className="flex items-center justify-center gap-2 w-full font-semibold text-sm min-h-[46px] rounded-xl border mb-3 cursor-pointer"
        style={{ background: "var(--s1)", border: "1px solid var(--b2)", color: "var(--txt2)" }}
      >
        <Download size={15} /> Download Receipt
      </button>
      <button
        onClick={() => { setStep("main"); setAmount(""); setBank(""); setAcct(""); setMethod(null); setTxnRef(""); setQrDataUrl(""); }}
        className="w-full font-bold text-black text-base min-h-[50px] rounded-xl border-none cursor-pointer"
        style={{ background: "linear-gradient(135deg,#00D4FF,#0055DD)" }}
      >
        Back to Wallet
      </button>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );

  /* ── Confirm ── */
  if (step === "confirm") {
    const meth = methods.find(m => m.id === method);
    const rows = [
      ["Amount", `$${parsedAmt.toFixed(2)}`],
      ["Wallet", walletType === "work" ? "Work Wallet" : "Recruit Earnings"],
      ["Method", meth?.label || "—"],
      ...(method === "Bank Transfer" ? [["Bank", bank || "—"], ["Account", acct || "—"]] : []),
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
        {error && (
          <div className="flex items-center gap-2 mt-4 rounded-xl px-3 py-2.5 text-sm" style={{ background: "rgba(255,77,109,.1)", border: "1px solid rgba(255,77,109,.3)", color: "#FF4D6D" }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}
        <button
          onClick={confirmWithdraw}
          disabled={loading}
          className="w-full font-bold text-black text-base min-h-[50px] rounded-xl border-none cursor-pointer mt-6"
          style={{ background: loading ? "var(--s3)" : "linear-gradient(135deg,#00E5A0,#00B37E)", color: loading ? "var(--txt3)" : "#000" }}
        >
          {loading ? "Processing…" : "Confirm & Submit →"}
        </button>
      </div>
    );
  }

  /* ── Amount ── */
  if (step === "amount") return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeUp">
      <BackBtn to="method" />
      <h2 className="font-black text-xl sm:text-2xl mb-1">Enter Amount</h2>
      <p className="text-sm mb-5" style={{ color: "var(--txt2)" }}>
        Withdrawing from: <strong style={{ color: walletType === "work" ? "var(--cyan)" : "var(--green)" }}>
          {walletType === "work" ? "Work Wallet" : "Recruit Earnings"}
        </strong>
      </p>
      <div className="mb-4">
        <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: "var(--txt2)" }}>WITHDRAWAL AMOUNT</div>
        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-lg font-mono" style={{ color: "var(--cyan)" }}>$</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" className={inputCls} style={{ paddingLeft: 30, fontSize: 22, fontWeight: 700 }} />
        </div>
        <p className="text-xs mt-1.5" style={{ color: "var(--txt2)" }}>
          Available: <strong style={{ color: "#00E5A0" }}>${activeBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong> · Min: $10.00
        </p>
      </div>
      {method === "Bank Transfer" && (
        <>
          <div className="mb-3">
            <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: "var(--txt2)" }}>BANK NAME</div>
            <input value={bank} onChange={e => setBank(e.target.value)} placeholder="e.g. Zenith Bank, GTBank…" className={inputCls} />
          </div>
          <div className="mb-5">
            <div className="font-mono text-[10px] tracking-widest mb-2" style={{ color: "var(--txt2)" }}>ACCOUNT NUMBER</div>
            <input value={acct} onChange={e => setAcct(e.target.value)} placeholder="10-digit account number" className={inputCls} />
          </div>
        </>
      )}
      <button
        disabled={!amount || parsedAmt < 10 || parsedAmt > activeBalance}
        onClick={() => setStep("confirm")}
        className="w-full font-bold text-base min-h-[50px] rounded-xl border-none cursor-pointer"
        style={{
          background: amount && parsedAmt >= 10 && parsedAmt <= activeBalance ? "linear-gradient(135deg,#00D4FF,#0055DD)" : "var(--s3)",
          color: amount && parsedAmt >= 10 && parsedAmt <= activeBalance ? "#fff" : "var(--txt3)",
        }}
      >
        Continue →
      </button>
    </div>
  );

  /* ── Method ── */
  if (step === "method") return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeUp">
      <BackBtn to="wallet-select" />
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

  /* ── Wallet Select ── */
  if (step === "wallet-select") return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 sm:py-8 animate-fadeUp">
      <BackBtn to="main" />
      <h2 className="font-black text-xl sm:text-2xl mb-1">Choose Wallet</h2>
      <p className="text-sm mb-6" style={{ color: "var(--txt2)" }}>Select which wallet to withdraw from.</p>
      <div className="space-y-3">
        <div
          onClick={() => { setWalletType("work"); setStep("method"); }}
          className="flex items-center gap-4 rounded-2xl p-4 sm:p-5 cursor-pointer transition-colors"
          style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}
        >
          <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 48, height: 48, background: "rgba(0,212,255,.12)", border: "1px solid rgba(0,212,255,.3)" }}>
            <Briefcase size={22} color="var(--cyan)" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm sm:text-base">Work Wallet</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>Earnings from annotation jobs</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-bold text-base" style={{ color: "var(--cyan)" }}>${workBalance.toFixed(2)}</div>
          </div>
          <ChevronRight size={16} color="var(--txt2)" />
        </div>
        <div
          onClick={() => { setWalletType("recruit"); setStep("method"); }}
          className="flex items-center gap-4 rounded-2xl p-4 sm:p-5 cursor-pointer transition-colors"
          style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}
        >
          <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 48, height: 48, background: "rgba(0,229,160,.12)", border: "1px solid rgba(0,229,160,.3)" }}>
            <Users size={22} color="#00E5A0" />
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm sm:text-base">Recruit Earnings</div>
            <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>Referral bonuses &amp; recruit commissions</div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-bold text-base" style={{ color: "#00E5A0" }}>${recruitBalance.toFixed(2)}</div>
          </div>
          <ChevronRight size={16} color="var(--txt2)" />
        </div>
      </div>
    </div>
  );

  /* ── Main ── */
  return (
    <div className="animate-fadeUp">
      {/* Header with two wallet cards */}
      <div className="rounded-b-3xl mb-6" style={{ background: "linear-gradient(150deg,#081428,#0C2044,#081830)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <h1 className="font-black text-2xl sm:text-3xl mb-5" style={{ fontFamily: "system-ui,sans-serif" }}>My Wallet</h1>

          {/* Two wallet cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {/* Work Wallet */}
            <div className="rounded-2xl p-4" style={{ background: "rgba(0,212,255,.08)", border: "1px solid rgba(0,212,255,.25)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase size={14} color="var(--cyan)" />
                <div className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--txt2)" }}>Work Wallet</div>
              </div>
              <div className="font-black text-2xl sm:text-3xl leading-none mb-1" style={{ color: "var(--cyan)" }}>
                ${workBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs" style={{ color: "var(--txt3)" }}>Annotation job earnings</div>
            </div>
            {/* Recruit Earnings */}
            <div className="rounded-2xl p-4" style={{ background: "rgba(0,229,160,.08)", border: "1px solid rgba(0,229,160,.25)" }}>
              <div className="flex items-center gap-2 mb-2">
                <Users size={14} color="#00E5A0" />
                <div className="font-mono text-[10px] tracking-widest uppercase" style={{ color: "var(--txt2)" }}>Recruit Earnings</div>
              </div>
              <div className="font-black text-2xl sm:text-3xl leading-none mb-1" style={{ color: "#00E5A0" }}>
                ${recruitBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-xs" style={{ color: "var(--txt3)" }}>Referral &amp; recruit bonuses</div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => canWithdraw && setStep("wallet-select")}
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
        <div className="lg:grid lg:grid-cols-2 lg:gap-10">
          {/* Left: stats + payout */}
          <div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {([
                ["Total Work",    `$${workBalance.toFixed(2)}`,    "#00D4FF"],
                ["Total Recruit", `$${recruitBalance.toFixed(2)}`, "#00E5A0"],
                ["Pending",       "$0.00",                         "#FFB800"],
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
                <div className="font-semibold text-sm" style={{ color: "#00E5A0" }}>Next Payout: Friday</div>
                <div className="text-xs mt-0.5" style={{ color: "var(--txt2)" }}>Work wallet processed automatically</div>
              </div>
            </div>
          </div>

          {/* Right: recent transactions */}
          <div>
            <h2 className="font-bold text-base sm:text-lg mb-3">Transaction History</h2>
            <div className="space-y-0">
              {[
                { type: "earn",     desc: "Annotation Job #A-2291",       amt: "+$2.50",  date: "Today",     c: "#00E5A0" },
                { type: "earn",     desc: "Annotation Job #A-2290",       amt: "+$1.80",  date: "Today",     c: "#00E5A0" },
                { type: "recruit",  desc: "Recruit Bonus — Fatima Bello", amt: "+$40.00", date: "Yesterday", c: "#00D4FF" },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid var(--b1)" }}>
                  <div
                    className="flex items-center justify-center rounded-xl shrink-0"
                    style={{ width: 40, height: 40, background: t.type === "earn" ? "rgba(0,229,160,.1)" : t.type === "recruit" ? "rgba(0,212,255,.1)" : "rgba(255,77,109,.1)" }}
                  >
                    {t.type === "recruit" ? <Users size={16} color="#00D4FF" /> :
                     t.type === "earn"    ? <ArrowDownToLine size={16} color="#00E5A0" /> :
                                           <ArrowUpFromLine size={16} color="#FF4D6D" />}
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
