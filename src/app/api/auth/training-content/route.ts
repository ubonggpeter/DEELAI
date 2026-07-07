import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE, ADMIN_COOKIE } from "@/lib/adminConfig";
import { prisma } from "@/lib/prisma";

// Returns quiz questions + training docs + modules to logged-in users AND admins.
// All content is scoped to the user's channel:
//   - Quiz:         approver's question set, falls back to global
//   - Training docs: channel owner's docs + global docs merged
//   - Modules:      channel-specific override if set, else global default
//   - Module docs:  channel-specific + global merged
export async function GET(req: NextRequest) {
  const userRaw    = req.cookies.get(USER_COOKIE)?.value;
  const adminEmail = req.cookies.get(ADMIN_COOKIE)?.value;

  if (!userRaw && !adminEmail) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  let approvedBy: string | null = null;
  let channelOwnerEmail: string | null = null;
  let userChannelId: string | null = null;

  if (userRaw) {
    try {
      const session = JSON.parse(userRaw) as { userId: string };
      const user = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { approvedBy: true, channelId: true },
      });
      approvedBy    = user?.approvedBy ?? null;
      userChannelId = user?.channelId  ?? null;
      if (user?.channelId) {
        const ch = await prisma.channel.findUnique({ where: { id: user.channelId }, select: { ownerEmail: true } });
        channelOwnerEmail = ch?.ownerEmail ?? null;
      }
    } catch { /* fall back to global */ }
  }

  const [quizQuestions, trainingDocs, trainingModules, moduleDocs] = await Promise.all([
    adminStore.getQuizQuestionsForApprover(approvedBy),
    adminStore.getTrainingDocsForChannel(channelOwnerEmail),
    adminStore.getTrainingModulesForChannel(userChannelId),
    adminStore.getModuleDocsForChannel(userChannelId),
  ]);

  return NextResponse.json({ quizQuestions, trainingDocs, trainingModules, moduleDocs });
}
