# BaseCrew App Store assets

Marketing screenshots in Apple Store listing style (phone mockup + bold headline + short subtitle).

## Current set (real app UI)

These frames use **HTML recreations of the live BaseCrew mobile UI** (light theme, Today clock strip, Focus today, Tasks, Team, Inbox) - not the older dark AI mockups.

| File | Use |
|------|-----|
| `basecrew-app-icon-1024.png` | App icon (1024×1024) |
| `basecrew-asc-00-login-*.png` | Screenshot 0 - Sign in / Welcome back |
| `basecrew-asc-01-clock-*.png` | Screenshot 1 - Clock in / attendance |
| `basecrew-asc-02-today-*.png` | Screenshot 2 - Plan your day |
| `basecrew-asc-03-tasks-*.png` | Screenshot 3 - My Tasks |
| `basecrew-asc-04-team-*.png` | Screenshot 4 - Team activity |
| `basecrew-asc-05-inbox-*.png` | Screenshot 5 - Inbox reminders |

Sizes provided per screenshot:
- `1290x2796` - iPhone 6.7" (upload this set first)
- `1242x2688` - iPhone 6.5"
- `1179x2556` - iPhone 6.1"

## Folders

| Path | Contents |
|------|----------|
| `ai-generated/` | Previous AI mock UIs (kept for reference - do not delete) |
| `real-ui/` | Source HTML + captured phone screens used to build frames |
| `build_real_frames.py` | Rebuild script (Chrome headless + Pillow) |

Rebuild:

```bash
cd mobile-app/app-store
python3 build_real_frames.py
```

## Suggested App Store copy

**Name:** BaseCrew  
**Subtitle:** Attendance, Tasks & Team Work  
**Promotional text:** Clock in with GPS, manage tasks, and see team activity - one mobile workspace for corporate teams.

**Description (short):**
BaseCrew helps corporate teams stay accountable. Clock in and out with location capture, plan your day, complete tasks with a swipe, and follow team activity - all synced with your BaseCrew workspace.

**Keywords:** attendance, timesheet, tasks, team, productivity, clock in, project management, workforce

## Upload order (recommended)

1. Sign in. Get to work.
2. Clock in. Stay accountable.
3. Plan your day. Get more done.
4. Tasks that stay on track.
5. See your team in real time.
6. Never miss what matters.

## Notes

- Frames match the current mobile design (light UI, compact clock strip, Focus today, tab bar Today/Tasks/Team/Profile).
- Status bar uses iOS-style cellular / Wi-Fi / battery icons (not text like `▌▌▌ 100%`) - required for Guideline 2.3.10.
- Phone mockups use a clean **iPhone-style** frame (Dynamic Island, side buttons) with no shine/shadow glitch overlays.
- Paste-ready review reply: `APP-STORE-REVIEW-REPLY-2.3.10.md`
- App icon is synced from `electron/icon.png` via `sync_icons_from_electron.py` (also writes iOS AppIcon + Android mipmaps).
- Prefer uploading the `1290x2796` set first in App Store Connect.
