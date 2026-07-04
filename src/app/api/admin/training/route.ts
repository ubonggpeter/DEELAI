import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";
import type { QuizQuestion } from "@/lib/adminStore";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ownerEmail = adminStore.isSuperAdmin(email) ? null : email;
  const [quizQuestions, trainingDocs] = await Promise.all([
    adminStore.getQuizQuestionsForOwner(ownerEmail),
    adminStore.getTrainingDocsForOwner(ownerEmail),
  ]);
  return NextResponse.json({ quizQuestions, trainingDocs });
}

export async function PUT(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json() as { quizQuestions: QuizQuestion[] };
  if (!Array.isArray(body.quizQuestions)) {
    return NextResponse.json({ error: "quizQuestions must be an array" }, { status: 400 });
  }
  const ownerEmail = adminStore.isSuperAdmin(email) ? null : email;
  await adminStore.setQuizQuestionsForOwner(ownerEmail, body.quizQuestions);
  return NextResponse.json({ success: true, quizQuestions: await adminStore.getQuizQuestionsForOwner(ownerEmail) });
}

export async function POST(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json() as { title: string; url: string; type: "pdf" | "doc" | "link" };
  if (!body.title || !body.url) {
    return NextResponse.json({ error: "title and url are required" }, { status: 400 });
  }
  const ownerEmail = adminStore.isSuperAdmin(email) ? null : email;
  const doc = await adminStore.addTrainingDoc({ title: body.title, url: body.url, type: body.type ?? "link", ownerEmail });
  return NextResponse.json({ doc }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json() as { id: string };

  // Super admin can delete any doc; sub-admin can only delete their own
  if (!adminStore.isSuperAdmin(email)) {
    const docs = await adminStore.getTrainingDocsForOwner(email);
    if (!docs.some((d) => d.id === id)) {
      return NextResponse.json({ error: "Not found or not yours" }, { status: 403 });
    }
  }

  const removed = await adminStore.removeTrainingDoc(id);
  if (!removed) return NextResponse.json({ error: "Doc not found" }, { status: 404 });
  return NextResponse.json({ success: true });
}
