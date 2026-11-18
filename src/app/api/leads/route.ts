import { NextResponse } from "next/server";
import { getStore } from "@/lib/stores";
import { searchLeads } from "@/lib/places";
import { leadSearchSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = leadSearchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { storeId, radiusMiles, categories } = parsed.data;
  const store = await getStore(storeId);
  if (!store) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const result = await searchLeads(store.lat, store.lng, radiusMiles, categories);
  return NextResponse.json(result);
}
