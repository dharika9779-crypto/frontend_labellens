import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ScoreRing } from './ScoreRing';
import { IngredientChip } from './IngredientChip';
import { WarningCard } from './WarningCard';
import type { FullScanResponse } from '../services/api';
import { CheckCircle2, AlertTriangle, XCircle, HelpCircle, Download, Loader2 } from 'lucide-react';
import { getUserProfile } from './UserProfile';
import { toast } from 'sonner';
import { t, translateIngredient } from '../translations';
import type { Language } from '../translations';

interface ResultsPanelProps {
  results: FullScanResponse;
  lang?: Language;
}

function CountCard({
  label, count, color, icon: Icon, delay
}: {
  label: string; count: number; color: string; icon: any; delay: number;
}) {
  const [displayCount, setDisplayCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = count / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= count) {
        setDisplayCount(count);
        clearInterval(timer);
      } else {
        setDisplayCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [count]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: color }} />
      <div className="flex items-center gap-3 mb-3">
        <Icon className="w-5 h-5" style={{ color }} />
        <div className="text-[#8B95A8] font-mono text-sm font-semibold uppercase tracking-wide">
          {label}
        </div>
      </div>
      <div className="text-4xl font-display font-bold text-white">{displayCount}</div>
    </motion.div>
  );
}

export function ResultsPanel({ results, lang = 'en' }: ResultsPanelProps) {
  const { health_score, counts, classified, personalisation } = results;
  const [pdfLoading, setPdfLoading] = useState(false);

  const allWarnings = [
    ...personalisation.allergy_warnings.map(w => ({ type: 'allergy' as const, message: w })),
    ...personalisation.diabetic_warnings.map(w => ({ type: 'diabetic' as const, message: w })),
    ...(personalisation.age_warnings || []).map(w => ({ type: 'diabetic' as const, message: w })),
    ...(personalisation.diet_warnings || []).map(w => ({ type: 'allergy' as const, message: w })),
    ...(personalisation.medical_warnings || []).map(w => ({ type: 'harmful' as const, message: w })),
    ...personalisation.harmful_warnings.map(w => ({ type: 'harmful' as const, message: w })),
  ];

  // ── PDF Download ───────────────────────────────────────────
  const handleDownloadPDF = async () => {
    setPdfLoading(true);
    try {
      const { apiService } = await import('../services/api');
      const profile = getUserProfile();
      await apiService.generatePDF(
        results,
        'Food Product',
        profile.name || ''
      );
      toast.success('PDF downloaded! 📄');
    } catch (error) {
      console.error('PDF failed:', error);
      toast.error('PDF generation failed. Try again.');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Score Ring */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center py-8"
      >
        <ScoreRing score={health_score.normalised} grade={health_score.grade} />
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-4 text-lg text-[#8B95A8] font-mono"
        >
          {health_score.verdict}
        </motion.p>
      </motion.div>

      {/* Count Chips — translated labels */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <CountCard label={t('safe', lang)}     count={counts.safe}     color="#00E676" icon={CheckCircle2} delay={1.3} />
        <CountCard label={t('moderate', lang)} count={counts.moderate} color="#FFB800" icon={AlertTriangle} delay={1.4} />
        <CountCard label={t('harmful', lang)}  count={counts.harmful}  color="#FF3D5A" icon={XCircle}      delay={1.5} />
        <CountCard label={t('unknown', lang)}  count={counts.unknown}  color="#8B95A8" icon={HelpCircle}   delay={1.6} />
      </div>

      {/* Ingredient Chips — translated names */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.5 }}
        className="glass-card rounded-2xl p-8 border border-white/10 relative"
      >
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#AAFF45] to-[#00E5FF] rounded-t-2xl" />
        <h3 className="text-white font-display font-bold text-2xl mb-6">
          {t('ingredientsBreakdown', lang)}
        </h3>
        <div className="flex flex-wrap gap-3">
          {classified.map((ingredient, index) => (
            <IngredientChip
              key={index}
              name={translateIngredient(ingredient.name, lang)}
              category={ingredient.category}
              index={index}
            />
          ))}
        </div>
      </motion.div>

      {/* Personalized Warnings */}
      {allWarnings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.5 }}
          className="glass-card rounded-2xl p-8 border border-white/10 relative"
        >
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#FF3D5A] to-[#FFB800] rounded-t-2xl" />
          <h3 className="text-white font-display font-bold text-2xl mb-6 flex items-center gap-2">
            <span>⚠️</span> {t('personalizedWarnings', lang)}
          </h3>
          <div className="space-y-4">
            {allWarnings.map((warning, index) => (
              <WarningCard
                key={index}
                type={warning.type}
                message={warning.message}
                index={index}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* General Advice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.2, duration: 0.5 }}
        className="relative rounded-2xl p-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(0, 229, 255, 0.1) 0%, rgba(170, 255, 69, 0.1) 100%)',
          border: '2px solid',
          borderImage: 'linear-gradient(135deg, #00E5FF, #AAFF45) 1',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/5 to-[#AAFF45]/5" />
        <div className="relative">
          <h3 className="text-[#00E5FF] font-display font-bold text-xl mb-3 flex items-center gap-2">
            <span>💡</span> {t('generalAdvice', lang)}
          </h3>
          <p className="text-white font-mono text-sm leading-relaxed">
            {personalisation.general_advice}
          </p>
        </div>
      </motion.div>

      {/* PDF Download Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.4, duration: 0.5 }}
      >
        <button
          onClick={handleDownloadPDF}
          disabled={pdfLoading}
          className="w-full py-5 rounded-2xl font-display font-bold text-lg border-2 border-[#AAFF45]/50 text-[#AAFF45] bg-[#AAFF45]/5 hover:bg-[#AAFF45]/10 hover:border-[#AAFF45] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          style={{ boxShadow: pdfLoading ? 'none' : '0 0 20px rgba(170,255,69,0.1)' }}
        >
          {pdfLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <Download className="w-5 h-5" />
              {t('downloadPDF', lang)}
            </>
          )}
        </button>
      </motion.div>

    </motion.div>
  );
}
