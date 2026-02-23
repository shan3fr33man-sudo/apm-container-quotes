import { useState, useMemo } from "react";
import { format } from "date-fns";
import {
  CalendarIcon,
  ChevronDown,
  ChevronUp,
  Loader2,
  Search,
  Package,
  Weight,
  Home,
} from "lucide-react";
import { QuoteRequestSchema } from "@/types";
import type { QuoteRequest, HomeSize, FurnishingLevel } from "@/types";
import {
  HOME_SIZE_DATA,
  FURNISHING_LABELS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { AddressInput } from "./address-input";
import { cn } from "@/lib/utils";

const HOME_SIZE_OPTIONS: { value: HomeSize; label: string }[] = [
  { value: "studio_apartment", label: "Studio Apartment" },
  { value: "1bed_apartment", label: "1 Bedroom Apartment" },
  { value: "1bed_house", label: "1 Bedroom House" },
  { value: "2bed_apartment", label: "2 Bedroom Apartment" },
  { value: "2bed_house", label: "2 Bedroom House" },
  { value: "3bed_apartment", label: "3 Bedroom Apartment" },
  { value: "3bed_house", label: "3 Bedroom House" },
  { value: "4bed_house", label: "4 Bedroom House" },
  { value: "5bed_house", label: "5 Bedroom House" },
  { value: "5plus_estate", label: "5+ Bedroom / Large Estate" },
];

const FURNISHING_OPTIONS: FurnishingLevel[] = ["light", "average", "heavy"];

interface QuoteFormProps {
  onSubmit: (request: QuoteRequest) => void;
  isLoading: boolean;
}

export function QuoteForm({ onSubmit, isLoading }: QuoteFormProps) {
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [moveDate, setMoveDate] = useState<Date | undefined>();
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>();
  const [homeSize, setHomeSize] = useState<HomeSize>("2bed_apartment");
  const [furnishingLevel, setFurnishingLevel] = useState<FurnishingLevel>("average");
  const [storageNeeded, setStorageNeeded] = useState(false);
  const [storageMonths, setStorageMonths] = useState(1);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [showCustomerInfo, setShowCustomerInfo] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sizeData = useMemo(() => HOME_SIZE_DATA[homeSize], [homeSize]);
  const estimatedCuFt = sizeData.cubicFeet[furnishingLevel];
  const estimatedWeight = Math.round(estimatedCuFt * 7);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const data = {
      originCity,
      destinationCity,
      moveDate,
      deliveryDate: deliveryDate || undefined,
      homeSize,
      furnishingLevel,
      storageNeeded,
      storageMonths: storageNeeded ? storageMonths : undefined,
      customerName: customerName || undefined,
      customerPhone: customerPhone || undefined,
      customerEmail: customerEmail || undefined,
    };

    const result = QuoteRequestSchema.safeParse(data);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0]?.toString() ?? "form";
        if (!fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }

    onSubmit(result.data);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Get Container Quotes</CardTitle>
        <CardDescription>
          Compare pricing from UBox, PODS, and ABF U-Pack instantly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Origin / Destination */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="origin">Moving From</Label>
              <AddressInput
                id="origin"
                value={originCity}
                onChange={setOriginCity}
                placeholder="City, State (e.g. Seattle, WA)"
              />
              {errors.originCity && (
                <p className="text-sm text-destructive">{errors.originCity}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="destination">Moving To</Label>
              <AddressInput
                id="destination"
                value={destinationCity}
                onChange={setDestinationCity}
                placeholder="City, State (e.g. Phoenix, AZ)"
              />
              {errors.destinationCity && (
                <p className="text-sm text-destructive">
                  {errors.destinationCity}
                </p>
              )}
            </div>
          </div>

          {/* Dates */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Move Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !moveDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {moveDate ? format(moveDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={moveDate}
                    onSelect={setMoveDate}
                    disabled={(date) => date < new Date()}
                  />
                </PopoverContent>
              </Popover>
              {errors.moveDate && (
                <p className="text-sm text-destructive">{errors.moveDate}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Preferred Delivery Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !deliveryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 size-4" />
                    {deliveryDate
                      ? format(deliveryDate, "PPP")
                      : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={deliveryDate}
                    onSelect={setDeliveryDate}
                    disabled={(date) =>
                      date < new Date() || (moveDate ? date < moveDate : false)
                    }
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Home Size + Furnishing Level */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Home Size</Label>
              <Select
                value={homeSize}
                onValueChange={(v) => setHomeSize(v as HomeSize)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {HOME_SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Furnishing Level</Label>
              <div className="flex gap-2">
                {FURNISHING_OPTIONS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFurnishingLevel(level)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-2 text-sm transition-colors",
                      furnishingLevel === level
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="font-medium">{FURNISHING_LABELS[level].label}</div>
                    <div className={cn(
                      "text-xs",
                      furnishingLevel === level ? "text-primary-foreground/70" : "text-muted-foreground"
                    )}>
                      {FURNISHING_LABELS[level].description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Stats */}
            <div className="flex flex-wrap gap-3">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                <Package className="size-3.5" />
                {estimatedCuFt.toLocaleString()} cu ft
              </Badge>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                <Weight className="size-3.5" />
                {estimatedWeight.toLocaleString()} lbs
              </Badge>
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                <Home className="size-3.5" />
                ~{sizeData.rooms} rooms
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {sizeData.typicalItems}
            </p>
          </div>

          {/* Storage */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Switch
                id="storage"
                checked={storageNeeded}
                onCheckedChange={setStorageNeeded}
              />
              <Label htmlFor="storage" className="cursor-pointer">
                Need storage at destination?
              </Label>
            </div>
            {storageNeeded && (
              <div className="ml-12 max-w-xs space-y-2">
                <Label htmlFor="storageMonths">Storage Duration (months)</Label>
                <Input
                  id="storageMonths"
                  type="number"
                  min={1}
                  max={24}
                  value={storageMonths}
                  onChange={(e) =>
                    setStorageMonths(
                      Math.max(1, Math.min(24, parseInt(e.target.value) || 1))
                    )
                  }
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Customer Info (collapsible) */}
          <div>
            <button
              type="button"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setShowCustomerInfo(!showCustomerInfo)}
            >
              {showCustomerInfo ? (
                <ChevronUp className="size-4" />
              ) : (
                <ChevronDown className="size-4" />
              )}
              Customer Info (optional — used for quote copy)
            </button>
            {showCustomerInfo && (
              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Name</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Phone</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">Email</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-destructive">
                      {errors.customerEmail}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Getting Quotes...
              </>
            ) : (
              <>
                <Search className="mr-2 size-4" />
                Get Quotes
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
