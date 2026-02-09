# Build Instructions / Bauanleitung

> **Note / Hinweis:** This document was created with AI assistance (Emergent AI / Claude).
> Dieses Dokument wurde mit KI-Unterstützung erstellt (Emergent AI / Claude).

---

## English Instructions

### Prerequisites

1. **Node.js** (v18 or later)
   - Download from: https://nodejs.org/
   - Choose the LTS version

2. **Git**
   - Windows: https://git-scm.com/download/win
   - Linux: `sudo apt install git`
   - macOS: `xcode-select --install`

3. **Expo CLI & EAS CLI**
   ```bash
   npm install -g expo-cli eas-cli
   ```

4. **Expo Account**
   - Create a free account at: https://expo.dev/signup

### Building an APK (Android)

#### Option 1: Cloud Build with EAS (Recommended)

This is the easiest method - no Android Studio required!

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/interlinear-language-learning-app.git
   cd interlinear-language-learning-app/frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Login to Expo**
   ```bash
   npx eas login
   ```

4. **Build the APK**
   ```bash
   npx eas build -p android --profile preview
   ```

5. **Wait for build to complete** (5-15 minutes)
   - You'll receive a download link when done
   - Or visit: https://expo.dev → Your Projects → Builds

6. **Download and install the APK**
   - Transfer to your Android phone
   - Enable "Install from Unknown Sources" in Settings
   - Open the APK to install

#### Option 2: Local Build (Requires Android Studio)

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio

2. **Set environment variables**
   - Add `ANDROID_HOME` pointing to Android SDK
   - Add SDK tools to PATH

3. **Generate native project**
   ```bash
   cd frontend
   npx expo prebuild -p android
   ```

4. **Build APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

5. **Find APK at:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Testing with Expo Go (Quick Testing)

1. Install **Expo Go** on your Android phone (from Play Store)
2. Run:
   ```bash
   cd frontend
   npx expo start
   ```
3. Scan the QR code with Expo Go

---

## Deutsche Anleitung

### Voraussetzungen

1. **Node.js** (v18 oder neuer)
   - Download: https://nodejs.org/
   - LTS-Version wählen

2. **Git**
   - Windows: https://git-scm.com/download/win
   - Linux: `sudo apt install git`
   - macOS: `xcode-select --install`

3. **Expo CLI & EAS CLI**
   ```bash
   npm install -g expo-cli eas-cli
   ```

4. **Expo-Konto**
   - Kostenloses Konto erstellen: https://expo.dev/signup

### APK erstellen (Android)

#### Option 1: Cloud-Build mit EAS (Empfohlen)

Die einfachste Methode - kein Android Studio erforderlich!

1. **Repository klonen**
   ```bash
   git clone https://github.com/YOUR_USERNAME/interlinear-language-learning-app.git
   cd interlinear-language-learning-app/frontend
   ```

2. **Abhängigkeiten installieren**
   ```bash
   npm install
   ```

3. **Bei Expo anmelden**
   ```bash
   npx eas login
   ```

4. **APK erstellen**
   ```bash
   npx eas build -p android --profile preview
   ```

5. **Auf Build warten** (5-15 Minuten)
   - Sie erhalten einen Download-Link
   - Oder besuchen Sie: https://expo.dev → Ihre Projekte → Builds

6. **APK herunterladen und installieren**
   - Auf Android-Handy übertragen
   - "Installation aus unbekannten Quellen" in Einstellungen aktivieren
   - APK öffnen zum Installieren

#### Option 2: Lokaler Build (Erfordert Android Studio)

1. **Android Studio installieren**
   - Download: https://developer.android.com/studio

2. **Umgebungsvariablen setzen**
   - `ANDROID_HOME` auf Android SDK setzen
   - SDK-Tools zum PATH hinzufügen

3. **Natives Projekt generieren**
   ```bash
   cd frontend
   npx expo prebuild -p android
   ```

4. **APK erstellen**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```

5. **APK finden unter:**
   ```
   android/app/build/outputs/apk/release/app-release.apk
   ```

### Testen mit Expo Go (Schnelltests)

1. **Expo Go** auf Android-Handy installieren (aus Play Store)
2. Ausführen:
   ```bash
   cd frontend
   npx expo start
   ```
3. QR-Code mit Expo Go scannen

---

## Troubleshooting / Fehlerbehebung

### Git authentication error / Git-Authentifizierungsfehler
GitHub requires a Personal Access Token instead of password.
GitHub erfordert einen Personal Access Token anstelle eines Passworts.

1. Go to / Gehen Sie zu: https://github.com/settings/tokens
2. Generate new token (classic) / Neuen Token erstellen (classic)
3. Select "repo" permission / "repo"-Berechtigung auswählen
4. Use token as password / Token als Passwort verwenden

### Build fails with image error / Build scheitert mit Bildfehler
Create placeholder images / Platzhalterbilder erstellen:
```bash
mkdir -p assets/images
# Use ImageMagick or any image tool to create simple colored PNGs
```

### EAS requires Git / EAS erfordert Git
Either install Git or use:
Git installieren oder verwenden:
```bash
EAS_NO_VCS=1 npx eas build -p android --profile preview
```
