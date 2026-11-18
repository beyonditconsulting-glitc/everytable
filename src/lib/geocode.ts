const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const url = `${NOMINATIM_URL}?${new URLSearchParams({
    q: address,
    format: "json",
    limit: "1",
  })}`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "everytable-b2b-lead-tool/1.0",
    },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    throw new Error(`Geocoding failed with status ${res.status}`);
  }

  const results = (await res.json()) as Array<{
    lat: string;
    lon: string;
    display_name: string;
  }>;

  if (results.length === 0) {
    throw new Error(
      "Could not find that address. Try adding city and state."
    );
  }

  const [top] = results;
  return {
    lat: parseFloat(top.lat),
    lng: parseFloat(top.lon),
    displayName: top.display_name,
  };
}
