import { nanoid } from "nanoid";
import { updateDb, readDb } from "./db";
import { geocodeAddress } from "./geocode";
import type { StoreProfile } from "./types";

export interface StoreInput {
  name: string;
  address: string;
  managerName: string;
  managerEmail: string;
  phone: string;
  promoBaseCode: string;
  discountText: string;
  offerText: string;
}

export async function listStores(): Promise<StoreProfile[]> {
  const db = await readDb();
  return db.stores;
}

export async function getStore(id: string): Promise<StoreProfile | undefined> {
  const db = await readDb();
  return db.stores.find((s) => s.id === id);
}

export async function createStore(input: StoreInput): Promise<StoreProfile> {
  const geo = await geocodeAddress(input.address);

  const store: StoreProfile = {
    id: nanoid(10),
    name: input.name,
    address: input.address,
    lat: geo.lat,
    lng: geo.lng,
    managerName: input.managerName,
    managerEmail: input.managerEmail,
    phone: input.phone,
    promoBaseCode: input.promoBaseCode.toUpperCase().replace(/\s+/g, ""),
    discountText: input.discountText,
    offerText: input.offerText,
    createdAt: new Date().toISOString(),
  };

  await updateDb((db) => {
    db.stores.push(store);
  });

  return store;
}

export async function updateStore(
  id: string,
  input: StoreInput
): Promise<StoreProfile> {
  const existing = await getStore(id);
  if (!existing) {
    throw new Error("Store not found");
  }

  const addressChanged = existing.address !== input.address;
  const geo = addressChanged
    ? await geocodeAddress(input.address)
    : { lat: existing.lat, lng: existing.lng };

  return updateDb((db) => {
    const store = db.stores.find((s) => s.id === id);
    if (!store) throw new Error("Store not found");
    store.name = input.name;
    store.address = input.address;
    store.lat = geo.lat;
    store.lng = geo.lng;
    store.managerName = input.managerName;
    store.managerEmail = input.managerEmail;
    store.phone = input.phone;
    store.promoBaseCode = input.promoBaseCode.toUpperCase().replace(/\s+/g, "");
    store.discountText = input.discountText;
    store.offerText = input.offerText;
    return store;
  });
}
