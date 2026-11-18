import type { Lead, LeadCategory } from "../types";
import { haversineMiles, milesToMeters } from "../distance";

const NEARBY_SEARCH_URL =
  "https://maps.googleapis.com/maps/api/place/nearbysearch/json";

// Google Places "type" + keyword combos used per category. We issue one
// request per combo and merge/dedupe the results.
const CATEGORY_QUERIES: Record<LeadCategory, { type?: string; keyword?: string }[]> = {
  gym: [{ type: "gym" }],
  clinic: [{ type: "doctor" }, { type: "hospital" }, { type: "dentist" }],
  school: [{ type: "school" }],
  office: [{ keyword: "office" }, { type: "coworking_space" }],
};

function categoryFromTypes(types: string[]): LeadCategory | null {
  if (types.includes("gym")) return "gym";
  if (
    types.some((t) => ["doctor", "hospital", "dentist", "health"].includes(t))
  )
    return "clinic";
  if (types.includes("school") || types.includes("university")) return "school";
  if (types.includes("coworking_space") || types.includes("point_of_interest"))
    return "office";
  return null;
}

interface GooglePlaceResult {
  place_id: string;
  name: string;
  vicinity?: string;
  types: string[];
  geometry: { location: { lat: number; lng: number } };
}

async function fetchNearby(
  lat: number,
  lng: number,
  radiusMeters: number,
  params: { type?: string; keyword?: string },
  apiKey: string
): Promise<GooglePlaceResult[]> {
  const search = new URLSearchParams({
    location: `${lat},${lng}`,
    radius: String(radiusMeters),
    key: apiKey,
  });
  if (params.type) search.set("type", params.type);
  if (params.keyword) search.set("keyword", params.keyword);

  const res = await fetch(`${NEARBY_SEARCH_URL}?${search}`, {
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    throw new Error(`Google Places returned ${res.status}`);
  }

  const json = (await res.json()) as {
    status: string;
    results?: GooglePlaceResult[];
    error_message?: string;
  };

  if (json.status !== "OK" && json.status !== "ZERO_RESULTS") {
    throw new Error(
      `Google Places status ${json.status}: ${json.error_message ?? ""}`
    );
  }

  return json.results ?? [];
}

export async function searchGoogleLeads(
  storeLat: number,
  storeLng: number,
  radiusMiles: number,
  categories: LeadCategory[],
  apiKey: string
): Promise<Lead[]> {
  const radiusMeters = Math.round(milesToMeters(radiusMiles));
  const seen = new Set<string>();
  const leads: Lead[] = [];

  for (const category of categories) {
    for (const params of CATEGORY_QUERIES[category]) {
      const results = await fetchNearby(
        storeLat,
        storeLng,
        radiusMeters,
        params,
        apiKey
      );

      for (const place of results) {
        if (seen.has(place.place_id)) continue;
        seen.add(place.place_id);

        const resolvedCategory = categoryFromTypes(place.types) ?? category;
        const { lat, lng } = place.geometry.location;
        const distanceMiles = haversineMiles(storeLat, storeLng, lat, lng);
        if (distanceMiles > radiusMiles) continue;

        leads.push({
          id: `google-${place.place_id}`,
          name: place.name,
          category: resolvedCategory,
          address: place.vicinity ?? "Address not listed",
          lat,
          lng,
          distanceMiles,
          source: "google",
        });
      }
    }
  }

  return leads.sort((a, b) => a.distanceMiles - b.distanceMiles);
}
