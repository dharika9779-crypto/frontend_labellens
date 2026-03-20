import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

export interface UserProfileData {
  name: string;
  age: string;
  dietType: string;
  isDiabetic: boolean;
  medicalConditions: string[];
  allergies: string[];
  isSetup: boolean;
}

const ALLERGY_OPTIONS = [
  { value: 'gluten',    label: 'Gluten',    emoji: '🌾' },
  { value: 'dairy',     label: 'Dairy',     emoji: '🥛' },
  { value: 'nuts',      label: 'Tree Nuts', emoji: '🌰' },
  { value: 'peanuts',   label: 'Peanuts',   emoji: '🥜' },
  { value: 'soy',       label: 'Soy',       emoji: '🫘' },
  { value: 'eggs',      label: 'Eggs',      emoji: '🥚' },
  { value: 'shellfish', label: 'Shellfish', emoji: '🦐' },
  { value: 'fish',      label: 'Fish',      emoji: '🐟' },
  { value: 'sesame',    label: 'Sesame',    emoji: '🌿' },
  { value: 'sulfites',  label: 'Sulfites',  emoji: '🧪' },
];

const AGE_OPTIONS = [
  { value: 'child',  label: 'Child',   emoji: '👶', desc: 'Under 12' },
  { value: 'teen',   label: 'Teen',    emoji: '🧒', desc: '13–17' },
  { value: 'adult',  label: 'Adult',   emoji: '🧑', desc: '18–60' },
  { value: 'senior', label: 'Senior',  emoji: '👴', desc: '60+' },
];

const DIET_OPTIONS = [
  { value: 'none',          label: 'No Restriction', emoji: '🍽️' },
  { value: 'vegetarian',    label: 'Vegetarian',     emoji: '🥗' },
  { value: 'vegan',         label: 'Vegan',          emoji: '🌱' },
  { value: 'keto',          label: 'Keto',           emoji: '🥩' },
  { value: 'low_sodium',    label: 'Low Sodium',     emoji: '🧂' },
  { value: 'low_sugar',     label: 'Low Sugar',      emoji: '🍬' },
];

const MEDICAL_OPTIONS = [
  { value: 'diabetes',     label: 'Diabetes',         emoji: '🩺' },
  { value: 'hypertension', label: 'High BP',          emoji: '💓' },
  { value: 'pregnant',     label: 'Pregnant',         emoji: '🤰' },
  { value: 'heart',        label: 'Heart Disease',    emoji: '❤️' },
  { value: 'kidney',       label: 'Kidney Disease',   emoji: '🫘' },
  { value: 'thyroid',      label: 'Thyroid',          emoji: '🦋' },
  { value: 'ibs',          label: 'IBS/Gut Issues',   emoji: '🫃' },
  { value: 'celiac',       label: 'Celiac Disease',   emoji: '🌾' },
];

const STORAGE_KEY = 'labellens_user_profile';

export function getUserProfile(): UserProfileData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    name: '', age: 'adult', dietType: 'none',
    isDiabetic: false, medicalConditions: [],
    allergies: [], isSetup: false
  };
}

export function saveUserProfile(profile: UserProfileData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearUserProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

interface UserProfileProps {
  onComplete: (profile: UserProfileData) => void;
}

export function UserProfile({ onComplete }: UserProfileProps) {
  const [step, setStep] = useState<'name' | 'age' | 'diet' | 'medical' | 'allergies'>('name');
  const [name, setName] = useState('');
  const [age, setAge] = useState('adult');
  const [dietType, setDietType] = useState('none');
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);

  const steps = ['name', 'age', 'diet', 'medical', 'allergies'];
  const currentStepIndex = steps.indexOf(step);

  const toggleItem = (list: string[], setList: any, value: string) => {
    setList((prev: string[]) =>
      prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]
    );
  };

  const handleComplete = () => {
    const isDiabetic = medicalConditions.includes('diabetes');
    const profile: UserProfileData = {
      name, age, dietType, isDiabetic,
      medicalConditions, allergies, isSetup: true
    };
    saveUserProfile(profile);
    onComplete(profile);
  };

  return (
    <div className="min-h-screen animated-bg flex items-center justify-center px-6">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="text-[#AAFF45] text-5xl mb-3">⬡</div>
          <h1 className="text-3xl font-display font-bold text-white">LabelLens</h1>
          <p className="text-[#8B95A8] font-mono text-sm mt-1">
            Setup your health profile — only once!
          </p>
        </motion.div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {steps.map((s, i) => (
            <div
              key={s}
              className="flex-1 h-1 rounded-full transition-all duration-500"
              style={{
                background: currentStepIndex >= i
                  ? '#AAFF45' : 'rgba(255,255,255,0.1)'
              }}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* STEP 1 — Name */}
          {step === 'name' && (
            <motion.div key="name"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="glass-card rounded-3xl p-8 border border-white/10 relative"
            >
              <div className="gradient-border-top" />
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                👋 What's your name?
              </h2>
              <p className="text-[#8B95A8] font-mono text-sm mb-6">
                We'll personalise your experience
              </p>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && name.trim() && setStep('age')}
                placeholder="Enter your name..."
                className="w-full bg-white/5 text-white border-2 border-white/10 rounded-xl p-4 font-mono text-lg focus:outline-none focus:border-[#AAFF45]/50 transition-all mb-6"
                autoFocus
              />
              <Button
                onClick={() => setStep('age')}
                disabled={!name.trim()}
                className="w-full bg-[#AAFF45] text-[#080B14] font-display font-bold rounded-xl py-6 disabled:opacity-30 btn-glow"
              >
                Continue →
              </Button>
            </motion.div>
          )}

          {/* STEP 2 — Age */}
          {step === 'age' && (
            <motion.div key="age"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="glass-card rounded-3xl p-8 border border-white/10 relative"
            >
              <div className="gradient-border-top" />
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                🎂 Age Group?
              </h2>
              <p className="text-[#8B95A8] font-mono text-sm mb-6">
                Different age groups have different needs
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {AGE_OPTIONS.map(({ value, label, emoji, desc }) => (
                  <button
                    key={value}
                    onClick={() => setAge(value)}
                    className={`py-4 px-4 rounded-2xl border-2 transition-all text-left
                      ${age === value
                        ? 'bg-[#AAFF45]/10 border-[#AAFF45] text-[#AAFF45]'
                        : 'bg-white/5 border-white/10 text-[#8B95A8] hover:border-white/20'
                      }`}
                  >
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className="font-display font-bold">{label}</div>
                    <div className="font-mono text-xs opacity-70">{desc}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep('name')} variant="outline"
                  className="flex-1 border-white/20 text-white bg-transparent rounded-xl py-6">
                  ← Back
                </Button>
                <Button onClick={() => setStep('diet')}
                  className="flex-1 bg-[#AAFF45] text-[#080B14] font-bold rounded-xl py-6 btn-glow">
                  Continue →
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 3 — Diet */}
          {step === 'diet' && (
            <motion.div key="diet"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="glass-card rounded-3xl p-8 border border-white/10 relative"
            >
              <div className="gradient-border-top" />
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                🥗 Diet Type?
              </h2>
              <p className="text-[#8B95A8] font-mono text-sm mb-6">
                We'll flag ingredients that don't match your diet
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {DIET_OPTIONS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => setDietType(value)}
                    className={`py-4 px-4 rounded-2xl border-2 transition-all text-left
                      ${dietType === value
                        ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-[#00E5FF]'
                        : 'bg-white/5 border-white/10 text-[#8B95A8] hover:border-white/20'
                      }`}
                  >
                    <div className="text-2xl mb-1">{emoji}</div>
                    <div className="font-display font-bold text-sm">{label}</div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep('age')} variant="outline"
                  className="flex-1 border-white/20 text-white bg-transparent rounded-xl py-6">
                  ← Back
                </Button>
                <Button onClick={() => setStep('medical')}
                  className="flex-1 bg-[#AAFF45] text-[#080B14] font-bold rounded-xl py-6 btn-glow">
                  Continue →
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 4 — Medical */}
          {step === 'medical' && (
            <motion.div key="medical"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="glass-card rounded-3xl p-8 border border-white/10 relative"
            >
              <div className="gradient-border-top" />
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                🏥 Medical Conditions?
              </h2>
              <p className="text-[#8B95A8] font-mono text-sm mb-6">
                Select all that apply — skip if none
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {MEDICAL_OPTIONS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => toggleItem(medicalConditions, setMedicalConditions, value)}
                    className={`py-3 px-4 rounded-xl border-2 transition-all text-left flex items-center gap-2
                      ${medicalConditions.includes(value)
                        ? 'bg-[#FF3D5A]/10 border-[#FF3D5A] text-[#FF3D5A]'
                        : 'bg-white/5 border-white/10 text-[#8B95A8] hover:border-white/20'
                      }`}
                  >
                    <span>{emoji}</span>
                    <span className="font-mono text-sm">{label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep('diet')} variant="outline"
                  className="flex-1 border-white/20 text-white bg-transparent rounded-xl py-6">
                  ← Back
                </Button>
                <Button onClick={() => setStep('allergies')}
                  className="flex-1 bg-[#AAFF45] text-[#080B14] font-bold rounded-xl py-6 btn-glow">
                  Continue →
                </Button>
              </div>
            </motion.div>
          )}

          {/* STEP 5 — Allergies */}
          {step === 'allergies' && (
            <motion.div key="allergies"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="glass-card rounded-3xl p-8 border border-white/10 relative"
            >
              <div className="gradient-border-top" />
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                🚨 Any Allergies?
              </h2>
              <p className="text-[#8B95A8] font-mono text-sm mb-6">
                Select all that apply — skip if none
              </p>
              <div className="grid grid-cols-2 gap-3 mb-8">
                {ALLERGY_OPTIONS.map(({ value, label, emoji }) => (
                  <button
                    key={value}
                    onClick={() => toggleItem(allergies, setAllergies, value)}
                    className={`py-3 px-4 rounded-xl border-2 transition-all text-left flex items-center gap-2
                      ${allergies.includes(value)
                        ? 'bg-[#00E5FF]/10 border-[#00E5FF] text-[#00E5FF]'
                        : 'bg-white/5 border-white/10 text-[#8B95A8] hover:border-white/20'
                      }`}
                  >
                    <span>{emoji}</span>
                    <span className="font-mono text-sm">{label}</span>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <Button onClick={() => setStep('medical')} variant="outline"
                  className="flex-1 border-white/20 text-white bg-transparent rounded-xl py-6">
                  ← Back
                </Button>
                <Button onClick={handleComplete}
                  className="flex-1 bg-[#AAFF45] text-[#080B14] font-bold rounded-xl py-6 btn-glow">
                  🚀 Start Scanning!
                </Button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <p className="text-center text-[#8B95A8] font-mono text-xs mt-6">
          Saved locally • Never shared • Can edit anytime
        </p>
      </div>
    </div>
  );
}