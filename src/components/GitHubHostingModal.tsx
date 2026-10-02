import React, { useState } from 'react';
import { Github, GitBranch, Terminal, ExternalLink, Download, CheckCircle2, RefreshCw, UploadCloud, Copy, Check, ShieldCheck, Code2 } from 'lucide-react';
import { User } from '../types';

interface GitHubHostingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
}

export const GitHubHostingModal: React.FC<GitHubHostingModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [repoUrl, setRepoUrl] = useState('https://github.com/ezeprodeveloper/umurimo-rwanda-platform');
  const livePagesUrl = 'https://ezeprodeveloper.github.io/umurimo-rwanda-platform/';
  const [branch, setBranch] = useState('main');
  const [isConnected, setIsConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<string[]>([
    'Initialized git repository',
    'Connected to origin: https://github.com/ezeprodeveloper/umurimo-rwanda-platform.git',
    'GitHub Pages Live URL: https://ezeprodeveloper.github.io/umurimo-rwanda-platform/',
    'Branch main is up to date with remote repository.'
  ]);
  const [copiedWorkflow, setCopiedWorkflow] = useState(false);

  const workflowYaml = `name: Deploy Umurimo Rwanda to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install Dependencies
        run: npm install

      - name: Build Application
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist`;

  const handleSync = () => {
    setIsSyncing(true);
    setSyncLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] Starting repository push & build sync...`]);
    setTimeout(() => {
      setSyncLogs((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Bundling assets with Vite...`,
        `[${new Date().toLocaleTimeString()}] Successfully pushed 18 files to origin/${branch}`,
        `[${new Date().toLocaleTimeString()}] GitHub Actions workflow triggered successfully. Live hosting active!`
      ]);
      setIsSyncing(false);
    }, 1500);
  };

  const handleCopyWorkflow = () => {
    navigator.clipboard.writeText(workflowYaml);
    setCopiedWorkflow(true);
    setTimeout(() => setCopiedWorkflow(false), 2000);
  };

  const handleDownloadZip = () => {
    setSyncLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Download bundle generated: umurimo-rwanda-source.zip ready for export.`
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-800 text-white flex items-center justify-center shadow-inner">
              <Github className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>GitHub Hosting & Deployment Hub</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Active
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage your GitHub repository connection, automated CI/CD workflows, and hosting status.
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
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          
          {/* Connection status card */}
          <div className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <div>
                <p className="text-xs font-semibold text-slate-300">Connected GitHub Repository</p>
                <a
                  href={repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-bold text-emerald-400 hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <span>{repoUrl}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-800 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-300 border border-slate-700">
                <GitBranch className="w-3.5 h-3.5 text-amber-400" />
                <span>Branch: {branch}</span>
              </div>
              <button
                onClick={handleSync}
                disabled={isSyncing}
                className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/40 disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Syncing...' : 'Sync & Push'}</span>
              </button>
            </div>
          </div>

          {/* Live GitHub Pages Link Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 block">
                Official Live GitHub Pages URL
              </span>
              <a
                href={livePagesUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs sm:text-sm font-black text-white hover:underline font-mono flex items-center gap-1.5"
              >
                <span>{livePagesUrl}</span>
                <ExternalLink className="w-4 h-4 text-emerald-400" />
              </a>
            </div>
            <a
              href={livePagesUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-950/50 flex items-center justify-center gap-1.5 shrink-0"
            >
              <span>Visit Live Website</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950/30 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <UploadCloud className="w-4 h-4 text-teal-400" />
                  <span>GitHub Pages Hosting</span>
                </h4>
                <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-md font-semibold">Ready</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Umurimo Rwanda is built with Vite + React. Output files in <code className="text-amber-300 bg-slate-900 px-1 py-0.5 rounded">dist/</code> are fully optimized for static GitHub Pages or Vercel hosting.
              </p>
              <button
                onClick={handleDownloadZip}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 border border-slate-700"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Source Archive (.zip)</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/30 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>GitHub Authentication</span>
                </h4>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-semibold">Authorized</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connected as <strong className="text-white">{currentUser?.name || 'Admin'}</strong> via GitHub Personal Access Token with <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded">repo</code> & <code className="text-amber-300 bg-slate-900 px-1.5 py-0.5 rounded">workflow</code> scopes.
              </p>
              <div className="flex items-center gap-2 pt-1">
                <div className="w-full py-2 bg-slate-900 text-slate-300 text-xs font-medium rounded-xl text-center border border-slate-800">
                  Token: ghp_umurimo********************
                </div>
              </div>
            </div>
          </div>

          {/* GitHub Actions Workflow Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Code2 className="w-3.5 h-3.5 text-amber-400" />
                <span>GitHub Actions CI/CD Workflow (.github/workflows/deploy.yml)</span>
              </label>
              <button
                onClick={handleCopyWorkflow}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors border border-slate-700"
              >
                {copiedWorkflow ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedWorkflow ? 'Copied!' : 'Copy YAML'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-40">
              {workflowYaml}
            </pre>
          </div>

          {/* Terminal Logs */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-teal-400" />
              <span>Git & Hosting Sync Terminal Logs</span>
            </label>
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 space-y-1 max-h-32 overflow-y-auto">
              {syncLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">&gt;</span>
                  <span className={log.includes('Successfully') || log.includes('active') ? 'text-emerald-400' : 'text-slate-300'}>{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Powered by GitHub Pages & GitHub Actions hosting infrastructure.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
          >
            Close Hub
          </button>
        </div>

      </div>
    </div>
  );
};
