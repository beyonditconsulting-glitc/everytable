import PDFDocument from "pdfkit";
import type { Lead, PromoCode, StoreProfile } from "./types";

const CATEGORY_HEADLINE: Record<Lead["category"], string> = {
  gym: "A free, healthy meal drop for your members",
  clinic: "A free lunch break for your hardworking staff",
  school: "A free lunch for your teachers and staff",
  office: "A free lunch your whole team will thank you for",
};

const COLORS = {
  brand: "#5a7d5a",
  dark: "#1f2421",
  subtext: "#3a4440",
  offerBg: "#f4f7f2",
  discount: "#2f5c2f",
  border: "#d8e0d6",
  muted: "#7a847c",
};

function formatValidThrough(createdAt: string): string {
  const created = new Date(createdAt);
  const validThrough = new Date(created.getTime() + 60 * 24 * 60 * 60 * 1000);
  return validThrough.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export async function buildFlyerPdf(
  store: StoreProfile,
  lead: Lead,
  promo: PromoCode,
  qrBuffer: Buffer
): Promise<Buffer> {
  const doc = new PDFDocument({
    size: "LETTER",
    margins: { top: 43.2, bottom: 43.2, left: 50.4, right: 50.4 },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));
  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  const contentWidth =
    doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const left = doc.page.margins.left;

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.brand)
    .text(store.name.toUpperCase(), left, doc.y, { characterSpacing: 1 });

  doc.moveDown(1);

  doc
    .font("Helvetica-Bold")
    .fontSize(30)
    .fillColor(COLORS.dark)
    .text(CATEGORY_HEADLINE[lead.category], left, doc.y, {
      width: contentWidth,
    });

  doc.moveDown(0.8);

  doc.font("Helvetica").fontSize(13).fillColor(COLORS.subtext);
  doc.text("Hi ", left, doc.y, { continued: true, width: contentWidth });
  doc
    .font("Helvetica-Bold")
    .fillColor(COLORS.dark)
    .text(lead.name, { continued: true });
  doc
    .font("Helvetica")
    .fillColor(COLORS.subtext)
    .text(
      ` — we're your neighbors just down the road. ${store.offerText}`
    );

  doc.moveDown(1.4);

  const boxX = left;
  const boxY = doc.y;
  const boxWidth = contentWidth;
  const boxHeight = 110;
  const radius = 12;
  const qrSize = 90;
  const boxPadX = 24;

  doc.roundedRect(boxX, boxY, boxWidth, boxHeight, radius).fill(COLORS.offerBg);
  doc
    .roundedRect(boxX, boxY, boxWidth, boxHeight, radius)
    .dash(4, { space: 3 })
    .lineWidth(1.5)
    .stroke(COLORS.brand);
  doc.undash();

  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(COLORS.discount)
    .text(store.discountText, boxX + boxPadX, boxY + 22, {
      width: boxWidth - boxPadX * 2 - qrSize - 20,
    });

  doc
    .font("Helvetica")
    .fontSize(10)
    .fillColor(COLORS.brand)
    .text("YOUR PROMO CODE", boxX + boxPadX, boxY + 52, {
      characterSpacing: 0.5,
    });

  doc
    .font("Courier-Bold")
    .fontSize(21)
    .fillColor(COLORS.dark)
    .text(promo.code, boxX + boxPadX, boxY + 66);

  doc.image(qrBuffer, boxX + boxWidth - boxPadX - qrSize, boxY + (boxHeight - qrSize) / 2, {
    width: qrSize,
    height: qrSize,
  });

  doc.y = boxY + boxHeight + 30;

  doc
    .font("Helvetica-Bold")
    .fontSize(11)
    .fillColor(COLORS.brand)
    .text("HOW TO REDEEM", left, doc.y, { characterSpacing: 0.5 });
  doc.moveDown(0.6);

  function step(render: () => void) {
    doc.font("Helvetica").fontSize(11).fillColor(COLORS.subtext);
    render();
    doc.moveDown(0.35);
  }

  step(() =>
    doc.text(
      "1. Call or email us to schedule your free sample meal drop.",
      left + 14,
      doc.y,
      { width: contentWidth - 14 }
    )
  );
  step(() => {
    doc.text("2. Mention code ", left + 14, doc.y, { continued: true });
    doc.font("Helvetica-Bold").fillColor(COLORS.dark).text(promo.code, {
      continued: true,
    });
    doc.font("Helvetica").fillColor(COLORS.subtext).text(" when you book.");
  });
  step(() =>
    doc.text(
      `3. Loved it? Use the same code to get ${store.discountText.toLowerCase()}.`,
      left + 14,
      doc.y,
      { width: contentWidth - 14 }
    )
  );

  const footerY = doc.page.height - doc.page.margins.bottom - 66;
  doc
    .moveTo(left, footerY)
    .lineTo(left + contentWidth, footerY)
    .lineWidth(1)
    .strokeColor(COLORS.border)
    .stroke();

  doc
    .font("Helvetica-Bold")
    .fontSize(13)
    .fillColor(COLORS.dark)
    .text(store.name, left, footerY + 14);
  doc.font("Helvetica").fontSize(10).fillColor(COLORS.subtext);
  doc.text(store.address, left, doc.y);
  doc.text(`${store.phone} · ${store.managerEmail}`, left, doc.y);

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(COLORS.muted)
    .text(`Valid through ${formatValidThrough(promo.createdAt)}`, left, footerY + 40, {
      width: contentWidth,
      align: "right",
    });

  doc.end();
  return done;
}
