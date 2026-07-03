import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import type { PermitType } from "@/lib/adminStore";

export async function POST(req: NextRequest, { params }: { params: { channelId: string } }) {
  const ch = await adminStore.getChannelById(params.channelId);
  if (!ch)          return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  if (!ch.isActive) return NextResponse.json({ error: "Channel not accepting registrations" }, { status: 403 });

  const body = await req.json() as {
    name: string; email: string; phone?: string; password?: string;
    permitType: PermitType; cvUrl?: string; paystackRef?: string;
    jobPassPaid: boolean; jobPassAmount: number;
  };

  if (!body.name || !body.email || !body.permitType) {
    return NextResponse.json({ error: "name, email and permitType are required" }, { status: 400 });
  }

  const emailLower = body.email.toLowerCase();
  const existing = await adminStore.getUserByEmail(emailLower);
  if (existing && existing.channelId === params.channelId) {
    return NextResponse.json({ error: "This email is already registered under this channel" }, { status: 409 });
  }

  const user = await adminStore.registerUser({
    name: body.name, email: emailLower, phone: body.phone ?? "",
    password: body.password ?? "", channelId: params.channelId,
    permitType: body.permitType, cvUrl: body.cvUrl,
    jobPassPaid: body.jobPassPaid, jobPassAmount: body.jobPassAmount,
    paystackRef: body.paystackRef,
  });

  return NextResponse.json({
    success: true, userId: user.id, accountStatus: user.accountStatus,
    message: "Registration submitted. Your application is pending review.",
  }, { status: 201 });
}
