# Circuit Stream - Android App

This is the Android version of Circuit Stream F1 Data Analysis app, built using Capacitor.

## 📱 Requirements

- **Android Studio** (Download: https://developer.android.com/studio)
- **JDK 17** or higher
- **Android SDK API 33+**
- **Physical Android device or emulator**

## 🚀 Quick Start

### 1. Open in Android Studio

```bash
# From the frontend directory
cd C:\Users\adith\Downloads\f1_project\frontend
npx cap open android
```

Or manually:
- Open Android Studio
- Click "Open an Existing Project"
- Navigate to `C:\Users\adith\Downloads\f1_project_android`
- Click "OK"

### 2. Sync Gradle

Android Studio will automatically sync Gradle dependencies. Wait for it to complete.

### 3. Run on Device/Emulator

**Option A: Physical Device**
1. Enable Developer Mode on your Android phone
2. Enable USB Debugging
3. Connect via USB
4. Click the green "Run" button ▶️ in Android Studio
5. Select your device

**Option B: Emulator**
1. Click "Device Manager" in Android Studio
2. Create a new virtual device (Pixel 5, API 33+)
3. Click "Run" button ▶️
4. Select the emulator

## 🔄 Update App After Web Changes

Whenever you make changes to the web app:

```bash
# 1. Go to frontend directory
cd C:\Users\adith\Downloads\f1_project\frontend

# 2. Build the React app
npm run build

# 3. Sync changes to Android
npx cap sync android
```

Then rebuild in Android Studio.

## 📦 Build Release APK

### For Testing (Debug APK)

1. In Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Find APK at: `app/build/outputs/apk/debug/app-debug.apk`
3. Transfer to phone and install

### For Play Store (Release AAB)

1. **Generate Signing Key:**
```bash
cd C:\Users\adith\Downloads\f1_project_android\app
keytool -genkey -v -keystore circuit-stream.keystore -alias circuit-stream -keyalg RSA -keysize 2048 -validity 10000
```

2. **Create `keystore.properties`** in `app/` folder:
```properties
storeFile=circuit-stream.keystore
storePassword=YOUR_PASSWORD
keyAlias=circuit-stream
keyPassword=YOUR_PASSWORD
```

3. **Update `app/build.gradle`:**
Add before `android {`:
```gradle
def keystorePropertiesFile = rootProject.file("app/keystore.properties")
def keystoreProperties = new Properties()
keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
```

Add inside `android { ... }`:
```gradle
signingConfigs {
    release {
        keyAlias keystoreProperties['keyAlias']
        keyPassword keystoreProperties['keyPassword']
        storeFile file(keystoreProperties['storeFile'])
        storePassword keystoreProperties['storePassword']
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

4. **Build Release:**
- In Android Studio: **Build → Generate Signed Bundle / APK**
- Select "Android App Bundle" (AAB)
- Choose your keystore and enter passwords
- Select "release" build type
- Click "Finish"

5. **Find AAB:** `app/build/outputs/bundle/release/app-release.aab`

## 🎨 Customization

### Change App Icon

1. Prepare icon images (512x512, 192x192, etc.)
2. Place in `app/src/main/res/mipmap-*/` folders
3. Update `ic_launcher.png` files

Or use Android Studio:
- Right-click `res` folder
- **New → Image Asset**
- Follow wizard

### Change Splash Screen

1. Edit colors in `app/src/main/res/values/colors.xml`
2. Edit splash in `app/src/main/res/drawable/splash.xml`

### Change App Name

Edit `app/src/main/res/values/strings.xml`:
```xml
<string name="app_name">Circuit Stream</string>
```

## 🐛 Troubleshooting

### "SDK not found"
- Open Android Studio Settings
- Go to **Appearance & Behavior → System Settings → Android SDK**
- Install Android SDK 33+

### "Gradle sync failed"
- File → Invalidate Caches / Restart
- Or delete `.gradle` folder and sync again

### "App crashes on launch"
- Check Logcat in Android Studio
- Verify API URL is correct
- Check network permissions in `AndroidManifest.xml`

### "White screen on launch"
```bash
# Clear cache and rebuild
cd C:\Users\adith\Downloads\f1_project\frontend
npm run build
npx cap sync android
```

## 📤 Publish to Google Play Store

1. **Create Developer Account:** https://play.google.com/console ($25 one-time fee)
2. **Create App in Console**
3. **Prepare Store Listing:**
   - App name: Circuit Stream
   - Short description (80 chars)
   - Full description (4000 chars)
   - Screenshots (at least 2, up to 8)
   - Feature graphic (1024x500)
   - App icon (512x512)
4. **Upload AAB file**
5. **Complete Content Rating questionnaire**
6. **Set pricing (Free)**
7. **Submit for Review** (1-7 days)

## 📝 Important Files

- `capacitor.config.ts` - Capacitor configuration (in frontend folder)
- `app/build.gradle` - Android build configuration
- `app/src/main/AndroidManifest.xml` - App permissions and settings
- `app/src/main/res/` - App resources (icons, colors, etc.)

## 🔗 Useful Links

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Developer Guide](https://developer.android.com/guide)
- [Play Console Help](https://support.google.com/googleplay/android-developer)

## 📱 App Info

- **Package Name:** com.circuitstream.f1
- **App Name:** Circuit Stream
- **Min SDK:** 22 (Android 5.1)
- **Target SDK:** 33 (Android 13)

---

**Built with ❤️ using Capacitor**
