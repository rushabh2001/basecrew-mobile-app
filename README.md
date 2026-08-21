# BaseCrew Mobile (React Native CLI)

Native iOS / Android app for BaseCrew. Primary feature is **geo clock in / out**; dashboard, tasks, and notifications sync with the same web API.

This folder is intentionally **gitignored** by the web monorepo. Version it as its own git repo if you publish to the App Store / Play Store.

## Stack

- React Native **0.79** (CLI, not Expo)
- React Navigation (tabs + stack)
- `@react-native-community/geolocation` for attendance location
- Bearer JWT via `POST /api/mobile/auth/login`

## Configure API URL

Edit `src/config.ts`:

| Target | URL |
|--------|-----|
| Android emulator → local Next.js | `http://10.0.2.2:3000` |
| iOS simulator → local Next.js | `http://localhost:3000` |
| Physical device | `http://<your-lan-ip>:3000` or your HTTPS staging/production URL |

Production builds should point at your deployed BaseCrew URL (`https://…`).

## Prerequisites

- Node 18+
- Xcode + CocoaPods (iOS)
- Android Studio / SDK (Android)
- Running BaseCrew web server with `NEXTAUTH_SECRET` set (mobile JWT is derived from it)

Apply DB schema for clock geo columns from the web repo:

```bash
# from web repo root
npm run db:push
```

## Install & run

```bash
cd mobile-app
npm install

# iOS pods (first time / after native deps change)
cd ios && bundle install && bundle exec pod install && cd ..

npm start
# other terminal:
npm run ios
# or
npm run android
```

## Sign in

Use the same credentials as the web app:

1. Organization code (tenant slug)
2. Email
3. Password

## Geo clock flow

1. Open **Clock** tab
2. **Clock in** / **Clock out** requests location permission
3. App sends `{ action, geo: { latitude, longitude, accuracyMeters, source: "mobile" } }` to `POST /api/clock`
4. Server stores lat/lng/label on `ClockSession`; web attendance sees the same session

## Store publishing

### Android (Play Store)

1. Set `applicationId` / signing in `android/app/build.gradle` (already `com.basecrew.mobile`)
2. Generate an upload keystore and configure `signingConfigs.release`
3. `cd android && ./gradlew bundleRelease`
4. Upload the `.aab` in Google Play Console

### iOS (App Store)

1. Open `ios/BaseCrewMobile.xcworkspace` in Xcode
2. Set Team, bundle id `com.basecrew.mobile`, version/build
3. Archive → Distribute App → App Store Connect

Update location usage string in `Info.plist` (`NSLocationWhenInUseUsageDescription`) before review.

## Sync contract (web ↔ mobile)

| Endpoint | Auth |
|----------|------|
| `POST /api/mobile/auth/login` | public |
| `GET /api/mobile/me` | Bearer |
| `GET/POST /api/clock` | Bearer or cookie |
| `GET /api/dashboard` | Bearer or cookie |
| `GET /api/tasks` | Bearer or cookie |
| `GET/PATCH /api/notifications` | Bearer or cookie |

Mobile never uses NextAuth cookies; always `Authorization: Bearer <accessToken>`.
# basecrew-mobile-app
