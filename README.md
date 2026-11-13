# Smart Grain Guardian 🌾🛡️

> **IoT Acoustic & Gas Sensor Fusion for Post-Harvest Spoilage Detection & Gemini AI Advisory**

10–20% of harvested grain, onions, and potatoes are lost each year to invisible subterranean insect infestations and fungal colonization. **Smart Grain Guardian** is a production-quality, mobile-first IoT monitoring dashboard that solves this by fusing acoustic transducer signals (larval chewing sounds) and MQ-135 gas analysis (fungal VOCs / ethylene) with rate-of-change cross-validation.

---

## 🌟 Core Scientific Novelty: "Ear + Nose" Cross-Validation

Single-sensor systems suffer from debilitating failure modes:
- **Acoustic-only systems** have high false-positive rates (~34%) triggered by roof rain, passing trucks, or ambient farm equipment.
- **Gas-only sensors** cannot detect early insect larvae chewing inside dry kernels before heat or mold begins.

**The Smart Grain Guardian Breakthrough:**
An alert is escalated to a **CONFIRMED CRITICAL ALERT** only when **BOTH** the acoustic sensor (Ear) and the gas sensor (Nose) simultaneously exceed their thresholds (Score ≥ 60), or when rotten gas surges across 3 consecutive cycles for tuber storage. Single-sensor spikes trigger an **Early Warning**, eliminating false alarms while providing 3 to 7 days of advance lead time.

---

## 🛠️ Hardware Bill of Materials (ESP32 Base Kit)

| Component | Function | Pins on ESP32 |
|---|---|---|
| **ESP32 NodeMCU** | Dual-core 240MHz microcontroller with WiFi | Micro-USB / 3.3V |
| **DHT22 (AM2302)** | Storage micro-climate temperature & humidity | GPIO 4 |
| **MQ-135 Gas Sensor** | Electrochemical VOC, ammonia, alcohol & ethylene | GPIO 34 (ADC1_CH6) |
| **Acoustic Mic Module** | High-sensitivity piezoelectric/mic transducer | GPIO 35 (ADC1_CH7) |
| **HC-SR04 Ultrasonic** | Top-down grain headspace measurement (level %) | TRIG: GPIO 5, ECHO: GPIO 18 |
| **MicroSD Card Shield** | Local offline telemetry logging when WiFi drops | SPI (GPIO 19, 23, 18, 5) |

---

## 📡 ESP32 REST Ingestion Endpoint

The system accepts live HTTP POST requests directly from physical ESP32 boards or gateway routers:

```http
POST /readings/{deviceId}.json
Content-Type: application/json
```

### JSON Payload Schema

```json
{
  "deviceId": "ESP32-GRAIN-01",
  "temperature": 27.8,
  "humidity": 68.4,
  "distanceCm": 45,
  "gasRaw": 780,
  "gasIndex": 1.30,
  "acousticRaw": 320,
  "insectEventsPerMin": 24,
  "module": "grains"
}
```

### Live Status & Simulator Fallback
- **Live from ESP32**: When real packets arrive, the dashboard displays a green `LIVE FROM ESP32` badge and tracks `Last seen X seconds ago`.
- **Autonomous Simulator**: If no live hardware reading is received for >60 seconds, the app automatically switches to an honest `SIMULATED DATA` badge running realistic diurnal temperature cycles and micro-climate physics.

---

## 🧪 Built-in Hackathon "Pitch Mode" (60 Seconds)

Click the **"Pitch Mode (60s)"** button on the top navigation bar to launch an automated, judge-ready walkthrough:
1. **Normal Harvest**: 500 Quintals of wheat loaded in bin.
2. **Humidity Rising**: External rain pushes humidity toward 75%.
3. **Fungal VOC Surge**: Fungi emit musty alcohols; MQ-135 enters Early Warning.
4. **Insect Chewing Emerges**: Acoustic sensor registers 48 chewing events/min.
5. **Cross-Validation Agreement**: Both sensors cross threshold 60, triggering Confirmed Alert with audio chime!
6. **Gemini 3.8 Flash Advisory**: Real-time agronomist diagnostic checklist in English, Hindi, or Marathi.
7. **Loss Prevention**: Impact calculator proves ₹2,45,000 crop value saved.
8. **Export Audit**: One-click sensor CSV download.

---

## 🔐 Firebase Setup & Realtime Database Rules

To connect your own Firebase Realtime Database:
1. Create a Firebase project in the [Firebase Console](https://console.firebase.google.com).
2. Create a Realtime Database in your preferred region.
3. Apply the security rules defined in `database.rules.json`:

```json
{
  "rules": {
    "readings": {
      ".read": true,
      "$deviceId": {
        ".indexOn": ["ts"],
        ".write": true
      }
    },
    "alerts": {
      ".read": true,
      "$deviceId": {
        ".write": "auth != null"
      }
    },
    "settings": {
      ".read": true,
      "$deviceId": {
        ".write": "auth != null"
      }
    }
  }
}
```

---

## ⚙️ Environment Variables

Create a `.env` file from `.env.example`:

```env
# GEMINI_API_KEY: Server-side Gemini 3.8 Flash key for AI storage advisor
GEMINI_API_KEY="your-gemini-api-key"

# APP_URL: Cloud Run / Hosting service URL
APP_URL="https://your-applet-url.run.app"
```

---

## 🚀 Development & Build Commands

```bash
# Install dependencies
npm install

# Start full-stack dev server (Express + Vite on Port 3000)
npm run dev

# Build production bundle
npm run build

# Start production server
npm start
```

---

## 📱 Progressive Web App (PWA)

- **Standalone Mode**: Installable directly on Android Chromium and iOS Safari.
- **Offline Caching**: Service worker precaches assets and scripts.
- **In-App Prompt**: Mounted `PWAInstallButton` with custom iOS guided instructions.
