import { NextResponse } from "next/server";
import { getStore } from "@/lib/stores";
import { getOrCreatePromoCode } from "@/lib/promoCode";
import { buildFlyerHtml } from "@/lib/flyerTemplate";
import { buildRedeemQrDataUrl } from "@/lib/qr";
import { renderHtmlToPdf } from "@/lib/pdf";
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
  const qrDataUrl = await buildRedeemQrDataUrl(store, promo);
  const html = buildFlyerHtml(store, lead, promo, qrDataUrl);
  const pdf = await renderHtmlToPdf(html);

  const filename = `${lead.name.replace(/[^a-z0-9]+/gi, "-")}-flyer.pdf`;

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "X-Promo-Code": promo.code,
    },
  });
}
