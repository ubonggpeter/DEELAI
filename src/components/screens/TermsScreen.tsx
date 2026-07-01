"use client";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";

interface Props {
  onBack: () => void;
}

const termsSections: [string, string][] = [
  ["1. Eligibility",          "You must be 18 or older and legally permitted to work remotely. DEELAi reserves the right to verify your identity before activating your account."],
  ["2. Payment Terms",        "Salaries are paid every Friday via your registered payment method. The minimum withdrawal is $10. DEELAi charges no processing fees."],
  ["3. Job Standards",        "Workers must maintain a minimum 90% accuracy score. Accounts that fall below this threshold enter a mandatory performance review period."],
  ["4. Termination",          "DEELAi may terminate accounts for fraud, repeated low-quality submissions, or violation of client data policies."],
  ["5. Intellectual Property","All data produced on DEELAi remains the property of the respective AI clients. Workers may not reproduce or distribute any dataset materials."],
];

const privacySections: [string, string][] = [
  ["Data We Collect", "We collect your name, contact details, payment information, and job performance data to operate the platform and process payouts."],
  ["How We Use It",   "Your data is used solely for platform operations, salary processing, and improving annotation quality. We do not sell your personal data."],
  ["Data Security",   "All data is encrypted with 256-bit SSL. Payment details are processed through PCI-DSS compliant systems."],
  ["Your Rights",     "You may request deletion of your account and personal data at any time by contacting support@deelai.uk."],
  ["Cookies",         "We use essential cookies for authentication only. No tracking or advertising cookies are used."],
];

export default function TermsScreen({ onBack }: Props) {
  const [tab, setTab] = useState<"terms" | "privacy">("terms");

  const sections     = tab === "terms" ? termsSections : privacySections;
  const headingColor = tab === "terms" ? "var(--cyan)" : "#8B5CF6";

  return (
    <div className="animate-fadeUp w-full" style={{ background: "var(--bg)", minHeight: "100%" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(145deg,#081428,#0C1E40)" }} className="rounded-b-3xl mb-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-5">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={onBack}
              className="flex items-center justify-center w-9 h-9 rounded-xl min-h-[44px] min-w-[44px]"
              style={{ background: "var(--b1)", color: "var(--txt2)", border: "none", cursor: "pointer" }}>
              <ArrowLeft size={18} />
            </button>
            <div className="text-xl sm:text-2xl font-black text-white">Terms & Privacy</div>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 rounded-xl" style={{ background: "var(--s2)" }}>
            {(["terms", "privacy"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className="flex-1 py-2.5 rounded-lg transition-all duration-200 text-sm sm:text-base font-semibold cursor-pointer"
                style={{
                  border: "none",
                  background: tab === t ? "var(--cyan)" : "transparent",
                  color: tab === t ? "#000" : "var(--txt2)",
                }}>
                {t === "terms" ? "Terms of Service" : "Privacy Policy"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          {sections.map(([heading, body]) => (
            <div key={heading} className="rounded-2xl p-4 sm:p-5"
              style={{ background: "var(--s1)", border: "1px solid var(--b1)" }}>
              <div className="text-sm font-bold mb-2" style={{ color: headingColor }}>{heading}</div>
              <div className="text-xs sm:text-sm leading-relaxed" style={{ color: "var(--txt2)" }}>{body}</div>
            </div>
          ))}
        </div>

        <div className="text-xs text-center" style={{ color: "var(--txt3)" }}>
          Last updated: May 1, 2026 · DEELAi UK Limited · deelai.uk
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
