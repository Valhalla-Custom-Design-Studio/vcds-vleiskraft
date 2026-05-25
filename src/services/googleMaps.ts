/**
 * Google Maps Places Autocomplete for delivery address
 */

const MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
const PLACES_URL = 'https://maps.googleapis.com/maps/api/place';

export interface PlacePrediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface PlaceDetail {
  formattedAddress: string;
  lat: number;
  lng: number;
  streetNumber?: string;
  streetName?: string;
  suburb?: string;
  city?: string;
  province?: string;
  postalCode?: string;
}

export async function searchAddress(input: string): Promise<PlacePrediction[]> {
  if (!input || input.length < 3) return [];
  const url = `${PLACES_URL}/autocomplete/json?input=${encodeURIComponent(input)}&components=country:za&types=address&key=${MAPS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK') return [];
  return data.predictions.map((p: any) => ({
    placeId: p.place_id,
    description: p.description,
    mainText: p.structured_formatting.main_text,
    secondaryText: p.structured_formatting.secondary_text,
  }));
}

export async function getPlaceDetail(placeId: string): Promise<PlaceDetail> {
  const fields = 'formatted_address,geometry,address_components';
  const url = `${PLACES_URL}/details/json?place_id=${placeId}&fields=${fields}&key=${MAPS_KEY}`;
  const res = await fetch(url);
  const data = await res.json();
  const r = data.result;
  const get = (type: string) =>
    r.address_components?.find((c: any) => c.types.includes(type))?.long_name;
  return {
    formattedAddress: r.formatted_address,
    lat: r.geometry.location.lat,
    lng: r.geometry.location.lng,
    streetNumber: get('street_number'),
    streetName: get('route'),
    suburb: get('sublocality') || get('neighborhood'),
    city: get('locality'),
    province: get('administrative_area_level_1'),
    postalCode: get('postal_code'),
  };
}
