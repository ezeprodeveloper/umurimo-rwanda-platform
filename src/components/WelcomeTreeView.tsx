import React, { useState, useRef } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Gift, CheckCircle2, Coins, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WelcomeTreeViewProps {
  onBackToHome: () => void;
  onProceedToRegister: () => void;
}

export const WelcomeTreeView: React.FC<WelcomeTreeViewProps> = ({
  onBackToHome,
  onProceedToRegister
}) => {
  const [isPulling, setIsPulling] = useState(false);
  const [dragY, setDragY] = useState(0);
  const [isAwakened, setIsAwakened] = useState(false);
  const startYRef = useRef<number>(0);

  const triggerAwakening = () => {
    confetti({
      particleCount: 80,
      spread: 90,
      origin: { y: 0.5 },
      colors: ['#10B981', '#F59E0B', '#3B82F6', '#EC4899', '#14B8A6']
    });
    setDragY(110);
    setIsAwakened(true);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsPulling(true);
    startYRef.current = e.clientY;
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPulling || isAwakened) return;
    const deltaY = Math.max(0, Math.min(120, e.clientY - startYRef.current));
    setDragY(deltaY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isPulling || isAwakened) return;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsPulling(false);

    if (dragY > 70) {
      triggerAwakening();
    } else {
      setDragY(0);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-8 select-none">
      {/* Top back button */}
      <button
        onClick={onBackToHome}
        className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Home Landing</span>
      </button>

      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Interactive Welcome Tree 🌳</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Welcome to the Umurimo Prosperity Tree
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          In Rwandan culture, trees represent growth, community, and enduring prosperity. Pull the braided rope (akagozi) below to awaken your financial growth and claim your registration bonus!
        </p>
      </div>

      {/* Interactive Tree Box */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl flex flex-col items-center relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />

        {/* SVG Tree & Coins Animation */}
        <div className="relative w-full h-64 flex justify-center items-center">
          <svg
            viewBox="0 0 600 300"
            className="w-full max-w-md h-64 drop-shadow-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Roots & Soil */}
            <ellipse cx="300" cy="275" rx="140" ry="18" fill="#1E293B" />
            <path d="M 220,270 C 250,250 280,245 300,245 C 320,245 350,250 380,270" stroke="#334155" strokeWidth="8" strokeLinecap="round" />

            {/* Robust Trunk */}
            <path
              d="M 260,250 C 265,190 275,130 260,90 C 250,65 230,45 200,30 C 250,55 295,95 300,160 C 305,95 350,55 400,30 C 370,45 350,65 340,90 C 325,130 335,190 340,250 Z"
              fill="#5A3A1E"
            />
            <path
              d="M 300,248 C 300,190 295,140 300,90 C 305,140 300,190 300,248 Z"
              fill="#38210F"
            />

            {/* Glowing Leaves Canopies */}
            <circle cx="160" cy="90" r="65" fill="#15803D" fillOpacity="0.85" />
            <circle cx="230" cy="55" r="75" fill="#16A34A" fillOpacity="0.9" />
            <circle cx="300" cy="40" r="85" fill="#22C55E" fillOpacity="0.85" />
            <circle cx="370" cy="55" r="75" fill="#16A34A" fillOpacity="0.9" />
            <circle cx="440" cy="90" r="65" fill="#15803D" fillOpacity="0.85" />

            {/* Golden Coins / Opportunities on Branches */}
            <g className="animate-pulse">
              <circle cx="180" cy="80" r="14" fill="#F59E0B" />
              <text x="176" y="84" fill="#78350F" fontSize="12" fontWeight="bold">RWF</text>

              <circle cx="260" cy="50" r="16" fill="#FBBF24" />
              <text x="252" y="55" fill="#78350F" fontSize="12" fontWeight="bold">BONUS</text>

              <circle cx="340" cy="50" r="16" fill="#F59E0B" />
              <text x="334" y="55" fill="#78350F" fontSize="12" fontWeight="bold">JOB</text>

              <circle cx="420" cy="80" r="14" fill="#FBBF24" />
              <text x="414" y="84" fill="#78350F" fontSize="12" fontWeight="bold">GROW</text>
            </g>
          </svg>

          {/* Hanging Braided Rope (Akagozi) */}
          <div className="absolute top-12 left-1/2 -translate-x-1/2 flex flex-col items-center z-20">
            <svg width="28" height={100 + dragY} className="overflow-visible transition-all duration-75">
              <line
                x1="14"
                y1="0"
                x2="14"
                y2={90 + dragY}
                stroke="#D97706"
                strokeWidth="6"
                strokeDasharray="5 3"
                strokeLinecap="round"
              />
              <line
                x1="14"
                y1="0"
                x2="14"
                y2={90 + dragY}
                stroke="#92400E"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>

            {/* Pull Handle (Tassel) */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              onClick={() => {
                if (!isAwakened) triggerAwakening();
              }}
              style={{
                transform: `translateY(${dragY}px)`,
                transition: isPulling ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
              className="cursor-pointer group flex flex-col items-center filter drop-shadow-lg"
            >
              <div className="w-10 h-14 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-700 border-2 border-amber-300 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform">
                <Coins className="w-5 h-5 text-amber-200 animate-bounce" />
              </div>
              <span className="text-[10px] font-bold text-amber-400 mt-1 uppercase tracking-wider bg-slate-950/80 px-2 py-0.5 rounded-full border border-amber-500/30">
                {isAwakened ? 'Awakened! ✨' : 'Pull Rope (Akagozi) ↓'}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions / Status Message */}
        <div className="mt-8 text-center space-y-4 max-w-md relative z-10">
          {!isAwakened ? (
            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
              <p className="text-xs font-bold text-amber-300 uppercase tracking-wide">
                Interactive Action Required
              </p>
              <p className="text-xs text-slate-300">
                Click and drag the hanging rope downwards (or tap the handle) to pull the akagozi and activate your prosperity tree.
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 animate-in fade-in zoom-in-95 duration-300">
              <div className="flex items-center justify-center gap-2 text-emerald-300 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Tree Successfully Awakened!</span>
              </div>
              <p className="text-xs text-slate-300">
                Your prosperity profile is initialized with a <strong className="text-emerald-400">+2,500 RWF</strong> registration bonus. Proceed to account setup to start earning.
              </p>
              <button
                onClick={onProceedToRegister}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to Account Setup</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
