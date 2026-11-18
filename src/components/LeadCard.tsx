"use client";

import { useState } from "react";
import type { Lead } from "@/lib/types";
import { EmailModal } from "./EmailModal";

const CATEGORY_BADGE: Record<Lead["category"], string> = {
  gym: "bg-sky-100 text-sky-800",
  clinic: "bg-rose-100 text-rose-800",
  school: "bg-amber-100 text-amber-800",
  office: "bg-violet-100 text-violet-800",
};

const CATEGORY_LABEL: Record<Lead["category"], string> = {
  gym: "Gym",
  clinic: "Clinic",
  school: "School",
  office: "Office",
};

export function LeadCard({ lead, storeId }: { lead: Lead; storeId: string }) {
  const [promoCode, setPromoCode] = useState<string | null>(null);
  const [flyerLoading, setFlyerLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailDraft, setEmailDraft] = useState<{
    subject: string;
    body: string;
  } | null>(null);

  async function handleFlyer() {
    setError(null);
    setFlyerLoading(true);
    try {
      const res = await fetch("/api/flyer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, lead }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Could not generate flyer");
      }
      const code = res.headers.get("X-Promo-Code");
      if (code) setPromoCode(code);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${lead.name.replace(/[^a-z0-9]+/gi, "-")}-flyer.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setFlyerLoading(false);
    }
  }

  async function handleEmail() {
    setError(null);
    setEmailLoading(true);
    try {
      const res = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storeId, lead }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not draft email");
      setPromoCode(data.promo.code);
      setEmailDraft(data.draft);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setEmailLoading(false);
    }
  }

  return (
    <div className="card flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-stone-900">{lead.name}</h3>
          <p className="text-sm text-stone-500">{lead.address}</p>
        </div>
        <span className={`badge ${CATEGORY_BADGE[lead.category]}`}>
          {CATEGORY_LABEL[lead.category]}
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm text-stone-500">
        <span>{lead.distanceMiles.toFixed(1)} mi away</span>
        {lead.source === "demo" && (
          <span className="badge bg-stone-100 text-stone-500">
            demo data
          </span>
        )}
      </div>

      {promoCode && (
        <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Promo code: <span className="font-mono font-semibold">{promoCode}</span>
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="mt-1 flex gap-2">
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={handleFlyer}
          disabled={flyerLoading}
        >
          {flyerLoading ? "Generating..." : "Generate flyer"}
        </button>
        <button
          type="button"
          className="btn-secondary flex-1"
          onClick={handleEmail}
          disabled={emailLoading}
        >
          {emailLoading ? "Drafting..." : "Draft email"}
        </button>
      </div>

      {emailDraft && (
        <EmailModal
          subject={emailDraft.subject}
          body={emailDraft.body}
          recipientHint={lead.name}
          onClose={() => setEmailDraft(null)}
        />
      )}
    </div>
  );
}
