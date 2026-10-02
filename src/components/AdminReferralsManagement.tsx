import React, { useState, useMemo } from 'react';
import { User, ReferralRecord } from '../types';
import { store } from '../data/store';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import {
  Users,
  UserCheck,
  UserPlus,
  Gift,
  Award,
  Share2,
  Link as LinkIcon,
  ArrowRight,
  Shield,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Download,
  DollarSign,
  Edit3,
  Lock,
  Unlock,
  MessageSquare,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Phone,
  MapPin,
  Calendar,
  Wallet,
  TrendingUp,
  Clock,
  UserX
} from 'lucide-react';

interface AdminReferralsManagementProps {
  onOpenChatWithUser?: (userId: string) => void;
}

export const AdminReferralsManagement: React.FC<AdminReferralsManagementProps> = ({
  onOpenChatWithUser
}) => {
  const users = store.getUsers();
  const allReferrals = store.getAllReferrals();

  // Active view tab: 'inviters' | 'invited' | 'tree' | 'orphans'
  const [activeSubTab, setActiveSubTab] = useState<'inviters' | 'invited' | 'tree' | 'orphans'>('inviters');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'product_bought' | 'active' | 'revoked'>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');

  // Notification Toast state inside component
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Modals state
  const [selectedInviterForBonus, setSelectedInviterForBonus] = useState<User | null>(null);
  const [bonusAmountInput, setBonusAmountInput] = useState<number>(1000);
  const [bonusReasonInput, setBonusReasonInput] = useState<string>('Top Community Promoter Reward');

  const [selectedUserForCodeEdit, setSelectedUserForCodeEdit] = useState<User | null>(null);
  const [newReferralCodeInput, setNewReferralCodeInput] = useState<string>('');

  const [selectedReferralToReassign, setSelectedReferralToReassign] = useState<ReferralRecord | null>(null);
  const [reassignNewInviterId, setReassignNewInviterId] = useState<string>('');
  const [reassignCreditBonus, setReassignCreditBonus] = useState<boolean>(true);

  const [selectedReferralToRevoke, setSelectedReferralToRevoke] = useState<ReferralRecord | null>(null);
  const [revokeReasonInput, setRevokeReasonInput] = useState<string>('Suspicious or self-referral detected');
  const [revokeDeductBonus, setRevokeDeductBonus] = useState<boolean>(true);

  const [selectedReferralToAdjust, setSelectedReferralToAdjust] = useState<ReferralRecord | null>(null);
  const [adjustAmountInput, setAdjustAmountInput] = useState<number>(500);
  const [adjustReasonInput, setAdjustReasonInput] = useState<string>('Tier upgrade commission correction');

  const [isManualPairModalOpen, setIsManualPairModalOpen] = useState(false);
  const [manualInviterId, setManualInviterId] = useState<string>('');
  const [manualReferredUserId, setManualReferredUserId] = useState<string>('');
  const [manualBonusAmount, setManualBonusAmount] = useState<number>(500);
  const [manualMarkProductBought, setManualMarkProductBought] = useState<boolean>(false);

  const [viewingInviterNetwork, setViewingInviterNetwork] = useState<User | null>(null);

  // --- DERIVED METRICS ---
  // Inviters are users who either have referralCount > 0, referralEarnings > 0, or have at least 1 record in referrals
  const invitersList = useMemo(() => {
    return users.filter((u) => {
      const hasRecords = allReferrals.some((r) => r.referrerId === u.id);
      return (u.referralCount || 0) > 0 || (u.referralEarnings || 0) > 0 || hasRecords;
    });
  }, [users, allReferrals]);

  // Orphan users: members who have no referredBy set
  const orphanUsers = useMemo(() => {
    return users.filter((u) => u.role === 'user' && !u.referredBy);
  }, [users]);

  // Platform Metrics
  const totalInvitersCount = invitersList.length;
  const totalReferralRecordsCount = allReferrals.length;
  const productBoughtRecordsCount = allReferrals.filter((r) => r.status === 'product_bought' || r.status === 'active').length;
  const totalCommissionsPaid = allReferrals.reduce((sum, r) => sum + (r.bonusEarned || 0), 0);
  const conversionRate = totalReferralRecordsCount > 0 ? Math.round((productBoughtRecordsCount / totalReferralRecordsCount) * 100) : 0;

  // Filtered Inviters
  const filteredInviters = useMemo(() => {
    return invitersList.filter((inv) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        inv.name.toLowerCase().includes(q) ||
        inv.phone.includes(q) ||
        (inv.referralCode && inv.referralCode.toLowerCase().includes(q)) ||
        (inv.district && inv.district.toLowerCase().includes(q));

      const matchesDistrict = districtFilter === 'all' || inv.district === districtFilter;
      return matchesSearch && matchesDistrict;
    });
  }, [invitersList, searchQuery, districtFilter]);

  // Filtered Referral Records
  const filteredReferrals = useMemo(() => {
    return allReferrals.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        r.referredUserName.toLowerCase().includes(q) ||
        r.referredUserPhone.includes(q) ||
        r.referrerCode.toLowerCase().includes(q) ||
        (r.adminNotes && r.adminNotes.toLowerCase().includes(q));

      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [allReferrals, searchQuery, statusFilter]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['Record ID', 'Inviter Name', 'Inviter Code', 'Invited User Name', 'Invited User Phone', 'Status', 'Bonus Earned (RWF)', 'Date', 'Admin Notes'];
    const rows = allReferrals.map((r) => {
      const referrerUser = users.find((u) => u.id === r.referrerId);
      return [
        r.id,
        referrerUser ? `"${referrerUser.name}"` : 'Unknown',
        r.referrerCode,
        `"${r.referredUserName}"`,
        `"${r.referredUserPhone}"`,
        r.status,
        r.bonusEarned,
        new Date(r.createdAt).toLocaleDateString(),
        `"${r.adminNotes || ''}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `umurimo_referrals_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported referral network report (CSV) successfully!');
  };

  // Handlers for Admin actions
  const handleCreditBonusSubmit = () => {
    if (!selectedInviterForBonus) return;
    const res = store.adminCreditReferralBonus(selectedInviterForBonus.id, bonusAmountInput, bonusReasonInput);
    if (res.success) {
      showToast(res.message);
      setSelectedInviterForBonus(null);
    } else {
      alert(res.message);
    }
  };

  const handleUpdateCodeSubmit = () => {
    if (!selectedUserForCodeEdit) return;
    const res = store.adminUpdateUserReferralCode(selectedUserForCodeEdit.id, newReferralCodeInput);
    if (res.success) {
      showToast(res.message);
      setSelectedUserForCodeEdit(null);
    } else {
      alert(res.message);
    }
  };

  const handleToggleLock = (user: User) => {
    const res = store.adminToggleReferralLock(user.id);
    showToast(res.message);
  };

  const handleReassignSubmit = () => {
    if (!selectedReferralToReassign || !reassignNewInviterId) return;
    const res = store.adminReassignInviter(
      selectedReferralToReassign.referredUserId,
      reassignNewInviterId,
      reassignCreditBonus
    );
    if (res.success) {
      showToast(res.message);
      setSelectedReferralToReassign(null);
      setReassignNewInviterId('');
    } else {
      alert(res.message);
    }
  };

  const handleRevokeSubmit = () => {
    if (!selectedReferralToRevoke) return;
    const res = store.adminRevokeReferral(selectedReferralToRevoke.id, revokeReasonInput, revokeDeductBonus);
    if (res.success) {
      showToast(res.message);
      setSelectedReferralToRevoke(null);
    } else {
      alert(res.message);
    }
  };

  const handleAdjustBonusSubmit = () => {
    if (!selectedReferralToAdjust) return;
    const res = store.adminAdjustReferralRecordBonus(
      selectedReferralToAdjust.id,
      adjustAmountInput,
      adjustReasonInput
    );
    if (res.success) {
      showToast(res.message);
      setSelectedReferralToAdjust(null);
    } else {
      alert(res.message);
    }
  };

  const handleManualPairSubmit = () => {
    if (!manualInviterId || !manualReferredUserId) {
      alert('Please select both the inviter and the invited member.');
      return;
    }
    const res = store.adminCreateReferralPair(
      manualInviterId,
      manualReferredUserId,
      manualBonusAmount,
      manualMarkProductBought
    );
    if (res.success) {
      showToast(res.message);
      setIsManualPairModalOpen(false);
      setManualInviterId('');
      setManualReferredUserId('');
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-16 right-4 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-2xl flex items-center gap-3 border border-emerald-400 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Quick Controls */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Share2 className="w-3.5 h-3.5" />
            <span>Referral Network & Affiliates Control</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>Inviters & Invited Management</span>
            <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {allReferrals.length} Total Connections
            </span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            Audit inviter leaders, inspect all invited friends, reassign inviters, adjust cash commissions,
            freeze fraudulent accounts, and connect unassigned members.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 text-slate-200 hover:bg-slate-800"
            icon={<Download className="w-4 h-4 text-emerald-400" />}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>

          <Button
            size="sm"
            variant="primary"
            className="!bg-emerald-600 hover:!bg-emerald-500 text-white shadow-lg shadow-emerald-950/40"
            icon={<UserPlus className="w-4 h-4" />}
            onClick={() => setIsManualPairModalOpen(true)}
          >
            + Link Inviter & Member
          </Button>
        </div>
      </div>

      {/* High-Level Referral Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Inviters */}
        <div
          onClick={() => setActiveSubTab('inviters')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeSubTab === 'inviters'
              ? 'bg-amber-950/20 border-amber-500/50 shadow-lg ring-1 ring-amber-500/30'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Inviters</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{totalInvitersCount}</span>
            <span className="text-[11px] text-amber-400 font-semibold">Active Promoters</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">Users who brought friends</span>
        </div>

        {/* Metric 2: Total Invited */}
        <div
          onClick={() => setActiveSubTab('invited')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeSubTab === 'invited'
              ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg ring-1 ring-emerald-500/30'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Total Invited Friends</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">
              {totalReferralRecordsCount}
            </span>
            <span className="text-[11px] text-emerald-400 font-semibold">Joined via links</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            {productBoughtRecordsCount} bought investment products
          </span>
        </div>

        {/* Metric 3: Total Commissions Paid */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Commissions Paid</span>
            <Wallet className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-purple-300 font-mono">
              {totalCommissionsPaid.toLocaleString()}
            </span>
            <span className="text-xs text-purple-400 font-semibold">RWF</span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            Registration + 10% tier bonuses
          </span>
        </div>

        {/* Metric 4: Conversion Rate & Orphans */}
        <div
          onClick={() => setActiveSubTab('orphans')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeSubTab === 'orphans'
              ? 'bg-blue-950/20 border-blue-500/50 shadow-lg ring-1 ring-blue-500/30'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Conversion & Orphans</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-blue-400 font-mono">{conversionRate}%</span>
            <span className="text-[11px] text-slate-300">
              ({orphanUsers.length} unassigned)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 block mt-1">
            Click to assign orphan members
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs & Filtering Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        {/* Sub-Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveSubTab('inviters')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'inviters'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Inviters ({invitersList.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('invited')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'invited'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>All Invited Friends ({allReferrals.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('tree')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'tree'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Network Tree View</span>
          </button>

          <button
            onClick={() => setActiveSubTab('orphans')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'orphans'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            <span>Unassigned ({orphanUsers.length})</span>
          </button>
        </div>

        {/* Search Bar & Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search member, phone, code..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {activeSubTab === 'invited' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="registered">Registered (+500 RWF)</option>
              <option value="product_bought">Bought Product (+10%)</option>
              <option value="active">Active Earner</option>
              <option value="revoked">Revoked / Suspended</option>
            </select>
          )}
        </div>
      </div>

      {/* SUB-VIEW 1: INVITERS (REFERRAL LEADERS) */}
      {activeSubTab === 'inviters' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {filteredInviters.length} inviter{filteredInviters.length === 1 ? '' : 's'}. You can grant bonuses, edit codes, or view full networks.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredInviters.map((inviter) => {
              const inviterRecords = allReferrals.filter((r) => r.referrerId === inviter.id);
              const investedCount = inviterRecords.filter((r) => r.status === 'product_bought' || r.status === 'active').length;
              const totalEarnedFromRecords = inviterRecords.reduce((sum, r) => sum + (r.bonusEarned || 0), 0);

              return (
                <div
                  key={inviter.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    inviter.referralLocked
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-slate-900 border-slate-800 shadow-md hover:border-slate-700'
                  }`}
                >
                  {/* Top user header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={inviter.avatar}
                        alt={inviter.name}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                        }}
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{inviter.name}</h4>
                          {inviter.role === 'admin' && (
                            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px] font-bold">
                              Admin
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono block">
                          {inviter.phone}
                        </span>
                        <span className="text-[10px] text-slate-500 block truncate">
                          {inviter.district || 'Rwanda'}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div>
                      {inviter.referralLocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          Locked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Referral Code Banner */}
                  <div className="mt-3 p-2 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase font-semibold block">Referral Code</span>
                      <span className="font-mono text-xs font-black text-amber-300 tracking-wider">
                        {inviter.referralCode}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedUserForCodeEdit(inviter);
                        setNewReferralCodeInput(inviter.referralCode);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
                      title="Edit referral code"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Inviter Stats Grid */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-slate-950/40">
                      <span className="text-[10px] text-slate-400 block">Invited</span>
                      <span className="font-mono text-sm font-bold text-white">
                        {inviter.referralCount || inviterRecords.length}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/40">
                      <span className="text-[10px] text-slate-400 block">Investors</span>
                      <span className="font-mono text-sm font-bold text-emerald-400">
                        {investedCount}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-950/40">
                      <span className="text-[10px] text-slate-400 block">Earned</span>
                      <span className="font-mono text-xs font-bold text-purple-300 block truncate">
                        {(inviter.referralEarnings || totalEarnedFromRecords).toLocaleString()} RWF
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-3 pt-2.5 border-t border-slate-800 flex flex-wrap items-center gap-1.5">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1 text-[11px] py-1.5"
                      icon={<Users className="w-3 h-3 text-emerald-400" />}
                      onClick={() => setViewingInviterNetwork(inviter)}
                    >
                      View ({inviterRecords.length})
                    </Button>

                    <Button
                      size="sm"
                      variant="primary"
                      className="text-[11px] py-1.5 !bg-amber-600 hover:!bg-amber-500 text-white"
                      icon={<Gift className="w-3 h-3" />}
                      onClick={() => {
                        setSelectedInviterForBonus(inviter);
                        setBonusAmountInput(1000);
                        setBonusReasonInput(`Promoter award for ${inviter.name}`);
                      }}
                    >
                      + Bonus
                    </Button>

                    <button
                      onClick={() => handleToggleLock(inviter)}
                      className={`p-2 rounded-xl border text-xs transition-colors ${
                        inviter.referralLocked
                          ? 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-950/30'
                          : 'border-rose-500/30 text-rose-400 hover:bg-rose-950/30'
                      }`}
                      title={inviter.referralLocked ? 'Unlock referral earnings' : 'Lock referral earnings'}
                    >
                      {inviter.referralLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    </button>

                    {onOpenChatWithUser && (
                      <button
                        onClick={() => onOpenChatWithUser(inviter.id)}
                        className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        title="Chat with inviter"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: ALL INVITED FRIENDS & CONNECTIONS TABLE */}
      {activeSubTab === 'invited' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing {filteredReferrals.length} referral connection{filteredReferrals.length === 1 ? '' : 's'}. You can reassign inviters, adjust bonuses, or revoke records.
            </span>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-md">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Invited Member</th>
                  <th className="py-3 px-4">Invited By (Referrer)</th>
                  <th className="py-3 px-4">Status & Progress</th>
                  <th className="py-3 px-4">Bonus Earned</th>
                  <th className="py-3 px-4">Date Joined</th>
                  <th className="py-3 px-4 text-right">Administrative Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredReferrals.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                      No referral records match your filters.
                    </td>
                  </tr>
                ) : (
                  filteredReferrals.map((rec) => {
                    const referrerUser = users.find((u) => u.id === rec.referrerId);
                    const invitedUser = users.find((u) => u.id === rec.referredUserId);

                    return (
                      <tr key={rec.id} className="hover:bg-slate-850/50 transition-colors">
                        {/* Invited Member Column */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {rec.referredUserName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-slate-100 block truncate">
                                {rec.referredUserName}
                              </span>
                              <span className="text-[11px] font-mono text-slate-400 block">
                                {rec.referredUserPhone}
                              </span>
                              {invitedUser && (
                                <span className="text-[10px] text-slate-500 block">
                                  {invitedUser.district || 'Member'}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Inviter Column */}
                        <td className="py-3 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-200">
                                {referrerUser ? referrerUser.name : 'Unknown User'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono text-[10px] font-bold">
                                {rec.referrerCode}
                              </span>
                              {referrerUser && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {referrerUser.phone}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Status Column */}
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {rec.status === 'product_bought' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                Product Bought (+10%)
                              </span>
                            )}
                            {rec.status === 'registered' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold">
                                <Clock className="w-3 h-3 text-blue-400" />
                                Registered (500 RWF)
                              </span>
                            )}
                            {rec.status === 'active' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                                Active Earner
                              </span>
                            )}
                            {rec.status === 'revoked' && (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                                <XCircle className="w-3 h-3 text-rose-400" />
                                Revoked
                              </span>
                            )}

                            {rec.adminNotes && (
                              <span className="block text-[10px] text-slate-400 italic">
                                Note: {rec.adminNotes}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Bonus Earned */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1">
                            <span className="font-mono font-bold text-sm text-emerald-400">
                              +{(rec.bonusEarned || 0).toLocaleString()}
                            </span>
                            <span className="text-[10px] text-slate-400">RWF</span>
                          </div>
                        </td>

                        {/* Date Joined */}
                        <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                          {new Date(rec.createdAt).toLocaleDateString('en-GB', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>

                        {/* Management Actions */}
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Reassign Inviter */}
                            <Button
                              size="sm"
                              variant="secondary"
                              className="text-[11px] py-1 px-2"
                              icon={<RefreshCw className="w-3 h-3 text-blue-400" />}
                              onClick={() => {
                                setSelectedReferralToReassign(rec);
                                setReassignNewInviterId(rec.referrerId);
                              }}
                              title="Reassign to another inviter"
                            >
                              Reassign
                            </Button>

                            {/* Adjust Bonus */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-[11px] py-1 px-2 border-slate-700"
                              icon={<DollarSign className="w-3 h-3 text-amber-400" />}
                              onClick={() => {
                                setSelectedReferralToAdjust(rec);
                                setAdjustAmountInput(rec.bonusEarned || 500);
                              }}
                              title="Adjust bonus amount"
                            >
                              Bonus
                            </Button>

                            {/* Revoke / Reinstate */}
                            {rec.status !== 'revoked' ? (
                              <button
                                onClick={() => {
                                  setSelectedReferralToRevoke(rec);
                                  setRevokeReasonInput('Admin audit: duplicate or invalid registration');
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                                title="Revoke referral connection"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => {
                                  store.adminUpdateReferralStatus(rec.id, 'registered', 'Reinstated by Admin');
                                  showToast('Referral connection reinstated.');
                                }}
                                className="p-1.5 rounded-lg text-emerald-400 hover:bg-emerald-950/30 transition-colors"
                                title="Reinstate referral"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}

                            {onOpenChatWithUser && invitedUser && (
                              <button
                                onClick={() => onOpenChatWithUser(invitedUser.id)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-slate-800 transition-colors"
                                title="Message invited user"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: VISUAL REFERRAL TREE / NETWORK HIERARCHY */}
      {activeSubTab === 'tree' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
            <span className="font-bold text-slate-200 block mb-1">Visual Network Tree</span>
            Explore the hierarchical chains of who invited whom. You can click on any node to manage or inspect.
          </div>

          <div className="space-y-4">
            {invitersList.map((inviter) => {
              const children = allReferrals.filter((r) => r.referrerId === inviter.id);

              return (
                <div
                  key={inviter.id}
                  className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-md space-y-4"
                >
                  {/* Root Node (Inviter) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                        <Award className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{inviter.name}</h4>
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-mono text-xs font-bold">
                            {inviter.referralCode}
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 font-mono">
                          {inviter.phone} · {inviter.district || 'Kigali'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs">
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Total Network</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {children.length} members ({children.filter((c) => c.status === 'product_bought').length} invested)
                        </span>
                      </div>

                      <Button
                        size="sm"
                        variant="secondary"
                        className="text-xs py-1"
                        icon={<Gift className="w-3.5 h-3.5 text-amber-400" />}
                        onClick={() => {
                          setSelectedInviterForBonus(inviter);
                          setBonusAmountInput(1000);
                          setBonusReasonInput(`Network performance reward`);
                        }}
                      >
                        Grant Bonus
                      </Button>
                    </div>
                  </div>

                  {/* Branches (Invitees) */}
                  {children.length === 0 ? (
                    <div className="pl-6 text-xs text-slate-500 italic">
                      No invited members recorded under this code yet.
                    </div>
                  ) : (
                    <div className="pl-4 sm:pl-8 space-y-2 border-l-2 border-dashed border-slate-800 ml-5">
                      {children.map((child) => {
                        const childUser = users.find((u) => u.id === child.referredUserId);

                        return (
                          <div
                            key={child.id}
                            className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <ArrowRight className="w-4 h-4 text-emerald-500 shrink-0" />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-slate-200">
                                    {child.referredUserName}
                                  </span>
                                  {child.status === 'product_bought' ? (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                      Tier Invested
                                    </span>
                                  ) : child.status === 'revoked' ? (
                                    <span className="px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 text-[10px] font-bold">
                                      Revoked
                                    </span>
                                  ) : (
                                    <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                                      Registered
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] font-mono text-slate-400">
                                  {child.referredUserPhone}
                                  {childUser?.district ? ` · ${childUser.district}` : ''}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 text-xs">
                              <span className="font-mono font-bold text-emerald-400">
                                +{child.bonusEarned.toLocaleString()} RWF
                              </span>

                              <button
                                onClick={() => {
                                  setSelectedReferralToReassign(child);
                                  setReassignNewInviterId(child.referrerId);
                                }}
                                className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-slate-700"
                              >
                                Reassign
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: ORPHAN UNASSIGNED USERS */}
      {activeSubTab === 'orphans' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-blue-950/20 border border-blue-500/30 flex items-start gap-3 text-xs text-blue-200">
            <UserX className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-white block mb-0.5">
                Unassigned Members ({orphanUsers.length})
              </span>
              These members signed up directly without entering any referral link or code. As an administrator,
              you can link them to an inviter to credit a promoter or promotional campaign.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {orphanUsers.map((orphan) => (
              <div
                key={orphan.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={orphan.avatar}
                    alt={orphan.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-700 shrink-0"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
                    }}
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-100 truncate">{orphan.name}</h4>
                    <span className="text-[11px] font-mono text-slate-400 block mt-0.5">
                      {orphan.phone}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate">
                      {orphan.district} · Balance: {orphan.balance.toLocaleString()} RWF
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-amber-400 font-medium">No Inviter Linked</span>

                  <Button
                    size="sm"
                    variant="primary"
                    className="text-xs py-1.5 !bg-emerald-600 hover:!bg-emerald-500 text-white"
                    icon={<LinkIcon className="w-3 h-3" />}
                    onClick={() => {
                      setManualReferredUserId(orphan.id);
                      setManualInviterId(invitersList[0]?.id || '');
                      setIsManualPairModalOpen(true);
                    }}
                  >
                    Assign Inviter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- MODAL 1: GRANT REFERRAL BONUS --- */}
      {selectedInviterForBonus && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInviterForBonus(null)}
          title={`Grant Referral Bonus: ${selectedInviterForBonus.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3">
              <Gift className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold text-slate-200 block">
                  Reward {selectedInviterForBonus.name}
                </span>
                <span className="text-slate-400 text-[11px]">
                  Current Referral Earnings: {(selectedInviterForBonus.referralEarnings || 0).toLocaleString()} RWF
                </span>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                Bonus Amount (RWF):
              </label>
              <input
                type="number"
                value={bonusAmountInput}
                onChange={(e) => setBonusAmountInput(Number(e.target.value))}
                min={100}
                step={100}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono font-bold focus:outline-none focus:border-amber-500"
              />
              <div className="flex gap-2 mt-2">
                {[500, 1000, 2500, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setBonusAmountInput(amt)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-mono font-semibold"
                  >
                    +{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                Administrative Reason / Note:
              </label>
              <input
                type="text"
                value={bonusReasonInput}
                onChange={(e) => setBonusReasonInput(e.target.value)}
                placeholder="e.g. VIP Promoter Bonus, Promo Contest Winner..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-3 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedInviterForBonus(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 !bg-amber-600 hover:!bg-amber-500 text-white font-bold"
                onClick={handleCreditBonusSubmit}
              >
                Credit +{bonusAmountInput.toLocaleString()} RWF
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- MODAL 2: REASSIGN INVITER --- */}
      {selectedReferralToReassign && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReferralToReassign(null)}
          title={`Reassign Inviter for ${selectedReferralToReassign.referredUserName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-blue-500/10 border border-blue-500/30">
              <span className="text-slate-300 font-bold block mb-1">
                Currently Referred By: {selectedReferralToReassign.referrerCode}
              </span>
              <span className="text-slate-400 text-[11px] block">
                Select the new inviter who should receive credit for this member.
              </span>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                Select New Inviter:
              </label>
              <select
                value={reassignNewInviterId}
                onChange={(e) => setReassignNewInviterId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
              >
                <option value="">-- Choose Inviter --</option>
                {users
                  .filter((u) => u.id !== selectedReferralToReassign.referredUserId)
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.phone}) · Code: {u.referralCode}
                    </option>
                  ))}
              </select>
            </div>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={reassignCreditBonus}
                onChange={(e) => setReassignCreditBonus(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <span className="text-slate-200 font-bold block">Credit +500 RWF referral bonus to new inviter</span>
                <span className="text-slate-400 text-[10px]">Adds welcome referral reward to new inviter's wallet.</span>
              </div>
            </label>

            <div className="pt-3 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedReferralToReassign(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 !bg-blue-600 hover:!bg-blue-500 text-white font-bold"
                onClick={handleReassignSubmit}
                disabled={!reassignNewInviterId}
              >
                Confirm Reassignment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- MODAL 3: EDIT REFERRAL CODE --- */}
      {selectedUserForCodeEdit && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedUserForCodeEdit(null)}
          title={`Edit Referral Code: ${selectedUserForCodeEdit.name}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Current Code:</span>
              <span className="font-mono text-base font-bold text-amber-300">
                {selectedUserForCodeEdit.referralCode}
              </span>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                New Custom Referral Code:
              </label>
              <input
                type="text"
                value={newReferralCodeInput}
                onChange={(e) => setNewReferralCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. VIP-PROMO, KIGALI-PRO"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-300 tracking-wider focus:outline-none focus:border-amber-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Must be unique across all members. Existing referrals linked to this user will update automatically.
              </span>
            </div>

            <div className="pt-3 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedUserForCodeEdit(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 !bg-amber-600 hover:!bg-amber-500 text-white font-bold"
                onClick={handleUpdateCodeSubmit}
              >
                Save New Code
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- MODAL 4: CREATE / MANUAL REFERRAL LINK --- */}
      {isManualPairModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setIsManualPairModalOpen(false)}
          title="Manually Link Inviter & Member"
        >
          <div className="space-y-4 text-xs">
            <p className="text-slate-400 text-[11px]">
              Manually connect any member who signed up without a referral code to a promoter or affiliate.
            </p>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                1. Select Invited Member:
              </label>
              <select
                value={manualReferredUserId}
                onChange={(e) => setManualReferredUserId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose Member --</option>
                {users
                  .filter((u) => u.role === 'user')
                  .map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.phone}) {!u.referredBy ? '⭐ [Unassigned Orphan]' : `(Already under ${u.referredBy})`}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                2. Select Inviter (Referrer):
              </label>
              <select
                value={manualInviterId}
                onChange={(e) => setManualInviterId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Choose Inviter --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.phone}) · Code: {u.referralCode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                Bonus Amount to Credit Inviter (RWF):
              </label>
              <input
                type="number"
                value={manualBonusAmount}
                onChange={(e) => setManualBonusAmount(Number(e.target.value))}
                min={0}
                step={100}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={manualMarkProductBought}
                onChange={(e) => setManualMarkProductBought(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-500"
              />
              <div>
                <span className="text-slate-200 font-bold block">Mark Member as Product Purchased</span>
                <span className="text-slate-400 text-[10px]">Unlocks withdrawal of the 2,500 RWF welcome bonus.</span>
              </div>
            </label>

            <div className="pt-3 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setIsManualPairModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 !bg-emerald-600 hover:!bg-emerald-500 text-white font-bold"
                onClick={handleManualPairSubmit}
              >
                Create Referral Link
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- MODAL 5: REVOKE REFERRAL --- */}
      {selectedReferralToRevoke && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReferralToRevoke(null)}
          title={`Revoke Referral: ${selectedReferralToRevoke.referredUserName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-400 mb-1" />
              <span className="font-bold block">Are you sure you want to revoke this referral?</span>
              <span className="text-[11px] text-rose-300 block">
                This marks the connection as revoked and prevents future commissions.
              </span>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                Reason for Revocation:
              </label>
              <input
                type="text"
                value={revokeReasonInput}
                onChange={(e) => setRevokeReasonInput(e.target.value)}
                placeholder="e.g. Self-referral, multiple accounts on same device..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={revokeDeductBonus}
                onChange={(e) => setRevokeDeductBonus(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-rose-500"
              />
              <div>
                <span className="text-slate-200 font-bold block">
                  Deduct {(selectedReferralToRevoke.bonusEarned || 0).toLocaleString()} RWF bonus from inviter's balance
                </span>
                <span className="text-slate-400 text-[10px]">Claws back the commission paid for this invitation.</span>
              </div>
            </label>

            <div className="pt-3 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedReferralToRevoke(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                className="flex-1 !bg-rose-600 hover:!bg-rose-500 text-white font-bold"
                onClick={handleRevokeSubmit}
              >
                Confirm Revocation
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- MODAL 6: ADJUST BONUS AMOUNT --- */}
      {selectedReferralToAdjust && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedReferralToAdjust(null)}
          title={`Adjust Bonus: ${selectedReferralToAdjust.referredUserName}`}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Current Bonus Credited:</span>
              <span className="font-mono text-base font-bold text-amber-300">
                {(selectedReferralToAdjust.bonusEarned || 0).toLocaleString()} RWF
              </span>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                New Bonus Amount (RWF):
              </label>
              <input
                type="number"
                value={adjustAmountInput}
                onChange={(e) => setAdjustAmountInput(Number(e.target.value))}
                min={0}
                step={100}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm font-mono font-bold text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1 font-semibold">
                Reason for Adjustment:
              </label>
              <input
                type="text"
                value={adjustReasonInput}
                onChange={(e) => setAdjustReasonInput(e.target.value)}
                placeholder="e.g. Higher tier purchase bonus..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="pt-3 flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setSelectedReferralToAdjust(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1 !bg-amber-600 hover:!bg-amber-500 text-white font-bold"
                onClick={handleAdjustBonusSubmit}
              >
                Save Adjustment
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* --- MODAL 7: VIEW INVITER NETWORK DETAILS --- */}
      {viewingInviterNetwork && (
        <Modal
          isOpen={true}
          onClose={() => setViewingInviterNetwork(null)}
          title={`Invitees of ${viewingInviterNetwork.name} (${viewingInviterNetwork.referralCode})`}
        >
          <div className="space-y-4 text-xs">
            {(() => {
              const children = allReferrals.filter((r) => r.referrerId === viewingInviterNetwork.id);
              return (
                <>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Invited:</span>
                      <span className="font-mono text-sm font-bold text-white">
                        {children.length} members
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Total Commissions:</span>
                      <span className="font-mono text-sm font-bold text-purple-300">
                        {children.reduce((s, c) => s + (c.bonusEarned || 0), 0).toLocaleString()} RWF
                      </span>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {children.length === 0 ? (
                      <p className="text-slate-500 text-center py-6 italic">No invited members yet.</p>
                    ) : (
                      children.map((child) => (
                        <div
                          key={child.id}
                          className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="font-bold text-slate-200 block">{child.referredUserName}</span>
                            <span className="text-[11px] font-mono text-slate-400">{child.referredUserPhone}</span>
                          </div>

                          <div className="text-right">
                            <span className="font-mono font-bold text-emerald-400 block">
                              +{child.bonusEarned.toLocaleString()} RWF
                            </span>
                            <span className="text-[10px] text-slate-400 uppercase font-semibold">
                              {child.status}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="pt-2">
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={() => setViewingInviterNetwork(null)}
                    >
                      Close Network List
                    </Button>
                  </div>
                </>
              );
            })()}
          </div>
        </Modal>
      )}
    </div>
  );
};
