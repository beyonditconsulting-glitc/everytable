import type { Lead, LeadCategory } from "../types";
import { haversineMiles, milesToMeters } from "../distance";

// Public Overpass mirrors to try in order. Some public mirrors block
// requests from certain networks/datacenter IP ranges, so we fail over.
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

const CATEGORY_FILTERS: Record<LeadCategory, string[]> = {
  gym: [
    'node["leisure"="fitness_centre"]',
    'way["leisure"="fitness_centre"]',
    'node["amenity"="gym"]',
  ],
  clinic: [
    'node["amenity"="clinic"]',
    'node["amenity"="doctors"]',
    'node["amenity"="dentist"]',
    'way["amenity"="hospital"]',
    'node["amenity"="hospital"]',
  ],
  school: [
    'node["amenity"="school"]',
    'way["amenity"="school"]',
    'node["amenity"="university"]',
  ],
  office: [
    'node["office"]',
    'way["office"]',
    'node["building"="office"]',
  ],
};

function buildQuery(
  lat: number,
  lng: number,
  radiusMeters: number,
  categories: LeadCategory[]
): string {
  const clauses = categories
    .flatMap((c) => CATEGORY_FILTERS[c])
    .map((filter) => `${filter}(around:${radiusMeters},${lat},${lng});`)
    .join("\n  ");

  return `[out:json][timeout:25];
(
  ${clauses}
);
out center tags 150;`;
}

function categoryFromTags(tags: Record<string, string>): LeadCategory | null {
  if (tags.leisure === "fitness_centre" || tags.amenity === "gym") return "gym";
  if (
    ["clinic", "doctors", "dentist", "hospital"].includes(tags.amenity ?? "")
  )
    return "clinic";
  if (["school", "university"].includes(tags.amenity ?? "")) return "school";
  if (tags.office || tags.building === "office") return "office";
  return null;
}

function formatAddress(tags: Record<string, string>): string {
  const parts = [
    [tags["addr:housenumber"], tags["addr:street"]].filter(Boolean).join(" "),
    tags["addr:city"],
    tags["addr:state"],
    tags["addr:postcode"],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Address not listed";
}

interface OverpassElement {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

async function fetchFromMirror(
  mirror: string,
  query: string
): Promise<OverpassElement[]> {
  const res = await fetch(mirror, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "everytable-b2b-lead-tool/1.0",
    },
    body: `data=${encodeURIComponent(query)}`,
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    throw new Error(`Overpass mirror ${mirror} returned ${res.status}`);
  }

  const json = (await res.json()) as { elements: OverpassElement[] };
  return json.elements ?? [];
}

export async function searchOsmLeads(
  storeLat: number,
  storeLng: number,
  radiusMiles: number,
  categories: LeadCategory[]
): Promise<Lead[]> {
  const radiusMeters = Math.round(milesToMeters(radiusMiles));
  const query = buildQuery(storeLat, storeLng, radiusMeters, categories);

  let elements: OverpassElement[] | null = null;
  let lastError: unknown;

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      elements = await fetchFromMirror(mirror, query);
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (elements === null) {
    throw new Error(
      `All Overpass mirrors unreachable: ${
        lastError instanceof Error ? lastError.message : String(lastError)
      }`
    );
  }

  const seen = new Set<string>();
  const leads: Lead[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name;
    if (!name) continue;

    const category = categoryFromTags(tags);
    if (!category) continue;

    const lat = el.lat ?? el.center?.lat;
    const lng = el.lon ?? el.center?.lon;
    if (lat === undefined || lng === undefined) continue;

    const dedupeKey = `${name.toLowerCase()}|${lat.toFixed(4)}|${lng.toFixed(4)}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    const distanceMiles = haversineMiles(storeLat, storeLng, lat, lng);
    if (distanceMiles > radiusMiles) continue;

    leads.push({
      id: `osm-${el.type}-${el.id}`,
      name,
      category,
      address: formatAddress(tags),
      lat,
      lng,
      distanceMiles,
      source: "osm",
      phone: tags.phone ?? tags["contact:phone"],
      website: tags.website ?? tags["contact:website"],
    });
  }

  return leads.sort((a, b) => a.distanceMiles - b.distanceMiles);
}
