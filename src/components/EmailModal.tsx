"use client";

import { useState } from "react";

export function EmailModal({
  subject,
  body,
  recipientHint,
  onClose,
}: {
  subject: string;
  body: string;
  recipientHint: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API can fail without permission; the text is still
      // selectable in the textarea below as a fallback.
    }
  }

  const mailtoHref = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h3 className="text-base font-semibold text-stone-900">
            Draft email for {recipientHint}
          </h3>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="mt-1 text-sm text-stone-500">
          Review and edit as needed, then copy it into your email client or
          open it directly.
        </p>

        <div className="mt-4">
          <span className="mb-1 block text-sm font-medium text-stone-700">
            Subject
          </span>
          <input className="input" readOnly value={subject} />
        </div>

        <div className="mt-4">
          <span className="mb-1 block text-sm font-medium text-stone-700">
            Body
          </span>
          <textarea
            className="input min-h-[280px] font-mono text-xs"
            readOnly
            value={body}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" className="btn-primary" onClick={handleCopy}>
            {copied ? "Copied!" : "Copy subject + body"}
          </button>
          <a href={mailtoHref} className="btn-secondary">
            Open in email app
          </a>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
