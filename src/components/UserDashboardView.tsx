import React, { useState } from 'react';
import { User, ProductPurchase, Task } from '../types';
import { Button } from './ui/Button';
import { store } from '../data/store';
import {
  Wallet,
  TrendingUp,
  Gift,
  ArrowDownRight,
  PlusCircle,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Layers,
  CheckSquare,
  ChevronRight,
  ShieldCheck,
  Video,
  User as UserIcon,
  Users,
  Copy,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DailyCheckInCard } from './DailyCheckInCard';

interface UserDashboardViewProps {
  currentUser: User;
  onOpenDeposit: (tierAmount?: number) => void;
  onOpenWithdraw: () => void;
  onOpenCreateTask: () => void;
  onOpenProfile?: () => void;
  onSelectTab: (tab: string) => void;
  onSelectTaskToSubmit: (task: Task) => void;
}

export const UserDashboardView: React.FC<UserDashboardViewProps> = ({
  currentUser,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenCreateTask,
  onOpenProfile,
  onSelectTab,
  onSelectTaskToSubmit
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [profitNotice, setProfitNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const purchases = store.getPurchases().filter((p) => p.userId === currentUser.id);
  const approvedPurchases = purchases.filter((p) => p.status === 'approved');
  const tasks = store.getTasks().filter((t) => t.status === 'published').slice(0, 3);

  const handleCopyReferralCode = () => {
    if (currentUser.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode);
      setCopiedCode(true);
      confetti({ particleCount: 25, spread: 50, origin: { y: 0.6 } });
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleClaimProfit = () => {
    const res = store.claimDailyProfit(currentUser.id);
    if (res.success) {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10B981', '#F59E0B', '#3B82F6']
      });
      setProfitNotice({ type: 'success', message: 'Daily profit claimed and added to your balance!' });
    } else {
      setProfitNotice({ type: 'error', message: res.message });
    }
    setTimeout(() => setProfitNotice(null), 5000);
  };

  const totalDailyProfitRate = approvedPurchases.reduce(
    (acc, curr) => acc + curr.dailyProfitAmount,
    0
  );

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Welcome to Umurimo Rwanda</span>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Hello, {currentUser.name}! 👋
            </h2>
            {onOpenProfile && (
              <button
                type="button"
                onClick={onOpenProfile}
                className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            This is your personal earning dashboard. Claim your 24h daily check-in reward, invite friends for instant commissions, complete micro-tasks, and withdraw money via MTN & Airtel MoMo.
          </p>

          {/* Quick Actions Bar */}
          <div className="pt-3 flex flex-wrap gap-2.5">
            <Button
              size="sm"
              variant="primary"
              onClick={() => onOpenDeposit()}
              icon={<Layers className="w-4 h-4" />}
            >
              Buy Product (Deposit)
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={onOpenWithdraw}
              icon={<ArrowDownRight className="w-4 h-4" />}
            >
              Withdraw Money
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSelectTab('referrals')}
              icon={<Gift className="w-4 h-4 text-amber-400" />}
            >
              Refer Friends (+500 RWF)
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSelectTab('videos')}
              icon={<Video className="w-4 h-4 text-emerald-400" />}
            >
              Watch Videos
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => onSelectTab('surveys')}
              icon={<CheckSquare className="w-4 h-4 text-amber-400" />}
            >
              Surveys
            </Button>

            <Button
              size="sm"
              variant="secondary"
              onClick={onOpenCreateTask}
              icon={<PlusCircle className="w-4 h-4 text-emerald-400" />}
            >
              Post a Task
            </Button>
          </div>
        </div>

        {/* Scenic Background image scrim */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none hidden md:block">
          <img
            src="/src/assets/images/rwanda_nature_banner_1790691623702.jpg"
            alt="Rwanda landscape"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Bonus Warning Lock if user hasn't bought any product yet */}
      {!currentUser.hasBoughtProduct && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1 text-xs">
            <span className="font-bold text-amber-300 text-sm block">
              Your 2,500 RWF Registration Bonus is in your wallet!
            </span>
            <p className="text-slate-300 mt-1 leading-relaxed">
              Security Policy: You cannot withdraw your registration bonus or funds until you buy at
              least one daily profit product starting from 5,000 RWF.
            </p>
            <div className="mt-2.5">
              <Button size="sm" variant="primary" onClick={() => onOpenDeposit(5000)}>
                Buy 1 Product to Unlock Withdrawals
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 24-HOUR DAILY CHECK-IN COMPONENT */}
      <DailyCheckInCard currentUser={currentUser} onSelectTab={onSelectTab} />

      {/* Referral Quick Highlight Bar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Invite Friends & Earn Real Money</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                +500 RWF / Friend + 10%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Your Code: <strong className="text-amber-300 font-mono">{currentUser.referralCode || 'UMURIMO-RW'}</strong> · Invited: {currentUser.referralCount || 0} friends
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={handleCopyReferralCode}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
          </button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onSelectTab('referrals')}
            icon={<ChevronRight className="w-3.5 h-3.5" />}
          >
            Referral Hub
          </Button>
        </div>
      </div>

      {/* Financial Metrics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Balance Card */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Available Balance</span>
            <Wallet className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono tabular-nums block">
            {currentUser.balance.toLocaleString()} RWF
          </span>
          <span className="text-[10px] text-slate-400 block">Eligible to withdraw</span>
        </div>

        {/* Daily Profit Rate */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Daily Profit</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums block">
            +{totalDailyProfitRate.toLocaleString()} RWF
          </span>
          <span className="text-[10px] text-slate-400 block">Every 24 hours</span>
        </div>

        {/* Registration Bonus */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Registration Bonus</span>
            <Gift className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tabular-nums block">
            2,500 RWF
          </span>
          <span className="text-[10px] text-slate-400 block">
            {currentUser.hasBoughtProduct ? '✓ Unlocked (Withdrawable)' : '🔒 Locked (Buy a Product)'}
          </span>
        </div>

        {/* Total Earned */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Earnings</span>
            <ShieldCheck className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-slate-100 font-mono tabular-nums block">
            {currentUser.totalEarned.toLocaleString()} RWF
          </span>
          <span className="text-[10px] text-slate-400 block">
            Total Withdrawn: {currentUser.totalWithdrawn.toLocaleString()} RWF
          </span>
        </div>
      </div>

      {/* Claim Daily Profit Section */}
      {approvedPurchases.length > 0 && (
        <div className="space-y-3">
          {profitNotice && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                profitNotice.type === 'success'
                  ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
              }`}
            >
              <span>{profitNotice.message}</span>
              <button
                type="button"
                onClick={() => setProfitNotice(null)}
                className="text-slate-400 hover:text-white text-xs ml-2"
              >
                ✕
              </button>
            </div>
          )}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs font-bold text-emerald-400 block uppercase tracking-wider">
                Your Daily Profit
              </span>
            <h3 className="text-base font-bold text-white">
              You have {approvedPurchases.length} active profit products earning daily!
            </h3>
            <p className="text-xs text-slate-400">
              Click this button to credit {totalDailyProfitRate.toLocaleString()} RWF to your wallet
              immediately.
            </p>
          </div>

          <Button
            size="md"
            variant="primary"
            onClick={handleClaimProfit}
            icon={<Sparkles className="w-4 h-4 text-amber-300" />}
          >
            Claim Today's Profit (+{totalDailyProfitRate.toLocaleString()} RWF)
          </Button>
          </div>
        </div>
      )}

      {/* Active Investment Products */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">
            My Earning Products
          </h3>
          <button
            onClick={() => onSelectTab('products')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>View all products</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {purchases.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
            <Layers className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-xs text-slate-400">You have not bought any earning products yet.</p>
            <Button size="sm" variant="primary" onClick={() => onOpenDeposit(5000)}>
              Buy 5,000 RWF Product
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {purchases.map((p) => {
              const isApproved = p.status === 'approved';

              return (
                <div
                  key={p.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 shadow-md"
                >
                  <div className="flex justify-between items-start">
                    <span className="font-mono text-sm font-bold text-white">
                      {p.tierAmount.toLocaleString()} RWF
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isApproved
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {isApproved ? 'Active (Approved)' : 'Pending Approval'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Daily Return:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        +{p.dailyProfitAmount.toLocaleString()} RWF
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Payment:</span>
                      <span className="text-slate-200">{p.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Total Profit Earned:</span>
                      <span className="font-mono font-bold text-slate-100">
                        {p.totalProfitEarned.toLocaleString()} RWF
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Available Tasks Preview */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">
            Available Micro-Tasks
          </h3>
          <button
            onClick={() => onSelectTab('tasks')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1 font-medium"
          >
            <span>View all tasks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-1">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase">
                    {task.type.replace('_', ' ')}
                  </span>
                  <span className="font-mono font-bold text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    +{task.rewardPerTask.toLocaleString()} RWF
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-100 line-clamp-2">{task.title}</h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{task.description}</p>
              </div>

              <Button
                size="sm"
                variant="primary"
                className="w-full"
                onClick={() => onSelectTaskToSubmit(task)}
              >
                Start Task (+{task.rewardPerTask} RWF)
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
