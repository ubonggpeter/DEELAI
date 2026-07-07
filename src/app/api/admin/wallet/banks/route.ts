import { NextRequest, NextResponse } from "next/server";
import { adminStore } from "@/lib/adminStore";
import { ADMIN_COOKIE } from "@/lib/adminConfig";

export const dynamic = "force-dynamic";

const COUNTRY_CODE_MAP: Record<string, string> = {
  nigeria: "nigeria", ghana: "ghana", kenya: "kenya",
  "south africa": "south africa", "côte d'ivoire": "cote d'ivoire",
  "ivory coast": "cote d'ivoire", ethiopia: "ethiopia",
  tanzania: "tanzania", uganda: "uganda", rwanda: "rwanda",
  mozambique: "mozambique", cameroon: "cameroon", senegal: "senegal",
  egypt: "egypt", morocco: "morocco", algeria: "algeria",
};

const COUNTRY_CURRENCY: Record<string, string> = {
  nigeria: "NGN", ghana: "GHS", kenya: "KES", "south africa": "ZAR",
};

export async function GET(req: NextRequest) {
  const email = req.cookies.get(ADMIN_COOKIE)?.value;
  if (!email || !(await adminStore.isAdmin(email))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const secretKey = await adminStore.getAdminPaystackKey(email);
  if (!secretKey) return NextResponse.json({ error: "Paystack not configured" }, { status: 400 });

  const country = req.nextUrl.searchParams.get("country") ?? "nigeria";
  const normalised = country.toLowerCase().trim();
  const paystackCountry = COUNTRY_CODE_MAP[normalised] ?? "nigeria";
  const currency = COUNTRY_CURRENCY[paystackCountry];

  const qs = new URLSearchParams({ country: paystackCountry, perPage: "100", use_cursor: "false" });
  if (currency) qs.set("currency", currency);

  const resp = await fetch(`https://api.paystack.co/bank?${qs}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
    next: { revalidate: 3600 },
  });
  if (!resp.ok) return NextResponse.json({ banks: [], unsupported: true });

  const data = await resp.json() as { status: boolean; data: { name: string; code: string }[] };
  const banks = (data.data ?? []).filter((b) => b.name && b.code);
  return NextResponse.json({ banks, country: paystackCountry });
}
