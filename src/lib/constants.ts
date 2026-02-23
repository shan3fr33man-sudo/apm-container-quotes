import type { Provider, HomeSize, FurnishingLevel, HomeSizeData, ContainerSpec, FurnitureItem } from "@/types";

// --- Provider Info ---

export const PROVIDER_NAMES: Record<Provider, string> = {
  ubox: "U-Box by U-Haul",
  pods: "PODS",
  abf: "ABF U-Pack",
};

export const PROVIDER_LOGOS: Record<Provider, string> = {
  ubox: "/logos/ubox.svg",
  pods: "/logos/pods.svg",
  abf: "/logos/abf.svg",
};

export const PROVIDER_URLS: Record<Provider, string> = {
  ubox: "https://www.uhaul.com/UBox/",
  pods: "https://www.pods.com/moving-services",
  abf: "https://www.upack.com/quote",
};

// --- Home Size Data (industry standard Table of Measurements) ---

export const HOME_SIZE_DATA: Record<HomeSize, HomeSizeData> = {
  studio_apartment: {
    label: "Studio Apartment",
    cubicFeet: { light: 150, average: 200, heavy: 300 },
    weightLbs: { light: 1050, average: 1400, heavy: 2100 },
    rooms: 1.5,
    typicalItems: "Bed, dresser, small desk, sofa or futon, TV, 10-20 boxes",
    truckSize: "10-foot truck",
  },
  "1bed_apartment": {
    label: "1 Bedroom Apartment",
    cubicFeet: { light: 250, average: 400, heavy: 600 },
    weightLbs: { light: 1750, average: 2800, heavy: 4200 },
    rooms: 2.5,
    typicalItems: "Bed, dresser, nightstands, sofa, coffee table, dining set (small), TV, 15-30 boxes",
    truckSize: "10-12 foot truck",
  },
  "1bed_house": {
    label: "1 Bedroom House",
    cubicFeet: { light: 350, average: 500, heavy: 750 },
    weightLbs: { light: 2450, average: 3500, heavy: 5250 },
    rooms: 3.5,
    typicalItems: "Same as 1BR apt + more storage, possibly garage items, yard tools",
    truckSize: "12-15 foot truck",
  },
  "2bed_apartment": {
    label: "2 Bedroom Apartment",
    cubicFeet: { light: 400, average: 600, heavy: 900 },
    weightLbs: { light: 2800, average: 4200, heavy: 6300 },
    rooms: 4,
    typicalItems: "2 beds, dressers, sofa, loveseat, dining table + 4 chairs, TV, desk, 25-40 boxes",
    truckSize: "15-foot truck",
  },
  "2bed_house": {
    label: "2 Bedroom House",
    cubicFeet: { light: 500, average: 800, heavy: 1100 },
    weightLbs: { light: 3500, average: 5600, heavy: 7700 },
    rooms: 5,
    typicalItems: "Same as 2BR apt + washer/dryer, more furniture, garage items, patio furniture",
    truckSize: "15-17 foot truck",
  },
  "3bed_apartment": {
    label: "3 Bedroom Apartment",
    cubicFeet: { light: 600, average: 900, heavy: 1200 },
    weightLbs: { light: 4200, average: 6300, heavy: 8400 },
    rooms: 5.5,
    typicalItems: "3 beds, multiple dressers, large sofa set, dining set for 6, multiple TVs, 35-50 boxes",
    truckSize: "17-20 foot truck",
  },
  "3bed_house": {
    label: "3 Bedroom House",
    cubicFeet: { light: 800, average: 1100, heavy: 1500 },
    weightLbs: { light: 5600, average: 7700, heavy: 10500 },
    rooms: 7,
    typicalItems: "Full household: 3 bedrooms, living room, dining room, kitchen appliances, garage, possibly basement/attic, 40-60 boxes",
    truckSize: "20-foot truck",
  },
  "4bed_house": {
    label: "4 Bedroom House",
    cubicFeet: { light: 1100, average: 1500, heavy: 2000 },
    weightLbs: { light: 7700, average: 10500, heavy: 14000 },
    rooms: 9,
    typicalItems: "Large household: 4 bedrooms, living/family rooms, formal dining, office, full kitchen, 2-car garage items, 50-80 boxes",
    truckSize: "26-foot truck",
  },
  "5bed_house": {
    label: "5 Bedroom House",
    cubicFeet: { light: 1400, average: 1900, heavy: 2500 },
    weightLbs: { light: 9800, average: 13300, heavy: 17500 },
    rooms: 11,
    typicalItems: "Very large household: 5 bedrooms, multiple living areas, formal dining, office, playroom, full garage, basement/attic, 60-100 boxes",
    truckSize: "26-foot truck or semi",
  },
  "5plus_estate": {
    label: "5+ Bedroom / Large Estate",
    cubicFeet: { light: 1800, average: 2500, heavy: 3500 },
    weightLbs: { light: 12600, average: 17500, heavy: 24500 },
    rooms: 14,
    typicalItems: "Estate: 6+ bedrooms, multiple floors, full basement, large garage, workshop, extensive furniture, possibly piano, pool table, 80-120+ boxes",
    truckSize: "Semi trailer or multiple trucks",
  },
};

export const FURNISHING_LABELS: Record<FurnishingLevel, { label: string; description: string }> = {
  light: { label: "Light", description: "Minimal furniture, mostly boxes" },
  average: { label: "Average", description: "Typical furnishings for home size" },
  heavy: { label: "Heavy", description: "Fully furnished, garage/attic/basement items" },
};

// --- Container Specifications (75% packing efficiency) ---

export const CONTAINER_SPECS: Record<string, ContainerSpec> = {
  ubox: {
    name: "U-Box",
    cubicFeet: 257,
    maxWeight: 2000,
    usableCubicFeet: 193,
    usableWeight: 2000,
    dimensions: "7'11\" L x 4'8\" W x 6'11.5\" H",
  },
  pods_8ft: {
    name: "PODS 8-foot",
    cubicFeet: 385,
    maxWeight: 5200,
    usableCubicFeet: 289,
    usableWeight: 5200,
    dimensions: "8' L x 7' W x 8' H",
  },
  pods_12ft: {
    name: "PODS 12-foot",
    cubicFeet: 689,
    maxWeight: 4600,
    usableCubicFeet: 517,
    usableWeight: 4600,
    dimensions: "12' L x 8' W x 8' H",
    localOnly: true,
  },
  pods_16ft: {
    name: "PODS 16-foot",
    cubicFeet: 857,
    maxWeight: 4200,
    usableCubicFeet: 643,
    usableWeight: 4200,
    dimensions: "16' L x 8' W x 8' H",
  },
  relocube: {
    name: "ReloCube",
    cubicFeet: 308,
    maxWeight: 2000,
    usableCubicFeet: 231,
    usableWeight: 2000,
    dimensions: "6'3\" L x 7' W x 8'4\" H",
    longDistanceOnly: true,
  },
};

// --- U-Box Pricing ---

export const UBOX_PRICING = {
  rentalPerMonth: 99,
  originDelivery: 99,
  destinationDelivery: 99,
  storagePerMonth: 74.95,
  shippingBaseFee: 350,
  shippingTier1PerMile: 0.80,
  shippingTier1Limit: 500,
  shippingTier2PerMile: 0.65,
  shippingTier2Limit: 1500,
  shippingTier3PerMile: 0.50,
  localFlatRate: 250,
};

export function getUBoxVolumeDiscount(numContainers: number): number {
  if (numContainers <= 1) return 1.0;
  if (numContainers <= 2) return 0.90;
  if (numContainers <= 4) return 0.78;
  if (numContainers <= 6) return 0.65;
  if (numContainers <= 8) return 0.55;
  return 0.48;
}

// --- PODS Pricing ---

export const PODS_PRICING = {
  deliveryFee: 75,
  adminFee: 54.95,
  monthlyRental: { "8ft": 169, "12ft": 209, "16ft": 345 } as Record<string, number>,
  storagePerMonth: { "8ft": 169, "12ft": 209, "16ft": 345 } as Record<string, number>,
  transportBase: { "8ft": 450, "12ft": 550, "16ft": 800 } as Record<string, number>,
  transportTier1PerMile: { "8ft": 2.20, "12ft": 2.60, "16ft": 3.40 } as Record<string, number>,
  transportTier1Limit: 500,
  transportTier2PerMile: { "8ft": 1.30, "12ft": 1.60, "16ft": 2.20 } as Record<string, number>,
  transportTier2Limit: 1500,
  transportTier3PerMile: { "8ft": 0.90, "12ft": 1.10, "16ft": 1.50 } as Record<string, number>,
  localBase: { "8ft": 400, "12ft": 550, "16ft": 750 } as Record<string, number>,
};

// --- ABF U-Pack Pricing ---

export const ABF_PRICING = {
  minimumDistance: 100,
  baseFee: 800,
  tier1PerMile: 1.80,
  tier1Limit: 500,
  tier2PerMile: 1.30,
  tier2Limit: 1500,
  tier3PerMile: 1.00,
  storagePerMonth: 150,
  volumeDiscount3Plus: 0.95,
  trailerBase: 2000,
  trailerPerMile: 1.60,
  trailerMaxPrice: 5500,
  trailerCuFtPerLinearFoot: 72,
  trailerMaxLinearFeet: 28,
  trailerMinLinearFeet: 5,
};

// --- Transit Times ---

export const TRANSIT_TIMES: Record<Provider, { maxMiles: number; days: string }[]> = {
  ubox: [
    { maxMiles: 50, days: "1-3 days" },
    { maxMiles: 500, days: "5-7 days" },
    { maxMiles: 1500, days: "7-14 days" },
    { maxMiles: Infinity, days: "10-21 days" },
  ],
  pods: [
    { maxMiles: 50, days: "1-3 days" },
    { maxMiles: 500, days: "5-7 days" },
    { maxMiles: 1500, days: "7-14 days" },
    { maxMiles: Infinity, days: "10-21 days" },
  ],
  abf: [
    { maxMiles: 500, days: "2-5 business days" },
    { maxMiles: 1500, days: "3-5 business days" },
    { maxMiles: Infinity, days: "5-6 business days" },
  ],
};

// --- Thresholds ---

export const LOCAL_MOVE_THRESHOLD_MILES = 50;
export const ABF_MINIMUM_DISTANCE_MILES = 100;

// --- Seasonal ---

export const SEASONAL_MULTIPLIERS: Record<number, { multiplier: number; label: string }> = {
  0: { multiplier: 0.90, label: "Low season" },
  1: { multiplier: 0.90, label: "Low season" },
  2: { multiplier: 0.95, label: "Shoulder season" },
  3: { multiplier: 1.00, label: "Normal season" },
  4: { multiplier: 1.10, label: "Peak season begins" },
  5: { multiplier: 1.20, label: "Peak season" },
  6: { multiplier: 1.25, label: "Peak season" },
  7: { multiplier: 1.20, label: "Peak season" },
  8: { multiplier: 1.10, label: "Winding down" },
  9: { multiplier: 1.00, label: "Normal season" },
  10: { multiplier: 0.90, label: "Low season" },
  11: { multiplier: 0.85, label: "Lowest season" },
};

export const PRICE_RANGE_SPREAD = 0.10;
export const ROAD_DISTANCE_MULTIPLIER = 1.3;
export const PRICING_LAST_UPDATED = "February 2026";

// --- Furniture Reference (cu ft per item) ---

export const FURNITURE_ITEMS: FurnitureItem[] = [
  // Bedroom
  { name: "King Bed (with mattress)", cubicFeet: 70, category: "Bedroom" },
  { name: "Queen Bed (with mattress)", cubicFeet: 60, category: "Bedroom" },
  { name: "Full/Double Bed", cubicFeet: 50, category: "Bedroom" },
  { name: "Twin Bed", cubicFeet: 40, category: "Bedroom" },
  { name: "Dresser (large)", cubicFeet: 30, category: "Bedroom" },
  { name: "Dresser (small)", cubicFeet: 18, category: "Bedroom" },
  { name: "Nightstand", cubicFeet: 5, category: "Bedroom" },
  { name: "Wardrobe/Armoire", cubicFeet: 35, category: "Bedroom" },
  // Living Room
  { name: "Sofa (3-seat)", cubicFeet: 50, category: "Living Room" },
  { name: "Loveseat", cubicFeet: 30, category: "Living Room" },
  { name: "Sectional Sofa", cubicFeet: 80, category: "Living Room" },
  { name: "Recliner", cubicFeet: 20, category: "Living Room" },
  { name: "Coffee Table", cubicFeet: 10, category: "Living Room" },
  { name: "End Table", cubicFeet: 5, category: "Living Room" },
  { name: "Entertainment Center", cubicFeet: 40, category: "Living Room" },
  { name: "Bookcase (large)", cubicFeet: 25, category: "Living Room" },
  { name: "Bookcase (small)", cubicFeet: 15, category: "Living Room" },
  { name: "TV (60\"+, with stand)", cubicFeet: 15, category: "Living Room" },
  // Dining
  { name: "Dining Table (seats 6)", cubicFeet: 30, category: "Dining" },
  { name: "Dining Table (seats 4)", cubicFeet: 20, category: "Dining" },
  { name: "Dining Chair", cubicFeet: 5, category: "Dining" },
  { name: "China Cabinet", cubicFeet: 35, category: "Dining" },
  // Kitchen
  { name: "Refrigerator", cubicFeet: 45, category: "Kitchen" },
  { name: "Stove/Range", cubicFeet: 25, category: "Kitchen" },
  { name: "Washer", cubicFeet: 20, category: "Kitchen" },
  { name: "Dryer", cubicFeet: 20, category: "Kitchen" },
  // Office
  { name: "Desk (large)", cubicFeet: 30, category: "Office" },
  { name: "Desk (small)", cubicFeet: 15, category: "Office" },
  { name: "Office Chair", cubicFeet: 10, category: "Office" },
  { name: "Filing Cabinet", cubicFeet: 10, category: "Office" },
  // Misc
  { name: "Piano (upright)", cubicFeet: 60, category: "Misc" },
  { name: "Piano (grand)", cubicFeet: 100, category: "Misc" },
  { name: "Treadmill", cubicFeet: 35, category: "Misc" },
  { name: "Bicycle", cubicFeet: 10, category: "Misc" },
  { name: "Patio Set (table + 4 chairs)", cubicFeet: 30, category: "Misc" },
  { name: "Lawn Mower", cubicFeet: 15, category: "Misc" },
  { name: "Grill", cubicFeet: 15, category: "Misc" },
  // Boxes
  { name: "Small Box (1.5 cu ft)", cubicFeet: 1.5, category: "Boxes" },
  { name: "Medium Box (3 cu ft)", cubicFeet: 3, category: "Boxes" },
  { name: "Large Box (4.5 cu ft)", cubicFeet: 4.5, category: "Boxes" },
  { name: "Extra Large Box (6 cu ft)", cubicFeet: 6, category: "Boxes" },
  { name: "Wardrobe Box (10 cu ft)", cubicFeet: 10, category: "Boxes" },
];
