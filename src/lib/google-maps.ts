import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let initialized = false;

export function isGoogleMapsAvailable(): boolean {
  return !!import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
}

function ensureInitialized(): void {
  if (!initialized) {
    setOptions({
      key: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    });
    initialized = true;
  }
}

async function loadPlaces(): Promise<google.maps.PlacesLibrary> {
  ensureInitialized();
  return (await importLibrary("places")) as google.maps.PlacesLibrary;
}

async function loadDistanceMatrix(): Promise<google.maps.DistanceMatrixService> {
  ensureInitialized();
  await importLibrary("routes");
  return new google.maps.DistanceMatrixService();
}

export async function getPlaceSuggestions(
  input: string
): Promise<string[]> {
  if (input.length < 2 || !isGoogleMapsAvailable()) return [];

  try {
    const places = await loadPlaces();
    const service = new places.AutocompleteService();
    const response = await service.getPlacePredictions({
      input,
      componentRestrictions: { country: "us" },
      types: ["(cities)"],
    });

    return (response.predictions || []).slice(0, 8).map((p: google.maps.places.AutocompletePrediction) => {
      // Convert "Seattle, WA, USA" → "Seattle, WA"
      const parts = p.description.split(", ");
      if (parts.length >= 3 && parts[parts.length - 1] === "USA") {
        return parts.slice(0, -1).join(", ");
      }
      return p.description;
    });
  } catch (e) {
    console.warn("Google Places API error, falling back to local suggestions:", e);
    return [];
  }
}

export async function getDistanceMatrix(
  origin: string,
  destination: string
): Promise<number | null> {
  if (!isGoogleMapsAvailable()) return null;

  try {
    const service = await loadDistanceMatrix();

    const response = await service.getDistanceMatrix({
      origins: [origin],
      destinations: [destination],
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.IMPERIAL,
    });

    const element = response.rows[0]?.elements[0];
    if (element?.status !== "OK" || !element.distance) return null;

    // distance.value is in meters, convert to miles
    return Math.round(element.distance.value / 1609.344);
  } catch (e) {
    console.warn("Google Distance Matrix API error:", e);
    return null;
  }
}
