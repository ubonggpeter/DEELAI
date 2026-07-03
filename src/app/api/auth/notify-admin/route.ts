import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";
import { sendEmail, tplAdminNewRegistration } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = JSON.parse(raw) as { userId: string; email: string; name: string; channelId?: string };
  if (!session.channelId) return NextResponse.json({ error: "No channel" }, { status: 400 });

  const { cvUrl } = (await req.json().catch(() => ({}))) as { cvUrl?: string };

  if (cvUrl) {
    await adminStore.updateUserProfile(session.userId, {});
  }

  const channel = await adminStore.getChannelById(session.channelId);
  if (!channel) return NextResponse.json({ error: "Channel not found" }, { status: 404 });

  const allSubAdmins = await adminStore.getAllSubAdmins();
  const ownerSub = allSubAdmins.find((s) => s.email === channel.ownerEmail);
  const ownerName = ownerSub?.name ?? "Admin";

  await sendEmail({
    to:      channel.ownerEmail,
    subject: `New Registration Pending — Channel ${channel.channelName}`,
    html:    tplAdminNewRegistration(ownerName, session.name, session.email, channel.channelName),
  });

  return NextResponse.json({ success: true });
}
