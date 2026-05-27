/**
 * Cron Job 1: Braai Weather Alert
 * Every 3 hours — checks OWM for all users with push tokens + location
 * Sends push if braai conditions are perfect (temp > 22°C, wind < 20km/h, no rain)
 */
import { pool } from '../db/pool';
import { Expo } from 'expo-server-sdk';

const expo = new Expo();
const OWM_KEY = process.env.OPENWEATHER_API_KEY || '';
const OWM_URL = 'https://api.openweathermap.org/data/2.5/weather';

interface UserRow {
  id: string;
  push_token: string;
  latitude: number;
  longitude: number;
  preferred_locale: string;
}

export async function runWeatherAlert(): Promise<void> {
  if (!OWM_KEY) {
    console.warn('[WeatherAlert] No OWM API key — skipping');
    return;
  }

  // Get all users with push tokens and location
  const { rows } = await pool.query<UserRow>(`
    SELECT u.id, pt.token AS push_token, u.latitude, u.longitude, u.preferred_locale
    FROM users u
    JOIN push_tokens pt ON pt.user_id = u.id
    WHERE u.latitude IS NOT NULL AND u.longitude IS NOT NULL
      AND u.is_active = true
    LIMIT 500
  `);

  if (!rows.length) return;

  const messages: any[] = [];

  for (const user of rows) {
    try {
      const res = await fetch(
        `${OWM_URL}?lat=${user.latitude}&lon=${user.longitude}&appid=${OWM_KEY}&units=metric`
      );
      const weather = await res.json();
      const temp = weather.main?.temp ?? 0;
      const windSpeed = (weather.wind?.speed ?? 0) * 3.6; // m/s → km/h
      const rain = weather.rain?.['1h'] ?? 0;
      const condition = weather.weather?.[0]?.main ?? '';

      const isBraaiWeather = temp > 22 && windSpeed < 20 && rain === 0 && condition !== 'Rain';

      if (isBraaiWeather && Expo.isExpoPushToken(user.push_token)) {
        const isAf = user.preferred_locale === 'af';
        messages.push({
          to: user.push_token,
          title: isAf ? '🔥 Perfekte Braai Weer!' : '🔥 Perfect Braai Weather!',
          body: isAf
            ? `${Math.round(temp)}°C, wind ${Math.round(windSpeed)}km/h — Ideaal vir 'n braai!`
            : `${Math.round(temp)}°C, wind ${Math.round(windSpeed)}km/h — Perfect for a braai!`,
          data: { type: 'weather_alert', temp, windSpeed },
          sound: 'default',
        });
      }
    } catch (err) {
      console.error(`[WeatherAlert] Failed for user ${user.id}:`, err);
    }
  }

  if (messages.length) {
    const chunks = expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk).catch(console.error);
    }
}
}
