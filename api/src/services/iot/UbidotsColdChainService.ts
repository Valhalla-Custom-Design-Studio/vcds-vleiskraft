/**
 * Ubidots IoT API — Cold chain temperature monitoring
 * Free tier: 3 devices, 4000 dots/day
 * Use case: Meat transport temp logging for Vleis-to-Fork™
 */

const UBIDOTS_TOKEN = process.env.UBIDOTS_TOKEN || "";
const UBIDOTS_BASE = "https://industrial.api.ubidots.com/api/v1.6";

export interface TempReading {
  deviceId: string;
  temperature: number;
  humidity: number;
  timestamp: number;
  location?: { lat: number; lon: number };
}

export async function getLatestReading(deviceLabel: string): Promise<TempReading | null> {
  const res = await fetch(`${UBIDOTS_BASE}/devices/${deviceLabel}/temperature/lv`, {
    headers: { "X-Auth-Token": UBIDOTS_TOKEN },
  });
  if (!res.ok) return null;
  const temp = await res.json();
  const humRes = await fetch(`${UBIDOTS_BASE}/devices/${deviceLabel}/humidity/lv`, {
    headers: { "X-Auth-Token": UBIDOTS_TOKEN },
  });
  const humidity = humRes.ok ? await humRes.json() : 0;
  return { deviceId: deviceLabel, temperature: temp.value || 0, humidity: humidity.value || 0, timestamp: temp.timestamp || Date.now() };
}

export async function checkColdChainCompliance(deviceLabel: string, minTemp = 0, maxTemp = 4): Promise<{ compliant: boolean; breaches: TempReading[] }> {
  const res = await fetch(`${UBIDOTS_BASE}/devices/${deviceLabel}/temperature/values/?page_size=100`, {
    headers: { "X-Auth-Token": UBIDOTS_TOKEN },
  });
  const data = await res.json();
  const readings: TempReading[] = (data.results || []).map((r: any) => ({
    deviceId: deviceLabel, temperature: r.value, humidity: 0, timestamp: r.timestamp,
  }));
  const breaches = readings.filter(r => r.temperature < minTemp || r.temperature > maxTemp);
  return { compliant: breaches.length === 0, breaches };
}

export async function sendTempAlert(deviceLabel: string, temperature: number): Promise<void> {
  // Post alert event to Ubidots
  await fetch(`${UBIDOTS_BASE}/devices/${deviceLabel}/`, {
    method: "POST",
    headers: { "X-Auth-Token": UBIDOTS_TOKEN, "Content-Type": "application/json" },
    body: JSON.stringify({ temperature_alert: { value: temperature, context: { status: "BREACH" } } }),
  });
}
