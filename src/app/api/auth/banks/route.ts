import { NextRequest, NextResponse } from "next/server";
import { USER_COOKIE } from "@/lib/adminConfig";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Countries supported by Paystack bank list endpoint (mapped from common country names)
const COUNTRY_CODE_MAP: Record<string, string> = {
  nigeria:       "nigeria",
  ghana:         "ghana",
  kenya:         "kenya",
  "south africa":"south africa",
  "côte d'ivoire":"cote d'ivoire",
  "ivory coast": "cote d'ivoire",
  ethiopia:      "ethiopia",   // not officially on Paystack – fallback
  tanzania:      "tanzania",
  uganda:        "uganda",
  rwanda:        "rwanda",
  mozambique:    "mozambique",
  cameroon:      "cameroon",
  senegal:       "senegal",
  egypt:         "egypt",
  morocco:       "morocco",
  algeria:       "algeria",
  tunisia:       "tunisia",
  zambia:        "zambia",
  zimbabwe:      "zimbabwe",
  angola:        "angola",
  mali:          "mali",
};

// Currency codes Paystack uses per country (needed for some endpoints)
const COUNTRY_CURRENCY: Record<string, string> = {
  nigeria:       "NGN",
  ghana:         "GHS",
  kenya:         "KES",
  "south africa": "ZAR",
};

export async function GET(req: NextRequest) {
  const raw = req.cookies.get(USER_COOKIE)?.value;
  if (!raw) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const session = JSON.parse(raw) as { userId: string };
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { channelId: true, country: true },
  });
  if (!user?.channelId) return NextResponse.json({ error: "No channel" }, { status: 400 });

  const channel = await prisma.channel.findUnique({
    where: { id: user.channelId }, select: { paystackSecretKey: true },
  });
  const secretKey = channel?.paystackSecretKey;
  if (!secretKey) return NextResponse.json({ error: "Channel Paystack not configured" }, { status: 400 });

  // Country can be passed as a query param override, or default to user's saved country
  const countryParam = req.nextUrl.searchParams.get("country") ?? user.country ?? "nigeria";
  const normalised = countryParam.toLowerCase().trim();
  const paystackCountry = COUNTRY_CODE_MAP[normalised] ?? "nigeria";
  const currency = COUNTRY_CURRENCY[paystackCountry];

  // Build Paystack bank list URL
  const qs = new URLSearchParams({ country: paystackCountry, perPage: "100", use_cursor: "false" });
  if (currency) qs.set("currency", currency);
  const url = `https://api.paystack.co/bank?${qs}`;

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${secretKey}` },
    next: { revalidate: 3600 },
  });

  if (!resp.ok) {
    // Paystack doesn't have every African country — return empty list with a flag
    return NextResponse.json({ banks: [], unsupported: true });
  }

  const data = await resp.json() as { status: boolean; data: { name: string; code: string }[] };
  const banks = (data.data ?? []).filter((b) => b.name && b.code);
  return NextResponse.json({ banks, country: paystackCountry, unsupported: banks.length === 0 });
}
