import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Google Gen AI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// In-memory store for IoT readings received from ESP32 or test posts
interface ESPReading {
  deviceId: string;
  ts: number;
  temperature: number;
  humidity: number;
  distanceCm: number;
  gasRaw: number;
  gasIndex: number;
  acousticRaw: number;
  insectEventsPerMin: number;
  module: 'grains' | 'onion_potato';
}

const latestDeviceReadings = new Map<string, ESPReading>();
const deviceReadingsHistory = new Map<string, ESPReading[]>();

// ESP32 Ingestion REST endpoint
app.post('/api/readings/ingest', (req, res) => {
  try {
    const {
      deviceId = 'ESP32-GRAIN-01',
      temperature,
      humidity,
      distanceCm,
      gasRaw,
      gasIndex,
      acousticRaw,
      insectEventsPerMin,
      module = 'grains',
    } = req.body;

    const reading: ESPReading = {
      deviceId,
      ts: Date.now(),
      temperature: Number(temperature) || 25,
      humidity: Number(humidity) || 55,
      distanceCm: Number(distanceCm) || 45,
      gasRaw: Number(gasRaw) || 600,
      gasIndex: Number(gasIndex) || 1.0,
      acousticRaw: Number(acousticRaw) || 200,
      insectEventsPerMin: Number(insectEventsPerMin) || 0,
      module,
    };

    latestDeviceReadings.set(deviceId, reading);

    if (!deviceReadingsHistory.has(deviceId)) {
      deviceReadingsHistory.set(deviceId, []);
    }
    const history = deviceReadingsHistory.get(deviceId)!;
    history.push(reading);
    if (history.length > 500) {
      history.shift();
    }

    res.json({ success: true, timestamp: reading.ts, deviceId });
  } catch (error: any) {
    res.status(400).json({ error: error?.message || 'Invalid payload' });
  }
});

// REST endpoint matching ESP32 Firebase RTDB style endpoint
app.post('/readings/:deviceId.json', (req, res) => {
  const deviceId = req.params.deviceId;
  const payload = req.body;
  const reading: ESPReading = {
    deviceId,
    ts: payload.ts || Date.now(),
    temperature: Number(payload.temperature) || 25,
    humidity: Number(payload.humidity) || 55,
    distanceCm: Number(payload.distanceCm) || 45,
    gasRaw: Number(payload.gasRaw) || 600,
    gasIndex: Number(payload.gasIndex) || 1.0,
    acousticRaw: Number(payload.acousticRaw) || 200,
    insectEventsPerMin: Number(payload.insectEventsPerMin) || 0,
    module: payload.module || 'grains',
  };

  latestDeviceReadings.set(deviceId, reading);
  res.json({ name: `-Rec_${Date.now()}` });
});

// Get latest reading for device
app.get('/api/readings/latest', (req, res) => {
  const deviceId = (req.query.deviceId as string) || 'ESP32-GRAIN-01';
  const reading = latestDeviceReadings.get(deviceId);
  res.json({
    deviceId,
    reading: reading || null,
    isOnline: reading ? Date.now() - reading.ts < 60000 : false,
    lastSeenSecondsAgo: reading ? Math.round((Date.now() - reading.ts) / 1000) : null,
  });
});

// AI Storage Advisor: Structured JSON output with Gemini
app.post('/api/gemini/advisor', async (req, res) => {
  try {
    const { reading, historySummary, forecast, activeAlerts, language = 'en' } = req.body;

    const langInstructions = {
      en: 'Respond in clear, farmer-friendly English.',
      hi: 'Respond in simple, clear Hindi (हिंदी) that Indian farmers can easily understand.',
      mr: 'Respond in simple, clear Marathi (मराठी) suitable for rural farmers in Maharashtra.',
    }[language as 'en' | 'hi' | 'mr'] || 'Respond in clear, farmer-friendly English.';

    const systemInstruction = `You are "Smart Grain Guardian", an agricultural post-harvest storage scientist and expert agronomist advisor.
Your mission is to evaluate storage bin sensor telemetry for grains, onions, and potatoes.
Strict Guidelines:
1. Use ONLY the provided telemetry numbers. Never invent or hallucinate data.
2. Clearly explain why acoustic chewing signals (insects) and gas emissions (fungal VOCs / rot) are critical.
3. If uncertainty exists, explicitly state it.
4. Remind the farmer that this is an AI advisory decision-support system and physical bin inspection is recommended.
5. ${langInstructions}
6. Provide output strictly matching the requested JSON schema.`;

    const promptText = `Analyze this grain storage bin status:
- Current Module: ${reading?.module || 'grains'}
- Temperature: ${reading?.temperature}°C
- Humidity: ${reading?.humidity}%
- Gas Index: ${reading?.gasIndex} (Baseline: 1.0, Gas Score: ${reading?.gasScore}/100)
- Acoustic Activity: ${reading?.insectEventsPerMin || 0} events/min (Acoustic Score: ${reading?.acousticScore || 0}/100)
- Grain Level: ${reading?.grainLevelPct}%
- Composite Risk Score: ${reading?.riskScore}/100
- System Status: ${reading?.status}
- 6-Hour Forecast Trend: ${forecast?.trend || 'Stable'} (Estimated time to alert: ${forecast?.timeToAlert || 'None'})
- Active Alert Triggers: ${JSON.stringify(activeAlerts || [])}
- Past 24h Summary: ${JSON.stringify(historySummary || {})}

Provide a structured storage diagnosis and prioritized action items.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: '1-2 sentence high level diagnostic summary of the grain condition.',
            },
            riskLevel: {
              type: Type.STRING,
              description: 'Safe, Early Warning, or Confirmed Alert',
            },
            likelyCause: {
              type: Type.STRING,
              description: 'The root cause identified from the telemetry (e.g. fungal VOC buildup, weevil acoustic chewing, moisture pocket, or normal stability).',
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.STRING,
              },
              description: '3-4 practical, prioritized actions the farmer should execute immediately.',
            },
            confidence: {
              type: Type.NUMBER,
              description: 'Diagnostic confidence level between 0 and 100.',
            },
            whatToCheckNext: {
              type: Type.STRING,
              description: 'Physical inspection checkpoint (e.g., check bin top hatch, inspect bottom auger, test moisture meter sample).',
            },
          },
          required: ['summary', 'riskLevel', 'likelyCause', 'actions', 'confidence', 'whatToCheckNext'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (err: any) {
    console.error('Gemini Advisor Error:', err);
    res.status(500).json({
      error: 'AI diagnosis failed',
      fallback: {
        summary: 'Sensor telemetry evaluated: Composite risk score reflects storage conditions. Ensure proper ventilation and check aeration fans.',
        riskLevel: req.body?.reading?.status === 'alert' ? 'Confirmed Alert' : (req.body?.reading?.status === 'early_warning' ? 'Early Warning' : 'Safe'),
        likelyCause: 'Automated telemetry rule evaluation',
        actions: [
          'Inspect the grain surface and aeration ports',
          'Verify ventilation fan operation during cool night hours',
          'Check grain moisture content at top and bottom sample ports',
        ],
        confidence: 85,
        whatToCheckNext: 'Check bottom discharge chute for damp grain or clump formation',
      },
    });
  }
});

// Contextual Grounded Farmer Chat endpoint
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, context } = req.body;
    const { reading, activeAlerts, language = 'en' } = context || {};

    const langInstructions = {
      en: 'Reply in simple, helpful English suitable for farmers.',
      hi: 'Reply in polite, helpful Hindi (हिंदी) with simple agricultural terms.',
      mr: 'Reply in polite, helpful Marathi (मराठी) with simple agricultural terms.',
    }[language as 'en' | 'hi' | 'mr'] || 'Reply in simple, helpful English.';

    const systemInstruction = `You are "Smart Grain Guardian" assistant.
You help storage managers and farmers understand their live IoT grain telemetry.
Current live status:
- Module: ${reading?.module || 'grains'}
- Temp: ${reading?.temperature}°C
- Humidity: ${reading?.humidity}%
- Gas Index: ${reading?.gasIndex}
- Acoustic Insect Chewing: ${reading?.insectEventsPerMin || 0} events/min
- Grain Level: ${reading?.grainLevelPct}%
- Spoilage Risk Score: ${reading?.riskScore}/100 (${reading?.status})
- Active Alerts: ${JSON.stringify(activeAlerts || [])}

Answer farmer questions concisely (2-4 sentences max), focusing on concrete farming steps. ${langInstructions}
Always be respectful, scientific, and realistic. Never make up sensor readings.`;

    const chat = ai.chats.create({
      model: 'gemini-3.8-flash',
      config: {
        systemInstruction,
      },
    });

    const chatResponse = await chat.sendMessage({
      message,
    });

    res.json({ reply: chatResponse.text });
  } catch (err: any) {
    console.error('Gemini Chat Error:', err);
    res.status(500).json({
      reply: 'I am currently unable to reach the agricultural AI server. Please verify your ventilation and inspect the bin manually if risk is high.',
    });
  }
});

// Setup Vite middlewares for development or serve static in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Grain Guardian server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
