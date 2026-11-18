"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { StoreProfile } from "@/lib/types";

export function Nav({
  stores,
  activeStoreId,
  onChangeStore,
  onAddStore,
  onEditStore,
}: {
  stores: StoreProfile[];
  activeStoreId: string | null;
  onChangeStore: (id: string) => void;
  onAddStore: () => void;
  onEditStore: () => void;
}) {
  const pathname = usePathname();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="text-lg font-bold text-emerald-800">
            Breakroom Lead Finder
          </span>
          <nav className="flex gap-4 text-sm font-medium">
            <Link
              href="/"
              className={
                pathname === "/" ? "text-emerald-700" : "text-stone-500 hover:text-stone-800"
              }
            >
              Find leads
            </Link>
            <Link
              href="/codes"
              className={
                pathname === "/codes"
                  ? "text-emerald-700"
                  : "text-stone-500 hover:text-stone-800"
              }
            >
              Promo codes
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {stores.length > 0 && (
            <select
              className="input w-auto max-w-[220px]"
              value={activeStoreId ?? ""}
              onChange={(e) => onChangeStore(e.target.value)}
            >
              {stores.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          )}
          {activeStoreId && (
            <button type="button" className="btn-secondary" onClick={onEditStore}>
              Edit store
            </button>
          )}
          <button type="button" className="btn-secondary" onClick={onAddStore}>
            + Add store
          </button>
        </div>
      </div>
    </header>
  );
}
