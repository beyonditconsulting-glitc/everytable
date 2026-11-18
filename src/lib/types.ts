export type LeadCategory = "gym" | "clinic" | "school" | "office";

export const LEAD_CATEGORIES: { value: LeadCategory; label: string }[] = [
  { value: "gym", label: "Gyms & fitness studios" },
  { value: "clinic", label: "Medical clinics & offices" },
  { value: "school", label: "Schools" },
  { value: "office", label: "Offices & coworking" },
];

export interface StoreProfile {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  managerName: string;
  managerEmail: string;
  phone: string;
  promoBaseCode: string;
  discountText: string;
  offerText: string;
  createdAt: string;
}

export type LeadSource = "osm" | "google" | "demo";

export interface Lead {
  id: string;
  name: string;
  category: LeadCategory;
  address: string;
  lat: number;
  lng: number;
  distanceMiles: number;
  source: LeadSource;
  phone?: string;
  website?: string;
}

export type PromoChannel = "flyer" | "email";

export interface PromoCode {
  code: string;
  storeId: string;
  leadId: string;
  leadName: string;
  leadCategory: LeadCategory;
  leadAddress: string;
  channels: PromoChannel[];
  createdAt: string;
  timesRedeemed: number;
  lastRedeemedAt?: string;
}

export interface Database {
  stores: StoreProfile[];
  promoCodes: PromoCode[];
}
