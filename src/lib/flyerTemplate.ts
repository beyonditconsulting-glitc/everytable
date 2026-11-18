import type { Lead, PromoCode, StoreProfile } from "./types";

const CATEGORY_HEADLINE: Record<Lead["category"], string> = {
  gym: "A free, healthy meal drop for your members",
  clinic: "A free lunch break for your hardworking staff",
  school: "A free lunch for your teachers and staff",
  office: "A free lunch your whole team will thank you for",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function formatValidThrough(createdAt: string): string {
  const created = new Date(createdAt);
  const validThrough = new Date(created.getTime() + 60 * 24 * 60 * 60 * 1000);
  return validThrough.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function buildFlyerHtml(
  store: StoreProfile,
  lead: Lead,
  promo: PromoCode,
  qrDataUrl: string
): string {
  const headline = CATEGORY_HEADLINE[lead.category];

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @page { size: Letter; margin: 0; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    color: #1f2421;
    width: 8.5in;
    height: 11in;
  }
  .page {
    width: 8.5in;
    height: 11in;
    display: flex;
    flex-direction: column;
    padding: 0.6in 0.7in;
  }
  .brand {
    font-size: 14px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #5a7d5a;
    font-weight: 700;
  }
  .headline {
    margin-top: 18px;
    font-size: 40px;
    line-height: 1.15;
    font-weight: 800;
    color: #1f2421;
  }
  .subtext {
    margin-top: 16px;
    font-size: 17px;
    line-height: 1.5;
    color: #3a4440;
    max-width: 5.6in;
  }
  .lead-name {
    font-weight: 700;
    color: #1f2421;
  }
  .offer-box {
    margin-top: 36px;
    border: 2px dashed #5a7d5a;
    border-radius: 16px;
    padding: 28px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #f4f7f2;
  }
  .offer-left { max-width: 3.9in; }
  .discount-text {
    font-size: 22px;
    font-weight: 800;
    color: #2f5c2f;
  }
  .code-label {
    margin-top: 10px;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #5a7d5a;
  }
  .code {
    margin-top: 2px;
    font-size: 32px;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #1f2421;
    font-family: "Courier New", monospace;
  }
  .qr {
    width: 1.4in;
    height: 1.4in;
    flex-shrink: 0;
  }
  .how-it-works {
    margin-top: 36px;
  }
  .how-it-works h3 {
    font-size: 15px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #5a7d5a;
    margin: 0 0 10px 0;
  }
  .how-it-works ol {
    margin: 0;
    padding-left: 22px;
    font-size: 15px;
    line-height: 1.6;
    color: #3a4440;
  }
  .spacer { flex: 1; }
  .footer {
    border-top: 1px solid #d8e0d6;
    padding-top: 18px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .store-info {
    font-size: 14px;
    line-height: 1.5;
    color: #3a4440;
  }
  .store-info .name {
    font-weight: 700;
    color: #1f2421;
    font-size: 16px;
  }
  .valid-through {
    font-size: 12px;
    color: #7a847c;
    text-align: right;
  }
</style>
</head>
<body>
  <div class="page">
    <div class="brand">${escapeHtml(store.name)}</div>
    <div class="headline">${escapeHtml(headline)}</div>
    <div class="subtext">
      Hi <span class="lead-name">${escapeHtml(lead.name)}</span> — we're your
      neighbors just down the road. ${escapeHtml(store.offerText)}
    </div>

    <div class="offer-box">
      <div class="offer-left">
        <div class="discount-text">${escapeHtml(store.discountText)}</div>
        <div class="code-label">Your promo code</div>
        <div class="code">${escapeHtml(promo.code)}</div>
      </div>
      <img class="qr" src="${qrDataUrl}" alt="QR code" />
    </div>

    <div class="how-it-works">
      <h3>How to redeem</h3>
      <ol>
        <li>Call or email us to schedule your free sample meal drop.</li>
        <li>Mention code <strong>${escapeHtml(promo.code)}</strong> when you book.</li>
        <li>Loved it? Use the same code to get ${escapeHtml(store.discountText).toLowerCase()}.</li>
      </ol>
    </div>

    <div class="spacer"></div>

    <div class="footer">
      <div class="store-info">
        <div class="name">${escapeHtml(store.name)}</div>
        <div>${escapeHtml(store.address)}</div>
        <div>${escapeHtml(store.phone)} &middot; ${escapeHtml(store.managerEmail)}</div>
      </div>
      <div class="valid-through">Valid through ${escapeHtml(
        formatValidThrough(promo.createdAt)
      )}</div>
    </div>
  </div>
</body>
</html>`;
}
