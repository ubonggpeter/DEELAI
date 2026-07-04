import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE, ADMIN_COOKIE } from "@/lib/adminConfig";
import { prisma } from "@/lib/prisma";

// Returns quiz questions + training docs to logged-in users AND admins.
// Quiz questions are scoped to whoever approved the user's registration:
//   - super admin approved → super admin's global questions
//   - sub-admin approved   → that sub-admin's question set (falls back to global if none set)
export async function GET(req: NextRequest) {
  const userRaw    = req.cookies.get(USER_COOKIE)?.value;
  const adminEmail = req.cookies.get(ADMIN_COOKIE)?.value;

  if (!userRaw && !adminEmail) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let approvedBy: string | null = null;
  let channelOwnerEmail: string | null = null;
  if (userRaw) {
    try {
      const session = JSON.parse(userRaw) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { approvedBy: true, channelId: true },
      });
      approvedBy = user?.approvedBy ?? null;
      if (user?.channelId) {
        const ch = await prisma.channel.findUnique({ where: { id: user.channelId }, select: { ownerEmail: true } });
        channelOwnerEmail = ch?.ownerEmail ?? null;
      }
    } catch { /* fall back to global */ }
  }

  const [quizQuestions, trainingDocs] = await Promise.all([
    adminStore.getQuizQuestionsForApprover(approvedBy),
    adminStore.getTrainingDocsForChannel(channelOwnerEmail),
  ]);

  return NextResponse.json({ quizQuestions, trainingDocs });
}
