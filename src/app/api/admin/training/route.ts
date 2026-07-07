import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";
import type { QuizQuestion, TrainingModule } from "@/lib/adminStore";

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const ownerEmail = adminStore.isSuperAdmin(email) ? null : email;
  const ch = !adminStore.isSuperAdmin(email) ? await adminStore.getChannelByOwner(email) : null;
  const channelId = ch?.id ?? null;
  const [quizQuestions, trainingDocs, trainingModules, moduleDocs] = await Promise.all([
    adminStore.getQuizQuestionsForOwner(ownerEmail),
    adminStore.getTrainingDocsForOwner(ownerEmail),
    adminStore.getTrainingModulesForChannel(channelId),
    adminStore.getModuleDocsForChannel(channelId),
  ]);
  return NextResponse.json({ quizQuestions, trainingDocs, trainingModules, moduleDocs });
}

export async function PUT(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json() as { quizQuestions?: QuizQuestion[]; trainingModules?: TrainingModule[] };
  const ownerEmail = adminStore.isSuperAdmin(email) ? null : email;
  const ch = !adminStore.isSuperAdmin(email) ? await adminStore.getChannelByOwner(email) : null;
  const channelId = ch?.id ?? null;

  const tasks: Promise<unknown>[] = [];

  if (Array.isArray(body.quizQuestions)) {
    tasks.push(adminStore.setQuizQuestionsForOwner(ownerEmail, body.quizQuestions));
  }
  if (Array.isArray(body.trainingModules)) {
    // Super-admin: saves to global TrainingModule table.
    // Sub-admin: saves to ChannelTrainingOverride — never touches global content.
    tasks.push(adminStore.setTrainingModulesForChannel(body.trainingModules, channelId));
  }
  if (tasks.length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }
  await Promise.all(tasks);
  return NextResponse.json({ success: true });
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
