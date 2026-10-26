# Circuit Stream Android 2.0.0

A Kotlin Android app that bundles the existing responsive React interface in Android WebView. There is no Capacitor or JavaScript-to-native bridge. The mobile web layout, charts, cinematic homepage, and all analysis routes are shared with the website. Native Kotlin handles system insets, splash screen, back history, lifecycle, loading errors, and external links.

- Application ID: `com.circuitstream.f1` (unchanged)
- Version name: `2.0.0`; version code: `20001`
- Minimum Android: 6.0 / API 23; compile and target SDK: 35
- JDK 17; Gradle wrapper 8.11.1; Kotlin 2.1.21
- Bundled assets served through AndroidX WebViewAssetLoader on `https://appassets.androidplatform.net/`. No file/content access, insecure HTTP, or mixed content.
- Live race data requires an internet connection. The packaged interface does not depend on Vercel being online.
- The new circuit monogram appears on the launcher and launch screen.

## Build

Set `JAVA_HOME` to JDK 17 and `ANDROID_HOME` to your SDK directory (or set `sdk.dir` in local.properties). Install Android SDK Platform 35 and Build Tools 35.0.0 through Android Studio.

From `frontend`:

```sh
npm ci
npm run android:debug
```

This lints and builds the web interface with the production HTTPS backend, copies it to generated Android assets, and builds the debug APK. To use another HTTPS backend, set `CIRCUIT_STREAM_API_URL` before preparing assets.

Outputs:

- Installable development APK: `android/app/build/outputs/apk/debug/app-debug.apk`
- Release APK: `android/app/build/outputs/apk/release/app-release-unsigned.apk` (or `app-release.apk` when signing is configured)
- Release bundle: `android/app/build/outputs/bundle/release/app-release.aab`

```sh
npm run android:release
```

Release artifacts remain unsigned unless the existing app signing/upload key is configured with these environment variables:

- `CIRCUIT_STREAM_KEYSTORE`: absolute keystore path
- `CIRCUIT_STREAM_STORE_PASSWORD`
- `CIRCUIT_STREAM_KEY_ALIAS`
- `CIRCUIT_STREAM_KEY_PASSWORD`

Use the original signing identity to upgrade an installed release. A development APK is signed with the Android debug key and cannot replace a differently signed installed app. Do not commit keystores or passwords.

## Android Studio

Open this `android` directory directly in Android Studio. Run `npm run android:prepare` from `frontend` before the first build and after web changes. Build assets are generated and intentionally excluded from Git. Do not run Gradle clean between preparation and compilation; clean removes the prepared assets.

## Verification

From this directory:

```sh
./gradlew testDebugUnitTest lintDebug assembleDebug assembleRelease bundleRelease
./gradlew connectedDebugAndroidTest
```

The local tests exercise URL isolation and SPA route restoration. Device tests check the mobile viewport, bundled origin, native back history, Activity recreation, live session results, and driver portrait assets. Run device tests on a connected emulator/phone with internet access.

Android guidance: https://developer.android.com/develop/ui/views/layout/webapps/load-local-content
