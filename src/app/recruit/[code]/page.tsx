import { redirect } from "next/navigation";
import { adminStore } from "@/lib/adminStore";

export default async function RecruitRedirect({ params }: { params: { code: string } }) {
  const referrer = await adminStore.getUserByRefCode(params.code);
  if (!referrer?.channelId) redirect("/");
  redirect(`/register?channel=${referrer.channelId}&ref=${params.code}`);
}
