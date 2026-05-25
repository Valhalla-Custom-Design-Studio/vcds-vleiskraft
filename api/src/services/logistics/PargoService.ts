/**
 * Pargo API — SA pickup point logistics
 * 3000+ pickup points across SA (Checkers, PEP, etc.)
 * Free sandbox, production: per-parcel pricing
 */

const PARGO_API_KEY = process.env.PARGO_API_KEY || "";
const PARGO_BASE = "https://api.pargo.co.za/api";

export interface PargoPoint {
  code: string;
  name: string;
  address: string;
  city: string;
  province: string;
  lat: number;
  lon: number;
  openingHours: string;
  distance?: number;
}

export async function getNearbyPickupPoints(lat: number, lon: number, radius = 10): Promise<PargoPoint[]> {
  const res = await fetch(`${PARGO_BASE}/pickup-points/nearest?lat=${lat}&lng=${lon}&radius=${radius}`, {
    headers: { Authorization: `Bearer ${PARGO_API_KEY}` },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.pickupPoints || []).map((p: any) => ({
    code: p.code, name: p.storeName, address: p.address,
    city: p.city, province: p.province,
    lat: p.latitude, lon: p.longitude,
    openingHours: p.openingHours || "Mon-Fri 8am-5pm",
    distance: p.distance,
  }));
}

export async function createShipment(orderId: string, pickupCode: string, parcelDetails: { weight: number; dimensions: string }): Promise<{ trackingNumber: string; label: string }> {
  const res = await fetch(`${PARGO_BASE}/shipments`, {
    method: "POST",
    headers: { Authorization: `Bearer ${PARGO_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, pickupPointCode: pickupCode, ...parcelDetails }),
  });
  const data = await res.json();
  return { trackingNumber: data.trackingNumber || "MOCK-TRK-001", label: data.labelUrl || "" };
}

export async function trackShipment(trackingNumber: string): Promise<{ status: string; location: string; eta: string }> {
  const res = await fetch(`${PARGO_BASE}/shipments/${trackingNumber}/track`, {
    headers: { Authorization: `Bearer ${PARGO_API_KEY}` },
  });
  const data = await res.json();
  return { status: data.status || "In Transit", location: data.currentLocation || "", eta: data.estimatedDelivery || "" };
}
