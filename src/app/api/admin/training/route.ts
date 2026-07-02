import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";
import type { QuizQuestion } from "@/lib/adminStore";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isAdmin(email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({
    quizQuestions: adminStore.getQuizQuestions(),
    trainingDocs: adminStore.getTrainingDocs(),
  });
}

export async function PUT(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }
  const body = await req.json() as { quizQuestions: QuizQuestion[] };
  if (!Array.isArray(body.quizQuestions)) {
    return NextResponse.json({ error: "quizQuestions must be an array" }, { status: 400 });
  }
  adminStore.setQuizQuestions(body.quizQuestions);
  return NextResponse.json({ success: true, quizQuestions: adminStore.getQuizQuestions() });
}

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }
  const body = await req.json() as { title: string; url: string; type: "pdf" | "doc" | "link" };
  if (!body.title || !body.url) {
    return NextResponse.json({ error: "title and url are required" }, { status: 400 });
  }
  const doc = adminStore.addTrainingDoc({ title: body.title, url: body.url, type: body.type ?? "link" });
  return NextResponse.json({ doc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !adminStore.isSuperAdmin(email)) {
    return NextResponse.json({ error: "Super admin only" }, { status: 403 });
  }
  const { id } = await req.json() as { id: string };
  const removed = adminStore.removeTrainingDoc(id);
  if (!removed) return NextResponse.json({ error: "Doc not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
