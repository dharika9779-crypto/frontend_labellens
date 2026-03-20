import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { Loader2, Camera, Hash } from 'lucide-react';
import { Button } from './ui/button';
import { apiService } from '../services/api';


interface BarcodeScannerProps {
  onIngredientsFound: (text: string, productName: string) => void;
}

export function BarcodeScanner({ onIngredientsFound }: BarcodeScannerProps) {
  const [mode, setMode] = useState<'camera' | 'manual'>('manual');
  const [isLoading, setIsLoading] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [productInfo, setProductInfo] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // ── IMAGE UPLOAD ──────────────────────────────────────────
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.scanBarcode(file);
      if (result.success && result.ingredients_text) {
        setProductInfo(result);
        onIngredientsFound(
          result.ingredients_text,
          result.product_name || 'Unknown Product'
        );
      } else {
        setError(result.error || 'Barcode not found. Try manual entry.');
      }
    } catch (err) {
      setError('Failed to scan barcode. Try manual entry.');
    } finally {
      setIsLoading(false);
    }
  };

  // ── CAMERA ────────────────────────────────────────────────
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err) {
      setError('Camera access denied. Use image upload instead.');
    }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  const captureFrame = async () => {
    if (!videoRef.current) return;
    setIsLoading(true);
    setError(null);

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
      try {
        const result = await apiService.scanBarcode(file);
        if (result.success && result.ingredients_text) {
          setProductInfo(result);
          stopCamera();
          onIngredientsFound(
            result.ingredients_text,
            result.product_name || 'Unknown Product'
          );
        } else {
          setError('No barcode detected. Try again or use manual entry.');
        }
      } catch {
        setError('Scan failed. Try manual entry.');
      } finally {
        setIsLoading(false);
      }
    }, 'image/jpeg');
  };

  // ── MANUAL ENTRY ──────────────────────────────────────────
  const handleManualLookup = async () => {
    if (!manualBarcode.trim()) return;
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiService.lookupBarcode(manualBarcode);
      if (result.success && result.ingredients_text) {
        setProductInfo(result);
        onIngredientsFound(
          result.ingredients_text,
          result.product_name || 'Unknown Product'
        );
      } else {
        setError(result.error || 'Product not found in database.');
      }
    } catch {
      setError('Lookup failed. Check barcode number.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Mode Selector */}
      <div className="flex gap-3">
        {[
  { key: 'camera', label: '🎥 Camera' },
  { key: 'manual', label: '# Manual' },
].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => { setMode(key as any); stopCamera(); setError(null); }}
            className={`flex-1 py-3 px-4 rounded-xl font-mono text-sm font-bold transition-all duration-200 border-2
              ${mode === key
                ? 'bg-[#AAFF45]/10 border-[#AAFF45] text-[#AAFF45]'
                : 'bg-white/5 border-white/10 text-[#8B95A8] hover:border-white/20'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* IMAGE UPLOAD MODE */}
      {mode === 'image' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-dashed border-white/10 rounded-2xl p-10 text-center hover:border-[#AAFF45]/50 transition-all duration-300"
        >
          <div className="text-5xl mb-4">📦</div>
          <p className="text-white font-display font-bold text-lg mb-2">
            Upload Barcode Image
          </p>
          <p className="text-[#8B95A8] font-mono text-sm mb-6">
            Photo of any product barcode
          </p>
          <input
            type="file"
            id="barcode-upload"
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <label htmlFor="barcode-upload">
            <Button
              asChild
              disabled={isLoading}
              className="bg-[#AAFF45] text-[#080B14] font-bold rounded-xl btn-glow cursor-pointer"
            >
              <span>
                {isLoading ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</>
                ) : (
                  '📷 Choose Barcode Image'
                )}
              </span>
            </Button>
          </label>
        </motion.div>
      )}

      {/* CAMERA MODE */}
      {mode === 'camera' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="relative rounded-2xl overflow-hidden bg-black border-2 border-white/10"
               style={{ minHeight: '240px' }}>
            <video
              ref={videoRef}
              className="w-full rounded-2xl"
              playsInline
              muted
            />
            {!cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-5xl mb-3">🎥</div>
                  <p className="text-[#8B95A8] font-mono text-sm">Camera inactive</p>
                </div>
              </div>
            )}
            {cameraActive && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-[#AAFF45] rounded-xl w-64 h-32 opacity-60"
                     style={{ boxShadow: '0 0 20px rgba(170,255,69,0.3)' }} />
              </div>
            )}
          </div>

          <div className="flex gap-3">
            {!cameraActive ? (
              <Button
                onClick={startCamera}
                className="flex-1 bg-[#AAFF45] text-[#080B14] font-bold rounded-xl btn-glow"
              >
                <Camera className="w-4 h-4 mr-2" /> Start Camera
              </Button>
            ) : (
              <>
                <Button
                  onClick={captureFrame}
                  disabled={isLoading}
                  className="flex-1 bg-[#AAFF45] text-[#080B14] font-bold rounded-xl btn-glow"
                >
                  {isLoading
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scanning...</>
                    : '📸 Capture & Scan'
                  }
                </Button>
                <Button
                  onClick={stopCamera}
                  variant="outline"
                  className="border-white/20 text-white hover:border-red-400 hover:text-red-400 bg-transparent"
                >
                  Stop
                </Button>
              </>
            )}
          </div>
        </motion.div>
      )}

      {/* MANUAL MODE */}
      {mode === 'manual' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div>
            <label className="block text-[#8B95A8] font-mono text-sm mb-2">
              Enter Barcode Number
            </label>
            <input
              type="text"
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleManualLookup()}
              placeholder="e.g. 8901058001357"
              className="w-full bg-white/5 text-white border-2 border-white/10 rounded-xl p-4 font-mono text-lg focus:outline-none focus:border-[#AAFF45]/50 transition-all"
            />
            <p className="text-[#8B95A8] font-mono text-xs mt-2">
              📍 Barkade number is printed at the bottom of the product
            </p>
          </div>
          <Button
            onClick={handleManualLookup}
            disabled={isLoading || !manualBarcode.trim()}
            className="w-full bg-[#AAFF45] text-[#080B14] font-bold rounded-xl btn-glow py-6 disabled:opacity-30"
          >
            {isLoading
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Looking up...</>
              : <><Hash className="w-4 h-4 mr-2" /> Lookup Product</>
            }
          </Button>
        </motion.div>
      )}

      {/* ERROR */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl border-2 border-[#FF3D5A]/30 bg-[#FF3D5A]/5"
        >
          <p className="text-[#FF3D5A] font-mono text-sm">❌ {error}</p>
        </motion.div>
      )}

      {/* PRODUCT FOUND */}
      {productInfo && productInfo.success && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl border-2 border-[#00E676]/30 bg-[#00E676]/5"
        >
          <p className="text-[#00E676] font-mono text-sm font-bold mb-1">
            ✅ Product Found!
          </p>
          <p className="text-white font-display font-bold text-lg">
            {productInfo.product_name}
          </p>
          {productInfo.brands && (
            <p className="text-[#8B95A8] font-mono text-sm">{productInfo.brands}</p>
          )}
          <p className="text-[#8B95A8] font-mono text-xs mt-2">
            Barcode: {productInfo.barcode}
          </p>
        </motion.div>
      )}
    </div>
  );
}