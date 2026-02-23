import type {
  QuoteRequest,
  ProviderQuote,
  PriceBreakdown,
  PriceRange,
  MoveEstimate,
  CapacityInfo,
  WeightStatus,
  ContainerConfig,
  Provider,
  ContainerSpec,
} from "@/types";
import {
  UBOX_PRICING,
  PODS_PRICING,
  ABF_PRICING,
  TRANSIT_TIMES,
  LOCAL_MOVE_THRESHOLD_MILES,
  ABF_MINIMUM_DISTANCE_MILES,
  PROVIDER_NAMES,
  PROVIDER_URLS,
  CONTAINER_SPECS,
  HOME_SIZE_DATA,
  SEASONAL_MULTIPLIERS,
  PRICE_RANGE_SPREAD,
  getUBoxVolumeDiscount,
} from "./constants";

// --- Helpers ---

function getTransitTime(provider: Provider, distanceMiles: number): string {
  const brackets = TRANSIT_TIMES[provider];
  const bracket = brackets.find((t) => distanceMiles <= t.maxMiles);
  return bracket?.days ?? brackets[brackets.length - 1].days;
}

function getSeasonalMultiplier(moveDate: Date): { multiplier: number; label: string } {
  const month = moveDate.getMonth();
  return SEASONAL_MULTIPLIERS[month] ?? { multiplier: 1.0, label: "Normal" };
}

function toRange(midpoint: number): PriceRange {
  const low = Math.round(midpoint * (1 - PRICE_RANGE_SPREAD));
  const high = Math.round(midpoint * (1 + PRICE_RANGE_SPREAD));
  return { low, high, mid: Math.round(midpoint) };
}

function computeTieredShipping(
  distance: number,
  baseFee: number,
  tiers: { limit: number; rate: number }[]
): number {
  let total = baseFee;
  let remaining = distance;
  for (let i = 0; i < tiers.length; i++) {
    const prevLimit = i === 0 ? 0 : tiers[i - 1].limit;
    const tierCap = tiers[i].limit === Infinity ? remaining : tiers[i].limit - prevLimit;
    const milesInTier = Math.min(remaining, tierCap);
    total += milesInTier * tiers[i].rate;
    remaining -= milesInTier;
    if (remaining <= 0) break;
  }
  return Math.round(total);
}

export function getMoveEstimate(request: QuoteRequest): MoveEstimate {
  const data = HOME_SIZE_DATA[request.homeSize];
  const level = request.furnishingLevel;
  const cubicFeet = request.cubicFeetOverride ?? data.cubicFeet[level];
  const weightLbs = Math.round(cubicFeet * 7); // industry standard 7 lbs/cu ft
  return {
    cubicFeet,
    weightLbs,
    rooms: data.rooms,
    homeSizeLabel: data.label,
    furnishingLabel: level.charAt(0).toUpperCase() + level.slice(1),
    typicalItems: data.typicalItems,
  };
}

function calculateContainersNeeded(totalCuFt: number, totalWeight: number, spec: ContainerSpec): number {
  const byVolume = Math.ceil(totalCuFt / spec.usableCubicFeet);
  const byWeight = Math.ceil(totalWeight / spec.usableWeight);
  return Math.max(byVolume, byWeight);
}

function getWeightStatus(totalWeight: number, numContainers: number, maxWeightPerContainer: number): { status: WeightStatus; message: string } {
  const totalCapacity = numContainers * maxWeightPerContainer;
  const utilization = totalWeight / totalCapacity;
  if (utilization > 1.0) return { status: "over", message: `OVER weight limit! ${totalWeight.toLocaleString()} lbs > ${totalCapacity.toLocaleString()} lbs capacity` };
  if (utilization > 0.85) return { status: "tight", message: `Weight is tight (${Math.round(utilization * 100)}% utilized). Consider adding a container.` };
  return { status: "ok", message: `Weight OK: ${totalWeight.toLocaleString()} lbs of ${totalCapacity.toLocaleString()} lbs` };
}

function makeCapacity(totalCuFt: number, totalWeight: number, numContainers: number, spec: ContainerSpec): CapacityInfo {
  const totalCapCuFt = numContainers * spec.cubicFeet;
  const bufferPercent = totalCuFt > 0 ? Math.round(((totalCapCuFt - totalCuFt) / totalCuFt) * 100) : 0;
  const ws = getWeightStatus(totalWeight, numContainers, spec.maxWeight);
  return {
    totalCubicFeet: totalCapCuFt,
    bufferPercent,
    weightStatus: ws.status,
    weightMessage: ws.message,
    totalWeightCapacity: numContainers * spec.maxWeight,
    estimatedWeight: totalWeight,
  };
}

// --- U-Box Estimator ---

function estimateUBox(
  request: QuoteRequest,
  distanceMiles: number,
  isLocal: boolean,
  seasonalMult: number,
  estimate: MoveEstimate
): ProviderQuote {
  const spec = CONTAINER_SPECS.ubox;
  const containersNeeded = calculateContainersNeeded(estimate.cubicFeet, estimate.weightLbs, spec);
  const breakdown: PriceBreakdown[] = [];
  let total = 0;

  if (isLocal) {
    const localCost = UBOX_PRICING.localFlatRate * containersNeeded;
    breakdown.push({ label: `Local move (${containersNeeded} U-Box${containersNeeded > 1 ? "es" : ""})`, amount: localCost });
    total += localCost;
  } else {
    const shippingPerContainer = computeTieredShipping(distanceMiles, UBOX_PRICING.shippingBaseFee, [
      { limit: UBOX_PRICING.shippingTier1Limit, rate: UBOX_PRICING.shippingTier1PerMile },
      { limit: UBOX_PRICING.shippingTier2Limit, rate: UBOX_PRICING.shippingTier2PerMile },
      { limit: Infinity, rate: UBOX_PRICING.shippingTier3PerMile },
    ]);
    const discount = getUBoxVolumeDiscount(containersNeeded);
    const discountedShipping = Math.round(shippingPerContainer * discount);
    const totalShipping = discountedShipping * containersNeeded;
    breakdown.push({ label: `Shipping (${containersNeeded} U-Box${containersNeeded > 1 ? "es" : ""})`, amount: totalShipping });
    if (discount < 1.0) {
      breakdown.push({ label: `Volume discount (${Math.round((1 - discount) * 100)}% off)`, amount: -Math.round((shippingPerContainer - discountedShipping) * containersNeeded) });
    }
    total += totalShipping;
    const deliveryFees = UBOX_PRICING.originDelivery + UBOX_PRICING.destinationDelivery;
    breakdown.push({ label: "Delivery & pickup fees", amount: deliveryFees });
    total += deliveryFees;
  }

  const rental = Math.round(UBOX_PRICING.rentalPerMonth * containersNeeded);
  breakdown.push({ label: `Monthly rental (${containersNeeded} containers)`, amount: rental });
  total += rental;

  if (request.storageNeeded && request.storageMonths) {
    const storageCost = Math.round(UBOX_PRICING.storagePerMonth * request.storageMonths * containersNeeded);
    breakdown.push({ label: `Storage (${request.storageMonths} mo)`, amount: storageCost });
    total += storageCost;
  }

  total = Math.round(total * seasonalMult);

  const capacity = makeCapacity(estimate.cubicFeet, estimate.weightLbs, containersNeeded, spec);
  const notes: string[] = [];
  if (capacity.weightStatus === "tight") notes.push(capacity.weightMessage);
  if (getUBoxVolumeDiscount(containersNeeded) < 1.0) {
    notes.push(`Bulk discount: ${Math.round((1 - getUBoxVolumeDiscount(containersNeeded)) * 100)}% off shipping`);
  }

  return {
    provider: "ubox",
    providerName: PROVIDER_NAMES.ubox,
    priceRange: toRange(total),
    breakdown,
    transitDays: getTransitTime("ubox", distanceMiles),
    containerConfig: [{ size: "U-Box (257 cu ft)", count: containersNeeded }],
    containerLabel: `${containersNeeded} x U-Box`,
    containersNeeded,
    capacity,
    notes,
    includes: ["Door-to-door service", "30-day rental period", "Weather-resistant containers", "Load/unload at your pace", "Only pay for containers used"],
    isEstimate: true,
    isCheapest: false,
    bookingUrl: PROVIDER_URLS.ubox,
    seasonalMultiplier: seasonalMult,
  };
}

// --- PODS Estimator ---

function computePodsPrice(
  distanceMiles: number,
  isLocal: boolean,
  sizeKey: string,
  count: number,
  seasonalMult: number,
  request: QuoteRequest
): { total: number; breakdown: PriceBreakdown[] } {
  const breakdown: PriceBreakdown[] = [];
  let total = 0;

  if (isLocal) {
    const localBase = PODS_PRICING.localBase[sizeKey] * count;
    breakdown.push({ label: `Local move (${count} x ${sizeKey})`, amount: localBase });
    total += localBase;
  } else {
    const transportPerContainer = computeTieredShipping(distanceMiles, PODS_PRICING.transportBase[sizeKey], [
      { limit: PODS_PRICING.transportTier1Limit, rate: PODS_PRICING.transportTier1PerMile[sizeKey] },
      { limit: PODS_PRICING.transportTier2Limit, rate: PODS_PRICING.transportTier2PerMile[sizeKey] },
      { limit: Infinity, rate: PODS_PRICING.transportTier3PerMile[sizeKey] },
    ]);
    const totalTransport = transportPerContainer * count;
    breakdown.push({ label: `Transport (${count} x ${sizeKey})`, amount: totalTransport });
    total += totalTransport;
    breakdown.push({ label: "Delivery & final pickup", amount: PODS_PRICING.deliveryFee * 2 });
    total += PODS_PRICING.deliveryFee * 2;
    breakdown.push({ label: "Long-distance admin fee", amount: Math.round(PODS_PRICING.adminFee) });
    total += PODS_PRICING.adminFee;
  }

  const rental = PODS_PRICING.monthlyRental[sizeKey] * count;
  breakdown.push({ label: `Monthly rental (${count} containers)`, amount: rental });
  total += rental;

  if (request.storageNeeded && request.storageMonths) {
    const storageCost = Math.round(PODS_PRICING.storagePerMonth[sizeKey] * request.storageMonths * count);
    breakdown.push({ label: `Storage (${request.storageMonths} mo)`, amount: storageCost });
    total += storageCost;
  }

  total = Math.round(total * seasonalMult);
  return { total, breakdown };
}

function estimatePods(
  request: QuoteRequest,
  distanceMiles: number,
  isLocal: boolean,
  seasonalMult: number,
  estimate: MoveEstimate
): ProviderQuote {
  const isLongDistance = distanceMiles >= LOCAL_MOVE_THRESHOLD_MILES;

  // Calculate container counts for each size
  const num8ft = calculateContainersNeeded(estimate.cubicFeet, estimate.weightLbs, CONTAINER_SPECS.pods_8ft);
  const num16ft = calculateContainersNeeded(estimate.cubicFeet, estimate.weightLbs, CONTAINER_SPECS.pods_16ft);

  // Build candidate configs
  type Config = { configs: ContainerConfig[]; label: string; sizeKey: string; count: number; specKey: string };
  const candidates: Config[] = [];

  // All 16ft
  candidates.push({ configs: [{ size: "16ft", count: num16ft }], label: `${num16ft} x 16-foot PODS`, sizeKey: "16ft", count: num16ft, specKey: "pods_16ft" });

  // All 8ft
  candidates.push({ configs: [{ size: "8ft", count: num8ft }], label: `${num8ft} x 8-foot PODS`, sizeKey: "8ft", count: num8ft, specKey: "pods_8ft" });

  // Mix: (num16ft-1) x 16ft + some 8ft for remainder
  if (num16ft > 1) {
    const coveredBig = (num16ft - 1) * CONTAINER_SPECS.pods_16ft.usableCubicFeet;
    const remainCuFt = Math.max(0, estimate.cubicFeet - coveredBig);
    const remainWeight = Math.max(0, estimate.weightLbs - (num16ft - 1) * CONTAINER_SPECS.pods_16ft.usableWeight);
    const fill8 = calculateContainersNeeded(remainCuFt, remainWeight, CONTAINER_SPECS.pods_8ft);
    if (fill8 > 0 && fill8 <= 2) {
      candidates.push({
        configs: [{ size: "16ft", count: num16ft - 1 }, { size: "8ft", count: fill8 }],
        label: `${num16ft - 1} x 16ft + ${fill8} x 8ft PODS`,
        sizeKey: "16ft",
        count: num16ft - 1 + fill8,
        specKey: "pods_16ft",
      });
    }
  }

  // 12ft for local only
  if (!isLongDistance) {
    const num12ft = calculateContainersNeeded(estimate.cubicFeet, estimate.weightLbs, CONTAINER_SPECS.pods_12ft);
    candidates.push({ configs: [{ size: "12ft", count: num12ft }], label: `${num12ft} x 12-foot PODS`, sizeKey: "12ft", count: num12ft, specKey: "pods_12ft" });
  }

  // Price each config — for mixed, approximate using the primary size
  const priced = candidates.map((c) => {
    // For mixed configs, compute per-part
    if (c.configs.length > 1) {
      let totalPrice = 0;
      const allBreakdown: PriceBreakdown[] = [];
      for (const part of c.configs) {
        const { total, breakdown } = computePodsPrice(distanceMiles, isLocal, part.size, part.count, seasonalMult, request);
        totalPrice += total;
        allBreakdown.push(...breakdown);
      }
      return { ...c, price: totalPrice, breakdown: allBreakdown };
    }
    const { total, breakdown } = computePodsPrice(distanceMiles, isLocal, c.sizeKey, c.count, seasonalMult, request);
    return { ...c, price: total, breakdown };
  });

  // Sort by price
  priced.sort((a, b) => a.price - b.price);
  const best = priced[0];
  const alt = priced.length > 1 && priced[1].price !== best.price ? priced[1] : undefined;

  // Capacity for best option
  const bestSpec = best.configs.length === 1
    ? CONTAINER_SPECS[best.specKey]
    : CONTAINER_SPECS.pods_16ft; // approximate for mixed
  const bestTotalCount = best.configs.reduce((s, c) => s + c.count, 0);
  const bestTotalCuFt = best.configs.reduce((s, c) => {
    const sk = `pods_${c.size}`;
    return s + c.count * (CONTAINER_SPECS[sk]?.cubicFeet ?? 0);
  }, 0);
  const bestWs = getWeightStatus(estimate.weightLbs, bestTotalCount, bestSpec.maxWeight);
  const bestCapacity: CapacityInfo = {
    totalCubicFeet: bestTotalCuFt,
    bufferPercent: estimate.cubicFeet > 0 ? Math.round(((bestTotalCuFt - estimate.cubicFeet) / estimate.cubicFeet) * 100) : 0,
    weightStatus: bestWs.status,
    weightMessage: bestWs.message,
    totalWeightCapacity: bestTotalCount * bestSpec.maxWeight,
    estimatedWeight: estimate.weightLbs,
  };

  const notes: string[] = [];
  if (!isLocal) {
    notes.push("PODS 12-foot containers are local moves only");
    notes.push("Call 877-350-7637 for exact PODS long-distance quote");
  }
  if (bestCapacity.weightStatus === "tight") notes.push(bestCapacity.weightMessage);

  let alternativeConfig: ProviderQuote["alternativeConfig"] = undefined;
  if (alt) {
    const altTotalCount = alt.configs.reduce((s, c) => s + c.count, 0);
    const altTotalCuFt = alt.configs.reduce((s, c) => s + c.count * (CONTAINER_SPECS[`pods_${c.size}`]?.cubicFeet ?? 0), 0);
    const altSpec = CONTAINER_SPECS[alt.specKey] ?? CONTAINER_SPECS.pods_16ft;
    alternativeConfig = {
      containerConfig: alt.configs,
      label: alt.label,
      priceRange: toRange(alt.price),
      capacity: (() => {
        const ws = getWeightStatus(estimate.weightLbs, altTotalCount, altSpec.maxWeight);
        return {
          totalCubicFeet: altTotalCuFt,
          bufferPercent: estimate.cubicFeet > 0 ? Math.round(((altTotalCuFt - estimate.cubicFeet) / estimate.cubicFeet) * 100) : 0,
          weightStatus: ws.status,
          weightMessage: ws.message,
          totalWeightCapacity: altTotalCount * altSpec.maxWeight,
          estimatedWeight: estimate.weightLbs,
        };
      })(),
    };
  }

  return {
    provider: "pods",
    providerName: PROVIDER_NAMES.pods,
    priceRange: toRange(best.price),
    breakdown: best.breakdown,
    transitDays: getTransitTime("pods", distanceMiles),
    containerConfig: best.configs,
    containerLabel: best.label,
    containersNeeded: bestTotalCount,
    capacity: bestCapacity,
    notes,
    includes: ["30 days of storage included", "Flexible scheduling", "Steel-framed, weather-resistant", "Ground-level loading", "Pay-as-you-go billing"],
    isEstimate: true,
    isCheapest: false,
    bookingUrl: PROVIDER_URLS.pods,
    seasonalMultiplier: seasonalMult,
    alternativeConfig,
  };
}

// --- ABF U-Pack Estimator ---

function estimateAbf(
  request: QuoteRequest,
  distanceMiles: number,
  seasonalMult: number,
  estimate: MoveEstimate
): ProviderQuote {
  if (distanceMiles < ABF_MINIMUM_DISTANCE_MILES) {
    return {
      provider: "abf",
      providerName: PROVIDER_NAMES.abf,
      priceRange: { low: 0, high: 0, mid: 0 },
      breakdown: [],
      transitDays: "",
      containerConfig: [],
      containerLabel: "",
      containersNeeded: 0,
      capacity: { totalCubicFeet: 0, bufferPercent: 0, weightStatus: "ok", weightMessage: "", totalWeightCapacity: 0, estimatedWeight: 0 },
      notes: [],
      includes: [],
      isEstimate: true,
      isCheapest: false,
      bookingUrl: PROVIDER_URLS.abf,
      unavailable: true,
      unavailableReason: `U-Pack is long-distance only (min ${ABF_MINIMUM_DISTANCE_MILES} miles). This route is ~${distanceMiles} miles.`,
      seasonalMultiplier: seasonalMult,
    };
  }

  const linearFeetNeeded = Math.max(
    ABF_PRICING.minLinearFeet,
    Math.min(Math.ceil(estimate.cubicFeet / ABF_PRICING.cuFtPerLinearFoot), ABF_PRICING.maxLinearFeet)
  );

  const breakdown: PriceBreakdown[] = [];
  let total = Math.min(
    ABF_PRICING.baseFee + distanceMiles * ABF_PRICING.perMile,
    ABF_PRICING.maxPrice
  );
  total = Math.round(total * seasonalMult);

  breakdown.push({ label: `Freight trailer — ${linearFeetNeeded} linear ft`, amount: total });

  if (request.storageNeeded && request.storageMonths) {
    const storageCost = Math.round(ABF_PRICING.storagePerMonth * request.storageMonths);
    breakdown.push({ label: `Storage (${request.storageMonths} mo)`, amount: storageCost });
    total += storageCost;
  }

  const trailerCuFt = linearFeetNeeded * ABF_PRICING.cuFtPerLinearFoot;
  const capacity: CapacityInfo = {
    totalCubicFeet: trailerCuFt,
    bufferPercent: estimate.cubicFeet > 0 ? Math.round(((trailerCuFt - estimate.cubicFeet) / estimate.cubicFeet) * 100) : 0,
    weightStatus: "ok",
    weightMessage: "Trailer has no per-unit weight limit",
    totalWeightCapacity: 99999,
    estimatedWeight: estimate.weightLbs,
  };

  const notes: string[] = [];
  notes.push("All-inclusive: delivery, transport, standard liability");
  notes.push("3 days to load, 3 days to unload included");

  return {
    provider: "abf",
    providerName: PROVIDER_NAMES.abf,
    priceRange: toRange(total),
    breakdown,
    transitDays: getTransitTime("abf", distanceMiles),
    containerConfig: [{ size: "Freight Trailer", count: 1 }],
    containerLabel: `28-ft trailer (${linearFeetNeeded} linear ft used)`,
    containersNeeded: 1,
    capacity,
    notes,
    includes: ["Guaranteed pricing — no hidden fees", "Professional drivers", "Trackable shipments", "3 business days load + 3 unload", "Standard liability coverage", "Only pay for linear feet you use"],
    isEstimate: true,
    isCheapest: false,
    bookingUrl: PROVIDER_URLS.abf,
    seasonalMultiplier: seasonalMult,
  };
}

// --- Recommendation ---

function generateRecommendation(estimate: MoveEstimate, distanceMiles: number): string {
  const cuft = estimate.cubicFeet;

  if (distanceMiles < ABF_MINIMUM_DISTANCE_MILES) {
    return "U-Pack isn't available for local moves. Compare U-Box and PODS for the best deal.";
  }
  if (cuft <= 500 && distanceMiles < 500) {
    return "U-Box is typically the best value for smaller moves under 500 miles.";
  }
  if (cuft <= 1100 && distanceMiles > 500) {
    return "Compare U-Box and PODS 16ft carefully — PODS includes 30 days storage, U-Box charges separately.";
  }
  if (cuft > 1100) {
    return "For large homes, U-Pack's trailer option is often significantly cheaper than multiple containers from any provider.";
  }
  return "Compare all three providers — prices vary significantly by route and season.";
}

// --- Main Entry Point ---

export function getEstimates(
  request: QuoteRequest,
  distanceMiles: number
): {
  quotes: ProviderQuote[];
  moveEstimate: MoveEstimate;
  seasonalMultiplier: number;
  seasonLabel: string;
  recommendation: string;
} {
  const isLocal = distanceMiles < LOCAL_MOVE_THRESHOLD_MILES;
  const { multiplier: seasonalMult, label: seasonLabel } = getSeasonalMultiplier(request.moveDate);
  const estimate = getMoveEstimate(request);

  const quotes: ProviderQuote[] = [
    estimateUBox(request, distanceMiles, isLocal, seasonalMult, estimate),
    estimatePods(request, distanceMiles, isLocal, seasonalMult, estimate),
    estimateAbf(request, distanceMiles, seasonalMult, estimate),
  ];

  const availableQuotes = quotes.filter((q) => !q.unavailable);
  if (availableQuotes.length > 0) {
    const minPrice = Math.min(...availableQuotes.map((q) => q.priceRange.mid));
    for (const q of quotes) {
      q.isCheapest = !q.unavailable && q.priceRange.mid === minPrice;
    }
  }

  const recommendation = generateRecommendation(estimate, distanceMiles);

  return { quotes, moveEstimate: estimate, seasonalMultiplier: seasonalMult, seasonLabel, recommendation };
}
