import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE } from "@/lib/adminConfig";

export async function GET(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ loggedIn: false });

  try {
    const session = JSON.parse(raw) as { userId: string; email: string; name: string; accountStatus: string; channelId?: string };
    // Re-fetch latest accountStatus from store (it may have changed since cookie was set)
    const user = adminStore.getUserById(session.userId);
    if (!user) return NextResponse.json({ loggedIn: false });
    return NextResponse.json({
      loggedIn: true,
      userId:  user.id,
      email:   user.email,
      name:    user.name,
      phone:   user.phone,
      accountStatus: user.accountStatus,
      channelId:     user.channelId,
      permitType:    user.permitType,
      jobPassPaid:   user.jobPassPaid,
      salary:        user.salary,
      jobsDone:      user.jobsDone,
      level:         user.level,
    });
  } catch {
    return NextResponse.json({ loggedIn: false });
  }
}
