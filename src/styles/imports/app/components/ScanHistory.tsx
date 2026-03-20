import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, ChevronRight, Clock, X } from 'lucide-react';
import type { FullScanResponse } from '../services/api';

// ── TYPES ─────────────────────────────────────────────────────
export interface ScanRecord {
  id: string;
  date: string;
  product_name: string;
  results: FullScanResponse;
}

const STORAGE_KEY = 'labellens_scan_history';
const MAX_HISTORY = 20;

// ── STORAGE HELPERS ───────────────────────────────────────────
export function getScanHistory(): ScanRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

export function saveScan(results: FullScanResponse, productName: string = 'Food Product'): void {
  try {
    const history = getScanHistory();
    const newRecord: ScanRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('en-IN', {
        day: '2-digit', month: 'short', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      }),
      product_name: productName,
      results,
    };

    // Naya scan pehle add karo
    history.unshift(newRecord);

    // Max 20 scans rakhो
    if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Save scan failed:', e);
  }
}

export function deleteScan(id: string): void {
  try {
    const history = getScanHistory().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {}
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── SCORE COLOR ───────────────────────────────────────────────
function getScoreColor(score: number): string {
  if (score >= 80) return '#00E676';
  if (score >= 60) return '#00E5FF';
  if (score >= 40) return '#FFB800';
  return '#FF3D5A';
}

// ── DETAIL MODAL ──────────────────────────────────────────────
function ScanDetailModal({
  record,
  onClose
}: {
  record: ScanRecord;
  onClose: () => void;
}) {
  const { results } = record;
  const scoreColor = getScoreColor(results.health_score.normalised);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,20,0.9)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card rounded-3xl p-8 border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="gradient-border-top" />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-display font-bold text-white">
              {record.product_name}
            </h2>
            <p className="text-[#8B95A8] font-mono text-sm mt-1">
              🕐 {record.date}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-white/10 text-[#8B95A8] hover:border-[#FF3D5A] hover:text-[#FF3D5A] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Score */}
        <div className="flex items-center gap-6 mb-6 glass-card rounded-2xl p-5 border border-white/10">
          <div className="text-center">
            <div
              className="text-5xl font-display font-bold"
              style={{ color: scoreColor }}
            >
              {results.health_score.normalised}
            </div>
            <div className="text-[#8B95A8] font-mono text-xs mt-1">SCORE</div>
          </div>
          <div className="text-center">
            <div
              className="text-5xl font-display font-bold"
              style={{ color: scoreColor }}
            >
              {results.health_score.grade}
            </div>
            <div className="text-[#8B95A8] font-mono text-xs mt-1">GRADE</div>
          </div>
          <div className="flex-1">
            <p className="text-white font-mono text-sm">
              {results.health_score.verdict}
            </p>
            <div className="flex gap-3 mt-3">
              <span className="text-[#00E676] font-mono text-xs">
                ✅ {results.counts.safe} Safe
              </span>
              <span className="text-[#FFB800] font-mono text-xs">
                ⚠️ {results.counts.moderate} Moderate
              </span>
              <span className="text-[#FF3D5A] font-mono text-xs">
                ☠️ {results.counts.harmful} Harmful
              </span>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <h3 className="text-white font-display font-bold mb-3">
          Ingredients
        </h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {results.classified.map((ing, i) => {
            const colors: Record<string, string> = {
              safe: 'rgba(0,230,118,0.15)',
              moderate: 'rgba(255,184,0,0.15)',
              harmful: 'rgba(255,61,90,0.15)',
              unknown: 'rgba(139,149,168,0.15)',
            };
            const textColors: Record<string, string> = {
              safe: '#00E676',
              moderate: '#FFB800',
              harmful: '#FF3D5A',
              unknown: '#8B95A8',
            };
            return (
              <span
                key={i}
                className="px-3 py-1 rounded-full font-mono text-xs"
                style={{
                  background: colors[ing.category] || colors.unknown,
                  color: textColors[ing.category] || textColors.unknown,
                  border: `1px solid ${textColors[ing.category]}40`,
                }}
              >
                {ing.name}
              </span>
            );
          })}
        </div>

        {/* Warnings */}
        {results.personalisation.total_warnings > 0 && (
          <>
            <h3 className="text-white font-display font-bold mb-3">
              ⚠️ Warnings
            </h3>
            <div className="space-y-2">
              {[
                ...results.personalisation.allergy_warnings,
                ...results.personalisation.diabetic_warnings,
                ...results.personalisation.harmful_warnings,
              ].map((w, i) => (
                <div
                  key={i}
                  className="p-3 rounded-xl font-mono text-xs text-[#FFB800] border border-[#FFB800]/20 bg-[#FFB800]/5"
                >
                  {w}
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────────
interface ScanHistoryProps {
  onClose: () => void;
}

export function ScanHistory({ onClose }: ScanHistoryProps) {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);

  useEffect(() => {
    setHistory(getScanHistory());
  }, []);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteScan(id);
    setHistory(prev => prev.filter(s => s.id !== id));
  };

  const handleClearAll = () => {
    clearHistory();
    setHistory([]);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center p-4"
        style={{ background: 'rgba(8,11,20,0.9)', backdropFilter: 'blur(12px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          className="glass-card rounded-3xl p-8 border border-white/10 w-full max-w-2xl max-h-[80vh] overflow-y-auto relative"
          onClick={e => e.stopPropagation()}
        >
          <div className="gradient-border-top" />

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-display font-bold text-white">
                📋 Scan History
              </h2>
              <p className="text-[#8B95A8] font-mono text-sm mt-1">
                {history.length} scan{history.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <div className="flex gap-2">
              {history.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="px-4 py-2 rounded-xl font-mono text-xs border border-[#FF3D5A]/30 text-[#FF3D5A] hover:bg-[#FF3D5A]/10 transition-all"
                >
                  Clear All
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl border border-white/10 text-[#8B95A8] hover:border-white/30 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Empty State */}
          {history.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-white font-display font-bold text-xl mb-2">
                No scans yet
              </p>
              <p className="text-[#8B95A8] font-mono text-sm">
                Scan a product to see history here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((record, index) => {
                const scoreColor = getScoreColor(record.results.health_score.normalised);
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedScan(record)}
                    className="flex items-center gap-4 p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 transition-all cursor-pointer group"
                  >
                    {/* Score Badge */}
                    <div
                      className="w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 border"
                      style={{
                        background: `${scoreColor}15`,
                        borderColor: `${scoreColor}40`,
                      }}
                    >
                      <span
                        className="text-xl font-display font-bold"
                        style={{ color: scoreColor }}
                      >
                        {record.results.health_score.grade}
                      </span>
                      <span
                        className="text-xs font-mono"
                        style={{ color: scoreColor }}
                      >
                        {record.results.health_score.normalised}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-display font-bold truncate">
                        {record.product_name}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[#8B95A8] font-mono text-xs flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {record.date}
                        </span>
                      </div>
                      <div className="flex gap-3 mt-2">
                        <span className="text-[#00E676] font-mono text-xs">
                          ✅ {record.results.counts.safe}
                        </span>
                        <span className="text-[#FFB800] font-mono text-xs">
                          ⚠️ {record.results.counts.moderate}
                        </span>
                        <span className="text-[#FF3D5A] font-mono text-xs">
                          ☠️ {record.results.counts.harmful}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={e => handleDelete(record.id, e)}
                        className="p-2 rounded-xl text-[#8B95A8] hover:text-[#FF3D5A] hover:bg-[#FF3D5A]/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <ChevronRight className="w-5 h-5 text-[#8B95A8] group-hover:text-[#AAFF45] transition-all" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedScan && (
          <ScanDetailModal
            record={selectedScan}
            onClose={() => setSelectedScan(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}