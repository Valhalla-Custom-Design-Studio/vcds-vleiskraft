/**
 * Vleis-to-Fork(TM)  -  World-first SA meat traceability
 * QR scan -> farm origin, animal ID, slaughter date, cold chain, carbon footprint
 * Blockchain: Polygon ID (free, decentralized)
 * PATENT PENDING  -  VCDS(TM) IP Asset
 */

export interface MeatTrace {
  qrCode: string;
  animalId: string;
  farmName: string;
  farmLocation: string;
  farmerId: string;
  breed: string;
  slaughterDate: string;
  slaughterHouse: string;
  coldChainLog: ColdChainEntry[];
  carbonFootprint: number; // kg CO2e
  certifications: string[];
  retailer: string;
  packDate: string;
  bestBefore: string;
  polygonTxHash?: string;
}

export interface ColdChainEntry {
  timestamp: string;
  location: string;
  temperature: number;
  humidity: number;
  status: "OK" | "WARNING" | "BREACH";
}

// Generate QR trace record (called at slaughter/packing)
export async function createTraceRecord(data: Omit<MeatTrace, "qrCode" | "polygonTxHash">): Promise<MeatTrace> {
  const qrCode = `VTF-${data.animalId}-${Date.now()}`;
  // Store on Polygon (free L2 blockchain)
  const txHash = await recordOnPolygon(qrCode, data);
  return { ...data, qrCode, polygonTxHash: txHash };
}

// Lookup by QR scan
export async function lookupTrace(qrCode: string): Promise<MeatTrace | null> {
  // In production: query PostgreSQL + verify on Polygon
  // Placeholder for DB lookup
  return null;
}

// Polygon ID  -  record trace hash on-chain (free)
async function recordOnPolygon(qrCode: string, data: any): Promise<string> {
  const POLYGON_RPC = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
  // In production: use ethers.js to write hash to smart contract
  // For now: return mock tx hash
  const hash = Buffer.from(JSON.stringify({ qrCode, timestamp: Date.now() })).toString("hex").slice(0, 64);
  return `0x${hash}`;
}

// Carbon footprint calculator (SA beef industry averages)
export function calculateCarbonFootprint(breed: string, ageMonths: number, feedType: "grass" | "feedlot" | "mixed"): number {
  const baseKgCO2 = { grass: 18, feedlot: 27, mixed: 22 };
  const breedMultiplier: Record<string, number> = { Angus: 0.9, Brahman: 1.1, Bonsmara: 1.0, Nguni: 0.85, Simmentaler: 1.05 };
  const base = baseKgCO2[feedType] || 22;
  const multiplier = breedMultiplier[breed] || 1.0;
  return Math.round(base * multiplier * (ageMonths / 24));
}

// -- Legacy-compatible wrappers (route-facing) -----------------------------
import crypto from "crypto";

export interface VleisToForkRecord {
  qr_code: string;
  product_name: string;
  cut_type: string;
  weight_kg: number;
  animal: { animal_id: string; farm_name: string; breed: string; feed_type: string; antibiotic_free: boolean; hormone_free: boolean; };
  slaughter: { slaughter_date: string; abattoir_name: string; grade: string; halaal_certified: boolean; };
  cold_chain: { timestamp: string; location: string; temperature_c: number; }[];
  carbon_footprint_kg_co2: number;
  retailer: string;
  pack_date: string;
  best_before: string;
  blockchain_hash: string;
  ip_watermark: string;
}

export function generateQRPayload(
  record: Omit<VleisToForkRecord, "qr_code" | "blockchain_hash" | "ip_watermark">
): VleisToForkRecord {
  const payload = JSON.stringify(record);
  const blockchain_hash = crypto.createHash("sha256").update(payload).digest("hex");
  const qr_code = `VTF-${record.animal.animal_id}-${Date.now()}`;
  return {
    ...record,
    qr_code,
    blockchain_hash,
    ip_watermark: "VCDS(TM) Vleis-to-Fork(TM)  -  Patent Pending",
  };
}

export function verifyBlockchainHash(record: VleisToForkRecord): boolean {
  const { blockchain_hash, qr_code, ip_watermark, ...rest } = record;
  const recomputed = crypto.createHash("sha256").update(JSON.stringify(rest)).digest("hex");
  return recomputed === blockchain_hash;
}
