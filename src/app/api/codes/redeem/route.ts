import { NextResponse } from "next/server";
import { redeemPromoCode } from "@/lib/promoCode";
import { z } from "zod";

const redeemSchema = z.object({
  storeId: z.string().min(1),
  code: z.string().min(1),
});

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = redeemSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const promo = await redeemPromoCode(parsed.data.storeId, parsed.data.code);
  if (!promo) {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }

  return NextResponse.json({ promo });
}
