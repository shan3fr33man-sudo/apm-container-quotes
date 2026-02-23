import type { CityCoords } from "@/types";
import { US_CITIES } from "./cities";
import { ROAD_DISTANCE_MULTIPLIER } from "./constants";

const STATE_ABBR_MAP: Record<string, string> = {
  alabama: "AL", alaska: "AK", arizona: "AZ", arkansas: "AR", california: "CA",
  colorado: "CO", connecticut: "CT", delaware: "DE", florida: "FL", georgia: "GA",
  hawaii: "HI", idaho: "ID", illinois: "IL", indiana: "IN", iowa: "IA",
  kansas: "KS", kentucky: "KY", louisiana: "LA", maine: "ME", maryland: "MD",
  massachusetts: "MA", michigan: "MI", minnesota: "MN", mississippi: "MS", missouri: "MO",
  montana: "MT", nebraska: "NE", nevada: "NV", "new hampshire": "NH", "new jersey": "NJ",
  "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND",
  ohio: "OH", oklahoma: "OK", oregon: "OR", pennsylvania: "PA", "rhode island": "RI",
  "south carolina": "SC", "south dakota": "SD", tennessee: "TN", texas: "TX",
  utah: "UT", vermont: "VT", virginia: "VA", washington: "WA",
  "west virginia": "WV", wisconsin: "WI", wyoming: "WY",
  "district of columbia": "DC",
};

function normalizeState(input: string): string {
  const trimmed = input.trim().toUpperCase();
  if (trimmed.length === 2) return trimmed;
  const abbr = STATE_ABBR_MAP[input.trim().toLowerCase()];
  return abbr || trimmed;
}

function normalizeCity(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z\s]/g, "");
}

export function parseCityState(input: string): { city: string; state: string } | null {
  const parts = input.split(",").map((s) => s.trim());
  if (parts.length < 2) return null;
  const city = parts[0];
  const state = parts[parts.length - 1];
  if (!city || !state) return null;
  return { city, state: normalizeState(state) };
}

export function findCity(input: string): CityCoords | null {
  const parsed = parseCityState(input);
  if (!parsed) return null;

  const normalizedCity = normalizeCity(parsed.city);
  const normalizedState = parsed.state.toUpperCase();

  // Exact match first
  const exact = US_CITIES.find(
    (c) =>
      normalizeCity(c.city) === normalizedCity &&
      c.stateAbbr.toUpperCase() === normalizedState
  );
  if (exact) return exact;

  // Fuzzy: starts-with match
  const startsWith = US_CITIES.find(
    (c) =>
      normalizeCity(c.city).startsWith(normalizedCity) &&
      c.stateAbbr.toUpperCase() === normalizedState
  );
  if (startsWith) return startsWith;

  // Fuzzy: contains match
  const contains = US_CITIES.find(
    (c) =>
      normalizeCity(c.city).includes(normalizedCity) &&
      c.stateAbbr.toUpperCase() === normalizedState
  );
  return contains || null;
}

export function getSuggestions(input: string): string[] {
  if (input.length < 2) return [];
  const lower = input.toLowerCase();
  return US_CITIES
    .filter((c) => {
      const full = `${c.city}, ${c.stateAbbr}`.toLowerCase();
      return full.includes(lower) || c.city.toLowerCase().startsWith(lower);
    })
    .slice(0, 8)
    .map((c) => `${c.city}, ${c.stateAbbr}`);
}

function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateDistance(origin: string, destination: string): number | null {
  const originCity = findCity(origin);
  const destCity = findCity(destination);

  if (!originCity || !destCity) return null;

  const straightLine = haversineDistance(
    originCity.lat, originCity.lng,
    destCity.lat, destCity.lng
  );

  return Math.round(straightLine * ROAD_DISTANCE_MULTIPLIER);
}
