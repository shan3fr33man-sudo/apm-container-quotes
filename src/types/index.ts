import { z } from "zod/v4";

export const HomeSize = z.enum([
  "studio_apartment",
  "1bed_apartment",
  "1bed_house",
  "2bed_apartment",
  "2bed_house",
  "3bed_apartment",
  "3bed_house",
  "4bed_house",
  "5bed_house",
  "5plus_estate",
]);
export type HomeSize = z.infer<typeof HomeSize>;

export const FurnishingLevel = z.enum(["light", "average", "heavy"]);
export type FurnishingLevel = z.infer<typeof FurnishingLevel>;

export const Provider = z.enum(["ubox", "pods", "abf"]);
export type Provider = z.infer<typeof Provider>;

export const QuoteRequestSchema = z.object({
  originCity: z.string().min(2, "Origin city is required"),
  destinationCity: z.string().min(2, "Destination city is required"),
  moveDate: z.date({ error: "Move date is required" }),
  deliveryDate: z.date().optional(),
  homeSize: HomeSize,
  furnishingLevel: FurnishingLevel,
  cubicFeetOverride: z.number().optional(), // from item checklist refinement
  storageNeeded: z.boolean(),
  storageMonths: z.number().int().min(1).max(24).optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  customerEmail: z.email().optional().or(z.literal("")),
});
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

export interface HomeSizeData {
  label: string;
  cubicFeet: Record<FurnishingLevel, number>;
  weightLbs: Record<FurnishingLevel, number>;
  rooms: number;
  typicalItems: string;
  truckSize: string;
}

export interface ContainerSpec {
  name: string;
  cubicFeet: number;
  maxWeight: number;
  usableCubicFeet: number;
  usableWeight: number;
  dimensions: string;
  localOnly?: boolean;
  longDistanceOnly?: boolean;
}

export interface PriceBreakdown {
  label: string;
  amount: number;
}

export interface PriceRange {
  low: number;
  high: number;
  mid: number;
}

export type WeightStatus = "ok" | "tight" | "over";

export interface ContainerConfig {
  size: string;
  count: number;
}

export interface CapacityInfo {
  totalCubicFeet: number;
  bufferPercent: number;
  weightStatus: WeightStatus;
  weightMessage: string;
  totalWeightCapacity: number;
  estimatedWeight: number;
}

export interface ProviderQuote {
  provider: Provider;
  providerName: string;
  priceRange: PriceRange;
  breakdown: PriceBreakdown[];
  transitDays: string;
  containerConfig: ContainerConfig[];
  containerLabel: string;
  containersNeeded: number;
  capacity: CapacityInfo;
  notes: string[];
  includes: string[];
  isEstimate: boolean;
  isCheapest: boolean;
  bookingUrl: string;
  unavailable?: boolean;
  unavailableReason?: string;
  seasonalMultiplier: number;
  // PODS can have alternative configs
  alternativeConfig?: {
    containerConfig: ContainerConfig[];
    label: string;
    priceRange: PriceRange;
    capacity: CapacityInfo;
  };
}

export interface TrailerAlternative {
  priceRange: PriceRange;
  linearFeet: number;
  description: string;
  note: string;
  capacity: CapacityInfo;
}

export interface MoveEstimate {
  cubicFeet: number;
  weightLbs: number;
  rooms: number;
  homeSizeLabel: string;
  furnishingLabel: string;
  typicalItems: string;
}

export interface QuoteResult {
  request: QuoteRequest;
  quotes: ProviderQuote[];
  distanceMiles: number;
  isLocalMove: boolean;
  moveEstimate: MoveEstimate;
  seasonalMultiplier: number;
  seasonLabel: string;
  trailerAlternative?: TrailerAlternative;
  recommendation: string;
}

export interface CityCoords {
  city: string;
  state: string;
  stateAbbr: string;
  lat: number;
  lng: number;
}

export interface FurnitureItem {
  name: string;
  cubicFeet: number;
  category: string;
}
