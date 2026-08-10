# Build TechPulse Android APK

Your app is a **Next.js web app** with a server (MongoDB + OpenAI). The Android APK wraps your **live website** in a native shell — like Chrome in app form, with an icon on the home screen.

## What you need

1. **Deployed website** (Vercel recommended) — the APK loads this URL  
2. **Node.js** (already installed)  
3. **Android Studio** — [developer.android.com/studio](https://developer.android.com/studio)  
4. **Java JDK 17+** (included with Android Studio)

---

## Step 1 — Deploy your site

Push to GitHub and deploy on **Vercel**:

1. Import project at [vercel.com](https://vercel.com)  
2. Add environment variables: `MONGODB_URI`, `OPENAI_API_KEY`, `CRON_SECRET`  
3. Deploy and copy your URL, e.g. `https://techpulse-abc.vercel.app`

---

## Step 2 — Point Capacitor at your URL

Edit `capacitor.config.json` and replace:

```json
"url": "https://YOUR_DEPLOYED_URL.vercel.app"
```

with your real Vercel URL.

For **local testing only** (phone must be on same Wi‑Fi as PC):

```json
"url": "http://192.168.x.x:3000"
```

---

## Step 3 — Install Capacitor (one time)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/app @capacitor/splash-screen --save-dev
npx cap add android
npx cap sync android
```

---

## Step 4 — Build the APK

### Option A — Android Studio (easiest)

```bash
npm run android:open
```

In Android Studio:

1. Wait for Gradle sync to finish  
2. **Build → Build Bundle(s) / APK(s) → Build APK(s)**  
3. APK path: `android/app/build/outputs/apk/debug/app-debug.apk`

### Option B — Command line

```bash
cd android
./gradlew assembleDebug
```

On Windows:

```powershell
cd android
.\gradlew.bat assembleDebug
```

APK output: `android\app\build\outputs\apk\debug\app-debug.apk`

---

## Step 5 — Install on your phone

1. Copy `app-debug.apk` to your phone  
2. Enable **Install from unknown sources** (Settings → Security)  
3. Open the APK file and install  

Or connect phone via USB and click **Run** in Android Studio.

---

## Release APK (Play Store)

For Google Play you need a **signed release** build:

1. Android Studio → **Build → Generate Signed Bundle / APK**  
2. Create a keystore (save password safely!)  
3. Choose **Android App Bundle (.aab)** for Play Store  

---

## Offline reading in the app

Saved articles use **IndexedDB** in the WebView — offline reading works inside the app after you save stories while online.

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| Blank white screen | Check `server.url` in `capacitor.config.json` |
| Cannot reach localhost | Use deployed Vercel URL, not `localhost` |
| Gradle fails | Open Android Studio and install suggested SDK packages |
| Feed sync slow | Normal with 80+ feeds — use Admin → Full sync and wait 2–5 min |

---

## NPM scripts

| Command | Description |
|---------|-------------|
| `npm run android:sync` | Sync web config to Android project |
| `npm run android:open` | Open project in Android Studio |
| `npm run android:build` | Build debug APK (requires Gradle) |
