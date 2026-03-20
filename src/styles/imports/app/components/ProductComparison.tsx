import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Upload, History, ChevronRight } from 'lucide-react';
import { getScanHistory, ScanRecord } from './ScanHistory';
import type { FullScanResponse } from '../services/api';
import { toast } from 'sonner';
import { getUserProfile } from './UserProfile';

// ── TYPES ─────────────────────────────────────────────────────
interface ComparisonSlot {
  name: string;
  results: FullScanResponse;
}

// ── SCORE BAR ─────────────────────────────────────────────────
function ScoreBar({ score, color }: { score: number; color: string }) {
  return (
    <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 1, ease: 'easeOut' }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

// ── WINNER BADGE ──────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 80) return '#00E676';
  if (score >= 60) return '#00E5FF';
  if (score >= 40) return '#FFB800';
  return '#FF3D5A';
}

function declareWinner(a: ComparisonSlot, b: ComparisonSlot): {
  winner: 'a' | 'b' | 'tie';
  reason: string;
} {
  const scoreA = a.results.health_score.normalised;
  const scoreB = b.results.health_score.normalised;
  const harmfulA = a.results.counts.harmful;
  const harmfulB = b.results.counts.harmful;

  if (scoreA === scoreB && harmfulA === harmfulB) {
    return { winner: 'tie', reason: 'Both products are equally healthy!' };
  }

  // Score comparison
  if (scoreA > scoreB) {
    const diff = scoreA - scoreB;
    return {
      winner: 'a',
      reason: `${a.name} scores ${diff} points higher (${scoreA} vs ${scoreB})`,
    };
  } else if (scoreB > scoreA) {
    const diff = scoreB - scoreA;
    return {
      winner: 'b',
      reason: `${b.name} scores ${diff} points higher (${scoreB} vs ${scoreA})`,
    };
  }

  // Tiebreaker: harmful ingredients
  if (harmfulA < harmfulB) {
    return {
      winner: 'a',
      reason: `${a.name} has fewer harmful ingredients (${harmfulA} vs ${harmfulB})`,
    };
  } else {
    return {
      winner: 'b',
      reason: `${b.name} has fewer harmful ingredients (${harmfulB} vs ${harmfulA})`,
    };
  }
}

// ── SCAN SLOT ─────────────────────────────────────────────────
function ScanSlot({
  slot,
  label,
  onScanNew,
  onSelectHistory,
}: {
  slot: ComparisonSlot | null;
  label: string;
  onScanNew: () => void;
  onSelectHistory: (record: ScanRecord) => void;
}) {
  const [showHistory, setShowHistory] = useState(false);
  const history = getScanHistory();

  if (slot) {
    const score = slot.results.health_score.normalised;
    const scoreColor = getScoreColor(score);

    return (
      <div className="glass-card rounded-2xl p-6 border border-white/10 relative">
        <div className="gradient-border-top" />
        <p className="text-[#8B95A8] font-mono text-xs uppercase tracking-wider mb-3">
          {label}
        </p>
        <h3 className="text-white font-display font-bold text-lg mb-4 truncate">
          {slot.name}
        </h3>

        {/* Score */}
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-16 h-16 rounded-2xl flex flex-col items-center justify-center border"
            style={{
              background: `${scoreColor}15`,
              borderColor: `${scoreColor}40`,
            }}
          >
            <span className="text-2xl font-display font-bold" style={{ color: scoreColor }}>
              {slot.results.health_score.grade}
            </span>
            <span className="text-xs font-mono" style={{ color: scoreColor }}>
              {score}
            </span>
          </div>
          <div className="flex-1">
            <p className="text-white font-mono text-sm mb-2">
              {slot.results.health_score.verdict}
            </p>
            <ScoreBar score={score} color={scoreColor} />
          </div>
        </div>

        {/* Counts */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'Safe',     count: slot.results.counts.safe,     color: '#00E676' },
            { label: 'Moderate', count: slot.results.counts.moderate, color: '#FFB800' },
            { label: 'Harmful',  count: slot.results.counts.harmful,  color: '#FF3D5A' },
          ].map(({ label, count, color }) => (
            <div
              key={label}
              className="text-center py-2 rounded-xl"
              style={{ background: `${color}10`, border: `1px solid ${color}30` }}
            >
              <div className="font-display font-bold text-xl" style={{ color }}>{count}</div>
              <div className="font-mono text-xs text-[#8B95A8]">{label}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty slot
  return (
    <div className="glass-card rounded-2xl p-6 border border-white/10 relative">
      <div className="gradient-border-top" />
      <p className="text-[#8B95A8] font-mono text-xs uppercase tracking-wider mb-4">
        {label}
      </p>

      <div className="space-y-3">
        {/* Scan New */}
        <button
          onClick={onScanNew}
          className="w-full py-4 rounded-xl border-2 border-dashed border-[#AAFF45]/30 text-[#AAFF45] font-mono text-sm hover:border-[#AAFF45] hover:bg-[#AAFF45]/5 transition-all flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Scan New Product
        </button>

        {/* From History */}
        {history.length > 0 && (
          <>
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="w-full py-4 rounded-xl border-2 border-[#00E5FF]/30 text-[#00E5FF] font-mono text-sm hover:border-[#00E5FF] hover:bg-[#00E5FF]/5 transition-all flex items-center justify-center gap-2"
            >
              <History className="w-4 h-4" />
              Choose from History ({history.length})
            </button>

            {/* History dropdown */}
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-2 overflow-hidden"
                >
                  {history.map((record) => (
                    <button
                      key={record.id}
                      onClick={() => {
                        onSelectHistory(record);
                        setShowHistory(false);
                      }}
                      className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:border-[#00E5FF]/50 transition-all"
                    >
                      <div className="text-left">
                        <p className="text-white font-mono text-sm truncate max-w-[160px]">
                          {record.product_name}
                        </p>
                        <p className="text-[#8B95A8] font-mono text-xs">
                          {record.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="font-display font-bold text-lg"
                          style={{ color: getScoreColor(record.results.health_score.normalised) }}
                        >
                          {record.results.health_score.grade}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#8B95A8]" />
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </div>
  );
}

// ── COMPARISON TABLE ──────────────────────────────────────────
function ComparisonTable({
  slotA,
  slotB,
}: {
  slotA: ComparisonSlot;
  slotB: ComparisonSlot;
}) {
  const winner = declareWinner(slotA, slotB);

  const rows = [
    {
      label: 'Health Score',
      a: slotA.results.health_score.normalised,
      b: slotB.results.health_score.normalised,
      higher: 'better' as const,
      format: (v: number) => `${v}/100`,
    },
    {
      label: 'Grade',
      a: slotA.results.health_score.grade,
      b: slotB.results.health_score.grade,
      higher: null,
      format: (v: any) => v,
    },
    {
      label: 'Safe Ingredients',
      a: slotA.results.counts.safe,
      b: slotB.results.counts.safe,
      higher: 'better' as const,
      format: (v: number) => v,
    },
    {
      label: 'Moderate',
      a: slotA.results.counts.moderate,
      b: slotB.results.counts.moderate,
      higher: 'worse' as const,
      format: (v: number) => v,
    },
    {
      label: 'Harmful',
      a: slotA.results.counts.harmful,
      b: slotB.results.counts.harmful,
      higher: 'worse' as const,
      format: (v: number) => v,
    },
    {
      label: 'Total Warnings',
      a: slotA.results.personalisation.total_warnings,
      b: slotB.results.personalisation.total_warnings,
      higher: 'worse' as const,
      format: (v: number) => v,
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      {/* Winner Banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="glass-card rounded-2xl p-6 border-2 relative overflow-hidden"
        style={{
          borderColor: winner.winner === 'tie' ? '#00E5FF40' : '#AAFF4540',
          background: winner.winner === 'tie'
            ? 'rgba(0,229,255,0.05)'
            : 'rgba(170,255,69,0.05)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="text-4xl">
            {winner.winner === 'tie' ? '🤝' : '🏆'}
          </div>
          <div>
            <p className="text-[#8B95A8] font-mono text-xs uppercase tracking-wider mb-1">
              {winner.winner === 'tie' ? 'Result' : 'Healthier Choice'}
            </p>
            <p className="text-white font-display font-bold text-xl">
              {winner.winner === 'tie'
                ? "It's a Tie!"
                : winner.winner === 'a'
                ? slotA.name
                : slotB.name
              }
            </p>
            <p className="text-[#8B95A8] font-mono text-sm mt-1">
              {winner.reason}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Comparison Table */}
      <div className="glass-card rounded-2xl border border-white/10 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-3 gap-0 border-b border-white/10">
          <div className="p-4 text-[#8B95A8] font-mono text-xs uppercase tracking-wider">
            Metric
          </div>
          <div className="p-4 text-center border-l border-white/10">
            <p className="text-[#AAFF45] font-display font-bold text-sm truncate">
              {slotA.name}
            </p>
          </div>
          <div className="p-4 text-center border-l border-white/10">
            <p className="text-[#00E5FF] font-display font-bold text-sm truncate">
              {slotB.name}
            </p>
          </div>
        </div>

        {/* Rows */}
        {rows.map(({ label, a, b, higher, format }, index) => {
          let colorA = 'text-white';
          let colorB = 'text-white';

          if (higher === 'better' && typeof a === 'number' && typeof b === 'number') {
            if (a > b) { colorA = 'text-[#00E676]'; colorB = 'text-[#FF3D5A]'; }
            else if (b > a) { colorB = 'text-[#00E676]'; colorA = 'text-[#FF3D5A]'; }
          } else if (higher === 'worse' && typeof a === 'number' && typeof b === 'number') {
            if (a > b) { colorA = 'text-[#FF3D5A]'; colorB = 'text-[#00E676]'; }
            else if (b > a) { colorB = 'text-[#FF3D5A]'; colorA = 'text-[#00E676]'; }
          }

          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.08 }}
              className="grid grid-cols-3 border-b border-white/5 hover:bg-white/[0.02] transition-all"
            >
              <div className="p-4 text-[#8B95A8] font-mono text-sm">{label}</div>
              <div className={`p-4 text-center border-l border-white/5 font-display font-bold ${colorA}`}>
                {format(a as any)}
              </div>
              <div className={`p-4 text-center border-l border-white/5 font-display font-bold ${colorB}`}>
                {format(b as any)}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Warnings Comparison */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { slot: slotA, color: '#AAFF45', label: slotA.name },
          { slot: slotB, color: '#00E5FF', label: slotB.name },
        ].map(({ slot, color, label }) => {
          const p = slot.results.personalisation;
          const allW = [
            ...(p.allergy_warnings || []),
            ...(p.diabetic_warnings || []),
            ...(p.harmful_warnings || []).slice(0, 2),
            ...(p.age_warnings || []),
            ...(p.diet_warnings || []),
            ...(p.medical_warnings || []),
          ];

          return (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="glass-card rounded-2xl p-5 border border-white/10"
              style={{ borderTop: `3px solid ${color}` }}
            >
              <p className="font-display font-bold text-sm mb-3 truncate"
                style={{ color }}>
                {label}
              </p>
              {allW.length === 0 ? (
                <p className="text-[#00E676] font-mono text-xs">
                  ✅ No warnings!
                </p>
              ) : (
                <div className="space-y-2">
                  {allW.slice(0, 3).map((w, i) => (
                    <p key={i} className="text-[#8B95A8] font-mono text-xs leading-relaxed">
                      {w}
                    </p>
                  ))}
                  {allW.length > 3 && (
                    <p className="text-[#8B95A8] font-mono text-xs">
                      +{allW.length - 3} more warnings...
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────
interface ProductComparisonProps {
  onClose: () => void;
  onScanNew: (slotCallback: (results: FullScanResponse, name: string) => void) => void;
  currentScan?: FullScanResponse | null;
}

export function ProductComparison({
  onClose,
  onScanNew,
  currentScan,
}: ProductComparisonProps) {
  const [slotA, setSlotA] = useState<ComparisonSlot | null>(
    currentScan
      ? { name: 'Product A', results: currentScan }
      : null
  );
  const [slotB, setSlotB] = useState<ComparisonSlot | null>(null);

  const handleSelectHistory = (slot: 'a' | 'b', record: ScanRecord) => {
    const data = { name: record.product_name, results: record.results };
    if (slot === 'a') setSlotA(data);
    else setSlotB(data);
  };

  const handleScanNew = (slot: 'a' | 'b') => {
    onScanNew((results, name) => {
      const data = { name, results };
      if (slot === 'a') setSlotA(data);
      else setSlotB(data);
    });
    onClose();
    toast.info('Scan your product — results will be added to comparison!');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-40 flex items-start justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(8,11,20,0.92)', backdropFilter: 'blur(16px)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        className="glass-card rounded-3xl p-8 border border-white/10 w-full max-w-3xl my-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="gradient-border-top" />

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-display font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#AAFF45]" />
              Product Comparison
            </h2>
            <p className="text-[#8B95A8] font-mono text-sm mt-1">
              Compare 2 products — find the healthier choice
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 text-[#8B95A8] hover:border-white/30 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Slots */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <ScanSlot
            slot={slotA}
            label="Product A"
            onScanNew={() => handleScanNew('a')}
            onSelectHistory={(r) => handleSelectHistory('a', r)}
          />
          <ScanSlot
            slot={slotB}
            label="Product B"
            onScanNew={() => handleScanNew('b')}
            onSelectHistory={(r) => handleSelectHistory('b', r)}
          />
        </div>

        {/* VS divider */}
        {(!slotA || !slotB) && (
          <div className="flex items-center gap-4 mb-8">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[#8B95A8] font-display font-bold text-lg">VS</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
        )}

        {/* Comparison Results */}
        {slotA && slotB && (
          <ComparisonTable slotA={slotA} slotB={slotB} />
        )}

        {/* Reset */}
        {(slotA || slotB) && (
          <button
            onClick={() => { setSlotA(null); setSlotB(null); }}
            className="mt-6 w-full py-3 rounded-xl border border-white/10 text-[#8B95A8] font-mono text-sm hover:border-white/30 transition-all"
          >
            Reset Comparison
          </button>
        )}
      </motion.div>
    </motion.div>
  );
}