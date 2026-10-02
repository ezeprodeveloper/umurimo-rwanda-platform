import React, { useState } from 'react';
import { User, ReferralRecord } from '../types';
import { store } from '../data/store';
import { Button } from './ui/Button';
import {
  Users,
  Copy,
  Check,
  Share2,
  Gift,
  DollarSign,
  TrendingUp,
  Sparkles,
  Phone,
  UserPlus,
  ExternalLink,
  MessageCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReferralSystemViewProps {
  currentUser: User;
  onOpenDeposit?: () => void;
}

export const ReferralSystemView: React.FC<ReferralSystemViewProps> = ({
  currentUser,
  onOpenDeposit
}) => {
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Invite Simulation / Test Modal state
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [testSuccessMessage, setTestSuccessMessage] = useState<string | null>(null);

  const referrals: ReferralRecord[] = store.getReferrals(currentUser.id);
  const activeReferralsCount = referrals.filter(
    (r) => r.status === 'product_bought' || r.status === 'active'
  ).length;

  const referralCode = currentUser.referralCode || 'UMURIMO-RW';
  const referralUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?ref=${referralCode}`
    : `https://umurimo.rw/?ref=${referralCode}`;

  const shareText = `Mwiriwe! Join Umurimo Rwanda now. Sign up to get an instant 2,500 RWF welcome bonus, earn daily profit from MTN/Airtel products, and complete micro-tasks! Use my referral code: ${referralCode} 👉 ${referralUrl}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralUrl);
    setCopiedLink(true);
    confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const handleTelegramShare = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(referralUrl)}&text=${encodeURIComponent('Join Umurimo Rwanda! Get 2,500 RWF bonus + daily profits')}`;
    window.open(url, '_blank');
  };

  const handleSimulateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!friendName.trim()) return;

    setIsSimulating(true);
    const res = store.simulateReferral(currentUser.id, friendName.trim(), friendPhone.trim());
    setIsSimulating(false);

    if (res.success) {
      confetti({
        particleCount: 65,
        spread: 70,
        origin: { y: 0.5 },
        colors: ['#10B981', '#F59E0B', '#3B82F6']
      });
      setTestSuccessMessage(res.message);
      setFriendName('');
      setFriendPhone('');
      setTimeout(() => setTestSuccessMessage(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-emerald-500/30 overflow-hidden shadow-xl">
        <div className="relative z-10 max-w-2xl space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
            <Gift className="w-3.5 h-3.5 text-amber-400" />
            <span>Official Umurimo Rwanda Referral Program</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Invite Friends & Earn Unlimited Cash! 🚀
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Share your unique referral link with friends, family, and groups. Earn{' '}
            <strong className="text-emerald-400">500 RWF</strong> instant registration bonus for every
            friend who signs up, plus a massive <strong className="text-amber-300">10% cash commission</strong> on
            every profit product they purchase!
          </p>

          <div className="pt-2 flex flex-wrap gap-2.5">
            <button
              onClick={handleWhatsAppShare}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Share to WhatsApp</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Referral Link'}</span>
            </button>
          </div>
        </div>

        {/* Ambient accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Referral Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Friends Invited</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums block">
            {currentUser.referralCount || referrals.length}
          </span>
          <span className="text-[10px] text-slate-500 block">Registered via your link</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Active Investors</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono tabular-nums block">
            {activeReferralsCount}
          </span>
          <span className="text-[10px] text-slate-500 block">Bought daily profit product</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Referral Earnings</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tabular-nums block">
            {(currentUser.referralEarnings || 0).toLocaleString()} RWF
          </span>
          <span className="text-[10px] text-slate-500 block">Credited to wallet balance</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Instant Commission</span>
            <Gift className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-xl sm:text-2xl font-black text-blue-300 font-mono tabular-nums block">
            500 RWF + 10%
          </span>
          <span className="text-[10px] text-slate-500 block">Per verified registration</span>
        </div>
      </div>

      {/* Share Box & Link Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Referral Code & Link Box */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Your Unique Referral Credentials</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Friends can enter your referral code when signing up or use your direct invite link.
            </p>
          </div>

          {/* Referral Code */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Your Referral Code</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-300 tracking-wider">
                {referralCode}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-700"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Referral Link */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-slate-300">Direct Share Link</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-300 truncate">
                {referralUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-950/40"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </button>
            </div>
          </div>

          {/* 1-Click Social Sharing */}
          <div className="pt-2 flex flex-wrap gap-2 border-t border-slate-800/80">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 min-w-[120px] py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleTelegramShare}
              className="flex-1 min-w-[120px] py-2 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 text-blue-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <ExternalLink className="w-4 h-4 text-blue-400" />
              <span>Telegram</span>
            </button>
          </div>
        </div>

        {/* How It Works & Rewards Breakdown */}
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3.5">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Commission Rules & Benefits</span>
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs">
                1
              </span>
              <div>
                <strong className="text-white block font-semibold">500 RWF Instant Sign-up Commission</strong>
                <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">
                  Whenever a friend signs up using your link or code, you immediately receive 500 RWF in your balance.
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-xs">
                2
              </span>
              <div>
                <strong className="text-white block font-semibold">10% Deposit Cashback</strong>
                <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">
                  When your referral purchases a daily profit product (from 5,000 to 50,000 RWF), you get 10% cash credited instantly (500 to 5,000 RWF).
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs">
                3
              </span>
              <div>
                <strong className="text-white block font-semibold">Withdrawable to MTN & Airtel Money</strong>
                <span className="text-slate-400 text-[11px] leading-relaxed block mt-0.5">
                  All referral commissions are 100% withdrawable to your Rwandan Mobile Money account.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test / Simulate Referral Invite Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/30 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-400" />
              <span>Simulate / Register an Invited Friend</span>
            </h3>
            <p className="text-xs text-slate-400">
              Test the referral system directly by simulating a friend registering under your referral code.
            </p>
          </div>
        </div>

        {testSuccessMessage && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{testSuccessMessage}</span>
          </div>
        )}

        <form onSubmit={handleSimulateInvite} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Friend's Full Name (e.g. Kwizera Eric)"
            value={friendName}
            onChange={(e) => setFriendName(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <input
            type="text"
            placeholder="Friend Phone (078... or 073...)"
            value={friendPhone}
            onChange={(e) => setFriendPhone(e.target.value)}
            className="w-full sm:w-48 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <Button
            type="submit"
            size="sm"
            variant="primary"
            isLoading={isSimulating}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Invite Friend (+500 RWF)
          </Button>
        </form>
      </div>

      {/* Referred Friends Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200">
            My Invited Friends ({referrals.length})
          </h3>
          <span className="text-xs text-slate-400">
            Total Bonus Earned: <strong className="text-emerald-400 font-mono">{referrals.reduce((sum, r) => sum + r.bonusEarned, 0).toLocaleString()} RWF</strong>
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white">No Referrals Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                You haven't invited anyone yet. Copy your referral link above and share it with friends to start earning instant 500 RWF rewards!
              </p>
            </div>
            <Button size="sm" variant="primary" onClick={handleCopyLink} icon={<Copy className="w-3.5 h-3.5" />}>
              Copy My Link
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-md">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Friend</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Bonus Earned</th>
                  <th className="py-3 px-4">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {referrals.map((ref) => {
                  const isProductActive = ref.status === 'product_bought' || ref.status === 'active';
                  // Mask phone for privacy
                  const maskedPhone = ref.referredUserPhone
                    ? `${ref.referredUserPhone.slice(0, 4)}***${ref.referredUserPhone.slice(-3)}`
                    : '078***123';

                  return (
                    <tr key={ref.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-xs">
                          {ref.referredUserName.charAt(0)}
                        </div>
                        <span>{ref.referredUserName}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400">
                        {maskedPhone}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            isProductActive
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-blue-500/20 text-blue-300'
                          }`}
                        >
                          {isProductActive ? 'Product Active (+10%)' : 'Registered'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        +{ref.bonusEarned.toLocaleString()} RWF
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(ref.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
