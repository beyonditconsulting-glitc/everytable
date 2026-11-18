"use client";

import { useState } from "react";
import { LEAD_CATEGORIES, type LeadCategory } from "@/lib/types";

const RADIUS_OPTIONS = [0.5, 1, 2, 3, 5];

export function SearchForm({
  loading,
  onSearch,
}: {
  loading: boolean;
  onSearch: (radiusMiles: number, categories: LeadCategory[]) => void;
}) {
  const [radiusMiles, setRadiusMiles] = useState(2);
  const [categories, setCategories] = useState<LeadCategory[]>([
    "gym",
    "clinic",
    "school",
    "office",
  ]);

  function toggleCategory(value: LeadCategory) {
    setCategories((prev) =>
      prev.includes(value) ? prev.filter((c) => c !== value) : [...prev, value]
    );
  }

  return (
    <div className="card">
      <h2 className="text-base font-semibold text-stone-900">
        Find nearby businesses
      </h2>
      <p className="mt-1 text-sm text-stone-500">
        Pull local gyms, clinics, schools, and offices within a radius of
        your store.
      </p>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-1 block text-sm font-medium text-stone-700">
            Radius
          </span>
          <div className="flex gap-2">
            {RADIUS_OPTIONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRadiusMiles(r)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  radiusMiles === r
                    ? "bg-emerald-700 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {r} mi
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-stone-700">
            Business types
          </span>
          <div className="flex flex-wrap gap-3">
            {LEAD_CATEGORIES.map((cat) => (
              <label
                key={cat.value}
                className="flex items-center gap-2 text-sm text-stone-700"
              >
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-stone-300 text-emerald-700 focus:ring-emerald-600"
                  checked={categories.includes(cat.value)}
                  onChange={() => toggleCategory(cat.value)}
                />
                {cat.label}
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn-primary whitespace-nowrap"
          disabled={loading || categories.length === 0}
          onClick={() => onSearch(radiusMiles, categories)}
        >
          {loading ? "Searching..." : "Find leads"}
        </button>
      </div>
    </div>
  );
}
