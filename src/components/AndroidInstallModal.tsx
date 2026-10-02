import React, { useState, useEffect } from 'react';
import { Smartphone, Download, Check, Copy, ExternalLink, QrCode, Sparkles, CheckCircle2, ShieldCheck } from 'lucide-react';

interface AndroidInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidInstallModal: React.FC<AndroidInstallModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  const sharedAppUrl = 'https://ais-pre-y36kklxoulsumxl3pobl5d-212149512863.europe-west2.run.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com?url=${encodeURIComponent(sharedAppUrl)}`;

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback instructions alert or copy
      navigator.clipboard.writeText(sharedAppUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(sharedAppUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-lg">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Download & Install Android App</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Native PWA / APK
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Install Umurimo Rwanda directly on your Android phone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200">
          {/* Main Direct Android Install Card */}
          <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Direct Android Install (WebAPK)
              </span>
              <span className="text-[11px] font-semibold text-emerald-400">No PlayStore Needed</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Install Umurimo Rwanda directly to your Android device with a single tap. It adds an app icon to your home screen and operates with full native performance and offline support.
            </p>
            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/60 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isInstalled ? 'App Already Installed!' : deferredPrompt ? 'Install App on this Device Now' : 'Tap to Install / Add to Home Screen'}</span>
            </button>
          </div>

          {/* Android App Direct URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300 block">
              Direct Android App Link:
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-emerald-400 truncate">
                {sharedAppUrl}
              </div>
              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 transition-colors flex items-center gap-1.5 border border-slate-700"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* How to Install on Android Phone - 3 Steps */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Easy 3-Step Android Installation Guide:</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Open the link above in <strong>Google Chrome</strong> or your Android browser.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>Tap the three dots menu <strong>(⋮)</strong> in the top right corner of Chrome.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. Umurimo Rwanda will appear on your phone home screen like any native Android app!</span>
              </div>
            </div>
          </div>

          {/* Standalone APK Packaging option */}
          <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-slate-200">Want a standalone .APK file?</p>
              <p className="text-[11px] text-slate-400">Package this PWA into an installable signed APK via PWABuilder.</p>
            </div>
            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors border border-slate-700 shrink-0"
            >
              <span>Build APK</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Compatible with Android 8.0+ (Samsung, Xiaomi, Tecno, Infinix, etc.)
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
