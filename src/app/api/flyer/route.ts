import { NextResponse } from "next/server";
import { getStore } from "@/lib/stores";
import { getOrCreatePromoCode } from "@/lib/promoCode";
import { buildFlyerPdf } from "@/lib/flyerPdf";
import { buildRedeemQrBuffer } from "@/lib/qr";
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

  const promo = await getOrCreatePromoCode(store, lead, "flyer");
  const qrBuffer = await buildRedeemQrBuffer(store, promo);
  const pdf = await buildFlyerPdf(store, lead, promo, qrBuffer);

  const filename = `${lead.name.replace(/[^a-z0-9]+/gi, "-")}-flyer.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Promo-Code": promo.code,
    },
  });
}
