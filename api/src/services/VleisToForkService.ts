/**
 * Vleis-to-Fork™ — SA-First Meat Traceability QR System
 * World First: Consumer scans QR → full farm-to-plate chain
 * Patent pending — VCDS™ IP Asset
 */
import crypto from "crypto";

export interface AnimalRecord {
  animal_id: string;
  farm_name: string;
  farm_gps: { lat: number; lng: number };
  farmer_name: string;
  breed: string;
  birth_date: string;
  feed_type: "grass_fed" | "grain_fed" | "free_range" | "organic";
  antibiotic_free: boolean;
  hormone_free: boolean;
}

export interface SlaughterRecord {
  slaughter_date: string;
  abattoir_name: string;
  abattoir_cert: string;
  inspector_id: string;
  grade: "A" | "AB" | "B" | "C";
  halaal_certified: boolean;
  kosher_certified: boolean;
}

export interface ColdChainRecord {
  timestamp: string;
  location: string;
  temperature_c: number;
  humidity_pct: number;
  handler: string;
}

export interface VleisToForkRecord {
  qr_code: string;
  product_name: string;
  cut_type: string;
  weight_kg: number;
  animal: AnimalRecord;
  slaughter: SlaughterRecord;
  cold_chain: ColdChainRecord[];
  carbon_footprint_kg_co2: number;
  retailer: string;
  pack_date: string;
  best_before: string;
  blockchain_hash: string;
  ip_watermark: string;
}

export function generateQRPayload(record: Omit<VleisToForkRecord, "qr_code" | "blockchain_hash" | "ip_watermark">): VleisToForkRecord {
  const payload = JSON.stringify(record);
  const hash = crypto.createHash("sha256").update(payload).digest("hex");
  const qr_code = `VCDS-VTF-${record.animal.animal_id}-${Date.now()}`;

  return {
    ...record,
    qr_code,
    blockchain_hash: hash,
    ip_watermark: "Vleis-to-Fork™ — VCDS™ Patent Pending ZA2026/XXXXX",
  };
}

export function calculateCarbonFootprint(
  feed_type: AnimalRecord["feed_type"],
  weight_kg: number,
  transport_km: number
): number {
  const base_factors = {
    grass_fed: 14.5,
    grain_fed: 27.0,
    free_range: 18.0,
    organic: 16.0,
  };
  const transport_factor = 0.21; // kg CO2 per km per tonne
  return parseFloat(
    (base_factors[feed_type] * weight_kg + (transport_km * weight_kg * transport_factor) / 1000).toFixed(2)
  );
}

export function verifyBlockchainHash(record: VleisToForkRecord): boolean {
  const { qr_code, blockchain_hash, ip_watermark, ...rest } = record;
  const payload = JSON.stringify(rest);
  const expected = crypto.createHash("sha256").update(payload).digest("hex");
  return expected === blockchain_hash;
}
