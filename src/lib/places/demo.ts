import type { Lead, LeadCategory } from "../types";

// Deterministic pseudo-random generator seeded from a number, so the same
// store + radius always produces the same demo leads (stable across
// repeated searches) instead of a different list every click.
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const NAME_PARTS: Record<LeadCategory, { prefixes: string[]; suffixes: string[] }> = {
  gym: {
    prefixes: ["Pulse", "Ironworks", "Summit", "Core", "Elevate", "Momentum"],
    suffixes: ["Fitness", "Gym", "Training Studio", "Athletic Club", "CrossFit"],
  },
  clinic: {
    prefixes: ["Riverside", "Harborview", "Lakeside", "Cedar", "Parkview", "Unity"],
    suffixes: ["Family Clinic", "Medical Group", "Urgent Care", "Health Center", "Dental"],
  },
  school: {
    prefixes: ["Lincoln", "Jefferson", "Washington", "Maple", "Horizon", "Bright Path"],
    suffixes: ["Elementary School", "Middle School", "Academy", "Preschool", "High School"],
  },
  office: {
    prefixes: ["Meridian", "Beacon", "Anchor", "Northview", "Union", "Crestline"],
    suffixes: ["Coworking", "Offices", "Business Center", "Professional Suites", "HQ"],
  },
};

const STREET_NAMES = [
  "Main St",
  "Oak Ave",
  "2nd St",
  "Market St",
  "Elm St",
  "Washington Blvd",
  "Park Ave",
  "Broadway",
];

const LEADS_PER_CATEGORY = 4;

export function generateDemoLeads(
  storeLat: number,
  storeLng: number,
  radiusMiles: number,
  categories: LeadCategory[]
): Lead[] {
  const seed = Math.round((storeLat * 1e4 + storeLng * 1e4 + radiusMiles) % 2147483647);
  const rand = mulberry32(seed || 1);
  const leads: Lead[] = [];

  for (const category of categories) {
    const { prefixes, suffixes } = NAME_PARTS[category];
    for (let i = 0; i < LEADS_PER_CATEGORY; i++) {
      // Random point within the radius: random bearing, random distance
      // (sqrt for uniform area distribution) so points don't cluster at center.
      const bearing = rand() * 2 * Math.PI;
      const distanceMiles = Math.sqrt(rand()) * radiusMiles * 0.92 + 0.1;
      const distanceDeg = distanceMiles / 69; // ~69 miles per degree latitude

      const lat = storeLat + distanceDeg * Math.cos(bearing);
      const lng =
        storeLng +
        (distanceDeg * Math.sin(bearing)) / Math.cos((storeLat * Math.PI) / 180);

      const prefix = prefixes[Math.floor(rand() * prefixes.length)];
      const suffix = suffixes[Math.floor(rand() * suffixes.length)];
      const streetNum = 100 + Math.floor(rand() * 9800);
      const street = STREET_NAMES[Math.floor(rand() * STREET_NAMES.length)];

      leads.push({
        id: `demo-${category}-${i}-${lat.toFixed(5)}-${lng.toFixed(5)}`,
        name: `${prefix} ${suffix}`,
        category,
        address: `${streetNum} ${street}`,
        lat,
        lng,
        distanceMiles,
        source: "demo",
      });
    }
  }

  return leads.sort((a, b) => a.distanceMiles - b.distanceMiles);
}
