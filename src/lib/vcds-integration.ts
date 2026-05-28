/**
 * VCDS™ Cross-App Integration Layer
 * VleisKraft™ ↔ Fitness & Fuel™
 * KAN-3: Integration Pass
 */

export const INTEGRATION_CONFIG = {
  // Shared user identity — same VCDS account works in both apps
  SHARED_AUTH: true,

  // F&F pulls SA food nutrition data from VleisKraft database
  FF_VLEISKRAFT_FOODS_ENDPOINT: process.env.EXPO_PUBLIC_API_BASE?.replace('vleiskraft', 'vleiskraft') + '/api/foods/sa-database',

  // VleisKraft pushes meat pack deals to F&F macro tracker
  VLEISKRAFT_DEALS_FEED: true,

  // Shared PayFast subscription — one subscription unlocks both apps
  SHARED_SUBSCRIPTION_TIER: ['pro', 'platinum'],

  // Deep link: F&F → VleisKraft product page
  DEEP_LINK_VLEISKRAFT: 'vcds-vleiskraft://',

  // Deep link: VleisKraft → F&F macro calculator
  DEEP_LINK_FF: 'vcds-ff://',
};

/**
 * Fetch SA meat nutrition data from VleisKraft API for F&F macro tracking
 */
export async function fetchVleisKraftFoodData(token: string, search?: string) {
  const base = process.env.EXPO_PUBLIC_VLEISKRAFT_API_BASE || 'https://vcds-vleiskraft.onrender.com';
  const url = search
    ? `${base}/api/foods/sa-database?search=${encodeURIComponent(search)}`
    : `${base}/api/foods/sa-database`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'X-Integration-Source': 'fitness-and-fuel',
        'X-Internal-Token': process.env.EXPO_PUBLIC_INTERNAL_TOKEN || '',
      },
    });
    if (!res.ok) throw new Error(`VleisKraft API ${res.status}`);
    return await res.json();
  } catch (e) {
    return null;
  }
}

/**
 * Push macro data from F&F to VleisKraft for personalised product recommendations
 */
export async function pushMacroProfileToVleisKraft(token: string, macros: {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}) {
  const base = process.env.EXPO_PUBLIC_VLEISKRAFT_API_BASE || 'https://vcds-vleiskraft.onrender.com';
  try {
    const res = await fetch(`${base}/api/recommendations/macro-profile`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Integration-Source': 'fitness-and-fuel',
        'X-Internal-Token': process.env.EXPO_PUBLIC_INTERNAL_TOKEN || '',
      },
      body: JSON.stringify(macros),
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}
