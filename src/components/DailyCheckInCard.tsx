import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { store } from '../data/store';
import {
  CalendarCheck,
  Flame,
  CheckCircle2,
  Lock,
  Clock,
  Sparkles,
  Gift,
  Coins,
  Award,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface DailyCheckInCardProps {
  currentUser: User;
  onSelectTab?: (tab: string) => void;
}

export const DailyCheckInCard: React.FC<DailyCheckInCardProps> = ({ currentUser, onSelectTab }) => {
  const [status, setStatus] = useState(() => store.getDailyCheckInStatus(currentUser.id));
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isClaiming, setIsClaiming] = useState(false);
  const [justClaimedReward, setJustClaimedReward] = useState<{ amount: number; streak: number } | null>(null);

  // Sync status whenever currentUser updates or store notifies
  useEffect(() => {
    setStatus(store.getDailyCheckInStatus(currentUser.id));
  }, [currentUser]);

  // Live countdown timer for the 24-hour cycle
  useEffect(() => {
    const updateCountdown = () => {
      const currentStatus = store.getDailyCheckInStatus(currentUser.id);
      setStatus(currentStatus);

      if (!currentStatus.canClaim && currentStatus.remainingMs > 0) {
        const totalSecs = Math.max(0, Math.floor(currentStatus.remainingMs / 1000));
        const hours = Math.floor(totalSecs / 3600);
        const minutes = Math.floor((totalSecs % 3600) / 60);
        const seconds = totalSecs % 60;
        setTimeLeft({ hours, minutes, seconds });
      } else {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [currentUser.id]);

  const handleClaim = () => {
    if (isClaiming || !status.canClaim) return;

    setIsClaiming(true);
    const res = store.claimDailyCheckIn(currentUser.id);

    if (res.success) {
      // Trigger Rwandan flag themed confetti blast
      confetti({
        particleCount: 90,
        spread: 85,
        origin: { y: 0.6 },
        colors: ['#00A3E0', '#FAD201', '#20603D', '#10B981', '#F59E0B']
      });

      // Extra burst for Day 7 milestone
      if (res.streak === 7) {
        setTimeout(() => {
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#FFD700', '#FFA500', '#10B981']
          });
        }, 300);
      }

      setJustClaimedReward({ amount: res.reward, streak: res.streak });
      setStatus(store.getDailyCheckInStatus(currentUser.id));

      setTimeout(() => {
        setJustClaimedReward(null);
      }, 5000);
    }
    setIsClaiming(false);
  };

  const streakDays = [
    { day: 1, reward: 100, label: 'Day 1' },
    { day: 2, reward: 150, label: 'Day 2' },
    { day: 3, reward: 200, label: 'Day 3' },
    { day: 4, reward: 250, label: 'Day 4' },
    { day: 5, reward: 300, label: 'Day 5' },
    { day: 6, reward: 400, label: 'Day 6' },
    { day: 7, reward: 600, label: 'Day 7 VIP', isSpecial: true }
  ];

  // Active day index (0-based) for the next claim
  const targetDayNum = status.canClaim ? status.nextStreak : status.currentStreak;

  return (
    <div className="relative rounded-3xl p-5 sm:p-6 bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 border border-emerald-500/20 shadow-xl overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Top Header: Badge, Title & Streak Counter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3.5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
              <CalendarCheck className="w-3.5 h-3.5" />
              <span>24-Hour Daily Check-in</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>Claim Free Daily Reward</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              Claim every 24 hours to grow your streak and earn up to <span className="text-emerald-400 font-bold">600 RWF</span> on Day 7!
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Streak Counter Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
              <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
              <div className="text-left">
                <span className="text-[10px] text-amber-400/80 font-medium block leading-none">Current Streak</span>
                <span className="text-xs font-black font-mono leading-none">
                  {status.currentStreak} {status.currentStreak === 1 ? 'Day' : 'Days'}
                </span>
              </div>
            </div>

            {/* Total Check-in Earnings */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">
              <Coins className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-none">Total Claimed</span>
                <span className="text-xs font-bold font-mono leading-none text-emerald-300">
                  {status.totalEarned.toLocaleString()} RWF
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Celebration Announcement Toast when user claims */}
        {justClaimedReward && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                🎉
              </div>
              <div>
                <span className="text-xs font-bold block">
                  Reward Claimed Successfully!
                </span>
                <span className="text-[11px] text-emerald-100">
                  +{justClaimedReward.amount} RWF added to your wallet balance (Day {justClaimedReward.streak} Streak)!
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-black bg-white/20 px-2.5 py-1 rounded-xl">
              +{justClaimedReward.amount} RWF
            </span>
          </div>
        )}

        {/* 7-Day Progressive Streak Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
          {streakDays.map((item) => {
            const isCompleted = item.day <= status.currentStreak && !status.canClaim;
            const isTodayReady = status.canClaim && item.day === status.nextStreak;
            const isCurrentClaimedToday = !status.canClaim && item.day === status.currentStreak;
            const isUpcoming = item.day > (status.canClaim ? status.nextStreak : status.currentStreak);

            return (
              <div
                key={item.day}
                className={`relative rounded-2xl p-2.5 text-center flex flex-col items-center justify-between transition-all ${
                  isTodayReady
                    ? 'bg-gradient-to-b from-emerald-500/20 to-emerald-600/30 border-2 border-emerald-400 shadow-lg shadow-emerald-950/50 scale-102 ring-2 ring-emerald-500/30'
                    : isCompleted || isCurrentClaimedToday
                    ? 'bg-slate-900/90 border border-emerald-500/30 text-emerald-300'
                    : item.isSpecial
                    ? 'bg-amber-500/10 border border-amber-500/30 text-amber-200'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400'
                }`}
              >
                {/* Special Tag for Day 7 */}
                {item.isSpecial && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider shadow">
                    Bonus
                  </span>
                )}

                <div className="w-full flex items-center justify-between text-[10px] font-semibold mb-1">
                  <span className={isTodayReady ? 'text-emerald-300 font-bold' : ''}>
                    D{item.day}
                  </span>
                  {isCompleted || isCurrentClaimedToday ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : isTodayReady ? (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  ) : (
                    <Lock className="w-3 h-3 text-slate-600" />
                  )}
                </div>

                <div className="my-1">
                  {item.isSpecial ? (
                    <Gift className={`w-5 h-5 mx-auto ${isTodayReady ? 'text-amber-400 animate-bounce' : 'text-amber-500/70'}`} />
                  ) : (
                    <Coins className={`w-4 h-4 mx-auto ${isTodayReady ? 'text-emerald-400' : isCompleted ? 'text-emerald-400' : 'text-slate-600'}`} />
                  )}
                </div>

                <div className="mt-1">
                  <span className={`text-[11px] font-mono font-bold block ${
                    isTodayReady
                      ? 'text-white'
                      : isCompleted || isCurrentClaimedToday
                      ? 'text-emerald-400'
                      : item.isSpecial
                      ? 'text-amber-300'
                      : 'text-slate-400'
                  }`}>
                    +{item.reward}
                  </span>
                  <span className="text-[9px] text-slate-500 block">RWF</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bar: Either 'Claim Now' or Countdown until next cycle */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70 p-3.5 rounded-2xl border border-slate-800">
          {status.canClaim ? (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-center sm:text-left">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <Award className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    Day {status.nextStreak} Reward Ready to Claim!
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Get <strong className="text-emerald-400 font-mono">+{status.nextReward} RWF</strong> added directly to your withdrawable balance.
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-emerald-950/60 hover:shadow-emerald-900/60 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-slate-950" />
                <span>Claim +{status.nextReward} RWF Today</span>
              </button>
            </div>
          ) : (
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-center sm:text-left">
                <div className="w-9 h-9 rounded-xl bg-slate-900 text-slate-400 flex items-center justify-center shrink-0 border border-slate-800">
                  <Clock className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block">
                    Today's Check-in Complete! Come back in:
                  </span>
                  <span className="text-[11px] text-slate-400 block">
                    Next reward: <strong className="text-emerald-400 font-mono">Day {status.nextStreak} (+{status.nextReward} RWF)</strong>
                  </span>
                </div>
              </div>

              {/* Countdown Digits */}
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-emerald-300 font-bold">
                  {String(timeLeft.hours).padStart(2, '0')}h
                </div>
                <span className="text-slate-600">:</span>
                <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-emerald-300 font-bold">
                  {String(timeLeft.minutes).padStart(2, '0')}m
                </div>
                <span className="text-slate-600">:</span>
                <div className="bg-slate-900 border border-slate-800 px-2 py-1 rounded-lg text-emerald-300 font-bold">
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
