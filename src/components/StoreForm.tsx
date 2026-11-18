"use client";

import { useState, type FormEvent } from "react";
import type { StoreProfile } from "@/lib/types";

export interface StoreFormValues {
  name: string;
  address: string;
  managerName: string;
  managerEmail: string;
  phone: string;
  promoBaseCode: string;
  discountText: string;
  offerText: string;
}

const DEFAULT_VALUES: StoreFormValues = {
  name: "",
  address: "",
  managerName: "",
  managerEmail: "",
  phone: "",
  promoBaseCode: "CLINIC20",
  discountText: "20% off your first catering order",
  offerText:
    "We'd love to drop off a free sample so your team can try us before you order.",
};

export function StoreForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial?: StoreProfile;
  submitLabel: string;
  onSubmit: (values: StoreFormValues) => Promise<void>;
  onCancel?: () => void;
}) {
  const [values, setValues] = useState<StoreFormValues>(
    initial
      ? {
          name: initial.name,
          address: initial.address,
          managerName: initial.managerName,
          managerEmail: initial.managerEmail,
          phone: initial.phone,
          promoBaseCode: initial.promoBaseCode,
          discountText: initial.discountText,
          offerText: initial.offerText,
        }
      : DEFAULT_VALUES
  );
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function update<K extends keyof StoreFormValues>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Store name">
          <input
            required
            className="input"
            value={values.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Everytable - Downtown"
          />
        </Field>
        <Field label="Store address">
          <input
            required
            className="input"
            value={values.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="123 Main St, Los Angeles, CA"
          />
        </Field>
        <Field label="Manager name">
          <input
            required
            className="input"
            value={values.managerName}
            onChange={(e) => update("managerName", e.target.value)}
          />
        </Field>
        <Field label="Manager email">
          <input
            required
            type="email"
            className="input"
            value={values.managerEmail}
            onChange={(e) => update("managerEmail", e.target.value)}
          />
        </Field>
        <Field label="Store phone">
          <input
            required
            className="input"
            value={values.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="(555) 555-0100"
          />
        </Field>
        <Field label="Promo base code">
          <input
            required
            className="input uppercase"
            value={values.promoBaseCode}
            onChange={(e) => update("promoBaseCode", e.target.value)}
          />
        </Field>
      </div>

      <Field label="Discount text (shown on flyer + email)">
        <input
          required
          className="input"
          value={values.discountText}
          onChange={(e) => update("discountText", e.target.value)}
        />
      </Field>

      <Field label="Offer description">
        <textarea
          required
          className="input min-h-[80px]"
          value={values.offerText}
          onChange={(e) => update("offerText", e.target.value)}
        />
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-stone-700">
        {label}
      </span>
      {children}
    </label>
  );
}
