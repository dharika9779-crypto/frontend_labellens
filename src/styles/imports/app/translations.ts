/**
 * translations.ts
 * ---------------
 * Static translations for LabelLens
 * Languages: English, Hindi, Marathi, Tamil, Bengali, Gujarati
 */

export type Language = 'en' | 'hi' | 'mr' | 'ta' | 'bn' | 'gu';

export const LANGUAGES = [
  { code: 'en', label: 'English',    flag: '🇬🇧' },
  { code: 'hi', label: 'हिंदी',      flag: '🇮🇳' },
  { code: 'mr', label: 'मराठी',      flag: '🇮🇳' },
  { code: 'ta', label: 'தமிழ்',      flag: '🇮🇳' },
  { code: 'bn', label: 'বাংলা',      flag: '🇮🇳' },
  { code: 'gu', label: 'ગુજરાતી',    flag: '🇮🇳' },
];

export const T = {
  // ── APP ───────────────────────────────────────────────────
  appName: {
    en: 'LabelLens',
    hi: 'लेबललेंस',
    mr: 'लेबललेन्स',
    ta: 'லேபல்லென்ஸ்',
    bn: 'লেবেললেন্স',
    gu: 'લેબललેન્સ',
  },
  tagline: {
    en: "Decode what's really in your food.",
    hi: 'जानें आपके खाने में क्या है।',
    mr: 'तुमच्या अन्नात काय आहे ते जाणा।',
    ta: 'உங்கள் உணவில் என்ன இருக்கிறது என்பதை அறியுங்கள்।',
    bn: 'আপনার খাবারে কী আছে তা জানুন।',
    gu: 'તમારા ખોરાકમાં શું છે તે જાણો।',
  },

  // ── STEPS ─────────────────────────────────────────────────
  step1: {
    en: 'Scan Food Label or Barcode',
    hi: 'फूड लेबल या बारकोड स्कैन करें',
    mr: 'फूड लेबल किंवा बारकोड स्कॅन करा',
    ta: 'உணவு லேபல் அல்லது பார்கோடை ஸ்கேன் செய்யுங்கள்',
    bn: 'ফুড লেবেল বা বারকোড স্ক্যান করুন',
    gu: 'ફૂડ લેબલ અથવા બારકોડ સ્કેન કરો',
  },
  step2: {
    en: 'Review & Analyse',
    hi: 'समीक्षा करें और विश्लेषण करें',
    mr: 'पुनरावलोकन करा आणि विश्लेषण करा',
    ta: 'மதிப்பாய்வு செய்து பகுப்பாய்வு செய்யுங்கள்',
    bn: 'পর্যালোচনা করুন এবং বিশ্লেষণ করুন',
    gu: 'સમીક્ષા કરો અને વિશ્લેષણ કરો',
  },
  step3: {
    en: 'Results',
    hi: 'परिणाम',
    mr: 'निकाल',
    ta: 'முடிவுகள்',
    bn: 'ফলাফল',
    gu: 'પરિણામ',
  },

  // ── BUTTONS ───────────────────────────────────────────────
  scanLabel: {
    en: '📷 Scan Label',
    hi: '📷 लेबल स्कैन करें',
    mr: '📷 लेबल स्कॅन करा',
    ta: '📷 லேபல் ஸ்கேன்',
    bn: '📷 লেবেল স্ক্যান',
    gu: '📷 લેબલ સ્કેન',
  },
  scanBarcode: {
    en: '📦 Scan Barcode',
    hi: '📦 बारकोड स्कैन करें',
    mr: '📦 बारकोड स्कॅन करा',
    ta: '📦 பார்கோட் ஸ்கேன்',
    bn: '📦 বারকোড স্ক্যান',
    gu: '📦 બારકોડ સ્કેન',
  },
  extractText: {
    en: 'Extract Text',
    hi: 'टेक्स्ट निकालें',
    mr: 'मजकूर काढा',
    ta: 'உரையை பிரித்தெடுக்கவும்',
    bn: 'টেক্সট বের করুন',
    gu: 'ટેક્સ્ટ કાઢો',
  },
  analyseIngredients: {
    en: '🧬 Analyse Ingredients',
    hi: '🧬 सामग्री का विश्लेषण करें',
    mr: '🧬 घटकांचे विश्लेषण करा',
    ta: '🧬 பொருட்களை பகுப்பாய்வு செய்யுங்கள்',
    bn: '🧬 উপাদান বিশ্লেষণ করুন',
    gu: '🧬 ઘટકોનું વિશ્લેષણ કરો',
  },
  downloadPDF: {
    en: 'Download PDF Report',
    hi: 'PDF रिपोर्ट डाउनलोड करें',
    mr: 'PDF अहवाल डाउनलोड करा',
    ta: 'PDF அறிக்கையை பதிவிறக்கவும்',
    bn: 'PDF রিপোর্ট ডাউনলোড করুন',
    gu: 'PDF રિપોર્ટ ડાઉનલોડ કરો',
  },
  scanAnother: {
    en: 'Scan Another Product',
    hi: 'दूसरा उत्पाद स्कैन करें',
    mr: 'दुसरे उत्पादन स्कॅन करा',
    ta: 'மற்றொரு தயாரிப்பை ஸ்கேன் செய்யுங்கள்',
    bn: 'আরেকটি পণ্য স্ক্যান করুন',
    gu: 'બીજું ઉત્પાદ સ્કેન કરો',
  },

  // ── RESULTS ───────────────────────────────────────────────
  healthScore: {
    en: 'Health Score',
    hi: 'स्वास्थ्य स्कोर',
    mr: 'आरोग्य स्कोर',
    ta: 'சுகாதார மதிப்பெண்',
    bn: 'স্বাস্থ্য স্কোর',
    gu: 'સ્વાસ્થ્ય સ્કોર',
  },
  ingredientsBreakdown: {
    en: 'Ingredients Breakdown',
    hi: 'सामग्री विवरण',
    mr: 'घटकांचा तपशील',
    ta: 'பொருட்கள் விவரம்',
    bn: 'উপাদানের বিবরণ',
    gu: 'ઘટકોની વિગત',
  },
  personalizedWarnings: {
    en: '⚠️ Personalized Warnings',
    hi: '⚠️ व्यक्तिगत चेतावनियां',
    mr: '⚠️ वैयक्तिक इशारे',
    ta: '⚠️ தனிப்பட்ட எச்சரிக்கைகள்',
    bn: '⚠️ ব্যক্তিগত সতর্কতা',
    gu: '⚠️ વ્યક்तिगत ચેतावणियां',
  },
  generalAdvice: {
    en: '💡 General Advice',
    hi: '💡 सामान्य सलाह',
    mr: '💡 सामान्य सल्ला',
    ta: '💡 பொது ஆலோசனை',
    bn: '💡 সাধারণ পরামর্শ',
    gu: '💡 સામાન્ય સલાહ',
  },

  // ── CATEGORIES ────────────────────────────────────────────
  safe: {
    en: 'Safe',
    hi: 'सुरक्षित',
    mr: 'सुरक्षित',
    ta: 'பாதுகாப்பான',
    bn: 'নিরাপদ',
    gu: 'સલામત',
  },
  moderate: {
    en: 'Moderate',
    hi: 'मध्यम',
    mr: 'मध्यम',
    ta: 'மிதமான',
    bn: 'মাঝারি',
    gu: 'મધ્યમ',
  },
  harmful: {
    en: 'Harmful',
    hi: 'हानिकारक',
    mr: 'हानिकारक',
    ta: 'தீங்கான',
    bn: 'ক্ষতিকর',
    gu: 'હાનિકારક',
  },
  unknown: {
    en: 'Unknown',
    hi: 'अज्ञात',
    mr: 'अज्ञात',
    ta: 'தெரியாத',
    bn: 'অজানা',
    gu: 'અજ્ઞાત',
  },

  // ── PROFILE SETUP ─────────────────────────────────────────
  setupProfile: {
    en: 'Setup your health profile — only once!',
    hi: 'अपनी स्वास्थ्य प्रोफ़ाइल सेट करें — सिर्फ एक बार!',
    mr: 'तुमची आरोग्य प्रोफाइल सेट करा — फक्त एकदा!',
    ta: 'உங்கள் சுகாதார சுயவிவரத்தை அமைக்கவும் — ஒரே ஒரு முறை!',
    bn: 'আপনার স্বাস্থ্য প্রোফাইল সেট করুন — শুধুমাত্র একবার!',
    gu: 'તમારી સ્વાસ્થ્ય પ્રોફાઇલ સેટ કરો — ફક્ত એક વખત!',
  },
  whatsYourName: {
    en: "👋 What's your name?",
    hi: '👋 आपका नाम क्या है?',
    mr: '👋 तुमचे नाव काय आहे?',
    ta: '👋 உங்கள் பெயர் என்ன?',
    bn: '👋 আপনার নাম কী?',
    gu: '👋 તમારું નામ શું છે?',
  },
  continue: {
    en: 'Continue →',
    hi: 'आगे बढ़ें →',
    mr: 'पुढे जा →',
    ta: 'தொடரவும் →',
    bn: 'চালিয়ে যান →',
    gu: 'આગળ વધો →',
  },
  startScanning: {
    en: '🚀 Start Scanning!',
    hi: '🚀 स्कैनिंग शुरू करें!',
    mr: '🚀 स्कॅनिंग सुरू करा!',
    ta: '🚀 ஸ்கேனிங் தொடங்குங்கள்!',
    bn: '🚀 স্ক্যানিং শুরু করুন!',
    gu: '🚀 સ્કેનિંગ શરૂ કરો!',
  },

  // ── WARNINGS (translated) ──────────────────────────────────
  warningDiabetic: {
    en: 'may raise blood sugar levels',
    hi: 'रक्त शर्करा बढ़ा सकता है',
    mr: 'रक्तातील साखर वाढवू शकतो',
    ta: 'இரத்த சர்க்கரையை அதிகரிக்கலாம்',
    bn: 'রক্তের শর্করা বাড়াতে পারে',
    gu: 'લોહીની શર્કરા વધારી શકે છે',
  },
  warningAllergy: {
    en: 'ALLERGY ALERT',
    hi: 'एलर्जी चेतावनी',
    mr: 'ऍलर्जी इशारा',
    ta: 'ஒவ்வாமை எச்சரிக்கை',
    bn: 'অ্যালার্জি সতর্কতা',
    gu: 'એલર્જી ચેતવણી',
  },
  warningHarmful: {
    en: 'is classified as harmful',
    hi: 'हानिकारक के रूप में वर्गीकृत है',
    mr: 'हानिकारक म्हणून वर्गीकृत आहे',
    ta: 'தீங்கானது என வகைப்படுத்தப்பட்டுள்ளது',
    bn: 'ক্ষতিকর হিসেবে শ্রেণীবদ্ধ',
    gu: 'હાનિકારક તરીકે વર્ગીકૃત છે',
  },

  // ── HISTORY ───────────────────────────────────────────────
  scanHistory: {
    en: '📋 Scan History',
    hi: '📋 स्कैन इतिहास',
    mr: '📋 स्कॅन इतिहास',
    ta: '📋 ஸ்கேன் வரலாறு',
    bn: '📋 স্ক্যান ইতিহাস',
    gu: '📋 સ્કેન ઇતિહાસ',
  },
  noScansYet: {
    en: 'No scans yet',
    hi: 'अभी कोई स्कैन नहीं',
    mr: 'अद्याप कोणतेही स्कॅन नाही',
    ta: 'இன்னும் ஸ்கேன் இல்லை',
    bn: 'এখনো কোনো স্ক্যান নেই',
    gu: 'હજી કોઈ સ્કેન નથી',
  },

  // ── MISC ──────────────────────────────────────────────────
  history: {
    en: '📋 History',
    hi: '📋 इतिहास',
    mr: '📋 इतिहास',
    ta: '📋 வரலாறு',
    bn: '📋 ইতিহাস',
    gu: '📋 ઇતિહાસ',
  },
  extractedText: {
    en: 'Extracted Text:',
    hi: 'निकाला गया टेक्स्ट:',
    mr: 'काढलेला मजकूर:',
    ta: 'பிரித்தெடுக்கப்பட்ட உரை:',
    bn: 'বের করা টেক্সট:',
    gu: 'કાઢેલ ટેક્સ્ટ:',
  },
  savedLocally: {
    en: 'Saved locally • Never shared • Can edit anytime',
    hi: 'स्थानीय रूप से सहेजा • कभी साझा नहीं • कभी भी संपादित करें',
    mr: 'स्थानिक पातळीवर जतन • कधीही शेअर नाही • कधीही संपादित करा',
    ta: 'உள்ளூரில் சேமிக்கப்பட்டது • பகிரப்படவில்லை • எப்போதும் திருத்தலாம்',
    bn: 'স্থানীয়ভাবে সংরক্ষিত • কখনো শেয়ার নয় • যেকোনো সময় সম্পাদনা করুন',
    gu: 'સ્થાનિક રીતે સાચવ્યું • ક્યારેય શેર નહીં • ગમે ત્યારે સંપાદિત કરો',
  },
} as const;

// ── HELPER FUNCTION ───────────────────────────────────────────
export function t(key: keyof typeof T, lang: Language): string {
  return (T[key] as any)[lang] ?? (T[key] as any)['en'];
}

// ── INGREDIENT TRANSLATIONS ───────────────────────────────────
export const INGREDIENT_TRANSLATIONS: Record<string, Record<Language, string>> = {
  sugar: {
    en: 'Sugar', hi: 'चीनी', mr: 'साखर',
    ta: 'சர்க்கரை', bn: 'চিনি', gu: 'ખાંડ'
  },
  salt: {
    en: 'Salt', hi: 'नमक', mr: 'मीठ',
    ta: 'உப்பு', bn: 'লবণ', gu: 'મીઠું'
  },
  water: {
    en: 'Water', hi: 'पानी', mr: 'पाणी',
    ta: 'தண்ணீர்', bn: 'পানি', gu: 'પાણી'
  },
  milk: {
    en: 'Milk', hi: 'दूध', mr: 'दूध',
    ta: 'பால்', bn: 'দুধ', gu: 'દૂધ'
  },
  wheat: {
    en: 'Wheat', hi: 'गेहूं', mr: 'गहू',
    ta: 'கோதுமை', bn: 'গম', gu: 'ઘઉં'
  },
  flour: {
    en: 'Flour', hi: 'आटा', mr: 'पीठ',
    ta: 'மாவு', bn: 'ময়দা', gu: 'લોટ'
  },
  oil: {
    en: 'Oil', hi: 'तेल', mr: 'तेल',
    ta: 'எண்ணெய்', bn: 'তেল', gu: 'તેલ'
  },
  butter: {
    en: 'Butter', hi: 'मक्खन', mr: 'लोणी',
    ta: 'வெண்ணெய்', bn: 'মাখন', gu: 'માખણ'
  },
  rice: {
    en: 'Rice', hi: 'चावल', mr: 'तांदूळ',
    ta: 'அரிசி', bn: 'চাল', gu: 'ચોખા'
  },
  'sodium benzoate': {
    en: 'Sodium Benzoate', hi: 'सोडियम बेंजोएट', mr: 'सोडियम बेंझोएट',
    ta: 'சோடியம் பென்சோயேட்', bn: 'সোডিয়াম বেনজোয়েট', gu: 'સોડિયમ બેન્ઝોએટ'
  },
  aspartame: {
    en: 'Aspartame', hi: 'एस्पार्टेम', mr: 'एस्पार्टेम',
    ta: 'அஸ்பார்டேம்', bn: 'অ্যাসপার্টেম', gu: 'એસ્પાર્ટેમ'
  },
  'high fructose corn syrup': {
    en: 'High Fructose Corn Syrup', hi: 'हाई फ्रुक्टोज कॉर्न सिरप',
    mr: 'हाय फ्रुक्टोज कॉर्न सिरप', ta: 'அதிக பிரக்டோஸ் கார்ன் சிரப்',
    bn: 'হাই ফ্রুকটোজ কর্ন সিরাপ', gu: 'હાઈ ફ્રુક્ટોઝ કોર્ન સિરપ'
  },
  'monosodium glutamate': {
    en: 'Monosodium Glutamate (MSG)', hi: 'मोनोसोडियम ग्लूटामेट (MSG)',
    mr: 'मोनोसोडियम ग्लुटामेट (MSG)', ta: 'மோனோசோடியம் குளுட்டமேட் (MSG)',
    bn: 'মনোসোডিয়াম গ্লুটামেট (MSG)', gu: 'મોનોસોડિયમ ગ્લુટામેટ (MSG)'
  },
};

export function translateIngredient(name: string, lang: Language): string {
  const key = name.toLowerCase().trim();
  return INGREDIENT_TRANSLATIONS[key]?.[lang] ?? name;
}

// ── LANGUAGE STORAGE ──────────────────────────────────────────
const LANG_KEY = 'labellens_language';

export function getSavedLanguage(): Language {
  try {
    return (localStorage.getItem(LANG_KEY) as Language) ?? 'en';
  } catch {
    return 'en';
  }
}

export function saveLanguage(lang: Language): void {
  localStorage.setItem(LANG_KEY, lang);
}