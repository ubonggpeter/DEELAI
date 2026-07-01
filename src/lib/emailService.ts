/**
 * Email utility. Uses Resend if RESEND_API_KEY is set, otherwise logs to console.
 * In production: npm install resend and set RESEND_API_KEY in Vercel env vars.
 */

interface EmailPayload {
  to:      string;
  subject: string;
  html:    string;
}

const FROM = "DEELAI <noreply@deelai.uk>";

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      await fetch("https://api.resend.com/emails", {
        method:  "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body:    JSON.stringify({ from: FROM, to: payload.to, subject: payload.subject, html: payload.html }),
      });
    } catch (e) {
      console.error("[EMAIL] Resend error:", e);
    }
  } else {
    console.log(`\n[EMAIL DEV]\nTo:      ${payload.to}\nSubject: ${payload.subject}\nBody:    ${payload.html.replace(/<[^>]+>/g, "")}\n`);
  }
}

/* ── Templates ──────────────────────────────────────────────────────── */
export function tplAdminNewRegistration(adminName: string, userName: string, userEmail: string, channelName: string): string {
  return `
<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#060A12;color:#EEF2FF;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#0C1220,#101829);padding:28px 32px;border-bottom:1px solid #162035">
    <span style="font-size:22px;font-weight:900;color:#fff">DEEL<span style="color:#00D4FF">Ai</span></span>
  </div>
  <div style="padding:28px 32px">
    <h2 style="color:#EEF2FF;font-size:18px;margin:0 0 16px">New Registration — Channel ${channelName}</h2>
    <p style="color:#7D8BAA;line-height:1.6;margin:0 0 16px">Hi ${adminName},</p>
    <p style="color:#7D8BAA;line-height:1.6;margin:0 0 20px">
      <strong style="color:#EEF2FF">${userName}</strong> (${userEmail}) has submitted a registration under
      <strong style="color:#00D4FF">Channel ${channelName}</strong> and is pending your approval.
    </p>
    <a href="${process.env.NEXT_PUBLIC_URL ?? "https://deelai.vercel.app"}/admin/login"
       style="display:inline-block;background:#00D4FF;color:#060A12;padding:11px 22px;border-radius:8px;font-weight:700;text-decoration:none">
      Review Application →
    </a>
    <p style="color:#4A5470;font-size:12px;margin-top:24px">
      Log in with your channel admin email to approve or reject this registration.
    </p>
  </div>
</div>`;
}

export function tplUserApproved(firstName: string, dashboardUrl: string): string {
  return `
<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#060A12;color:#EEF2FF;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#0C1220,#101829);padding:28px 32px;border-bottom:1px solid #162035">
    <span style="font-size:22px;font-weight:900;color:#fff">DEEL<span style="color:#00D4FF">Ai</span></span>
  </div>
  <div style="padding:28px 32px">
    <div style="width:52px;height:52px;border-radius:50%;background:#00E5A015;border:2px solid #00E5A050;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:24px">✓</div>
    <h2 style="color:#00E5A0;font-size:20px;margin:0 0 12px">You're Approved!</h2>
    <p style="color:#7D8BAA;line-height:1.6;margin:0 0 8px">Hi ${firstName},</p>
    <p style="color:#7D8BAA;line-height:1.6;margin:0 0 24px">
      Great news — your DEELAI account has been approved! You can now log in and start working on
      annotation tasks and earning your salary.
    </p>
    <a href="${dashboardUrl}"
       style="display:inline-block;background:linear-gradient(135deg,#00D4FF,#0099BB);color:#060A12;padding:12px 24px;border-radius:8px;font-weight:700;text-decoration:none">
      Access Your Dashboard →
    </a>
    <p style="color:#4A5470;font-size:12px;margin-top:24px">Welcome to the DEELAI network.</p>
  </div>
</div>`;
}

export function tplUserRejected(firstName: string): string {
  return `
<div style="font-family:Inter,sans-serif;max-width:560px;margin:0 auto;background:#060A12;color:#EEF2FF;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#0C1220,#101829);padding:28px 32px;border-bottom:1px solid #162035">
    <span style="font-size:22px;font-weight:900;color:#fff">DEEL<span style="color:#00D4FF">Ai</span></span>
  </div>
  <div style="padding:28px 32px">
    <h2 style="color:#FF4D6D;font-size:18px;margin:0 0 12px">Application Update</h2>
    <p style="color:#7D8BAA;line-height:1.6;margin:0 0 8px">Hi ${firstName},</p>
    <p style="color:#7D8BAA;line-height:1.6;margin:0 0 20px">
      After reviewing your application, we were unable to approve your account at this time.
      Please contact support if you believe this is an error.
    </p>
    <a href="mailto:support@deelai.uk"
       style="display:inline-block;background:#FF4D6D22;color:#FF4D6D;border:1px solid #FF4D6D44;padding:10px 20px;border-radius:8px;font-weight:700;text-decoration:none">
      Contact Support
    </a>
  </div>
</div>`;
}
