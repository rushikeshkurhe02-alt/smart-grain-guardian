export type SupportedLanguage = 'en' | 'hi' | 'mr';

export interface TranslationStrings {
  brandName: string;
  tagline: string;
  moduleGrains: string;
  moduleOnionPotato: string;
  tabDashboard: string;
  tabInsights: string;
  tabHistory: string;
  tabAlerts: string;
  tabHowItWorks: string;
  tabSettings: string;
  tabPitchMode: string;
  liveBadge: string;
  simulatedBadge: string;
  onlineDot: string;
  offlineDot: string;
  statusNormal: string;
  statusWarning: string;
  statusAlert: string;
  normalHeadline: string;
  warningHeadline: string;
  alertHeadline: string;
  riskGaugeTitle: string;
  safeZone: string;
  warningZone: string;
  criticalZone: string;
  earNoseFusionTitle: string;
  earNoseSubtitle: string;
  acousticEar: string;
  gasNose: string;
  fusionBothAgree: string;
  fusionOneHigh: string;
  fusionNormal: string;
  kpiTemp: string;
  kpiHumidity: string;
  kpiGrainLevel: string;
  kpiGasIndex: string;
  kpiAcoustic: string;
  grainBinTitle: string;
  grainBinCapacity: string;
  grainBinSafeColor: string;
  scenariosTitle: string;
  scenarioNormal: string;
  scenarioHumRising: string;
  scenarioFungus: string;
  scenarioInsects: string;
  scenarioConfirmedAlert: string;
  aiAdvisorTitle: string;
  aiAdvisorSubtitle: string;
  btnAnalyzeStorage: string;
  analyzingStorage: string;
  diagnosisSummary: string;
  likelyRootCause: string;
  immediateActions: string;
  inspectionCheckpoint: string;
  diagnosticConfidence: string;
  forecastTitle: string;
  forecastSubtitle: string;
  forecast6Hours: string;
  timeToWarning: string;
  timeToAlert: string;
  noRiskExpected: string;
  statEstimateNotice: string;
  askAssistantTitle: string;
  askAssistantPlaceholder: string;
  btnSend: string;
  impactCalculatorTitle: string;
  impactQuantityLabel: string;
  impactPriceLabel: string;
  impactLossRisk: string;
  impactProtectedValue: string;
  impactAssumptionNotice: string;
  historyTitle: string;
  filter24h: string;
  filter7d: string;
  filterAll: string;
  btnDownloadCSV: string;
  btnDownloadAlertsCSV: string;
  btnPrintReport: string;
  connectESP32Title: string;
  connectESP32Subtitle: string;
  restEndpointLabel: string;
  deviceIdLabel: string;
  btnSendTestReading: string;
  testReadingSent: string;
  lastSeenLabel: string;
  copyCode: string;
  codeCopied: string;
  arduinoCodeTitle: string;
  alertsCenterTitle: string;
  btnAcknowledge: string;
  acknowledgedStatus: string;
  noActiveAlerts: string;
  pitchModeTitle: string;
  btnSkip: string;
  btnStopPitch: string;
  btnStartPitch: string;
  stepOf: string;
  settingsTitle: string;
  btnSaveSettings: string;
  btnResetDefaults: string;
  thresholdsTitle: string;
  audioAlarmLabel: string;
}

export const translations: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    brandName: 'Smart Grain Guardian',
    tagline: 'IoT Acoustic & Gas Sensor Fusion for Post-Harvest Protection',
    moduleGrains: 'Grains & Cereals',
    moduleOnionPotato: 'Onion + Potato',
    tabDashboard: 'Live Telemetry',
    tabInsights: 'AI Insights',
    tabHistory: 'History & Export',
    tabAlerts: 'Alerts Center',
    tabHowItWorks: 'How It Works',
    tabSettings: 'Settings',
    tabPitchMode: 'Pitch Mode (60s)',
    liveBadge: 'LIVE FROM ESP32',
    simulatedBadge: 'SIMULATED DATA',
    onlineDot: 'Hardware Online',
    offlineDot: 'Hardware Offline',
    statusNormal: 'SAFE / NORMAL',
    statusWarning: 'EARLY WARNING',
    statusAlert: 'CONFIRMED CRITICAL ALERT',
    normalHeadline: 'Storage micro-climate is stable. No active biological spoilage detected.',
    warningHeadline: 'Storage micro-climate anomaly detected. Inspect storage bin conditions.',
    alertHeadline: 'CRITICAL ALERT: Multi-sensor agreement confirmed active spoilage!',
    riskGaugeTitle: 'Composite Spoilage Risk',
    safeZone: 'Safe (<40)',
    warningZone: 'Early Warning (40-60)',
    criticalZone: 'Critical (>60)',
    earNoseFusionTitle: 'Ear + Nose Signal Cross-Validation',
    earNoseSubtitle: 'Alert confirmed only when both acoustic and gas signals agree',
    acousticEar: 'Acoustic Activity (The Ear)',
    gasNose: 'VOC Rotten Gas (The Nose)',
    fusionBothAgree: 'CROSS-VALIDATED: Both Sensors Agree',
    fusionOneHigh: 'Single Signal Elevated (Early Warning)',
    fusionNormal: 'Dual Signals Nominal',
    kpiTemp: 'Core Temperature',
    kpiHumidity: 'Relative Humidity',
    kpiGrainLevel: 'Grain Fill Level',
    kpiGasIndex: 'Gas Index (MQ-135)',
    kpiAcoustic: 'Insect Sound Activity',
    grainBinTitle: 'Physical Storage Bin Fill (HC-SR04)',
    grainBinCapacity: 'Bin Height: 250 cm · Distance to Grain: ',
    grainBinSafeColor: 'Grain Condition: Golden / Nominal',
    scenariosTitle: 'Simulation Controls (Real-Time Physics)',
    scenarioNormal: '1. Normal State',
    scenarioHumRising: '2. Humidity Rising',
    scenarioFungus: '3. Fungal Spoilage',
    scenarioInsects: '4. Insect Infestation',
    scenarioConfirmedAlert: '5. Dual Sensor Alert',
    aiAdvisorTitle: 'Agricultural Storage AI Advisor',
    aiAdvisorSubtitle: 'Grounded agronomic diagnosis powered by Gemini 3.8 Flash',
    btnAnalyzeStorage: 'Analyze My Storage Bin',
    analyzingStorage: 'Evaluating Telemetry & Running Diagnostics...',
    diagnosisSummary: 'Diagnostic Summary',
    likelyRootCause: 'Likely Root Cause',
    immediateActions: 'Farmer Checklist & Immediate Actions',
    inspectionCheckpoint: 'Physical Inspection Checkpoint',
    diagnosticConfidence: 'Confidence Score',
    forecastTitle: '6-Hour Statistical Spoilage Forecast',
    forecastSubtitle: 'Exponential smoothing (EWMA) & linear regression on micro-climate trajectory',
    forecast6Hours: '6-Hour Projection',
    timeToWarning: 'Est. Time to Early Warning',
    timeToAlert: 'Est. Time to Critical Alert',
    noRiskExpected: 'No risk escalation expected in 6h window',
    statEstimateNotice: 'Statistical estimate based on recent rate of change. Actual rates depend on external ambient weather.',
    askAssistantTitle: 'Ask Grain Guardian Grounded Chat',
    askAssistantPlaceholder: 'e.g. Is my grain safe to store for another month?',
    btnSend: 'Ask Advisor',
    impactCalculatorTitle: 'Economic Crop Value Protection Calculator',
    impactQuantityLabel: 'Stored Crop Quantity (Quintals)',
    impactPriceLabel: 'Market Price per Quintal (₹ INR)',
    impactLossRisk: 'Estimated Value at Risk (10-20% Spoilage)',
    impactProtectedValue: 'Economic Loss Preventable by Early Alert',
    impactAssumptionNotice: 'Based on ICAR & FAO estimates of 10-20% post-harvest loss in unmonitored storage bins.',
    historyTitle: 'Historical Sensor Telemetry & Audit Logs',
    filter24h: 'Last 24 Hours',
    filter7d: '7-Day Full Cycle',
    filterAll: 'Complete History',
    btnDownloadCSV: 'Download Sensor CSV',
    btnDownloadAlertsCSV: 'Download Alerts CSV',
    btnPrintReport: 'Print Storage Report (PDF)',
    connectESP32Title: 'ESP32 IoT Kit Integration',
    connectESP32Subtitle: 'Direct REST API endpoint for physical ESP32 microcontrollers',
    restEndpointLabel: 'REST Endpoint URL',
    deviceIdLabel: 'Target Device ID',
    btnSendTestReading: 'Send Test Telemetry Packet',
    testReadingSent: 'Test packet sent! Hardware status updated.',
    lastSeenLabel: 'Last Seen',
    copyCode: 'Copy Arduino Code',
    codeCopied: 'Copied to Clipboard!',
    arduinoCodeTitle: 'Production Arduino C++ Firmware Snippet',
    alertsCenterTitle: 'Storage Alert Log & Incident Response',
    btnAcknowledge: 'Acknowledge',
    acknowledgedStatus: 'Acknowledged',
    noActiveAlerts: 'Zero critical incidents. Storage bins are running safely.',
    pitchModeTitle: 'Hackathon Pitch Mode: 60-Second Walkthrough',
    btnSkip: 'Next Step',
    btnStopPitch: 'Exit Pitch Mode',
    btnStartPitch: 'Start 60s Judge Pitch',
    stepOf: 'Step',
    settingsTitle: 'Storage Bin Geometry & Safety Thresholds',
    btnSaveSettings: 'Save Storage Settings',
    btnResetDefaults: 'Reset to Factory Defaults',
    thresholdsTitle: 'Sensor Thresholds & Baseline Tuning',
    audioAlarmLabel: 'Sound Alarm Chime on Critical Alert',
  },
  hi: {
    brandName: 'स्मार्ट ग्रेन गार्डियन',
    tagline: 'अनाज और फसल सुरक्षा के लिए आईओटी ध्वनि और गैस सेंसर फ्यूजन प्रणाली',
    moduleGrains: 'अनाज और दालें (गेहूं, चावल)',
    moduleOnionPotato: 'प्याज और आलू',
    tabDashboard: 'लाइव टेलीमेट्री',
    tabInsights: 'एआई परामर्श',
    tabHistory: 'इतिहास और डेटा',
    tabAlerts: 'चेतावनी केंद्र',
    tabHowItWorks: 'यह कैसे काम करता है',
    tabSettings: 'सेटिंग्स',
    tabPitchMode: 'पिच मोड (60 सेकंड)',
    liveBadge: 'ईएसपी32 से लाइव',
    simulatedBadge: 'सिम्युलेटेड डेटा',
    onlineDot: 'डिवाइस ऑनलाइन',
    offlineDot: 'डिवाइस ऑफलाइन',
    statusNormal: 'सुरक्षित / सामान्य',
    statusWarning: 'प्रारंभिक चेतावनी',
    statusAlert: 'गंभीर चेतावनी: खतरा!',
    normalHeadline: 'भंडारण का वातावरण सामान्य है। कोई सड़न या कीट संकेत नहीं मिले।',
    warningHeadline: 'भंडारण में असामान्यता पाई गई। कृपया तुरंत निरीक्षण करें।',
    alertHeadline: 'गंभीर चेतावनी: ध्वनि और गैस दोनों सेंसरों ने सड़न की पुष्टि की है!',
    riskGaugeTitle: 'समग्र फसल जोखिम सूचकांक',
    safeZone: 'सुरक्षित (<40)',
    warningZone: 'चेतावनी (40-60)',
    criticalZone: 'गंभीर खतरा (>60)',
    earNoseFusionTitle: 'कान और नाक सेंसर मिलान (सिग्नल क्रॉस-वैलिडेशन)',
    earNoseSubtitle: 'अलर्ट केवल तभी जारी होता है जब ध्वनि और गैस दोनों सेंसर सहमत हों',
    acousticEar: 'ध्वनि सेंसर (कान - कीट गतिविधि)',
    gasNose: 'गैस सेंसर (नाक - सड़न की गंध)',
    fusionBothAgree: 'पुष्टि: दोनों सेंसर सहमत हैं (अलर्ट)',
    fusionOneHigh: 'एक सेंसर में वृद्धि (प्रारंभिक चेतावनी)',
    fusionNormal: 'दोनों सेंसर सामान्य स्थिति में',
    kpiTemp: 'तापमान (Core Temp)',
    kpiHumidity: 'हवा में नमी (Humidity)',
    kpiGrainLevel: 'गोदाम में अनाज स्तर',
    kpiGasIndex: 'सड़न गैस सूचकांक (MQ-135)',
    kpiAcoustic: 'कीटों की आवाज दर (प्रति मिनट)',
    grainBinTitle: 'साइलो/गोदाम स्तर (अल्ट्रासोनिक)',
    grainBinCapacity: 'कुल ऊंचाई: 250 सेमी · अनाज तक दूरी: ',
    grainBinSafeColor: 'अनाज स्थिति: सुनहरा / सुरक्षित',
    scenariosTitle: 'सिम्युलेटर परिदृश्य (लाइव डेमो)',
    scenarioNormal: '1. सामान्य स्थिति',
    scenarioHumRising: '2. नमी में वृद्धि',
    scenarioFungus: '3. फफूंद और सड़न',
    scenarioInsects: '4. घुन/कीट प्रकोप',
    scenarioConfirmedAlert: '5. दोहरा अलर्ट (कान+नाक)',
    aiAdvisorTitle: 'कृषि भंडारण एआई सलाहकार (Gemini)',
    aiAdvisorSubtitle: 'सेंसर डेटा पर आधारित सटीक कृषि सुझाव',
    btnAnalyzeStorage: 'मेरे भंडारण का विश्लेषण करें',
    analyzingStorage: 'डेटा का विश्लेषण हो रहा है...',
    diagnosisSummary: 'रोग निदान सारांश',
    likelyRootCause: 'संभावित कारण',
    immediateActions: 'किसान के लिए तत्काल कदम',
    inspectionCheckpoint: 'जांच बिंदु',
    diagnosticConfidence: 'विश्वसनीयता स्तर',
    forecastTitle: '6-घंटे का सांख्यिकीय जोखिम पूर्वानुमान',
    forecastSubtitle: 'भविष्य में जोखिम का अनुमान',
    forecast6Hours: '6 घंटे का अनुमान',
    timeToWarning: 'चेतावनी तक अनुमानित समय',
    timeToAlert: 'गंभीर खतरे तक अनुमानित समय',
    noRiskExpected: 'अगले 6 घंटे में कोई खतरा संभावित नहीं',
    statEstimateNotice: 'यह हाल के बदलाव की दर पर आधारित सांख्यिकीय अनुमान है।',
    askAssistantTitle: 'ग्रेन गार्डियन से पूछें',
    askAssistantPlaceholder: 'जैसे: क्या मेरा गेहूं सुरक्षित है?',
    btnSend: 'सलाह लें',
    impactCalculatorTitle: 'फसल मूल्य सुरक्षा कैलकुलेटर',
    impactQuantityLabel: 'भंडारित फसल की मात्रा (क्विंटल)',
    impactPriceLabel: 'बाजार भाव प्रति क्विंटल (₹ रुपये)',
    impactLossRisk: 'संभावित नुकसान का मूल्य (10-20% सड़न)',
    impactProtectedValue: 'समय पर अलर्ट से बचाया जा सकने वाला धन',
    impactAssumptionNotice: 'आईसीएआर और एफएओ के अनुसार पारंपरिक भंडारण में 10-20% फसल बर्बाद होती है।',
    historyTitle: 'ऐतिहासिक सेंसर डेटा और ऑडिट लॉग',
    filter24h: 'पिछले 24 घंटे',
    filter7d: '7 दिनों का चक्र',
    filterAll: 'पूर्ण इतिहास',
    btnDownloadCSV: 'सेंसर डेटा CSV डाउनलोड करें',
    btnDownloadAlertsCSV: 'अलर्ट लॉग CSV डाउनलोड करें',
    btnPrintReport: 'भंडारण रिपोर्ट प्रिंट करें (PDF)',
    connectESP32Title: 'ESP32 हार्डवेयर कनेक्शन',
    connectESP32Subtitle: 'सेंसर किट के लिए डायरेक्ट REST API लिंक',
    restEndpointLabel: 'REST यूआरएल',
    deviceIdLabel: 'डिवाइस आईडी',
    btnSendTestReading: 'टेस्ट डेटा पैकेट भेजें',
    testReadingSent: 'डेटा भेजा गया! हार्डवेयर सक्रिय है।',
    lastSeenLabel: 'अंतिम संपर्क',
    copyCode: 'Arduino कोड कॉपी करें',
    codeCopied: 'कोड कॉपी हो गया!',
    arduinoCodeTitle: 'ESP32 के लिए Arduino C++ कोड',
    alertsCenterTitle: 'अलर्ट और सुरक्षा चेतावनी केंद्र',
    btnAcknowledge: 'स्वीकार करें (Ack)',
    acknowledgedStatus: 'स्वीकृत',
    noActiveAlerts: 'कोई सक्रिय चेतावनी नहीं। भंडारण सुरक्षित है।',
    pitchModeTitle: 'हैकाथॉन पिच मोड: 60 सेकंड का डेमो',
    btnSkip: 'अगला कदम',
    btnStopPitch: 'पिच रोकें',
    btnStartPitch: '60 सेकंड का जज डेमो शुरू करें',
    stepOf: 'कदम',
    settingsTitle: 'भंडारण और सेंसर सीमा सेटिंग्स',
    btnSaveSettings: 'सेटिंग्स सहेजें',
    btnResetDefaults: 'डिफ़ॉल्ट पर रीसेट करें',
    thresholdsTitle: 'सेंसर सीमा (Thresholds)',
    audioAlarmLabel: 'खतरे के समय चेतावनी ध्वनि बजाएं',
  },
  mr: {
    brandName: 'स्मार्ट ग्रेन गार्डियन',
    tagline: 'धान्य आणि कांदा-बटाटा संरक्षणासाठी आयओटी ध्वनी व वायू सेन्सर फ्युजन प्रणाली',
    moduleGrains: 'धान्य आणि कडधान्ये (गहू, तांदूळ)',
    moduleOnionPotato: 'कांदा आणि बटाटा',
    tabDashboard: 'थेट सेन्सर माहिती',
    tabInsights: 'एआय सल्लागार',
    tabHistory: 'इतिहास आणि नोंदी',
    tabAlerts: 'इशारा केंद्र',
    tabHowItWorks: 'प्रणाली कशी चालते',
    tabSettings: 'सेटिंग्ज',
    tabPitchMode: 'पिच मोड (60 सेकंद)',
    liveBadge: 'ESP32 वरून थेट',
    simulatedBadge: 'सिम्युलेटेड डेटा',
    onlineDot: 'डिव्हाइस ऑनलाइन',
    offlineDot: 'डिव्हाइस ऑफलाइन',
    statusNormal: 'सुरक्षित / सामान्य',
    statusWarning: 'पूर्वसूचना (चेतावणी)',
    statusAlert: 'धोका: तात्काळ लक्ष द्या!',
    normalHeadline: 'साठवणूक वातावरण सामान्य आहे. कीड किंवा बुरशीची कोणतीही लक्षणे नाहीत.',
    warningHeadline: 'साठवणुकीत बदल जाणवला आहे. कृपया जागेवर जाऊन तपासणी करा.',
    alertHeadline: 'धोका: ध्वनी आणि वायू दोन्ही सेन्सरनी कीड व बुरशीची पुष्टी केली आहे!',
    riskGaugeTitle: 'एकत्रित साठवणूक धोका निर्देशांक',
    safeZone: 'सुरक्षित (<40)',
    warningZone: 'सावधगिरी (40-60)',
    criticalZone: 'गंभीर धोका (>60)',
    earNoseFusionTitle: 'कान आणि नाक सेन्सर ताळमेळ (सिग्नल फ्युजन)',
    earNoseSubtitle: 'जेव्हा ध्वनी आणि वायू दोन्ही सेन्सर सहमत असतात तेव्हाच अलर्ट जारी होतो',
    acousticEar: 'ध्वनी सेन्सर (कान - कीड चावण्याचा आवाज)',
    gasNose: 'वायू सेन्सर (नाक - कुजका वास/इथिलीन)',
    fusionBothAgree: 'दोन्ही सेन्सर सहमत: खरा धोका (अलर्ट)',
    fusionOneHigh: 'एकाच सेन्सरची नोंद (पूर्वसूचना)',
    fusionNormal: 'दोन्ही सेन्सर सुरक्षित पातळीवर',
    kpiTemp: 'आतील तापमान (Core Temp)',
    kpiHumidity: 'हवेतील आर्द्रता (Humidity)',
    kpiGrainLevel: 'साठवलेल्या धान्याची पातळी',
    kpiGasIndex: 'सडणारा वायू निर्देशांक (MQ-135)',
    kpiAcoustic: 'कीटक हालचालींचा आवाज (प्रति मिनिट)',
    grainBinTitle: 'गोदाम धान्य पातळी (अल्ट्रासॉनिक)',
    grainBinCapacity: 'एकूण उंची: 250 सेमी · धान्यापासून अंतर: ',
    grainBinSafeColor: 'धान्य स्थिती: सोनेरी / सुरक्षित',
    scenariosTitle: 'सिम्युलेटर परिस्थिती (डेमोसाठी)',
    scenarioNormal: '1. सामान्य स्थिती',
    scenarioHumRising: '2. आर्द्रता वाढणे',
    scenarioFungus: '3. बुरशीचा प्रादुर्भाव',
    scenarioInsects: '4. कीड/किडे प्रादुर्भाव',
    scenarioConfirmedAlert: '5. दुहेरी पुष्टी (कान+नाक अलर्ट)',
    aiAdvisorTitle: 'कृषी साठवणूक एआय सल्लागार (Gemini)',
    aiAdvisorSubtitle: 'थेट सेन्सर नोंदींवर आधारित शेती सल्ला',
    btnAnalyzeStorage: 'माझ्या साठवणुकीचे विश्लेषण करा',
    analyzingStorage: 'डेटा तपासला जात आहे...',
    diagnosisSummary: 'निदान सारांश',
    likelyRootCause: 'संभाव्य कारण',
    immediateActions: 'शेतकऱ्यांसाठी तात्काळ उपाययोजना',
    inspectionCheckpoint: 'तपासणी ठिकाण',
    diagnosticConfidence: 'खात्री टक्केवारी',
    forecastTitle: '६ तासांचा संभाव्य धोका अंदाज',
    forecastSubtitle: 'मायक्रो-क्लायमेट बदलांवरून पुढील स्थितीचा अंदाज',
    forecast6Hours: '६ तासांचे भाकीत',
    timeToWarning: 'चेतावणीची संभाव्य वेळ',
    timeToAlert: 'गंभीर धोक्याची संभाव्य वेळ',
    noRiskExpected: 'पुढील ६ तासांत कोणताही धोका अपेक्षित नाही',
    statEstimateNotice: 'हा सांख्यिकीय अंदाज आहे. बाहेरील हवामानानुसार यात बदल होऊ शकतो.',
    askAssistantTitle: 'ग्रेन गार्डियनशी बोला',
    askAssistantPlaceholder: 'उदा. माझा माल किती दिवस टिकेल?',
    btnSend: 'सल्ला विचारा',
    impactCalculatorTitle: 'आर्थिक नुकसान टाळणारा कॅल्क्युलेटर',
    impactQuantityLabel: 'साठवलेला माल (क्विंटल)',
    impactPriceLabel: 'बाजारभाव प्रति क्विंटल (₹ रुपये)',
    impactLossRisk: 'संभाव्य नुकसानीचे मूल्य (10-20% सडणे)',
    impactProtectedValue: 'वेळेवर अलर्ट मिळाल्यामुळे वाचणारे पैसे',
    impactAssumptionNotice: 'पारंपरिक साठवणुकीत सरासरी 10-20% धान्याची नासाडी होते.',
    historyTitle: 'मागील सेन्सर नोंदी आणि अहवाल',
    filter24h: 'मागील २४ तास',
    filter7d: '७ दिवसांचा पूर्ण अहवाल',
    filterAll: 'सर्व नोंदी',
    btnDownloadCSV: 'सेन्सर CSV डाउनलोड करा',
    btnDownloadAlertsCSV: 'अलर्ट CSV डाउनलोड करा',
    btnPrintReport: 'साठवणूक अहवाल प्रिंट करा (PDF)',
    connectESP32Title: 'ESP32 हार्डवेअर जोडणी',
    connectESP32Subtitle: 'थेट REST API द्वारे सेन्सर किट जोडणी',
    restEndpointLabel: 'REST यूआरएल',
    deviceIdLabel: 'डिव्हाइस आयडी',
    btnSendTestReading: 'चाचणी डेटा पाठवा',
    testReadingSent: 'चाचणी डेटा पाठवला गेला! हार्डवेअर सक्रिय झाले.',
    lastSeenLabel: 'शेवटची नोंद',
    copyCode: 'Arduino कोड कॉपी करा',
    codeCopied: 'कोड क्लिपबोर्डवर कॉपी झाला!',
    arduinoCodeTitle: 'ESP32 साठी Arduino C++ कोड',
    alertsCenterTitle: 'अलर्ट आणि सूचना केंद्र',
    btnAcknowledge: 'नोंद घेतली (Ack)',
    acknowledgedStatus: 'नोंद झाली',
    noActiveAlerts: 'कोणतीही धोक्याची सूचना नाही. माल सुरक्षित आहे.',
    pitchModeTitle: 'हॅकाथॉन पिच मोड: ६० सेकंदांचा डेमो',
    btnSkip: 'पुढील टप्पा',
    btnStopPitch: 'पिच थांबवा',
    btnStartPitch: '६० सेकंदांचा पिच डेमो सुरू करा',
    stepOf: 'टप्पा',
    settingsTitle: 'गोदाम आकार आणि सेन्सर मर्यादा',
    btnSaveSettings: 'सेटिंग्ज जतन करा',
    btnResetDefaults: 'मूळ स्थितीत आणा',
    thresholdsTitle: 'सेन्सर मर्यादा (Thresholds)',
    audioAlarmLabel: 'धोक्याच्या वेळी अलार्म आवाज चालू ठेवा',
  },
};
