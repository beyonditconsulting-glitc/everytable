import { customAlphabet } from "nanoid";
import { updateDb } from "./db";
import type { Lead, PromoChannel, PromoCode, StoreProfile } from "./types";

const suffixAlphabet = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 4);

function buildCodeString(baseCode: string, lead: Lead): string {
  const categoryTag = lead.category.slice(0, 2).toUpperCase();
  return `${baseCode}-${categoryTag}${suffixAlphabet()}`;
}

/**
 * Returns the existing promo code for this store+lead if one was already
 * generated, otherwise mints a new one. Keeps the code stable across the
 * flyer and email channels so tracking stays consistent per lead.
 */
export async function getOrCreatePromoCode(
  store: StoreProfile,
  lead: Lead,
  channel: PromoChannel
): Promise<PromoCode> {
  return updateDb((db) => {
    const existing = db.promoCodes.find(
      (p) => p.storeId === store.id && p.leadId === lead.id
    );

    if (existing) {
      if (!existing.channels.includes(channel)) {
        existing.channels.push(channel);
      }
      return existing;
    }

    const created: PromoCode = {
      code: buildCodeString(store.promoBaseCode, lead),
      storeId: store.id,
      leadId: lead.id,
      leadName: lead.name,
      leadCategory: lead.category,
      leadAddress: lead.address,
      channels: [channel],
      createdAt: new Date().toISOString(),
      timesRedeemed: 0,
    };
    db.promoCodes.push(created);
    return created;
  });
}

export async function listPromoCodes(storeId: string): Promise<PromoCode[]> {
  return updateDb((db) =>
    db.promoCodes
      .filter((p) => p.storeId === storeId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );
}

export async function redeemPromoCode(
  storeId: string,
  code: string
): Promise<PromoCode | null> {
  return updateDb((db) => {
    const match = db.promoCodes.find(
      (p) => p.storeId === storeId && p.code === code
    );
    if (!match) return null;
    match.timesRedeemed += 1;
    match.lastRedeemedAt = new Date().toISOString();
    return match;
  });
}
