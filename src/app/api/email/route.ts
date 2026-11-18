import { NextResponse } from "next/server";
import { getStore } from "@/lib/stores";
import { getOrCreatePromoCode } from "@/lib/promoCode";
import { buildEmailDraft } from "@/lib/emailTemplate";
import { actionSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { storeId, lead } = parsed.data;
  const store = await getStore(storeId);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const promo = await getOrCreatePromoCode(store, lead, "email");
  const draft = buildEmailDraft(store, lead, promo);

  return NextResponse.json({ draft, promo });
}
