import QRCode from "qrcode";
import type { PromoCode, StoreProfile } from "./types";

export async function buildRedeemQrDataUrl(
  store: StoreProfile,
  promo: PromoCode
): Promise<string> {
  const text = `${store.name}\nPromo code: ${promo.code}\nCall ${store.phone} or email ${store.managerEmail} to redeem.`;
  return QRCode.toDataURL(text, {
    margin: 1,
    width: 240,
    color: { dark: "#1f2421", light: "#ffffff" },
  });
}
