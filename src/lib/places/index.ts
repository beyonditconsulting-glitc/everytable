import type { Lead, LeadCategory, LeadSource } from "../types";
import { searchOsmLeads } from "./osm";
import { searchGoogleLeads } from "./google";
import { generateDemoLeads } from "./demo";

export interface LeadSearchResult {
  leads: Lead[];
  source: LeadSource;
  warning?: string;
}

export async function searchLeads(
  storeLat: number,
  storeLng: number,
  radiusMiles: number,
  categories: LeadCategory[]
): Promise<LeadSearchResult> {
  const googleKey = process.env.GOOGLE_PLACES_API_KEY;

  if (googleKey) {
    try {
      const leads = await searchGoogleLeads(
        storeLat,
        storeLng,
        radiusMiles,
        categories,
        googleKey
      );
      return { leads, source: "google" };
    } catch (err) {
      // Fall through to OSM/demo below rather than failing the whole search.
      console.error("Google Places search failed, falling back:", err);
    }
  }

  try {
    const leads = await searchOsmLeads(storeLat, storeLng, radiusMiles, categories);
    if (leads.length > 0) {
      return { leads, source: "osm" };
    }
    return {
      leads: generateDemoLeads(storeLat, storeLng, radiusMiles, categories),
      source: "demo",
      warning:
        "No businesses found in OpenStreetMap for this area, so we generated sample demo leads instead.",
    };
  } catch (err) {
    console.error("OSM search failed, falling back to demo data:", err);
    return {
      leads: generateDemoLeads(storeLat, storeLng, radiusMiles, categories),
      source: "demo",
      warning:
        "Live map data was unreachable, so these are sample demo leads for testing the workflow.",
    };
  }
}
