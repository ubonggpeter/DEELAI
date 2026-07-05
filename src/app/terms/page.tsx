import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — DEELAi",
  description: "DEELAi Terms of Service and platform usage rules.",
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

function Warn({ children }: { children: React.ReactNode }) {
  return <strong style={{ color: C.red }}>{children}</strong>;
}

export default function TermsPage() {
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
            Terms of Service
          </h1>
          <p style={{ color: C.txt3, fontSize: 13, margin: 0 }}>Effective date: {EFFECTIVE_DATE}</p>
        </div>

        <div style={{ background: C.s1, border: `1px solid ${C.s3}`, borderRadius: 16, padding: "32px 28px" }}>

          <P>
            Welcome to <Highlight>DEELAi</Highlight> (&ldquo;the Platform,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By registering for an account or accessing any part of the Platform, you (&ldquo;User,&rdquo; &ldquo;Contributor,&rdquo; or &ldquo;you&rdquo;) agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). Please read them carefully before proceeding.
          </P>

          <Section title="1. Account Registration and Eligibility">
            <P>To use DEELAi you must:</P>
            <Ul>
              <Li>Be at least 18 years of age (or the age of legal majority in your jurisdiction).</Li>
              <Li>Provide accurate, current, and complete information during registration.</Li>
              <Li>Register through an authorised Channel link provided by a DEELAi Channel Administrator.</Li>
              <Li>Not create more than one account per person.</Li>
              <Li>Not use another person&apos;s credentials or impersonate any individual or entity.</Li>
            </Ul>
            <P>
              DEELAi reserves the right to reject any application at its sole discretion. All registrations are subject to approval by the Channel Administrator and/or DEELAi staff. <Highlight>Approval is not guaranteed.</Highlight>
            </P>
          </Section>

          <Section title="2. Registration Fee and Non-Refundable Policy">
            <P>
              Certain Channels require a one-time <Highlight>Registration Fee</Highlight> (&ldquo;Job Pass Fee&rdquo;) before your account is activated. This fee covers:
            </P>
            <Ul>
              <Li>Access to the DEELAi training curriculum and certification modules.</Li>
              <Li>Access to downloadable training resources, PDF guides, and reference materials.</Li>
              <Li>Platform onboarding tools and the annotation workspace.</Li>
            </Ul>
            <P>
              <Warn>IMPORTANT — NON-REFUNDABLE:</Warn> Once you have accessed, opened, or downloaded any training resource, course material, or PDF document on the Platform, the Registration Fee is <Warn>strictly non-refundable</Warn>, regardless of whether you subsequently complete training, pass the certification quiz, or perform any annotation work.
            </P>
            <P>
              By clicking &ldquo;Pay &amp; Activate Job Pass,&rdquo; you acknowledge and agree that:
            </P>
            <Ul>
              <Li>The fee is for resource access, not a guarantee of employment or income.</Li>
              <Li>No refund will be issued once training materials have been accessed.</Li>
              <Li>If no resources have been accessed and you contact support within 24 hours of payment, your case may be reviewed at our discretion — refunds are not guaranteed.</Li>
            </Ul>
          </Section>

          <Section title="3. Annotation Work Standards and Accuracy Requirements">
            <P>
              DEELAi Contributors are expected to maintain professional annotation quality. The following standards apply to all submitted work:
            </P>
            <Ul>
              <Li><Highlight>Minimum accuracy threshold:</Highlight> You must maintain an accuracy score of at least 90% across submitted annotation batches.</Li>
              <Li><Highlight>Bounding box precision:</Highlight> All bounding boxes must tightly surround the target object. Loose, misaligned, or missing boxes will be marked as errors.</Li>
              <Li><Highlight>Label correctness:</Highlight> Labels applied to objects must match the expected taxonomy provided for each job. Incorrect labels reduce your accuracy score and may result in job rejection.</Li>
              <Li><Highlight>Partial objects:</Highlight> Partially occluded objects must be annotated with the appropriate flag where required.</Li>
              <Li><Highlight>Completeness:</Highlight> All objects in a job must be annotated. Missed objects count as errors.</Li>
            </Ul>
            <P>
              <Highlight>Rejection policy:</Highlight> Individual annotation batches where more than 50% of labels are incorrect may be automatically rejected by the system. Rejected batches do not count toward your earnings for that session. Repeated rejections (more than 3 in a rolling 7-day period) may trigger a mandatory re-training requirement or account review.
            </P>
            <P>
              If your accuracy score drops below 90%, you will be placed in a performance improvement period. Failure to improve within 14 days may result in account suspension.
            </P>
          </Section>

          <Section title="4. Daily Work Limits">
            <Ul>
              <Li><Highlight>Full-Time Permit holders</Highlight> may complete up to 40 job batches per week (approximately 8 per working day).</Li>
              <Li><Highlight>Part-Time Permit holders</Highlight> may complete up to 20 job batches per week (approximately 4 per working day).</Li>
              <Li>Daily limits reset at 00:00 UTC.</Li>
              <Li>Attempting to circumvent daily limits through automated tools, bots, or multiple accounts will result in immediate account termination.</Li>
            </Ul>
          </Section>

          <Section title="5. Withdrawal and Payment Terms">
            <P>Earnings are accumulated in your DEELAi salary wallet and are subject to the following conditions:</P>
            <Ul>
              <Li>Withdrawals are processed on a scheduled payout cycle (typically every Friday, subject to change).</Li>
              <Li>A minimum withdrawal threshold may apply; the current minimum is displayed in your Wallet screen.</Li>
              <Li>Payments are made via the bank account linked to your profile. You are responsible for providing accurate banking details. DEELAi is not liable for payments sent to an incorrectly entered account.</Li>
              <Li>DEELAi reserves the right to withhold payment pending review of suspicious activity, accuracy violations, or disputes.</Li>
              <Li>Earnings derived from rejected batches are not credited to your wallet.</Li>
              <Li>Withdraw requests may take 1–5 business days to process depending on your bank and region.</Li>
            </Ul>
          </Section>

          <Section title="6. Referral Programme">
            <P>DEELAi operates an opt-in referral programme where Contributors can earn bonuses by referring new users:</P>
            <Ul>
              <Li>A referral bonus is credited when a referred user completes their Job Pass payment and is approved.</Li>
              <Li>The referral bonus amount is set by the Channel Administrator and may vary by channel.</Li>
              <Li>Self-referrals (creating a second account to refer yourself) are strictly prohibited and will result in forfeiture of any bonus and possible account termination.</Li>
              <Li>DEELAi reserves the right to modify, pause, or discontinue the referral programme at any time.</Li>
              <Li>Referral bonuses are not guaranteed income and do not constitute employment.</Li>
            </Ul>
          </Section>

          <Section title="7. Account Suspension and Termination">
            <P>DEELAi may suspend or permanently terminate your account for any of the following reasons:</P>
            <Ul>
              <Li>Providing false or misleading information during registration.</Li>
              <Li>Sustained accuracy below the minimum threshold without improvement.</Li>
              <Li>Fraudulent activity, including bot usage, account sharing, or manipulation of the job queue.</Li>
              <Li>Abusive behaviour toward staff, other users, or Channel Administrators.</Li>
              <Li>Violation of any section of these Terms.</Li>
              <Li>Using the Platform in a manner that causes harm to DEELAi or its clients.</Li>
            </Ul>
            <P>
              Upon termination, any unpaid earnings in your wallet that are not disputed will be processed in the regular payout cycle unless the termination was due to fraudulent activity, in which case earnings may be forfeited.
            </P>
          </Section>

          <Section title="8. General Platform Usage Rules">
            <Ul>
              <Li>You may not reverse-engineer, scrape, or attempt to extract proprietary data from the DEELAi Platform.</Li>
              <Li>You may not use automated scripts or bots to interact with the annotation workspace.</Li>
              <Li>You may not share, redistribute, or publish any annotation job content, client data, or internal platform materials.</Li>
              <Li>All annotation work performed on the Platform remains the intellectual property of DEELAi and its clients.</Li>
              <Li>You are solely responsible for maintaining the security of your login credentials.</Li>
              <Li>DEELAi may update these Terms at any time. Continued use of the Platform constitutes acceptance of the revised Terms.</Li>
            </Ul>
          </Section>

          <Section title="9. Disclaimer of Warranties">
            <P>
              The Platform is provided &ldquo;as is&rdquo; without warranties of any kind. DEELAi does not guarantee continuous, uninterrupted access to the Platform. Annotation job availability may fluctuate based on client demand. DEELAi does not guarantee a specific volume of work or income level.
            </P>
          </Section>

          <Section title="10. Contact">
            <P>
              For questions about these Terms, please contact us at{" "}
              <a href="mailto:support@deelai.uk" style={{ color: C.cyan }}>support@deelai.uk</a>.
            </P>
          </Section>

        </div>

        <div style={{ display: "flex", gap: 16, marginTop: 24, flexWrap: "wrap" }}>
          <a href="/privacy" style={{ color: C.cyan, fontSize: 13, textDecoration: "underline" }}>Privacy Policy</a>
          <a href="/" style={{ color: C.txt3, fontSize: 13 }}>← Back to DEELAi</a>
        </div>
      </div>
    </div>
  );
}
