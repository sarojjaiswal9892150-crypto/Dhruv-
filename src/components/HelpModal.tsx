import React from 'react';
import { X, Bot, Sparkles, Languages, Volume2, Mic, CheckCircle2 } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-slate-900 border border-slate-700/80 shadow-2xl p-5 sm:p-6 text-slate-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2 font-['Plus_Jakarta_Sans']">
              About Nova AI
              <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-indigo-300 font-['Noto_Sans_Devanagari']">
              आपका दोस्ताना एआई साथी • Your friendly bilingual assistant
            </p>
          </div>
        </div>

        {/* Guiding Principles */}
        <div className="space-y-3 my-4 text-xs sm:text-sm">
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
            <Languages className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-slate-100">Bilingual by Default (हिंदी + English)</span>
              <p className="text-slate-400 text-xs mt-0.5">
                Nova AI answers simultaneously in simple English and easy Hindi (or Hinglish) so concepts are crystal clear.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
            <div>
              <span className="font-semibold text-slate-100">Short, Crisp & Truly Helpful</span>
              <p className="text-slate-400 text-xs mt-0.5">
                No endless text walls. Nova gets straight to the point with actionable steps and bullet points.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-start gap-2.5">
            <div className="flex items-center gap-1 text-cyan-400 mt-0.5 shrink-0">
              <Mic className="w-4 h-4" />
              <Volume2 className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-slate-100">Voice Input & Audio Read-Out</span>
              <p className="text-slate-400 text-xs mt-0.5">
                Tap the microphone to speak your question in Hindi or English, and click the speaker icon to listen to any response.
              </p>
            </div>
          </div>
        </div>

        {/* Shortcuts */}
        <div className="border-t border-slate-800 pt-3 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Enter</kbd> send, <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Shift+Enter</kbd> new line</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium cursor-pointer transition-colors"
          >
            Got it / समझ गए
          </button>
        </div>
      </div>
    </div>
  );
};
