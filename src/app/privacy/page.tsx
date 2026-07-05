import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — DEELAi",
  description: "DEELAi Privacy Policy — how we collect, use, and protect your information.",
};

const C = {
  bg: "#060A12", s1: "#0C1220", s2: "#101829", s3: "#1A2540",
  cyan: "#00D4FF", green: "#00E5A0", gold: "#FFB800", red: "#FF4D6D",
  txt: "#EEF2FF", txt2: "#7D8BAA", txt3: "#4A5470",
};

const EFFECTIVE_DATE = "1 July 2026";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: 36 }}>
      <h2 style={{ color: C.cyan, fontSize: 17, fontWeight: 700, marginBottom: 12, fontFamily: "system-ui,sans-serif" }}>
        {title}
      </h2>
      <div style={{ color: C.txt2, fontSize: 14, lineHeight: 1.8 }}>{children}</div>
    </section>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ marginBottom: 10 }}>{children}</p>;
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ marginBottom: 6, paddingLeft: 4 }}>
      <span style={{ color: C.cyan, marginRight: 8 }}>›</span>{children}
    </li>
  );
}

function Ul({ children }: { children: React.ReactNode }) {
  return <ul style={{ listStyle: "none", padding: 0, margin: "8px 0 12px" }}>{children}</ul>;
}

function Highlight({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: C.txt }}>{children}</strong>;
}

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: C.bg, padding: "32px 16px 80px" }}>
      <div style={{ maxWidth: 760, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <a href="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 28 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: "linear-gradient(135deg,#00D4FF,#0055DD)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#fff", fontSize: 14, fontFamily: "system-ui" }}>D</div>
            <span style={{ fontWeight: 900, fontSize: 18, color: C.txt, fontFamily: "system-ui" }}>DEEL<span style={{ color: C.cyan }}>Ai</span></span>
          </a>
          <h1 style={{ color: C.txt, fontSize: 28, fontWeight: 900, margin: "0 0 8px", fontFamily: "system-ui,sans-serif" }}>
            Privacy Policy
          </h1>
          <p style={{ color: C.txt3, fontSize: 13, margin: 0 }}>Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div style={{ background: C.s1, border: `1px solid ${C.s3}`, borderRadius: 16, padding: "32px 28px" }}>

          <P>
            DEELAi (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is committed to protecting your personal information. This Privacy Policy explains what data we collect, how we use it, and your rights regarding that data.
          </P>

          <Section title="1. Information We Collect">
            <P>We collect the following categories of personal data when you register or use the Platform:</P>
            <Ul>
              <Li><Highlight>Identity data:</Highlight> Full name, email address, phone number.</Li>
              <Li><Highlight>Account data:</Highlight> Password (stored as a one-way hash), permit type, registration channel, approval status.</Li>
              <Li><Highlight>Financial data:</Highlight> Bank account details you provide for withdrawal processing. Payment references from Paystack transactions.</Li>
              <Li><Highlight>Work data:</Highlight> Annotation job submissions, accuracy scores, job history, earnings, and streak data.</Li>
              <Li><Highlight>Profile data:</Highlight> CV/resume files you upload, avatar images.</Li>
              <Li><Highlight>Usage data:</Highlight> Activity logs, module completion status, login timestamps.</Li>
              <Li><Highlight>Communications:</Highlight> Support messages, emails sent to or from DEELAi.</Li>
            </Ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <Ul>
              <Li>To create and manage your account on the Platform.</Li>
              <Li>To process Registration Fee payments via Paystack.</Li>
              <Li>To assess, approve, or reject your registration application.</Li>
              <Li>To deliver annotation jobs and calculate your earnings and accuracy scores.</Li>
              <Li>To process salary withdrawals to your linked bank account.</Li>
              <Li>To track training progress and issue certification status.</Li>
              <Li>To communicate platform updates, approval decisions, and payment notifications via email.</Li>
              <Li>To detect fraud, enforce our Terms of Service, and maintain platform security.</Li>
              <Li>To comply with applicable laws and regulations.</Li>
            </Ul>
          </Section>

          <Section title="3. Data Sharing">
            <P>We do <Highlight>not sell</Highlight> your personal data to third parties. We may share data with:</P>
            <Ul>
              <Li><Highlight>Channel Administrators:</Highlight> Your name, email, application status, and work performance are visible to the administrator of the channel you registered under.</Li>
              <Li><Highlight>Paystack:</Highlight> Your email address and payment amount are shared with Paystack to process Registration Fee payments. Paystack&apos;s own privacy policy governs that data.</Li>
              <Li><Highlight>Supabase / Database providers:</Highlight> Your data is stored on Supabase-hosted PostgreSQL infrastructure.</Li>
              <Li><Highlight>Legal authorities:</Highlight> We may disclose data if required by law, court order, or to protect the rights and safety of DEELAi, users, or third parties.</Li>
            </Ul>
          </Section>

          <Section title="4. Data Retention">
            <Ul>
              <Li>Account data is retained for as long as your account is active or as required to provide services.</Li>
              <Li>Activity logs and job history may be retained for up to 12 months after account closure for audit purposes.</Li>
              <Li>Financial records are retained as required by applicable accounting and tax regulations (typically 7 years).</Li>
              <Li>If your account is terminated due to fraud, data may be retained indefinitely to prevent re-registration.</Li>
            </Ul>
          </Section>

          <Section title="5. Your Rights">
            <P>Depending on your jurisdiction, you may have the right to:</P>
            <Ul>
              <Li><Highlight>Access</Highlight> the personal data we hold about you.</Li>
              <Li><Highlight>Correct</Highlight> inaccurate or incomplete data.</Li>
              <Li><Highlight>Delete</Highlight> your account and associated personal data (subject to retention requirements above).</Li>
              <Li><Highlight>Withdraw consent</Highlight> for optional data processing.</Li>
              <Li><Highlight>Object to processing</Highlight> in certain circumstances.</Li>
            </Ul>
            <P>
              To exercise these rights, email us at{" "}
              <a href="mailto:privacy@deelai.uk" style={{ color: C.cyan }}>privacy@deelai.uk</a>.
              We will respond within 30 days.
            </P>
          </Section>

          <Section title="6. Cookies and Local Storage">
            <P>
              DEELAi uses secure HTTP-only session cookies to authenticate logged-in users. We do not use advertising or tracking cookies. Browser local storage may be used to preserve UI preferences.
            </P>
          </Section>

          <Section title="7. Security">
            <P>
              We implement industry-standard security measures including password hashing (bcrypt), HTTPS encryption, and server-side session management. No method of transmission over the internet is 100% secure; we cannot guarantee absolute security but take reasonable precautions to protect your data.
            </P>
          </Section>

          <Section title="8. Children">
            <P>
              DEELAi is not intended for users under the age of 18. We do not knowingly collect personal data from minors. If you believe a minor has registered, please contact us immediately.
            </P>
          </Section>

          <Section title="9. Changes to This Policy">
            <P>
              We may update this Privacy Policy periodically. We will notify you of significant changes via email or a platform announcement. Continued use of the Platform after changes are posted constitutes your acceptance of the revised Policy.
            </P>
          </Section>

          <Section title="10. Contact">
            <P>
              For privacy-related enquiries:{" "}
              <a href="mailto:privacy@deelai.uk" style={{ color: C.cyan }}>privacy@deelai.uk</a>
              <br />
              For general support:{" "}
              <a href="mailto:support@deelai.uk" style={{ color: C.cyan }}>support@deelai.uk</a>
            </P>
          </Section>

        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
          <a href="/terms" style={{ color: C.cyan, fontSize: 13, textDecoration: "underline" }}>Terms of Service</a>
          <a href="/" style={{ color: C.txt3, fontSize: 13 }}>← Back to DEELAi</a>
        </div>
      </div>
    </div>
  );
}
