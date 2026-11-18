import { NextResponse } from "next/server";
import { listPromoCodes } from "@/lib/promoCode";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const storeId = searchParams.get("storeId");
  if (!storeId) {
    return NextResponse.json({ error: "storeId is required" }, { status: 400 });
  }

  const codes = await listPromoCodes(storeId);
  return NextResponse.json({ codes });
}
