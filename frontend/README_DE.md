# Interlinear Sprachlern-App

> **Hinweis:** Diese README-Datei wurde mit Unterstützung von KI (Emergent AI / Claude) erstellt.

## Überblick

Die **Interlinear Sprachlern-App** ist eine mobile Anwendung, die Menschen beim Sprachenlernen mit der **Birkenbihl-Methode** unterstützt. Die App unterstützt derzeit das Lernen von **Deutsch** und **Schweizerdeutsch** von **Englisch** aus, wobei die Architektur so gestaltet ist, dass in Zukunft weitere Sprachen leicht hinzugefügt werden können.

## Zweck & Absicht

Diese App wurde entwickelt, um ein kostenloses, quelloffenes Werkzeug für Sprachlerner bereitzustellen, die die bewährte Birkenbihl-Methode des Spracherwerbs nutzen möchten. Die Methode umfasst drei Hauptschritte:

1. **Dekodieren** - Lesen von Wort-für-Wort-Übersetzungen (Interlineartexte)
2. **Aktives Hören** - Zuhören von Audio während des Lesens des Interlineartextes
3. **Passives Hören** - Wiederholtes Hören von Audio im Hintergrund

Die App ist so konzipiert, dass sie **vollständig offline** funktioniert, sobald Inhalte installiert sind - ideal für Lerner, die ohne Internetverbindung lernen möchten.

## Funktionen

### Kernfunktionalität
- **Inhaltspakete importieren** (ZIP-Dateien) mit Audio und Interlineartexten
- **Projekte manuell erstellen** durch Auswahl eigener Audio- und HTML-Dateien
- **Interlineartexte anzeigen** mit Wort-für-Wort-Übersetzungen
- **Audio abspielen** synchron mit der Textanzeige
- **Audio wiederholen** für passives Hörtraining
- **Projekte exportieren** als ZIP-Dateien zum Teilen
- **Projektdetails bearbeiten** nach der Erstellung

### Inhaltsverwaltung
- Inhalte vom lokalen Gerätespeicher importieren
- Inhalte von URL importieren
- Beispielinhalte zur Demonstration laden
- Inhalte nach Zielsprache, Muttersprache und Quelle organisieren

## Wie Inhalte gespeichert werden

Die App speichert alle Projektdaten lokal auf Ihrem Gerät in folgender Struktur:

```
[App-Dokumentenverzeichnis]/content/
├── [Zielsprache]/
│   └── [Muttersprache]/
│       └── [Quelle]/
│           └── [Projektname]_[ID]/
│               ├── audio.mp3
│               ├── interlinear.html
│               ├── project.yaml
│               └── [weitere Dateien]
```

### Dateibeschreibungen
- **audio.mp3** - Die Audiodatei in der Zielsprache
- **interlinear.html** - HTML-Datei mit Wort-für-Wort-Übersetzungen
- **project.yaml** - Projektmetadaten (Name, Sprachen, Autor, Beschreibung)

### Projektmetadaten (project.yaml)
```yaml
project_name: Ihr Projektname
target_language: Swiss German
native_language: English
author: Autorenname (optional)
source: Quellenname (optional)
description: Projektbeschreibung (optional)
```

## Inhaltspaket-Format

Um Inhalte für diese App zu erstellen, erstellen Sie eine ZIP-Datei mit:
- `audio.mp3` - Audioaufnahme in der Zielsprache
- `interlinear.html` - HTML mit interlinearen Wort-für-Wort-Übersetzungen
- `project.yaml` - Projektmetadaten

### Empfohlenes ZIP-Dateinamenformat
```
[zielsprache_code]-[muttersprache_code]-[titel].zip
```
Beispiel: `chde-en-begruessungen.zip` (Schweizerdeutsch zu Englisch)

## Unterstützte Sprachen

Derzeit unterstützt:
- **Zielsprachen:** Deutsch, Schweizerdeutsch
- **Muttersprachen:** Englisch

Die App-Architektur unterstützt das Hinzufügen weiterer Sprachen in der Zukunft.

## Technologie-Stack

- **Framework:** React Native mit Expo
- **Plattform:** Android (iOS-Unterstützung möglich)
- **Speicherung:** Lokales Dateisystem + AsyncStorage
- **Audio:** expo-av
- **Dateiverwaltung:** expo-file-system, expo-document-picker

## App erstellen

Siehe [BUILD_INSTRUCTIONS.md](./BUILD_INSTRUCTIONS.md) für detaillierte Anweisungen, wie man eine APK aus diesem Quellcode erstellt.

## Lizenz

Dieses Projekt ist Open Source. Sie können es gemäß den Lizenzbedingungen frei verwenden, modifizieren und verteilen.

## Mitwirken

Beiträge sind willkommen! Dazu gehören:
- Unterstützung für neue Sprachen hinzufügen
- Inhaltspakete erstellen
- Die Benutzeroberfläche verbessern
- Fehler beheben
- Die App übersetzen

## Danksagungen

- Inspiriert von Vera F. Birkenbihl's Sprachlernmethode
- Erstellt mit Expo und React Native
- README erstellt mit KI-Unterstützung (Emergent AI / Claude)

---

*Für die englische Version dieser README, siehe [README.md](./README.md)*
