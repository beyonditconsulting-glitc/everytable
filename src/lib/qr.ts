import QRCode from "qrcode";
import type { PromoCode, StoreProfile } from "./types";

function redeemText(store: StoreProfile, promo: PromoCode): string {
  return `${store.name}\nPromo code: ${promo.code}\nCall ${store.phone} or email ${store.managerEmail} to redeem.`;
}

export async function buildRedeemQrBuffer(
  store: StoreProfile,
  promo: PromoCode
): Promise<Buffer> {
  return QRCode.toBuffer(redeemText(store, promo), {
    type: "png",
    margin: 1,
    width: 240,
    color: { dark: "#1f2421", light: "#ffffff" },
  });
}
