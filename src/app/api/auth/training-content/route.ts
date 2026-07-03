import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { USER_COOKIE, ADMIN_COOKIE } from "@/lib/adminConfig";

// Serves quiz questions and training docs to logged-in users AND admins.
// /api/admin/training GET is admin-only; this endpoint exists so that
// the user-facing TrainingScreen can load content without an admin cookie.
export async function GET(req: NextRequest) {
  const userRaw    = req.cookies.get(USER_COOKIE)?.value;
  const adminEmail = req.cookies.get(ADMIN_COOKIE)?.value;

  if (!userRaw && !adminEmail) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const [quizQuestions, trainingDocs] = await Promise.all([
    adminStore.getQuizQuestions(),
    adminStore.getTrainingDocs(),
  ]);

  return NextResponse.json({ quizQuestions, trainingDocs });
}
