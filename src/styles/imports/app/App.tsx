import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

import { ImageUploader } from './components/ImageUploader';
import { ResultsPanel } from './components/ResultsPanel';
import { BarcodeScanner } from './components/BarcodeScanner';
import { UserProfile, getUserProfile, clearUserProfile } from './components/UserProfile';
import { Button } from './components/ui/button';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { ScanHistory, saveScan } from './components/ScanHistory';
import { VoiceAssistant } from './components/VoiceAssistant';
import { ProductComparison } from './components/ProductComparison';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { ThemeToggle, applyTheme, getTheme } from './components/ThemeToggle';
import { t, getSavedLanguage, saveLanguage } from './translations';
import type { Language } from './translations';
import type { FullScanResponse } from './services/api';
import { RefreshCw, Loader2, Settings, LogOut } from 'lucide-react';


function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [scanMode, setScanMode] = useState<'label' | 'barcode'>('label');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [isDiabetic, setIsDiabetic] = useState(false);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<FullScanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [profileReady, setProfileReady] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [userName, setUserName] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showComparison, setShowComparison] = useState(false);
  const [lang, setLang] = useState<Language>(getSavedLanguage());
  type ComparisonCb = (results: FullScanResponse, name: string) => void;
  const [comparisonCallback, setComparisonCallback] = useState<ComparisonCb | null>(null);

  // ── Apply saved theme on mount ────────────────────────────
  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  // ── App load hone pe profile check karo ──────────────────
  useEffect(() => {
    const profile = getUserProfile();
    if (profile.isSetup) {
      setIsDiabetic(profile.isDiabetic);
      setAllergies(profile.allergies);
      setUserName(profile.name);
      setProfileReady(true);
    } else {
      setShowProfileSetup(true);
    }
  }, []);

  // ── Profile setup complete ────────────────────────────────
  const handleProfileComplete = (profile: any) => {
    setIsDiabetic(profile.isDiabetic);
    setAllergies(profile.allergies);
    setUserName(profile.name);
    setProfileReady(true);
    setShowProfileSetup(false);
    toast.success(`Welcome, ${profile.name}! 🎉`, {
      description: 'Your health profile has been saved.'
    });
  };

  // ── Profile reset ─────────────────────────────────────────
  const handleLogout = () => {
  clearUserProfile();
  setProfileReady(false);
  setShowProfileSetup(true);
  setCurrentStep(1);
  setAnalysisResult(null);
  setExtractedText('');
  setUserName('');
  setIsDiabetic(false);
  setAllergies([]);
};


  // ── Extract complete ──────────────────────────────────────
  const handleExtractComplete = (text: string, fallback: boolean) => {
    setExtractedText(text);
    setUsedFallback(fallback);
    setCurrentStep(2);
    if (fallback) {
      toast.warning('Using demo mode - Backend unavailable', {
        description: 'Connect your FastAPI backend for live analysis'
      });
    }
  };

  // ── Analyse ───────────────────────────────────────────────
  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const { apiService } = await import('./services/api');
      const profile = getUserProfile();
      const result = await apiService.fullScan(
        extractedText,
        isDiabetic,
        allergies,
        profile.age || 'adult',
        profile.dietType || 'none',
        profile.medicalConditions || [],
      );
      setAnalysisResult(result);
      saveScan(result, 'Food Product');

      if (comparisonCallback) {
        comparisonCallback(result, 'Food Product');
        setComparisonCallback(null);
        toast.success('Product added to comparison!');
      }

      setCurrentStep(3);
    } catch (error) {
      console.error('Analysis failed:', error);
      toast.error('Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────
  const handleReset = () => {
    setCurrentStep(1);
    setScanMode('label');
    setSelectedFile(null);
    setExtractedText('');
    setAnalysisResult(null);
    setUsedFallback(false);
  };

  // ── Language change ───────────────────────────────────────
  const handleLanguageChange = (newLang: Language) => {
    setLang(newLang);
    saveLanguage(newLang);
  };

  // ── Profile Setup Screen ──────────────────────────────────
  if (showProfileSetup) {
    return <UserProfile onComplete={handleProfileComplete} />;
  }

  // ── Main App ──────────────────────────────────────────────
  return (
    <div className="min-h-screen animated-bg">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            color: '#FFFFFF',
            fontFamily: 'JetBrains Mono, monospace',
          },
        }}
      />

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(8, 11, 20, 0.9)', backdropFilter: 'blur(12px)' }}
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="w-20 h-20 rounded-full border-4 border-white/10 border-t-[#AAFF45] mb-6 mx-auto"
                style={{ boxShadow: '0 0 24px rgba(170, 255, 69, 0.4)' }}
              />
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-white font-display text-xl font-bold"
              >
                {t('analyseIngredients', lang)}...
              </motion.p>
              <p className="text-[#8B95A8] font-mono text-sm mt-2">
                This will only take a moment
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── HEADER ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="border-b border-white/5 backdrop-blur-xl bg-white/[0.02] sticky top-0 z-30"
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-3">

            {/* Logo */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <motion.div
                animate={{
                  filter: [
                    'drop-shadow(0 0 8px rgba(170, 255, 69, 0.6))',
                    'drop-shadow(0 0 16px rgba(170, 255, 69, 0.9))',
                    'drop-shadow(0 0 8px rgba(170, 255, 69, 0.6))'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-[#AAFF45] text-3xl"
              >
                ⬡
              </motion.div>
              <div>
                <h1 className="text-2xl font-display font-bold text-white">
                  {t('appName', lang)}
                </h1>
                <p className="text-xs text-[#8B95A8] font-mono hidden sm:block">
                  {userName ? `Hey ${userName} 👋` : t('tagline', lang)}
                </p>
              </div>
            </div>

            {/* Right side buttons */}
            <div className="flex items-center gap-2 flex-wrap justify-end">

              {/* Health badges — desktop only */}
              <div className="hidden lg:flex items-center gap-2">
                {isDiabetic && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono border border-[#FFB800]/30 bg-[#FFB800]/10 text-[#FFB800]">
                    🩺 Diabetic
                  </span>
                )}
                {allergies.length > 0 && (
                  <span className="px-3 py-1 rounded-full text-xs font-mono border border-[#00E5FF]/30 bg-[#00E5FF]/10 text-[#00E5FF]">
                    🚨 {allergies.length} Allerg{allergies.length > 1 ? 'ies' : 'y'}
                  </span>
                )}
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Language Switcher */}
              <LanguageSwitcher
                currentLang={lang}
                onChange={handleLanguageChange}
              />

              {/* History Button */}
              <button
                onClick={() => setShowHistory(true)}
                title="Scan History"
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#AAFF45]/30 bg-[#AAFF45]/5 text-[#AAFF45] hover:bg-[#AAFF45]/15 hover:border-[#AAFF45] transition-all font-mono text-sm font-bold"
              >
                {t('history', lang)}
              </button>

              {/* Voice Assistant Button */}
              <button
                onClick={() => setShowVoice(true)}
                title="Voice Assistant"
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#00E5FF]/30 bg-[#00E5FF]/5 text-[#00E5FF] hover:bg-[#00E5FF]/15 hover:border-[#00E5FF] transition-all font-mono text-sm font-bold"
              >
                🎤 <span className="hidden sm:inline">Voice</span>
              </button>

              {/* Compare Button */}
              <button
                onClick={() => setShowComparison(true)}
                title="Compare Products"
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#FFB800]/30 bg-[#FFB800]/5 text-[#FFB800] hover:bg-[#FFB800]/15 hover:border-[#FFB800] transition-all font-mono text-sm font-bold"
              >
                ⚖️ <span className="hidden sm:inline">Compare</span>
              </button>

              {/* Settings button */}
              <button
              onClick={handleLogout}
              title="Logout"
              className="flex items-center gap-1 px-3 py-2 rounded-xl border border-[#FF3D5A]/30 bg-[#FF3D5A]/5 text-[#FF3D5A] hover:bg-[#FF3D5A]/15 hover:border-[#FF3D5A] transition-all font-mono text-sm"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

              {/* Scan Another — only on step 3 */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    className="border-2 border-white/20 text-white hover:border-[#AAFF45] hover:text-[#AAFF45] hover:bg-[#AAFF45]/5 font-display font-bold transition-all duration-200 bg-transparent text-sm"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">{t('scanAnother', lang)}</span>
                    <span className="sm:hidden">Rescan</span>
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
        <div className="h-px bg-gradient-to-r from-transparent via-[#AAFF45]/30 to-transparent" />
      </motion.div>

      {/* ── MAIN CONTENT ── */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">

          {/* ── STEP 1 ── */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm"
                >
                  <span className="text-[#AAFF45] font-display font-bold text-lg">01</span>
                  <span className="text-white font-mono text-sm font-semibold">
                    {t('step1', lang)}
                  </span>
                </motion.div>
              </div>

              {/* Mode Toggle */}
              <div className="flex gap-3 mb-6">
                <button
                  onClick={() => setScanMode('label')}
                  className={`flex-1 py-4 rounded-2xl font-display font-bold text-lg border-2 transition-all duration-200
                    ${scanMode === 'label'
                      ? 'bg-[#AAFF45]/10 border-[#AAFF45] text-[#AAFF45]'
                      : 'bg-white/5 border-white/10 text-[#8B95A8] hover:border-white/20'
                    }`}
                >
                  {t('scanLabel', lang)}
                </button>
                <button
                  onClick={() => setScanMode('barcode')}
                  className={`flex-1 py-4 rounded-2xl font-display font-bold text-lg border-2 transition-all duration-200
                    ${scanMode === 'barcode'
                      ? 'bg-[#AAFF45]/10 border-[#AAFF45] text-[#AAFF45]'
                      : 'bg-white/5 border-white/10 text-[#8B95A8] hover:border-white/20'
                    }`}
                >
                  {t('scanBarcode', lang)}
                </button>
              </div>

              <div className="glass-card rounded-3xl p-8 border border-white/10 relative">
                <div className="gradient-border-top" />
                <AnimatePresence mode="wait">
                  {scanMode === 'label' ? (
                    <motion.div
                      key="label"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ImageUploader
                        onExtractComplete={handleExtractComplete}
                        onFileSelect={setSelectedFile}
                        selectedFile={selectedFile}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="barcode"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                    >
                      <BarcodeScanner
                        onIngredientsFound={(text, productName) => {
                          toast.success(`Found: ${productName}`);
                          handleExtractComplete(`INGREDIENTS: ${text}`, false);
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2 ── */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm"
                >
                  <span className="text-[#AAFF45] font-display font-bold text-lg">02</span>
                  <span className="text-white font-mono text-sm font-semibold">
                    {t('step2', lang)}
                  </span>
                </motion.div>
              </div>

              {/* Profile summary card */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 glass-card rounded-2xl p-5 border border-white/10 flex items-center justify-between"
              >
                <div>
                  <p className="text-white font-display font-bold text-sm mb-1">
                    ✅ Using your saved health profile
                  </p>
                  <p className="text-[#8B95A8] font-mono text-xs">
                    {isDiabetic ? '🩺 Diabetic · ' : ''}
                    {allergies.length > 0
                      ? `🚨 ${allergies.join(', ')} allergies`
                      : 'No allergies set'}
                  </p>
                </div>
                <button
                  onClick={handleResetProfile}
                  className="text-[#8B95A8] font-mono text-xs hover:text-[#AAFF45] transition-all underline"
                >
                  Edit Profile
                </button>
              </motion.div>

              {usedFallback && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 glass-card rounded-2xl p-5 border-2 border-[#FFB800]/30 bg-[#FFB800]/5"
                >
                  <p className="text-[#FFB800] font-mono text-sm">
                    ⚠️ Demo Mode Active — Backend service unavailable. Using sample data.
                  </p>
                </motion.div>
              )}

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-card rounded-3xl p-8 border border-white/10 mb-8 relative"
              >
                <div className="gradient-border-top" />
                <div className="mb-6">
                  <label className="block text-[#8B95A8] font-mono text-sm mb-3 font-semibold">
                    {t('extractedText', lang)}
                  </label>
                  <textarea
                    value={extractedText}
                    onChange={(e) => setExtractedText(e.target.value)}
                    className="w-full bg-white/5 text-white border-2 border-white/10 rounded-2xl p-6 font-mono text-sm min-h-[140px] focus:outline-none focus:border-[#AAFF45]/50 focus:bg-white/[0.07] transition-all duration-200 backdrop-blur-sm resize-none"
                    placeholder="Extracted ingredients will appear here..."
                    style={{ boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.3)' }}
                  />
                  <div className="text-right mt-2">
                    <span className="text-[#8B95A8] font-mono text-xs">
                      {extractedText.length} characters
                    </span>
                  </div>
                </div>
              </motion.div>

              <Button
                onClick={handleAnalyze}
                disabled={loading || !extractedText}
                size="lg"
                className="w-full bg-[#AAFF45] hover:bg-[#AAFF45] text-[#080B14] font-display font-bold rounded-xl shadow-lg disabled:opacity-30 disabled:cursor-not-allowed btn-glow text-lg py-7 relative overflow-hidden"
              >
                {loading ? (
                  <>
                    <div className="absolute inset-0 shimmer"></div>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin relative z-10" />
                    <span className="relative z-10">{t('analyseIngredients', lang)}...</span>
                  </>
                ) : (
                  t('analyseIngredients', lang)
                )}
              </Button>
            </motion.div>
          )}

          {/* ── STEP 3 ── */}
          {currentStep === 3 && analysisResult && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4 }}
            >
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] backdrop-blur-sm"
                >
                  <span className="text-[#AAFF45] font-display font-bold text-lg">03</span>
                  <span className="text-white font-mono text-sm font-semibold">
                    {t('step3', lang)}
                  </span>
                </motion.div>
              </div>

              <div className="glass-card rounded-3xl p-8 border border-white/10 relative">
                <div className="gradient-border-top" />
                <ResultsPanel results={analysisResult} lang={lang} />
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── MODALS ── */}

      <AnimatePresence>
        {showHistory && (
          <ScanHistory onClose={() => setShowHistory(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showVoice && (
          <VoiceAssistant
            onClose={() => setShowVoice(false)}
            analysisResult={analysisResult}
            onBarcodeDetected={(barcode) => {
              setShowVoice(false);
              setScanMode('barcode');
              setCurrentStep(1);
              import('./services/api').then(({ apiService }) => {
                apiService.lookupBarcode(barcode).then((result) => {
                  if (result.success && result.ingredients_text) {
                    toast.success(`Found: ${result.product_name}`);
                    handleExtractComplete(`INGREDIENTS: ${result.ingredients_text}`, false);
                  } else {
                    toast.error('Product not found. Try manual entry.');
                  }
                });
              });
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComparison && (
          <ProductComparison
            onClose={() => setShowComparison(false)}
            currentScan={analysisResult}
            onScanNew={(callback) => {
              setComparisonCallback(() => callback);
              setShowComparison(false);
              handleReset();
              toast.info('Scan your second product!');
            }}
          />
        )}
      </AnimatePresence>

      {/* ── FOOTER ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="border-t border-white/5 mt-16 backdrop-blur-xl bg-white/[0.01]"
      >
        <div className="max-w-6xl mx-auto px-6 py-6 text-center">
          <p className="text-[#8B95A8] font-mono text-sm">
            Powered by AI • FastAPI Backend • Built with React + Tailwind
          </p>
        </div>
      </motion.div>
    </div>
  );
}

export default App;
