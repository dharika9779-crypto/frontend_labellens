import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react';

interface VoiceAssistantProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
  analysisResult?: any;
}

// ── SPEECH SYNTHESIS (text → voice) ──────────────────────────
function speak(text: string, onEnd?: () => void) {
  window.speechSynthesis.cancel(); // pehle wala band karo
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.85;    // thoda slow — elderly ke liye
  utterance.pitch = 1;
  utterance.volume = 1;

  // English voice prefer karo
  const voices = window.speechSynthesis.getVoices();
  const english = voices.find(v => v.lang.startsWith('en'));
  if (english) utterance.voice = english;

  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  window.speechSynthesis.cancel();
}

// ── RESULTS TEXT BANANA ───────────────────────────────────────
function buildResultsSummary(results: any): string {
  if (!results) return "No results available yet. Please scan a product first.";

  const score = results.health_score?.normalised ?? 0;
  const grade = results.health_score?.grade ?? 'N/A';
  const verdict = results.health_score?.verdict ?? '';
  const counts = results.counts ?? {};
  const warnings = results.personalisation ?? {};

  const totalWarnings =
    (warnings.allergy_warnings?.length ?? 0) +
    (warnings.diabetic_warnings?.length ?? 0) +
    (warnings.harmful_warnings?.length ?? 0) +
    (warnings.age_warnings?.length ?? 0) +
    (warnings.diet_warnings?.length ?? 0) +
    (warnings.medical_warnings?.length ?? 0);

  let summary = `Health Score is ${score} out of 100. Grade ${grade}. ${verdict}. `;
  summary += `Found ${counts.safe ?? 0} safe ingredients, `;
  summary += `${counts.moderate ?? 0} moderate, `;
  summary += `${counts.harmful ?? 0} harmful. `;

  if (totalWarnings > 0) {
    summary += `There are ${totalWarnings} personalized warnings for you. `;

    // Allergy warnings
    if (warnings.allergy_warnings?.length > 0) {
      summary += warnings.allergy_warnings.slice(0, 2).join('. ') + '. ';
    }

    // Diabetic warnings
    if (warnings.diabetic_warnings?.length > 0) {
      summary += `Diabetic alert: ${warnings.diabetic_warnings[0]}. `;
    }

    // Medical warnings
    if (warnings.medical_warnings?.length > 0) {
      summary += warnings.medical_warnings.slice(0, 2).join('. ') + '. ';
    }
  }

  summary += warnings.general_advice ?? '';
  return summary;
}

// ── MAIN COMPONENT ────────────────────────────────────────────
export function VoiceAssistant({
  onBarcodeDetected,
  onClose,
  analysisResult
}: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('Tap mic to speak');
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Browser support check
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSupported(false);
      setStatus('Voice not supported in this browser. Use Chrome.');
      return;
    }

    // Greet karo
    setTimeout(() => {
      speak(
        "Hello! I am your LabelLens voice assistant. " +
        "You can say a barcode number for me to look up, " +
        "or say read results to hear your analysis.",
        () => setIsSpeaking(false)
      );
      setIsSpeaking(true);
    }, 500);

    return () => {
      stopSpeaking();
      recognitionRef.current?.stop();
    };
  }, []);

  // ── START LISTENING ─────────────────────────────────────────
  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) return;

    stopSpeaking();
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus('Listening... speak now');
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      const heard = event.results[0][0].transcript.toLowerCase().trim();
      setTranscript(heard);
      handleVoiceCommand(heard);
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      setStatus(`Error: ${event.error}. Try again.`);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // ── STOP LISTENING ──────────────────────────────────────────
  const stopListening = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
    setStatus('Tap mic to speak');
  };

  // ── HANDLE COMMANDS ─────────────────────────────────────────
  const handleVoiceCommand = (command: string) => {
    setStatus(`Heard: "${command}"`);

    // ── READ RESULTS ──
    if (
      command.includes('read') ||
      command.includes('results') ||
      command.includes('analysis') ||
      command.includes('score') ||
      command.includes('tell me')
    ) {
      if (analysisResult) {
        const summary = buildResultsSummary(analysisResult);
        setStatus('Reading results...');
        setIsSpeaking(true);
        speak(summary, () => {
          setIsSpeaking(false);
          setStatus('Done. Tap mic to speak again.');
        });
      } else {
        speak('No results available yet. Please scan a product first.');
        setStatus('No results yet.');
      }
      return;
    }

    // ── BARCODE NUMBER ──
    // Numbers in speech: "8901058001357" ya "eight nine zero one..."
    const digits = command.replace(/\D/g, '');
    if (digits.length >= 8) {
      setStatus(`Barcode detected: ${digits}`);
      speak(`Looking up barcode ${digits}.`, () => setIsSpeaking(false));
      setIsSpeaking(true);
      onBarcodeDetected(digits);
      return;
    }

    // ── WARNINGS ──
    if (command.includes('warning') || command.includes('danger')) {
      if (analysisResult) {
        const p = analysisResult.personalisation;
        const allW = [
          ...(p.allergy_warnings || []),
          ...(p.diabetic_warnings || []),
          ...(p.harmful_warnings || []),
          ...(p.age_warnings || []),
          ...(p.medical_warnings || []),
        ];
        if (allW.length > 0) {
          const text = `You have ${allW.length} warnings. ` + allW.slice(0, 3).join('. ');
          setIsSpeaking(true);
          speak(text, () => {
            setIsSpeaking(false);
            setStatus('Done.');
          });
        } else {
          speak('No warnings for this product. It looks safe for you!');
        }
      }
      return;
    }

    // ── SCORE ONLY ──
    if (command.includes('grade') || command.includes('rating')) {
      if (analysisResult) {
        const s = analysisResult.health_score;
        speak(
          `The health score is ${s.normalised} out of 100. Grade ${s.grade}. ${s.verdict}.`,
          () => setIsSpeaking(false)
        );
        setIsSpeaking(true);
      }
      return;
    }

    // ── STOP ──
    if (command.includes('stop') || command.includes('quiet') || command.includes('close')) {
      stopSpeaking();
      setIsSpeaking(false);
      setStatus('Stopped.');
      return;
    }

    // ── HELP ──
    if (command.includes('help') || command.includes('what can you')) {
      speak(
        'You can say: read results, to hear the analysis. ' +
        'Say a barcode number to look up a product. ' +
        'Say warnings to hear your personal warnings. ' +
        'Say grade to hear the health score. ' +
        'Say stop to stop me from speaking.',
        () => setIsSpeaking(false)
      );
      setIsSpeaking(true);
      setStatus('Help spoken.');
      return;
    }

    // ── NOT UNDERSTOOD ──
    speak(
      `I heard "${command}" but did not understand. ` +
      'Say help to know what you can say.',
      () => setIsSpeaking(false)
    );
    setIsSpeaking(true);
    setStatus('Command not recognized.');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(8,11,20,0.92)', backdropFilter: 'blur(16px)' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="glass-card rounded-3xl p-10 border border-white/10 w-full max-w-md relative text-center"
      >
        <div className="gradient-border-top" />

        {/* Close */}
        <button
          onClick={() => { stopSpeaking(); onClose(); }}
          className="absolute top-4 right-4 p-2 rounded-xl border border-white/10 text-[#8B95A8] hover:border-white/30 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="text-5xl mb-3">🎤</div>
          <h2 className="text-2xl font-display font-bold text-white">
            Voice Assistant
          </h2>
          <p className="text-[#8B95A8] font-mono text-sm mt-1">
            Speak to interact with LabelLens
          </p>
        </div>

        {/* Mic Button */}
        <div className="relative flex items-center justify-center mb-8">
          {/* Pulse animation when listening */}
          {isListening && (
            <>
              <motion.div
                animate={{ scale: [1, 1.6], opacity: [0.4, 0] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="absolute w-32 h-32 rounded-full bg-[#AAFF45]/20"
              />
              <motion.div
                animate={{ scale: [1, 1.4], opacity: [0.3, 0] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                className="absolute w-32 h-32 rounded-full bg-[#AAFF45]/20"
              />
            </>
          )}

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={isListening ? stopListening : startListening}
            disabled={!supported}
            className="relative w-28 h-28 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
            style={{
              background: isListening
                ? 'linear-gradient(135deg, #AAFF45, #00E5FF)'
                : 'rgba(170,255,69,0.1)',
              border: `3px solid ${isListening ? '#AAFF45' : 'rgba(170,255,69,0.3)'}`,
              boxShadow: isListening
                ? '0 0 32px rgba(170,255,69,0.5)'
                : '0 0 16px rgba(170,255,69,0.1)',
            }}
          >
            {isListening
              ? <MicOff className="w-10 h-10 text-[#080B14]" />
              : <Mic className="w-10 h-10 text-[#AAFF45]" />
            }
          </motion.button>
        </div>

        {/* Status */}
        <motion.p
          key={status}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-white font-mono text-sm mb-4 min-h-[20px]"
        >
          {status}
        </motion.p>

        {/* Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10"
          >
            <p className="text-[#8B95A8] font-mono text-xs mb-1">You said:</p>
            <p className="text-[#AAFF45] font-mono text-sm">"{transcript}"</p>
          </motion.div>
        )}

        {/* Speaking indicator */}
        <AnimatePresence>
          {isSpeaking && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <Volume2 className="w-4 h-4 text-[#00E5FF]" />
              <span className="text-[#00E5FF] font-mono text-sm">Speaking...</span>
              <button
                onClick={() => { stopSpeaking(); setIsSpeaking(false); }}
                className="ml-2 text-[#8B95A8] hover:text-[#FF3D5A] transition-all"
              >
                <VolumeX className="w-4 h-4" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Commands Help */}
        <div className="text-left space-y-2">
          <p className="text-[#8B95A8] font-mono text-xs uppercase tracking-wider mb-3">
            Voice Commands:
          </p>
          {[
            { cmd: '"Read results"',    desc: 'Hear full analysis' },
            { cmd: '"Warnings"',        desc: 'Hear your warnings' },
            { cmd: '"Grade"',           desc: 'Hear health score' },
            { cmd: '"[barcode number]"',desc: 'Look up product' },
            { cmd: '"Stop"',            desc: 'Stop speaking' },
            { cmd: '"Help"',            desc: 'All commands' },
          ].map(({ cmd, desc }) => (
            <div key={cmd} className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-[#AAFF45] font-mono text-xs">{cmd}</span>
              <span className="text-[#8B95A8] font-mono text-xs">{desc}</span>
            </div>
          ))}
        </div>

        {!supported && (
          <div className="mt-4 p-3 rounded-xl border border-[#FF3D5A]/30 bg-[#FF3D5A]/5">
            <p className="text-[#FF3D5A] font-mono text-xs">
              ⚠️ Use Google Chrome for voice support
            </p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}