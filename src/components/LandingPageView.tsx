import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Gift,
  CheckCircle2,
  Lock,
  Smartphone,
  ArrowRight,
  TrendingUp,
  Layers,
  Users,
  HelpCircle,
  LogIn,
  UserPlus,
  Banknote
} from 'lucide-react';

interface LandingPageViewProps {
  onGetStarted: () => void;
  onLogin: () => void;
  onRegister: () => void;
}

export const LandingPageView: React.FC<LandingPageViewProps> = ({
  onGetStarted,
  onLogin,
  onRegister
}) => {
  // Cycling background color state
  const [colorIndex, setColorIndex] = useState(0);

  const colorThemes = [
    'from-slate-950 via-emerald-950/40 to-slate-950',
    'from-slate-950 via-teal-950/40 to-slate-950',
    'from-slate-950 via-amber-950/40 to-slate-950',
    'from-slate-950 via-indigo-950/40 to-slate-950',
    'from-slate-950 via-purple-950/40 to-slate-950'
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setColorIndex((prev) => (prev + 1) % colorThemes.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`space-y-16 pb-20 transition-all duration-1000 bg-gradient-to-b ${colorThemes[colorIndex]} rounded-3xl p-4 sm:p-8 relative overflow-hidden`}>
      {/* Floating Rwandan Money Notes Background Accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-25">
        <div className="absolute top-12 left-10 p-3 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 font-mono text-xs animate-pulse flex items-center gap-1.5 transform -rotate-6">
          <Banknote className="w-4 h-4 text-emerald-400" />
          <span>5,000 RWF</span>
        </div>
        <div className="absolute top-1/3 right-12 p-3 rounded-2xl bg-amber-500/20 border border-amber-400/30 text-amber-300 font-mono text-xs animate-bounce flex items-center gap-1.5 transform rotate-12">
          <Banknote className="w-4 h-4 text-amber-400" />
          <span>10,000 RWF</span>
        </div>
        <div className="absolute bottom-1/4 left-1/4 p-3 rounded-2xl bg-teal-500/20 border border-teal-400/30 text-teal-300 font-mono text-xs animate-pulse flex items-center gap-1.5 transform rotate-3">
          <Banknote className="w-4 h-4 text-teal-400" />
          <span>2,000 RWF</span>
        </div>
        <div className="absolute bottom-12 right-1/3 p-3 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-300 font-mono text-xs animate-bounce flex items-center gap-1.5 transform -rotate-12">
          <Banknote className="w-4 h-4 text-blue-400" />
          <span>1,000 RWF</span>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900/90 backdrop-blur-md border border-slate-800 p-8 sm:p-14 text-center shadow-2xl z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-emerald-500/15 blur-3xl pointer-events-none rounded-full" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Earn • Work • Grow in Rwanda</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            The Premier Micro-Tasks & Daily Profit Platform in Rwanda
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
            Complete quick jobs, earn daily profits from our 7 investment tiers, invite friends through our referral network, and withdraw securely instantly via <strong className="text-emerald-400">MTN & Airtel MoMo</strong>.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 group"
            >
              <span>Get Started (Interactive Tree 🌳)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={onLogin}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-colors flex items-center justify-center gap-2 border border-slate-700"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>Log In to Account</span>
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-400" />
              <span>+2,500 RWF Welcome Bonus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-teal-400" />
              <span>MTN & Airtel MoMo Payouts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Banknote className="w-4 h-4 text-emerald-400" />
              <span>Instant Daily RWF Profits</span>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="space-y-8 max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-emerald-400">Simple 3-Step Process</span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">How Umurimo Rwanda Works</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Get started in under 2 minutes and begin earning daily automated profits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 backdrop-blur-md border border-slate-800 space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-6xl font-black text-slate-800/40 font-mono">01</div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-lg border border-emerald-500/20">
              🌳
            </div>
            <h3 className="text-lg font-bold text-white">1. Grow & Sign Up</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Explore our interactive welcome tree, pull the prosperity rope, and create your secure account with a 2,500 RWF instant registration bonus.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 backdrop-blur-md border border-slate-800 space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-6xl font-black text-slate-800/40 font-mono">02</div>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-lg border border-amber-500/20">
              ⚡
            </div>
            <h3 className="text-lg font-bold text-white">2. Complete Tasks & Invest</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Unlock the dashboard after logging in to access microtasks, YouTube engagement, surveys, and daily profit investment tiers.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/90 backdrop-blur-md border border-slate-800 space-y-4 shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 text-6xl font-black text-slate-800/40 font-mono">03</div>
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center font-bold text-lg border border-teal-500/20">
              💸
            </div>
            <h3 className="text-lg font-bold text-white">3. Withdraw via MoMo</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Request instant withdrawals directly to your MTN or Airtel Mobile Money phone number with secure automated verification.
            </p>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        <div className="p-8 rounded-3xl bg-slate-900/90 backdrop-blur-md border border-slate-800 space-y-6 shadow-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 text-xs font-semibold">
            <Gift className="w-3.5 h-3.5" />
            <span>Platform Advantages</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Why Thousands of Rwandans Trust Umurimo
          </h2>

          <div className="space-y-3">
            {[
              'Instant 2,500 RWF welcome registration bonus upon signup',
              'Automated 24-hour daily profit distribution from tier investments',
              'Referral network paying 500 RWF per invite + 10% product purchase commission',
              'Daily check-in streak rewards up to 600 RWF every 24 hours',
              'Fast Mobile Money payouts on MTN Mobile Money and Airtel Money'
            ].map((benefit, idx) => (
              <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={onGetStarted}
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-lg"
            >
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-emerald-400 mx-auto" />
          <h2 className="text-2xl font-black text-white">Frequently Asked Questions</h2>
          <p className="text-xs text-slate-400">Got questions? We have clear answers.</p>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How do I get my 2,500 RWF welcome bonus?',
              a: 'Simply click "Get Started", pull the interactive welcome tree rope, and create your account. The 2,500 RWF bonus is credited instantly to your wallet.'
            },
            {
              q: 'How does daily profit generation work?',
              a: 'When you purchase an investment product tier (from 5,000 RWF to 50,000 RWF) in your dashboard, our automated system credits your daily profit every 24 hours for 30 days.'
            },
            {
              q: 'How do I withdraw my earnings?',
              a: 'Withdrawals are processed instantly to MTN Mobile Money and Airtel Money once you have purchased at least one product tier to unlock your welcome bonus.'
            },
            {
              q: 'Is my account secure?',
              a: 'Yes! We use Supabase-grade security, hashed passwords, session tracking, and encrypted transactions.'
            }
          ].map((faq, idx) => (
            <div key={idx} className="p-5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-slate-800 space-y-2 shadow-sm">
              <h4 className="text-sm font-bold text-white">{faq.q}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
