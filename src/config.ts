/** API base URL of the BaseCrew web app (no trailing slash). */
const PROD_API = 'https://app.basecrew.in';

/**
 * Physical device + local Next.js: use your Mac LAN IP (same Wi-Fi).
 * Run: `npx next dev --hostname 0.0.0.0`
 *
 * Keep PROD when testing against the live Hostinger deploy.
 * Set USE_LOCAL_API=true below only while iterating on APIs not yet deployed.
 */
const USE_LOCAL_API = false;
const LOCAL_API = 'http://192.168.29.103:3000';

export const API_BASE_URL = USE_LOCAL_API ? LOCAL_API : PROD_API;

/**
 * Change before running:
 * - Live (physical iPhone / any device): https://app.basecrew.in
 * - iOS simulator + local Next.js:       http://localhost:3000
 * - Android emulator + local Next.js:    http://10.0.2.2:3000
 * - Physical device + local Next.js:     http://<your-mac-lan-ip>:3000
 *   (Mac and phone on the same Wi-Fi; run `npx next dev --hostname 0.0.0.0`)
 */
