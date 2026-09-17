# iOS Firebase (skip Xcode SPM)

Firebase Console’s “Add Firebase SDK with Swift Package Manager” steps are for **native Swift apps**.
BaseCrew Mobile is **React Native** and uses **`@react-native-firebase`** via **CocoaPods**.

Do **not** use: Xcode → File → Add Packages → `firebase-ios-sdk`.

## What to do instead

### 1. Download config (only file you need from Firebase Console)

1. Firebase Console → Project settings → Your apps → iOS app (`in.basecrew`)
2. Download **`GoogleService-Info.plist`**
3. Put it at:
   `mobile-app/ios/GoogleService-Info.plist`
   **or**
   `mobile-app/ios/BaseCrewMobile/GoogleService-Info.plist`
4. In Xcode, open **`BaseCrewMobile.xcworkspace`** (not `.xcodeproj`)
5. Drag the plist into the **BaseCrewMobile** target
6. Check **Copy items if needed** and target membership **BaseCrewMobile**

### 2. Install pods (this installs Firebase SDK)

From Terminal (not Xcode Add Packages):

```bash
cd mobile-app/ios
pod install
```

If you see `cdn.cocoapods.org: 403 Forbidden`, the Podfile already points at the git Specs source. First clone can take several minutes:

```bash
cd mobile-app/ios
pod install
```

If that still fails:

```bash
pod repo add-cdn trunk https://cdn.cocoapods.org/
# or
pod repo add cocoapods https://github.com/CocoaPods/Specs.git
pod install
```

The Podfile already has:

- `$RNFirebaseDisableSPM = true` (avoids broken Xcode SPM)
- `use_frameworks! :linkage => :static`
- `$RNFirebaseAsStaticFramework = true`

Open **`BaseCrewMobile.xcworkspace`** after pods succeed.
### 3. AppDelegate

`FirebaseApp.configure()` is already added in `AppDelegate.swift`.

### 4. Capabilities in Xcode

For the BaseCrewMobile target:

- Signing & Capabilities → **+ Push Notifications**
- Background Modes → enable **Remote notifications**

### 5. APNs key in Firebase

Firebase → Project settings → Cloud Messaging → upload your Apple APNs Auth Key (.p8).

### 6. Run

Always open/run via the workspace:

```bash
cd mobile-app
npx react-native run-ios
```

## If `pod install` fails

```bash
cd mobile-app/ios
pod repo update
rm -rf Pods Podfile.lock
pod install
```

## Android (same Firebase project)

Download `google-services.json` for `com.basecrew.mobile` into:
`mobile-app/android/app/google-services.json`
