"use client";
import { useState } from "react";
import { ArrowLeft, Lock, CheckCircle } from "lucide-react";
import Spinner from "@/components/atoms/Spinner";
import { User } from "@/lib/types";

interface Props {
  user: User;
  setUser: (fn: (u: User) => User) => void;
  onBack: () => void;
}

const docTypes = ["NIN", "BVN", "Passport", "Voter's Card"];

export default function KYCScreen({ user, setUser, onBack }: Props) {
  const [step, setStep]         = useState<"form" | "done">(user.kycDone ? "done" : "form");
  const [docType, setDocType]   = useState("");
  const [fname, setFname]       = useState("");
  const [lname, setLname]       = useState("");
  const [dob, setDob]           = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = fname && lname && dob && docType;

  const submit = () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setUser((u) => ({ ...u, kycDone: true }));
      setStep("done");
    }, 2500);
  };

  if (step === "done") {
    return (
      <div className="animate-fadeUp flex flex-col items-center justify-center text-center px-4 sm:px-6"
        style={{ minHeight: 400, paddingTop: 60, paddingBottom: 40 }}>
        <CheckCircle size={72} style={{ color: "#00E5A0", marginBottom: 20 }} />
        <div className="text-2xl sm:text-3xl font-black mb-3" style={{ color: "#00E5A0" }}>Identity Verified</div>
        <div className="text-sm sm:text-base leading-relaxed mb-8 max-w-sm" style={{ color: "var(--txt2)" }}>
          Your account is fully verified. Withdrawals are now enabled with no limits.
        </div>
        <button onClick={onBack}
          className="min-h-[52px] px-10 rounded-xl font-bold text-base text-white"
          style={{ background: "linear-gradient(135deg,#00D4FF,#0055DD)", border: "none", cursor: "pointer" }}>
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeUp w-full" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(145deg,#081428,#0C1E40)" }} className="rounded-b-3xl mb-5">
        <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5">
          <div className="flex items-center gap-3 mb-1">
            <button onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl min-h-[44px] min-w-[44px]"
              style={{ background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={18} />
            </button>
            <div className="text-xl sm:text-2xl font-black text-white">ID Verification</div>
          </div>
          <div className="text-xs sm:text-sm pl-12" style={{ color: "var(--txt2)" }}>
            Required for withdrawals above $50
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Security Banner */}
        <div className="flex gap-3 items-start rounded-xl mb-5 p-3 sm:p-4"
          style={{ background: "rgba(255,184,0,.08)", border: "1px solid rgba(255,184,0,.22)" }}>
          <Lock size={18} style={{ color: "#FFB800", flexShrink: 0, marginTop: 2 }} />
          <div>
            <div className="text-sm font-semibold mb-1" style={{ color: "#FFB800" }}>Your data is secure</div>
            <div className="text-xs sm:text-sm" style={{ color: "var(--txt2)" }}>
              DEELAi uses 256-bit encryption. Your documents are never shared with third parties.
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {[
            { label: "First Name",    value: fname, setter: setFname, type: "text", ph: "e.g. Amara" },
            { label: "Last Name",     value: lname, setter: setLname, type: "text", ph: "e.g. Osei" },
          ].map(({ label, value, setter, type, ph }) => (
            <div key={label}>
              <div className="text-[10px] font-mono tracking-widest mb-2" style={{ color: "var(--txt2)" }}>
                {label.toUpperCase()}
              </div>
              <input
                type={type}
                value={value}
                onChange={(e) => setter(e.target.value)}
                placeholder={ph}
                className="w-full rounded-xl text-sm text-white outline-none min-h-[48px]"
                style={{ padding: "13px 14px", background: "var(--s2)", border: "1px solid var(--b2)" }}
              />
            </div>
          ))}
        </div>

        <div className="mb-4">
          <div className="text-[10px] font-mono tracking-widest mb-2" style={{ color: "var(--txt2)" }}>DATE OF BIRTH</div>
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            className="w-full rounded-xl text-sm text-white outline-none min-h-[48px]"
            style={{ padding: "13px 14px", background: "var(--s2)", border: "1px solid var(--b2)" }}
          />
        </div>

        {/* Doc Type */}
        <div className="mb-6">
          <div className="text-[10px] font-mono tracking-widest mb-3" style={{ color: "var(--txt2)" }}>DOCUMENT TYPE</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {docTypes.map((d) => (
              <button key={d} onClick={() => setDocType(d)}
                className="rounded-xl font-mono text-xs sm:text-sm min-h-[48px] cursor-pointer transition-all"
                style={{
                  border: `1px solid ${docType === d ? "var(--cyan)" : "var(--b2)"}`,
                  background: docType === d ? "var(--cyan-d)" : "var(--s2)",
                  color: docType === d ? "var(--cyan)" : "var(--txt2)",
                }}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button onClick={submit} disabled={!canSubmit || submitting}
          className="flex items-center justify-center gap-3 w-full rounded-xl font-bold text-base min-h-[52px]"
          style={{
            border: "none",
            background: canSubmit ? "linear-gradient(135deg,#00D4FF,#0055DD)" : "var(--s3)",
            color: canSubmit ? "#fff" : "var(--txt3)",
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}>
          {submitting ? <><Spinner /> Verifying…</> : "Submit Verification →"}
        </button>

        <div className="h-8" />
      </div>
    </div>
  );
}
