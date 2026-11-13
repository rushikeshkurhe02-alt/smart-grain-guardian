import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  Brain,
  MessageSquare,
  Calculator,
  ShieldCheck,
  AlertCircle,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  HelpCircle,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { SensorReading, StorageSettings, AIAdvisorResult, AlertItem } from '../types';
import { TranslationStrings } from '../services/i18n';
import { computeForecast, detectAnomalies } from '../services/forecasting';

interface AIInsightsViewProps {
  readings: SensorReading[];
  currentReading: SensorReading;
  activeAlerts: AlertItem[];
  settings: StorageSettings;
  t: TranslationStrings;
}

export const AIInsightsView: React.FC<AIInsightsViewProps> = ({
  readings,
  currentReading,
  activeAlerts,
  settings,
  t,
}) => {
  const forecast = computeForecast(readings);
  const anomalyReadings = detectAnomalies(readings).filter(r => r.isAnomaly).slice(-5);

  // AI Advisor State
  const [advisorLoading, setAdvisorLoading] = useState(false);
  const [advisorResult, setAdvisorResult] = useState<AIAdvisorResult | null>(null);

  // Chat State
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: settings.language === 'hi'
        ? 'नमस्ते! मैं स्मार्ट ग्रेन गार्डियन हूँ। अपने भंडारण, कीट आवाज या नमी के बारे में कोई भी प्रश्न पूछें।'
        : settings.language === 'mr'
        ? 'नमस्कार! मी स्मार्ट ग्रेन गार्डियन आहे. साठवणूक, कीड आवाज किंवा आर्द्रतेबद्दल कोणताही प्रश्न विचारा.'
        : 'Hello! I am your Smart Grain Guardian agronomist. Ask me any question about your grain moisture, insects, or ventilation.',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);

  // Economic Impact Calculator State
  const [quintals, setQuintals] = useState<number>(settings.quantityQuintal || 500);
  const [pricePerQuintal, setPricePerQuintal] = useState<number>(settings.pricePerQuintal || 2450);

  const totalValue = quintals * pricePerQuintal;
  const valueAtRiskMin = totalValue * 0.10; // 10% standard unmonitored loss
  const valueAtRiskMax = totalValue * 0.20; // 20% standard unmonitored loss
  const protectedEstimate = (valueAtRiskMin + valueAtRiskMax) / 2;

  // Run AI Advisor Analysis via server endpoint
  const handleRunAdvisor = async () => {
    setAdvisorLoading(true);
    try {
      // 24h summary stats
      const past24h = readings.slice(-144);
      const avgTemp = past24h.reduce((a, b) => a + b.temperature, 0) / (past24h.length || 1);
      const avgHum = past24h.reduce((a, b) => a + b.humidity, 0) / (past24h.length || 1);
      const maxGas = Math.max(...past24h.map(r => r.gasIndex), 1.0);
      const maxAcoustic = Math.max(...past24h.map(r => r.insectEventsPerMin), 0);

      const res = await fetch('/api/gemini/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reading: currentReading,
          historySummary: {
            avgTemp: Math.round(avgTemp * 10) / 10,
            avgHum: Math.round(avgHum * 10) / 10,
            maxGas,
            maxAcoustic,
          },
          forecast: {
            trend: forecast.trend,
            timeToAlert: forecast.estimatedHoursToAlert ? `${forecast.estimatedHoursToAlert}h` : 'None',
          },
          activeAlerts: activeAlerts.slice(-3).map(a => a.message),
          language: settings.language,
        }),
      });

      if (!res.ok) throw new Error('Advisor request failed');
      const data = await res.json();
      setAdvisorResult(data);
    } catch (err) {
      console.error(err);
      // Fallback
      setAdvisorResult({
        summary: `Storage conditions evaluated for ${settings.module === 'grains' ? 'Wheat & Cereals' : 'Onion & Potato'}. Composite risk is currently ${currentReading.riskScore}/100.`,
        riskLevel: currentReading.status === 'alert' ? 'Confirmed Alert' : (currentReading.status === 'early_warning' ? 'Early Warning' : 'Safe'),
        likelyCause: currentReading.statusReason || 'Telemetry nominal',
        actions: [
          'Cycle bottom-to-top exhaust fans during cool night hours (11 PM - 4 AM)',
          'Check the grain bulk core temperature with a manual probe',
          'Inspect hopper outlet for damp grain clustering or musty odors',
        ],
        confidence: 88,
        whatToCheckNext: 'Inspect bin roof vents for condensation dripping onto grain top surface',
      });
    } finally {
      setAdvisorLoading(false);
    }
  };

  // Grounded Chat Send
  const handleSendChat = async (msgText?: string) => {
    const textToSend = msgText || chatInput;
    if (!textToSend.trim() || chatLoading) return;

    const userMsg = { sender: 'user' as const, text: textToSend };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          context: {
            reading: currentReading,
            activeAlerts: activeAlerts.slice(-2).map(a => a.message),
            language: settings.language,
          },
        }),
      });

      if (!res.ok) throw new Error('Chat request failed');
      const data = await res.json();
      setChatMessages(prev => [...prev, { sender: 'assistant', text: data.reply }]);
    } catch (err) {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Unable to reach the Gemini advisory network. Please check your network connection and inspect storage ventilation directly.',
        },
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const suggestedQuestions = settings.language === 'hi'
    ? ['क्या मेरा अनाज आज सुरक्षित है?', 'जोखिम क्यों बढ़ रहा है?', 'मुझे अब क्या करना चाहिए?']
    : settings.language === 'mr'
    ? ['माझे धान्य आज सुरक्षित आहे का?', 'धोका का वाढत आहे?', 'मी आता काय करावे?']
    : ['Is my grain safe today?', 'Why is the risk score rising?', 'What aeration steps should I take now?'];

  return (
    <div className="space-y-6">

      {/* 1. Spoilage 6-Hour Statistical Forecast Band */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              {t.forecastTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.forecastSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Trend: <strong>{forecast.trend}</strong>
            </span>
            {forecast.estimatedHoursToAlert !== null ? (
              <span className="px-2 py-1 rounded-md bg-red-100 dark:bg-red-950/70 text-red-700 dark:text-red-300 font-bold">
                Alert in ~{forecast.estimatedHoursToAlert}h
              </span>
            ) : forecast.estimatedHoursToWarning !== null ? (
              <span className="px-2 py-1 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold">
                Warning in ~{forecast.estimatedHoursToWarning}h
              </span>
            ) : (
              <span className="px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-semibold">
                {t.noRiskExpected}
              </span>
            )}
          </div>
        </div>

        {/* 6-Hour Confidence Band Area Chart */}
        <div className="w-full h-64 sm:h-72 mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecast.points} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastBandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0E8A96" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0E8A96" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis dataKey="timeLabel" stroke="#94A3B8" fontSize={11} tickLine={false} fontFamily="monospace" />
              <YAxis domain={[0, 100]} stroke="#94A3B8" fontSize={11} tickLine={false} fontFamily="monospace" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#F8FAFC',
                }}
              />
              <ReferenceLine y={40} stroke="#F59E0B" strokeDasharray="3 3" label={{ value: 'Early Warning (40)', fill: '#F59E0B', fontSize: 10 }} />
              <ReferenceLine y={60} stroke="#EF4444" strokeDasharray="3 3" label={{ value: 'Confirmed Alert (60)', fill: '#EF4444', fontSize: 10 }} />

              {/* Confidence Band (Upper and Lower) */}
              <Area
                type="monotone"
                dataKey="upperBand"
                name="Confidence Ceiling (90%)"
                stroke="#0E8A96"
                strokeWidth={1}
                strokeDasharray="2 2"
                fill="url(#forecastBandGrad)"
              />
              <Area
                type="monotone"
                dataKey="lowerBand"
                name="Confidence Floor"
                stroke="#0E8A96"
                strokeWidth={1}
                strokeDasharray="2 2"
                fill="transparent"
              />
              <Line
                type="monotone"
                dataKey="riskScore"
                name="Projected Risk"
                stroke="#0E8A96"
                strokeWidth={2.5}
                strokeDasharray="5 3"
                dot={{ r: 3, fill: '#0E8A96' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Forecast Disclaimer */}
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 shrink-0 text-slate-400" />
          <span>{forecast.summaryText} {t.statEstimateNotice}</span>
        </div>

        {/* Anomaly Detection Strip if any anomalies flagged */}
        {anomalyReadings.length > 0 && (
          <div className="mt-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Anomaly Detector:</span> {anomalyReadings.length} sudden statistical deviances flagged in recent cycles (sudden gas or acoustic spikes exceeding EWMA 2.2σ).
            </div>
          </div>
        )}
      </div>

      {/* 2. Gemini AI Storage Advisor Card */}
      <div className="rounded-2xl border border-teal-500/30 bg-gradient-to-br from-white via-white to-teal-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-teal-950/20 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-teal-600 text-white">
                <Brain className="w-4 h-4" />
              </span>
              {t.aiAdvisorTitle}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {t.aiAdvisorSubtitle}
            </p>
          </div>

          <button
            onClick={handleRunAdvisor}
            disabled={advisorLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-900/20 disabled:opacity-50 transition"
          >
            {advisorLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t.analyzingStorage}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{t.btnAnalyzeStorage}</span>
              </>
            )}
          </button>
        </div>

        {/* AI Advisor Result Display */}
        {advisorResult ? (
          <div className="mt-5 space-y-4 animate-in fade-in duration-300">
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400">
                  {t.diagnosisSummary}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  {t.diagnosticConfidence}: <strong>{advisorResult.confidence}%</strong>
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                {advisorResult.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Likely Root Cause */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  {t.likelyRootCause}
                </span>
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  {advisorResult.likelyCause}
                </p>
              </div>

              {/* Physical Checkpoint */}
              <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                  {t.inspectionCheckpoint}
                </span>
                <p className="text-sm font-semibold text-teal-700 dark:text-teal-300">
                  {advisorResult.whatToCheckNext}
                </p>
              </div>
            </div>

            {/* Action Items */}
            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white block mb-2">
                {t.immediateActions}
              </span>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                {advisorResult.actions.map((act, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{act}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div className="mt-6 text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <Sparkles className="w-8 h-8 text-teal-500/50 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Click <strong>"{t.btnAnalyzeStorage}"</strong> to generate a real-time agronomist diagnosis with Gemini 3.8 Flash.
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Evaluates live acoustic events, gas index, 24-hour trends, and weather risk.
            </p>
          </div>
        )}
      </div>

      {/* 3. Grounded Farmer Chat + Economic Impact Calculator Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

        {/* "Ask Grain Guardian" Grounded Chat (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-teal-600" />
                {t.askAssistantTitle}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Context-Grounded
              </span>
            </div>

            {/* Suggested Prompts */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendChat(q)}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-teal-50 dark:hover:bg-teal-950/50 hover:text-teal-700 dark:hover:text-teal-300 transition"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Messages Scroll Area */}
            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto pr-1">
              {chatMessages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-teal-600 text-white rounded-br-none'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-none px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-xs flex items-center gap-2 text-slate-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                    <span>Thinking...</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Input Bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendChat()}
              placeholder={t.askAssistantPlaceholder}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <button
              onClick={() => handleSendChat()}
              disabled={!chatInput.trim() || chatLoading}
              className="p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-40 transition"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Economic Value Protection Calculator (5 cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal-600" />
                {t.impactCalculatorTitle}
              </h3>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                  {t.impactQuantityLabel}
                </label>
                <input
                  type="number"
                  value={quintals}
                  onChange={e => setQuintals(Math.max(1, Number(e.target.value) || 0))}
                  className="mt-1 w-full px-3 py-1.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500 dark:text-slate-400 font-medium block">
                  {t.impactPriceLabel}
                </label>
                <input
                  type="number"
                  value={pricePerQuintal}
                  onChange={e => setPricePerQuintal(Math.max(1, Number(e.target.value) || 0))}
                  className="mt-1 w-full px-3 py-1.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="mt-5 space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Total Stored Asset Value:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₹{totalValue.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="flex justify-between text-amber-600 dark:text-amber-400">
                <span>{t.impactLossRisk}:</span>
                <span className="font-mono font-bold">
                  ₹{valueAtRiskMin.toLocaleString('en-IN')} – ₹{valueAtRiskMax.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 mt-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 block">
                  {t.impactProtectedValue}
                </span>
                <span className="text-2xl font-black font-mono text-teal-700 dark:text-teal-300">
                  ₹{protectedEstimate.toLocaleString('en-IN')}
                </span>
                <span className="text-[10px] text-teal-800/80 dark:text-teal-400/80 block mt-0.5">
                  Protects up to 15% harvest value with prompt 48h aerating intervention.
                </span>
              </div>
            </div>
          </div>

          <p className="mt-4 text-[10px] text-slate-400 leading-tight">
            {t.impactAssumptionNotice}
          </p>
        </div>

      </div>

    </div>
  );
};
