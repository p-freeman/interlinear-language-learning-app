# Interlinear Language Learning App - Build Guide

## Overview
This is an Expo/React Native app for learning languages using the Birkenbihl method with interlinear texts.

## Building an APK for Android on Windows 10

### Prerequisites

1. **Install Node.js** (v18 or later)
   - Download from: https://nodejs.org/
   - Choose the LTS version

2. **Install Yarn** (package manager)
   ```bash
   npm install -g yarn
   ```

3. **Install Expo CLI**
   ```bash
   npm install -g expo-cli eas-cli
   ```

4. **Create an Expo Account**
   - Go to https://expo.dev/signup
   - Sign up for a free account

5. **Install Java Development Kit (JDK 17)**
   - Download from: https://adoptium.net/
   - Add to PATH environment variable

### Option 1: Build Using EAS Build (Recommended - Cloud Build)

This is the easiest method and doesn't require Android Studio.

1. **Login to Expo**
   ```bash
   npx expo login
   ```

2. **Navigate to the frontend folder**
   ```bash
   cd frontend
   ```

3. **Configure EAS Build**
   ```bash
   npx eas build:configure
   ```

4. **Build APK for Android**
   ```bash
   npx eas build -p android --profile preview
   ```
   
   This will upload your code to Expo's servers and build an APK. You'll get a download link when complete.

### Option 2: Build Locally (Requires Android Studio)

1. **Install Android Studio**
   - Download from: https://developer.android.com/studio
   - During installation, make sure to install:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device

2. **Set Environment Variables**
   Add these to your System Environment Variables:
   ```
   ANDROID_HOME = C:\Users\<YourUsername>\AppData\Local\Android\Sdk
   ```
   Add to PATH:
   ```
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\tools
   ```

3. **Generate Native Android Project**
   ```bash
   cd frontend
   npx expo prebuild -p android
   ```

4. **Build the APK**
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   
   The APK will be at: `android/app/build/outputs/apk/release/app-release.apk`

### Option 3: Using Expo Go (For Testing Only)

The fastest way to test on your phone:

1. **Install Expo Go app** on your Android phone from Google Play Store

2. **Start the development server**
   ```bash
   cd frontend
   npx expo start
   ```

3. **Scan the QR code** shown in the terminal with your phone

## EAS Build Configuration

Create `eas.json` in the frontend folder:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## Project Structure

```
frontend/
├── app/                    # Screen files (Expo Router)
│   ├── _layout.tsx        # Root layout
│   ├── index.tsx          # Home screen
│   ├── import.tsx         # Import content screen
│   ├── project/[id].tsx   # Project details screen
│   ├── interlinear/[id].tsx # Interlinear view screen
│   └── audio-loop/[id].tsx # Audio loop screen
├── src/
│   └── utils/
│       ├── storage.ts     # Project storage utilities
│       ├── zipHandler.ts  # ZIP import handling
│       └── sampleContent.ts # Sample content installer
├── assets/                # Images and assets
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Content Package Format

ZIP files should contain:
- `audio.mp3` - Audio file in target language
- `interlinear.html` - HTML with word-by-word translations
- `project.yaml` - Project metadata
- `words_target.txt` - Word list in target language (optional)
- `words_native.txt` - Word list in native language (optional)

### project.yaml Example:
```yaml
project_name: My Lesson
target_language: Swiss German
native_language: English
author: Your Name
source: Your Source
description: A description of the lesson content.
```

### Filename Convention:
`targetlang-nativelang-title.zip`
Example: `chde-en-greetings.zip`

## Troubleshooting

### Build fails with Java error
- Make sure JDK 17 is installed and JAVA_HOME is set correctly

### Build fails with SDK error
- Accept Android SDK licenses: `sdkmanager --licenses`

### Metro bundler issues
- Clear cache: `npx expo start --clear`

## Testing the App

1. Load the sample content from the Import screen
2. Navigate to the project
3. Open the Interlinear View to see word-by-word translations
4. Use Audio Loop for passive listening practice

## Notes

- The app works fully offline once content is imported
- File system operations only work on native platforms (not web preview)
- For best experience, test on an actual Android device using Expo Go
