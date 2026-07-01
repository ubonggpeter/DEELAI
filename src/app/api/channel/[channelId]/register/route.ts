import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import type { PermitType } from "@/lib/adminStore";

export async function POST(req: NextRequest, { params }: { params: { channelId: string } }) {
  const ch = adminStore.getChannelById(params.channelId);
  if (!ch)          return NextResponse.json({ error: "Channel not found" }, { status: 404 });
  if (!ch.isActive) return NextResponse.json({ error: "Channel not accepting registrations" }, { status: 403 });

  const body = await req.json() as {
    name: string;
    email: string;
    permitType: PermitType;
    cvUrl?: string;
    paystackRef?: string;
    jobPassPaid: boolean;
    jobPassAmount: number;
  };

  if (!body.name || !body.email || !body.permitType) {
    return NextResponse.json({ error: "name, email and permitType are required" }, { status: 400 });
  }

  // Check if email already registered under this channel
  const existing = adminStore.users.find(
    (u) => u.email === body.email.toLowerCase() && u.channelId === params.channelId
  );
  if (existing) {
    return NextResponse.json({ error: "This email is already registered under this channel" }, { status: 409 });
  }

  const user = adminStore.registerUser({
    name:          body.name,
    email:         body.email.toLowerCase(),
    channelId:     params.channelId,
    permitType:    body.permitType,
    cvUrl:         body.cvUrl,
    jobPassPaid:   body.jobPassPaid,
    jobPassAmount: body.jobPassAmount,
    paystackRef:   body.paystackRef,
  });

  return NextResponse.json({
    success: true,
    userId: user.id,
    accountStatus: user.accountStatus,
    message: "Registration submitted. Your application is pending review.",
  }, { status: 201 });
}
