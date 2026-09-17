# Mobile push notifications (FCM)

BaseCrew sends Android / iOS push alerts through **Firebase Cloud Messaging**. Users opt in from **Profile → Mobile alerts**.

## What gets pushed

| Event | When | Opt-in |
|-------|------|--------|
| Task assigned / urgent / project added | Instant | Automatic notifications |
| Due today | Morning cron once | Automatic |
| Overdue digest | Day-end cron once | Automatic |
| Custom reminders | When due (every 15 min cron, once each) | Custom reminders |
| Forgot to clock in | 10:30 IST once | Automatic |
| Forgot to clock out | 19:00 IST once | Automatic |
| Admin broadcast | Manual from Settings / Platform | Automatic |

## Healthy crons (Hostinger, times in UTC)

```bash
# Morning due today (~09:00 IST)
30 3 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" "https://app.basecrew.in/api/cron/deadline-check?mode=due_today"

# Day-end overdue (~18:30 IST)
0 13 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" "https://app.basecrew.in/api/cron/deadline-check?mode=overdue"

# Custom reminders (due only)
*/15 * * * * curl -s -H "Authorization: Bearer $CRON_SECRET" https://app.basecrew.in/api/cron/reminder-pushes

# Clock-in 10:30 IST / clock-out 19:00 IST
0 5 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" "https://app.basecrew.in/api/cron/attendance-nudges?kind=clock_in"
30 13 * * * curl -s -H "Authorization: Bearer $CRON_SECRET" "https://app.basecrew.in/api/cron/attendance-nudges?kind=clock_out"
```

Do **not** spam attendance every few minutes. Each nudge is once per user per day.

## Rich lock-screen UI

- Brand blue Android channel (`basecrew_alerts`, high importance)
- Creative title + subtitle + body per notification type
- Optional HTTPS image (big picture / iOS attachment)
- Notifee shows banners while the app is open

OS still owns lock-screen chrome (same as Swiggy/Zomato). We control content, image, and priority.

## Manual send

| Who | Where | Audience |
|-----|--------|----------|
| Org admin | **Settings → Send push** | Your organisation |
| Super admin | **Platform → Push** | All orgs, or one tenant |

Creates in-app announcements for everyone; FCM only for opted-in devices.

## Server setup

1. `npm run db:push` (or additive SQL for push columns / `tf_push_devices`)
2. Env:

```bash
FIREBASE_SERVICE_ACCOUNT_JSON='{"project_id":"...","client_email":"...","private_key":"-----BEGIN...\\n"}'
```

3. Cron: `GET /api/cron/reminder-pushes` with `Authorization: Bearer $CRON_SECRET`

## Mobile setup

1. Add Android `com.basecrew.mobile` + iOS `in.basecrew` in Firebase
2. `android/app/google-services.json` + `ios/GoogleService-Info.plist`
3. Upload APNs key in Firebase
4. Rebuild apps (`pod install` on iOS)
5. Enable toggles in Profile

## API

- `POST` / `DELETE` `/api/mobile/push/register`
- `GET` / `POST` `/api/admin/push/broadcast`
- `GET` / `POST` `/api/platform/push/broadcast`
- `PATCH` `/api/users/me` (`pushNotificationEnabled`, `pushReminderEnabled`)
