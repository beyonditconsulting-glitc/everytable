import { z } from "zod";

export const storeInputSchema = z.object({
  name: z.string().trim().min(1, "Store name is required").max(120),
  address: z.string().trim().min(5, "Enter a full street address").max(200),
  managerName: z.string().trim().min(1, "Manager name is required").max(120),
  managerEmail: z.string().trim().email("Enter a valid email"),
  phone: z.string().trim().min(7, "Enter a valid phone number").max(30),
  promoBaseCode: z
    .string()
    .trim()
    .min(2, "Promo code is required")
    .max(20)
    .regex(/^[A-Za-z0-9]+$/, "Letters and numbers only"),
  discountText: z.string().trim().min(1).max(120),
  offerText: z.string().trim().min(1).max(400),
});

export const leadSearchSchema = z.object({
  storeId: z.string().min(1),
  radiusMiles: z.number().min(0.25).max(10),
  categories: z
    .array(z.enum(["gym", "clinic", "school", "office"]))
    .min(1, "Pick at least one business type"),
});

export const leadSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.enum(["gym", "clinic", "school", "office"]),
  address: z.string(),
  lat: z.number(),
  lng: z.number(),
  distanceMiles: z.number(),
  source: z.enum(["osm", "google", "demo"]),
  phone: z.string().optional(),
  website: z.string().optional(),
});

export const actionSchema = z.object({
  storeId: z.string().min(1),
  lead: leadSchema,
});
