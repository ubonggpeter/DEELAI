import { redirect } from "next/navigation";
import { adminStore } from "@/lib/adminStore";

// /recruit/[code] — resolve the referrer's channel and drop straight into
// that channel's registration page, carrying the ref code as a query param.
export default async function RecruitRedirect({ params }: { params: { code: string } }) {
  const referrer = await adminStore.getUserByRefCode(params.code);
  // If the ref code is invalid or the referrer has no channel, send to home
  if (!referrer?.channelId) redirect("/");
  redirect(`/channel/${referrer.channelId}?ref=${params.code}`);
}
