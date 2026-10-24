import React from 'react';
import { Bot, Sparkles, Volume2, VolumeX, Trash2, Languages, HelpCircle, Zap } from 'lucide-react';
import { LanguageMode } from '../types.ts';

interface HeaderProps {
  languageMode: LanguageMode;
  onLanguageChange: (mode: LanguageMode) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClearChat: () => void;
  onOpenHelp: () => void;
  hasMessages: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  languageMode,
  onLanguageChange,
  autoSpeak,
  onToggleAutoSpeak,
  onClearChat,
  onOpenHelp,
  hasMessages,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80 px-4 py-3 sm:px-6">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Logo and Identity */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            {/* Online Pulse Dot */}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                Nova AI
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  <Sparkles className="w-2.5 h-2.5 text-amber-400" />
                  Friendly Assistant
                </span>
                <span className="hidden xs:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  <Zap className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />
                  Fast ⚡
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-normal hidden sm:block">
              Always answering in simple Hindi & English • Short & helpful
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Selector Dropdown */}
          <div className="relative flex items-center">
            <Languages className="w-3.5 h-3.5 text-indigo-400 absolute left-2.5 pointer-events-none hidden xs:block" />
            <select
              aria-label="Language Mode"
              value={languageMode}
              onChange={(e) => onLanguageChange(e.target.value as LanguageMode)}
              className="bg-slate-900 border border-slate-700/80 hover:border-slate-600 text-xs text-slate-200 rounded-lg pl-3 xs:pl-8 pr-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="bilingual">🌐 Hindi + English (Dual)</option>
              <option value="hinglish">💬 Hinglish (Casual)</option>
              <option value="hindi">🇮🇳 सरल हिंदी (Simple Hindi)</option>
              <option value="english">🇺🇸 Simple English</option>
            </select>
          </div>

          {/* Auto Read Aloud Toggle */}
          <button
            onClick={onToggleAutoSpeak}
            className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
              autoSpeak
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300 shadow-sm'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
            title={autoSpeak ? 'Auto-voice read is ON (Click to turn off)' : 'Auto-voice read is OFF (Click to turn on)'}
          >
            {autoSpeak ? <Volume2 className="w-4 h-4 text-indigo-400" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline text-[11px] font-medium">
              {autoSpeak ? 'Voice ON' : 'Voice'}
            </span>
          </button>

          {/* Help modal */}
          <button
            onClick={onOpenHelp}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 transition-colors cursor-pointer"
            title="About Nova AI & Tips"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Clear chat history */}
          {hasMessages && (
            <button
              onClick={onClearChat}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:text-rose-300 hover:border-rose-900/60 hover:bg-rose-950/20 transition-colors cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
