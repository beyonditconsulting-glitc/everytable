import { NextResponse } from "next/server";
import { updateStore } from "@/lib/stores";
import { storeInputSchema } from "@/lib/validation";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;
  const body = await req.json();
  const parsed = storeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const store = await updateStore(storeId, parsed.data);
    return NextResponse.json({ store });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update store" },
      { status: 400 }
    );
  }
}
