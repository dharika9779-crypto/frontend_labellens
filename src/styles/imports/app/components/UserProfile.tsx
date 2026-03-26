import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from './ui/button';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export interface UserProfileData {
  email: string;
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
  { value: 'child',  label: 'Child',  emoji: '👶', desc: 'Under 12' },
  { value: 'teen',   label: 'Teen',   emoji: '🧒', desc: '13–17'   },
  { value: 'adult',  label: 'Adult',  emoji: '🧑', desc: '18–60'   },
  { value: 'senior', label: 'Senior', emoji: '👴', desc: '60+'     },
];

const DIET_OPTIONS = [
  { value: 'none',       label: 'No Restriction', emoji: '🍽️' },
  { value: 'vegetarian', label: 'Vegetarian',     emoji: '🥗' },
  { value: 'vegan',      label: 'Vegan',          emoji: '🌱' },
  { value: 'keto',       label: 'Keto',           emoji: '🥩' },
  { value: 'low_sodium', label: 'Low Sodium',     emoji: '🧂' },
  { value: 'low_sugar',  label: 'Low Sugar',      emoji: '🍬' },
];

const MEDICAL_OPTIONS = [
  { value: 'diabetes',     label: 'Diabetes',      emoji: '🩺' },
  { value: 'hypertension', label: 'High BP',        emoji: '💓' },
  { value: 'pregnant',     label: 'Pregnant',       emoji: '🤰' },
  { value: 'heart',        label: 'Heart Disease',  emoji: '❤️' },
  { value: 'kidney',       label: 'Kidney Disease', emoji: '🫘' },
  { value: 'thyroid',      label: 'Thyroid',        emoji: '🦋' },
  { value: 'ibs',          label: 'IBS/Gut Issues', emoji: '🫃' },
  { value: 'celiac',       label: 'Celiac Disease', emoji: '🌾' },
];

const STORAGE_KEY = 'labellens_user_profile';

// ── STORAGE HELPERS ───────────────────────────────────────────
export function getUserProfile(): UserProfileData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return {
    email: '', name: '', age: 'adult', dietType: 'none',
    isDiabetic: false, medicalConditions: [],
    allergies: [], isSetup: false,
  };
}

export function saveUserProfile(profile: UserProfileData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearUserProfile(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ── MONGODB API HELPERS ───────────────────────────────────────
async function saveProfileToMongo(profile: UserProfileData): Promise<void> {
  try {
    // Try update first — if not found, create
    const res = await fetch(`${BASE_URL}/user/${encodeURIComponent(profile.email)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: profile.email,
        name: profile.name,
        age: profile.age,
        diet_type: profile.dietType,
        is_diabetic: profile.isDiabetic,
        medical_conditions: profile.medicalConditions,
        allergies: profile.allergies,
      }),
    });

    if (!res.ok) {
      // Create new user
      await fetch(`${BASE_URL}/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          name: profile.name,
          age: profile.age,
          diet_type: profile.dietType,
          is_diabetic: profile.isDiabetic,
          medical_conditions: profile.medicalConditions,
          allergies: profile.allergies,
        }),
      });
    }
  } catch (e) {
    console.error('MongoDB save failed — using localStorage only', e);
  }
}

async function loadProfileFromMongo(email: string): Promise<UserProfileData | null> {
  try {
    const res = await fetch(`${BASE_URL}/user/${encodeURIComponent(email)}`);
    if (!res.ok) return null;
    const data = await res.json();
    const u = data.user;
    return {
      email: u.email,
      name: u.name,
      age: u.age || 'adult',
      dietType: u.diet_type || 'none',
      isDiabetic: u.is_diabetic || false,
      medicalConditions: u.medical_conditions || [],
      allergies: u.allergies || [],
      isSetup: true,
    };
  } catch {
    return null;
  }
}

// ── MAIN COMPONENT ────────────────────────────────────────────
interface UserProfileProps {
  onComplete: (profile: UserProfileData) => void;
}

export function UserProfile({ onComplete }: UserProfileProps) {
  const [step, setStep] = useState<'email' | 'name' | 'age' | 'diet' | 'medical' | 'allergies'>('email');
  const [email, setEmail]   = useState('');
  const [name, setName]     = useState('');
  const [age, setAge]       = useState('adult');
  const [dietType, setDietType] = useState('none');
  const [medicalConditions, setMedicalConditions] = useState<string[]>([]);
  const [allergies, setAllergies]   = useState<string[]>([]);
  const [customAllergy, setCustomAllergy] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');

  const steps = ['email', 'name', 'age', 'diet', 'medical', 'allergies'];
  const currentStepIndex = steps.indexOf(step);

  const toggleItem = (list: string[], setList: any, value: string) => {
    setList((prev: string[]) =>
      prev.includes(value) ? prev.filter((i: string) => i !== value) : [...prev, value]
    );
  };

  const addCustomAllergy = () => {
    const trimmed = customAllergy.trim().toLowerCase();
    if (trimmed && !allergies.includes(trimmed)) {
      setAllergies(prev => [...prev, trimmed]);
      setCustomAllergy('');
    }
  };

  const removeAllergy = (value: string) => {
    setAllergies(prev => prev.filter(a => a !== value));
  };

  // ── EMAIL STEP — check if user exists ─────────────────────
  const handleEmailContinue = async () => {
    if (!email.trim() || !email.includes('@')) {
      setEmailError('Please enter a valid email');
      return;
    }
    setEmailError('');
    setLoading(true);

    // Try loading existing profile from MongoDB
    const existing = await loadProfileFromMongo(email.trim());
    setLoading(false);

    if (existing) {
      // User exists — load profile and skip setup
      saveUserProfile(existing);
      onComplete(existing);
    } else {
      // New user — go through setup
      setStep('name');
    }
  };

  const handleComplete = async () => {
    const isDiabetic = medicalConditions.includes('diabetes');
    const profile: UserProfileData = {
      email, name, age, dietType, isDiabetic,
      medicalConditions, allergies, isSetup: true,
    };

    // Save to localStorage + MongoDB
    saveUserProfile(profile);
    await saveProfileToMongo(profile);
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

          {/* STEP 0 — Email */}
          {step === 'email' && (
            <motion.div key="email"
              initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              className="glass-card rounded-3xl p-8 border border-white/10 relative"
            >
              <div className="gradient-border-top" />
              <h2 className="text-2xl font-display font-bold text-white mb-2">
                📧 Enter your email
              </h2>
              <p className="text-[#8B95A8] font-mono text-sm mb-6">
                Returning user? Your profile will load automatically.
              </p>
              <input
                type="email"
                value={email}
                onChange={e => { setEmail(e.target.value); setEmailError(''); }}
                onKeyDown={e => e.key === 'Enter' && email.trim() && handleEmailContinue()}
                placeholder="you@example.com"
                className="w-full bg-white/5 text-white border-2 border-white/10 rounded-xl p-4 font-mono text-lg focus:outline-none focus:border-[#AAFF45]/50 transition-all mb-2"
                autoFocus
              />
              {emailError && (
                <p className="text-[#FF3D5A] font-mono text-xs mb-4">{emailError}</p>
              )}
              <Button
                onClick={handleEmailContinue}
                disabled={!email.trim() || loading}
                className="w-full bg-[#AAFF45] text-[#080B14] font-display font-bold rounded-xl py-6 disabled:opacity-30 btn-glow mt-4"
              >
                {loading ? '⏳ Checking...' : 'Continue →'}
              </Button>
            </motion.div>
          )}

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
              <div className="flex gap-3">
                <Button onClick={() => setStep('email')} variant="outline"
                  className="flex-1 border-white/20 text-white bg-transparent rounded-xl py-6">
                  ← Back
                </Button>
                <Button
                  onClick={() => setStep('age')}
                  disabled={!name.trim()}
                  className="flex-1 bg-[#AAFF45] text-[#080B14] font-display font-bold rounded-xl py-6 disabled:opacity-30 btn-glow"
                >
                  Continue →
                </Button>
              </div>
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
                Select from list or add your own
              </p>

              {/* Preset allergies */}
              <div className="grid grid-cols-2 gap-2 mb-4">
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

              {/* Custom allergy input */}
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={customAllergy}
                  onChange={e => setCustomAllergy(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addCustomAllergy()}
                  placeholder="Add custom allergy..."
                  className="flex-1 bg-white/5 text-white border-2 border-white/10 rounded-xl p-3 font-mono text-sm focus:outline-none focus:border-[#AAFF45]/50 transition-all"
                />
                <button
                  onClick={addCustomAllergy}
                  disabled={!customAllergy.trim()}
                  className="px-4 py-3 rounded-xl bg-[#AAFF45]/10 border-2 border-[#AAFF45]/30 text-[#AAFF45] font-mono text-sm hover:bg-[#AAFF45]/20 disabled:opacity-30 transition-all"
                >
                  + Add
                </button>
              </div>

              {/* Custom allergies added */}
              {allergies.filter(a => !ALLERGY_OPTIONS.find(o => o.value === a)).length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {allergies
                    .filter(a => !ALLERGY_OPTIONS.find(o => o.value === a))
                    .map(a => (
                      <span
                        key={a}
                        className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#AAFF45]/10 border border-[#AAFF45]/30 text-[#AAFF45] font-mono text-xs"
                      >
                        {a}
                        <button
                          onClick={() => removeAllergy(a)}
                          className="ml-1 hover:text-[#FF3D5A] transition-all"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                </div>
              )}

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
      </div>
    </div>
  );
}
