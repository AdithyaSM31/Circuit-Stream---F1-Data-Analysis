# Circuit Stream - Build Instructions

## 📱 Build APK for Distribution

### Quick Build (Debug APK)
```bash
cd C:\Users\adith\Downloads\f1_project\frontend
npm run build
npx cap sync android
cd android
.\gradlew assembleDebug
```

**Output:** `android/app/build/outputs/apk/debug/app-debug.apk`

### Distribution Channels

#### 1. GitHub Releases (Recommended)
- Free hosting
- Direct download link
- Version control
- Professional presentation

#### 2. Google Drive / OneDrive
- Share link with "Anyone with link"
- Easy for users to download

#### 3. Direct File Transfer
- Email, messaging apps
- Cloud storage services
- USB transfer

## 📦 File Locations

- **APK Output:** `frontend/android/app/build/outputs/apk/debug/`
- **Web Build:** `frontend/build/`
- **Android Project:** `frontend/android/`

## 🔄 Making Updates

1. Make changes to React code
2. Build web app: `npm run build`
3. Sync to Android: `npx cap sync android`
4. Build new APK: `cd android && .\gradlew assembleDebug`
5. Increment version number
6. Upload new release

## 📊 App Info

- **Package ID:** com.circuitstream.f1
- **App Name:** Circuit Stream
- **Version:** 1.0
- **Min SDK:** 22 (Android 5.1)
- **Target SDK:** 33 (Android 13)

## 🌐 Backend API

- **Production:** https://circuit-stream.up.railway.app
- **Health Check:** https://circuit-stream.up.railway.app/api/health

## 🛠️ Development

- **Run locally:** `npm start`
- **Build production:** `npm run build`
- **Test in browser:** `http://localhost:3000`
- **Open Android Studio:** `npx cap open android`

## 📝 Notes

- APK size: ~17-18 MB
- Internet connection required
- Data from FastF1 official API
- All times displayed in IST (Indian Standard Time)
