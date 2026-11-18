import { NextResponse } from "next/server";
import { createStore, listStores } from "@/lib/stores";
import { storeInputSchema } from "@/lib/validation";

export async function GET() {
  const stores = await listStores();
  return NextResponse.json({ stores });
}

export async function POST(req: Request) {
  const body = await req.json();
  const parsed = storeInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  try {
    const store = await createStore(parsed.data);
    return NextResponse.json({ store });
  } catch (err) {
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Could not create store",
      },
      { status: 400 }
    );
  }
}
