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
  const [step, setStep] = useState<"form" | "done">(user.kycDone ? "done" : "form");
  const [docType, setDocType] = useState("");
  const [fname, setFname] = useState("");
  const [lname, setLname] = useState("");
  const [dob, setDob] = useState("");
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
      <div className="animate-fadeUp flex flex-col items-center justify-center text-center" style={{ padding: "40px 18px", minHeight: 400 }}>
        <CheckCircle size={64} style={{ color: "#00E5A0", marginBottom: 16 }} />
        <div style={{ fontWeight: 800, fontSize: 24, color: "#00E5A0", marginBottom: 10 }}>Identity Verified</div>
        <div style={{ fontSize: 14, color: "var(--txt2)", lineHeight: 1.7, marginBottom: 24 }}>
          Your account is fully verified. Withdrawals are now enabled with no limits.
        </div>
        <button
          onClick={onBack}
          style={{
            padding: "14px 40px",
            borderRadius: 12,
            border: "none",
            background: "linear-gradient(135deg,#00D4FF,#0055DD)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 15,
            cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeUp" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(145deg,#081428,#0C1E40)",
          padding: "24px 18px 20px",
          borderRadius: "0 0 24px 24px",
          marginBottom: 20,
        }}
      >
        <div className="flex items-center gap-3 mb-1">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg"
            style={{ background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}
          >
            <ArrowLeft size={18} />
          </button>
          <div style={{ fontWeight: 800, fontSize: 20 }}>ID Verification</div>
        </div>
        <div style={{ fontSize: 13, color: "var(--txt2)", marginLeft: 44 }}>
          Required for withdrawals above $50
        </div>
      </div>

      <div style={{ padding: "0 16px" }}>
        {/* Security Banner */}
        <div
          className="flex gap-3 items-start rounded-xl mb-5"
          style={{
            background: "rgba(255,184,0,.08)",
            border: "1px solid rgba(255,184,0,.22)",
            padding: "12px 14px",
          }}
        >
          <Lock size={18} style={{ color: "#FFB800", flexShrink: 0, marginTop: 1 }} />
          <div>
            <div style={{ fontWeight: 600, fontSize: 13, color: "#FFB800", marginBottom: 2 }}>
              Your data is secure
            </div>
            <div style={{ fontSize: 12, color: "var(--txt2)" }}>
              DEELAi uses 256-bit encryption. Your documents are never shared with third parties.
            </div>
          </div>
        </div>

        {/* Form Fields */}
        {[
          { label: "First Name", value: fname, setter: setFname, type: "text", ph: "e.g. Amara" },
          { label: "Last Name", value: lname, setter: setLname, type: "text", ph: "e.g. Osei" },
          { label: "Date of Birth", value: dob, setter: setDob, type: "date", ph: "" },
        ].map(({ label, value, setter, type, ph }) => (
          <div key={label} style={{ marginBottom: 14 }}>
            <div
              style={{
                fontSize: 11,
                color: "var(--txt2)",
                fontFamily: "monospace",
                letterSpacing: 1,
                marginBottom: 6,
              }}
            >
              {label.toUpperCase()}
            </div>
            <input
              type={type}
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={ph}
              style={{
                width: "100%",
                padding: "13px 14px",
                borderRadius: 12,
                background: "var(--s2)",
                border: "1px solid var(--b2)",
                color: "#fff",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>
        ))}

        {/* Doc Type */}
        <div style={{ marginBottom: 20 }}>
          <div
            style={{
              fontSize: 11,
              color: "var(--txt2)",
              fontFamily: "monospace",
              letterSpacing: 1,
              marginBottom: 8,
            }}
          >
            DOCUMENT TYPE
          </div>
          <div className="flex gap-2">
            {docTypes.map((d) => (
              <button
                key={d}
                onClick={() => setDocType(d)}
                style={{
                  flex: 1,
                  padding: "10px 4px",
                  borderRadius: 10,
                  border: `1px solid ${docType === d ? "var(--cyan)" : "var(--b2)"}`,
                  background: docType === d ? "var(--cyan-d)" : "var(--s2)",
                  color: docType === d ? "var(--cyan)" : "var(--txt2)",
                  fontSize: 11,
                  cursor: "pointer",
                  fontFamily: "monospace",
                }}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={submit}
          disabled={!canSubmit || submitting}
          className="flex items-center justify-center gap-3 w-full"
          style={{
            padding: 15,
            borderRadius: 12,
            border: "none",
            background: canSubmit ? "linear-gradient(135deg,#00D4FF,#0055DD)" : "var(--s3)",
            color: canSubmit ? "#fff" : "var(--txt3)",
            fontWeight: 700,
            fontSize: 15,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          {submitting ? (
            <>
              <Spinner />
              Verifying…
            </>
          ) : (
            "Submit Verification →"
          )}
        </button>

        <div style={{ height: 24 }} />
      </div>
    </div>
  );
}
