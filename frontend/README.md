# Interlinear Language Learning App

> **Note:** This README was created with the assistance of AI (Emergent AI / Claude).

## Overview

The **Interlinear Language Learning App** is a mobile application designed to help people learn languages using the **Birkenbihl Method**. The app currently supports learning **German** and **Swiss German** from **English**, with the architecture designed to easily add more languages in the future.

## Purpose & Intent

This app was created to provide a free, open-source tool for language learners who want to use the proven Birkenbihl method of language acquisition. The method involves three key steps:

1. **Decoding** - Reading word-by-word translations (interlinear texts)
2. **Active Listening** - Listening to audio while following the interlinear text
3. **Passive Listening** - Listening to audio repeatedly in the background

The app is designed to be **fully offline** once content is installed, making it ideal for learners who want to study without an internet connection.

## Features

### Core Functionality
- **Import content packages** (ZIP files) containing audio and interlinear texts
- **Create projects manually** by selecting your own audio and HTML files
- **View interlinear texts** with word-by-word translations
- **Play audio** synchronized with text viewing
- **Loop audio** for passive listening practice
- **Export projects** as ZIP files to share with others
- **Edit project details** after creation

### Content Management
- Import content from local device storage
- Import content from URL
- Load sample content for demonstration
- Organize content by target language, native language, and source

## How Content is Stored

The app stores all project data locally on your device in the following structure:

```
[App Documents Directory]/content/
├── [Target Language]/
│   └── [Native Language]/
│       └── [Source]/
│           └── [Project Name]_[ID]/
│               ├── audio.mp3
│               ├── interlinear.html
│               ├── project.yaml
│               └── [other files]
```

### File Descriptions
- **audio.mp3** - The audio file in the target language
- **interlinear.html** - HTML file containing word-by-word translations
- **project.yaml** - Project metadata (name, languages, author, description)

### Project Metadata (project.yaml)
```yaml
project_name: Your Project Name
target_language: Swiss German
native_language: English
author: Author Name (optional)
source: Source Name (optional)
description: Project description (optional)
```

## Content Package Format

To create content for this app, create a ZIP file containing:
- `audio.mp3` - Audio recording in the target language
- `interlinear.html` - HTML with interlinear word-by-word translations
- `project.yaml` - Project metadata

### Recommended ZIP Filename Format
```
[target_lang_code]-[native_lang_code]-[title].zip
```
Example: `chde-en-greetings.zip` (Swiss German to English)

## Supported Languages

Currently supported:
- **Target Languages:** German, Swiss German
- **Native Languages:** English

The app architecture supports adding more languages in the future.

## Technology Stack

- **Framework:** React Native with Expo
- **Platform:** Android (iOS support possible)
- **Storage:** Local file system + AsyncStorage
- **Audio:** expo-av
- **File Handling:** expo-file-system, expo-document-picker

## Building the App

See [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md) for detailed instructions on how to build an APK from this source code.

## License

This project is open source. Feel free to use, modify, and distribute according to the license terms.

## Contributing

Contributions are welcome! This includes:
- Adding support for new languages
- Creating content packages
- Improving the user interface
- Fixing bugs
- Translating the app

## Acknowledgments

- Inspired by Vera F. Birkenbihl's language learning method
- Built with Expo and React Native
- README created with AI assistance (Emergent AI / Claude)

---

*For the German version of this README, see [README_DE.md](./README_DE.md)*
