import React, { useState } from 'react';
import {
  Radio,
  Copy,
  Check,
  Send,
  Code,
  Wifi,
  Cpu,
  Layers,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { TranslationStrings } from '../services/i18n';

interface ESP32IntegrationViewProps {
  deviceId: string;
  isOnline: boolean;
  lastSeenSecondsAgo: number | null;
  onSendTestReading: () => Promise<void>;
  t: TranslationStrings;
}

export const ESP32IntegrationView: React.FC<ESP32IntegrationViewProps> = ({
  deviceId,
  isOnline,
  lastSeenSecondsAgo,
  onSendTestReading,
  t,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [testSending, setTestSending] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);

  const endpointUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/readings/${deviceId}.json`
    : `https://smart-grain-guardian.web.app/readings/${deviceId}.json`;

  const samplePayload = {
    deviceId,
    ts: Date.now(),
    temperature: 28.4,
    humidity: 62.8,
    distanceCm: 44,
    grainLevelPct: 82,
    gasRaw: 740,
    gasIndex: 1.18,
    acousticRaw: 240,
    insectEventsPerMin: 12,
    module: 'grains',
  };

  const arduinoSnippet = `// Smart Grain Guardian - ESP32 Firmware
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include "DHT.h"

#define DHTPIN 4
#define DHTTYPE DHT22
#define TRIG_PIN 5
#define ECHO_PIN 18
#define MQ135_PIN 34
#define MIC_PIN 35

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "${endpointUrl}";

DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWiFi Connected!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    // Read Sensors
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    
    // HC-SR04 Ultrasonic Distance
    digitalWrite(TRIG_PIN, LOW); delayMicroseconds(2);
    digitalWrite(TRIG_PIN, HIGH); delayMicroseconds(10);
    digitalWrite(TRIG_PIN, LOW);
    long duration = pulseIn(ECHO_PIN, HIGH);
    float distanceCm = duration * 0.034 / 2;

    // Analog Sensors
    int gasRaw = analogRead(MQ135_PIN);
    float gasIndex = gasRaw / 600.0;
    int acousticRaw = analogRead(MIC_PIN);
    int insectEvents = (acousticRaw > 400) ? 14 : 2;

    // Build JSON Payload
    StaticJsonDocument<256> doc;
    doc["deviceId"] = "${deviceId}";
    doc["temperature"] = t;
    doc["humidity"] = h;
    doc["distanceCm"] = distanceCm;
    doc["gasRaw"] = gasRaw;
    doc["gasIndex"] = gasIndex;
    doc["acousticRaw"] = acousticRaw;
    doc["insectEventsPerMin"] = insectEvents;
    doc["module"] = "grains";

    String jsonString;
    serializeJson(doc, jsonString);

    int httpResponseCode = http.POST(jsonString);
    Serial.printf("Telemetry Sent! HTTP Response: %d\\n", httpResponseCode);
    http.end();
  }
  delay(10000); // 10 second interval
}`;

  const copyToClipboard = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendTest = async () => {
    setTestSending(true);
    await onSendTestReading();
    setTestSending(false);
    setTestSuccess(true);
    setTimeout(() => setTestSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">

      {/* Header and Online/Offline Telemetry Status */}
      <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              {t.connectESP32Title}
            </h3>
            <p className="text-xs text-slate-500">
              {t.connectESP32Subtitle}
            </p>
          </div>
        </div>

        {/* Live Hardware Online Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isOnline ? t.onlineDot : t.offlineDot}
            </span>
            <span className="text-slate-400">
              {lastSeenSecondsAgo !== null ? `(${lastSeenSecondsAgo}s ago)` : '(no signal)'}
            </span>
          </div>

          <button
            onClick={handleSendTest}
            disabled={testSending}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-xs transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testSending ? 'Sending...' : t.btnSendTestReading}</span>
          </button>
        </div>
      </div>

      {testSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{t.testReadingSent} Dashboard switched to live hardware streaming.</span>
        </div>
      )}

      {/* Connection Coordinates: Endpoint URL & Device ID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* REST Endpoint URL */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            {t.restEndpointLabel} (Firebase RTDB REST Pattern)
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-mono text-slate-800 dark:text-slate-200 truncate flex-1">
              {endpointUrl}
            </span>
            <button
              onClick={() => copyToClipboard(endpointUrl, setCopiedUrl)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              title="Copy Endpoint"
            >
              {copiedUrl ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Copyable Device ID */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
            {t.deviceIdLabel}
          </label>
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 flex-1">
              {deviceId}
            </span>
            <button
              onClick={() => copyToClipboard(deviceId, setCopiedId)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
              title="Copy Device ID"
            >
              {copiedId ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

      </div>

      {/* JSON Payload Sample */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
          Expected JSON Payload Schema
        </h4>
        <pre className="p-3 rounded-xl bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
          {JSON.stringify(samplePayload, null, 2)}
        </pre>
      </div>

      {/* Complete Production Arduino C++ Code Snippet */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code className="w-4 h-4 text-teal-600" />
            {t.arduinoCodeTitle}
          </h4>
          <button
            onClick={() => copyToClipboard(arduinoSnippet, setCopiedCode)}
            className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? t.codeCopied : t.copyCode}</span>
          </button>
        </div>

        <pre className="mt-3 p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs max-h-96 overflow-y-auto leading-relaxed">
          {arduinoSnippet}
        </pre>
      </div>

    </div>
  );
};
