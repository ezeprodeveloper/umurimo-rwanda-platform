import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { store } from '../data/store';
import { RWANDA_DISTRICTS } from '../data/mockData';
import {
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Lock,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  CreditCard,
  FileText,
  Copy,
  Check,
  Sparkles,
  Smartphone
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

const PRESET_AVATARS = [
  {
    id: 'avatar-user-1',
    label: 'Mugisha',
    url: '/src/assets/images/avatar_user_rw_1790691607872.jpg'
  },
  {
    id: 'avatar-admin-1',
    label: 'Jean Claude',
    url: '/src/assets/images/avatar_admin_rw_1790691595686.jpg'
  },
  {
    id: 'avatar-female-1',
    label: 'Clarisse',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'avatar-male-2',
    label: 'Eric',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80'
  },
  {
    id: 'avatar-female-2',
    label: 'Aline',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80'
  }
];

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [district, setDistrict] = useState(currentUser?.district || 'Gasabo (Kigali)');
  const [birthDate, setBirthDate] = useState(currentUser?.birthDate || '2001-01-01');
  const [avatar, setAvatar] = useState(currentUser?.avatar || '');
  const [bio, setBio] = useState(currentUser?.bio || '');

  // MoMo Payout details
  const [momoProvider, setMomoProvider] = useState<'MTN' | 'AIRTEL_TIGO'>(currentUser?.momoProvider || 'MTN');
  const [momoPhone, setMomoPhone] = useState(currentUser?.momoPhone || currentUser?.phone || '');
  const [momoName, setMomoName] = useState(currentUser?.momoName || currentUser?.name || '');

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [activeTab, setActiveTab] = useState<'personal' | 'payout' | 'password'>('personal');
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setPhone(currentUser.phone);
      setDistrict(currentUser.district || 'Gasabo (Kigali)');
      setBirthDate(currentUser.birthDate || '2001-01-01');
      setAvatar(currentUser.avatar);
      setBio(currentUser.bio || 'Member at Umurimo Rwanda');
      setMomoProvider(currentUser.momoProvider || (currentUser.phone.startsWith('078') || currentUser.phone.startsWith('079') ? 'MTN' : 'AIRTEL_TIGO'));
      setMomoPhone(currentUser.momoPhone || currentUser.phone);
      setMomoName(currentUser.momoName || currentUser.name);
    }
  }, [currentUser]);

  if (!currentUser || !isOpen) return null;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const res = store.updateUserProfile(currentUser.id, {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      district,
      birthDate,
      avatar,
      bio: bio.trim(),
      momoProvider,
      momoPhone: momoPhone.trim(),
      momoName: momoName.trim()
    });

    if (res.success) {
      setIsSuccess(true);
      setMessage('Profile and payment details saved successfully!');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword.trim()) return;

    const res = store.changePassword(currentUser.id, oldPassword, newPassword);
    if (res.success) {
      setIsSuccess(true);
      setMessage('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1400);
    }
  };

  const handleCopyReferralCode = () => {
    if (currentUser.referralCode) {
      navigator.clipboard.writeText(currentUser.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={currentUser.role === 'admin' ? 'Admin Profile & System Settings' : 'Edit Personal Profile & Payout Info'}
      maxWidth="lg"
    >
      <div className="space-y-4">
        {/* Account Identity Summary Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-emerald-950/40 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={avatar || currentUser.avatar}
              alt={name}
              className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500/40 shrink-0"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';
              }}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white leading-tight">{currentUser.name}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                  {currentUser.role === 'admin' ? 'Administrator' : 'Verified Member'}
                </span>
              </div>
              <span className="text-xs text-slate-400 block mt-0.5">{currentUser.district} · {currentUser.email}</span>
            </div>
          </div>

          {/* Referral Code Chip */}
          {currentUser.referralCode && (
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <span className="text-[10px] text-slate-400">Referral Code:</span>
              <span className="font-mono text-xs font-bold text-amber-300">{currentUser.referralCode}</span>
              <button
                type="button"
                onClick={handleCopyReferralCode}
                className="text-slate-400 hover:text-white p-0.5"
                title="Copy Referral Code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Tab navigation */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'personal'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Personal Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('payout')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'payout'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            MoMo Payout Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('password')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'password'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Password & Security
          </button>
        </div>

        {message && (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* TAB 1: Personal Info Form */}
        {activeTab === 'personal' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            {/* Avatar Selector and Custom Photo */}
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <span className="text-[11px] font-bold text-slate-300 block">Choose Profile Avatar</span>
              
              <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAvatar(preset.url)}
                    className={`relative rounded-xl p-0.5 transition-all ${
                      avatar === preset.url
                        ? 'ring-2 ring-emerald-500 scale-105'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={preset.url}
                      alt={preset.label}
                      className="w-11 h-11 rounded-lg object-cover"
                    />
                    <span className="text-[9px] text-slate-400 block text-center mt-0.5 truncate max-w-[44px]">
                      {preset.label}
                    </span>
                  </button>
                ))}

                {/* Upload Photo Button */}
                <label className="flex flex-col items-center justify-center w-11 h-11 rounded-xl bg-slate-900 border border-dashed border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-emerald-400 cursor-pointer transition-colors shrink-0">
                  <Camera className="w-4 h-4" />
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
            </div>

            {/* Names & Bio */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Occupation / Bio</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={bio}
                    placeholder="e.g. Student in Kigali, Daily Investor"
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Phone Number (MTN / Airtel)</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* District & Birth Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-200 mb-1">District / Akarere</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    {RWANDA_DISTRICTS.map((dist) => (
                      <option key={dist} value={dist}>
                        {dist}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-200 mb-1">Date of Birth</label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full py-2.5" icon={<ShieldCheck className="w-4 h-4" />}>
                Save Personal Profile
              </Button>
            </div>
          </form>
        )}

        {/* TAB 2: MoMo Payout Details Form */}
        {activeTab === 'payout' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white text-xs">Preferred Mobile Money Provider</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMomoProvider('MTN')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    momoProvider === 'MTN'
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="block text-xs">MTN Mobile Money</span>
                    <span className="text-[10px] opacity-75 font-normal">078 / 079 numbers</span>
                  </div>
                  {momoProvider === 'MTN' && <Check className="w-4 h-4 text-amber-400" />}
                </button>

                <button
                  type="button"
                  onClick={() => setMomoProvider('AIRTEL_TIGO')}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                    momoProvider === 'AIRTEL_TIGO'
                      ? 'bg-rose-500/10 border-rose-500 text-rose-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400'
                  }`}
                >
                  <div>
                    <span className="block text-xs">Airtel Money</span>
                    <span className="text-[10px] opacity-75 font-normal">072 / 073 numbers</span>
                  </div>
                  {momoProvider === 'AIRTEL_TIGO' && <Check className="w-4 h-4 text-rose-400" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-200 mb-1">
                MoMo Account Registered Full Name
              </label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="Official registered name on MTN/Airtel SIM"
                  value={momoName}
                  onChange={(e) => setMomoName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                Must match the identity registered on your MoMo SIM to avoid withdrawal approval delays.
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-200 mb-1">
                MoMo Withdrawal Receiving Phone Number
              </label>
              <div className="relative">
                <Smartphone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 0789456123"
                  value={momoPhone}
                  onChange={(e) => setMomoPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full py-2.5" icon={<ShieldCheck className="w-4 h-4" />}>
                Save MoMo Payout Settings
              </Button>
            </div>
          </form>
        )}

        {/* TAB 3: Password Form */}
        {activeTab === 'password' && (
          <form onSubmit={handleChangePassword} className="space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Current Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-200 mb-1">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter strong new password"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-10 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" className="w-full py-2.5">
                Update Password
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};
