import React from 'react';
import { Sparkles, MessageSquareHeart, Zap, Compass, HeartPulse, Laptop, Mail } from 'lucide-react';
import { PromptSuggestion } from '../types.ts';

const PROMPT_SUGGESTIONS: PromptSuggestion[] = [
  {
    id: '1',
    category: 'Daily Wisdom',
    titleEn: 'Healthy Morning Habits',
    titleHi: 'सुबह की स्वस्थ आदतें',
    prompt: 'Give me 3 simple morning habits to stay energetic all day. / पूरे दिन ऊर्जावान रहने के लिए 3 आसान सुबह की आदतें बताएं।',
    icon: 'HeartPulse',
  },
  {
    id: '2',
    category: 'Coding & Tech',
    titleEn: 'Learn Coding Faster',
    titleHi: 'कोडिंग जल्दी कैसे सीखें',
    prompt: 'What are the best tips to learn programming quickly for beginners? / शुरुआती लोगों के लिए प्रोग्रामिंग जल्दी सीखने के सबसे अच्छे तरीके क्या हैं?',
    icon: 'Laptop',
  },
  {
    id: '3',
    category: 'Work Email',
    titleEn: 'Polite Leave Request',
    titleHi: 'ऑफिस की छुट्टी के लिए ईमेल',
    prompt: 'Write a short and polite 1-day leave request email to my manager. / मैनेजर को 1 दिन की छुट्टी के लिए संक्षिप्त और विनम्र ईमेल लिखें।',
    icon: 'Mail',
  },
  {
    id: '4',
    category: 'Understanding AI',
    titleEn: 'Explain AI Simply',
    titleHi: 'आर्टिफिशियल इंटेलिजेंस क्या है?',
    prompt: 'Explain Artificial Intelligence (AI) in 2 simple sentences in Hindi and English. / AI क्या है, इसे 2 आसान वाक्यों में समझाएं।',
    icon: 'Sparkles',
  },
  {
    id: '5',
    category: 'Productivity',
    titleEn: 'Beat Procrastination',
    titleHi: 'आलस और टालमटोल कैसे दूर करें',
    prompt: 'How to stop procrastinating and start focusing on work right now? / टालमटोल बंद करके तुरंत काम पर ध्यान कैसे लगाएं?',
    icon: 'Zap',
  },
  {
    id: '6',
    category: 'Quick English',
    titleEn: 'Daily English Phrases',
    titleHi: 'रोज़ाना बोले जाने वाले 5 वाक्य',
    prompt: 'Give me 5 useful daily English phrases with simple Hindi meanings. / रोज़ाना बातचीत के 5 उपयोगी अंग्रेजी वाक्य और उनका सरल हिंदी अर्थ बताएं।',
    icon: 'Compass',
  },
];

interface EmptyStateProps {
  onSelectPrompt: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectPrompt }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'HeartPulse':
        return <HeartPulse className="w-4 h-4 text-rose-400" />;
      case 'Laptop':
        return <Laptop className="w-4 h-4 text-cyan-400" />;
      case 'Mail':
        return <Mail className="w-4 h-4 text-emerald-400" />;
      case 'Sparkles':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'Zap':
        return <Zap className="w-4 h-4 text-yellow-400" />;
      default:
        return <Compass className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="py-6 sm:py-10 max-w-2xl mx-auto px-4 text-center">
      {/* Friendly Persona Greeting */}
      <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 p-1 mb-4 shadow-xl shadow-indigo-500/25">
        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
          <MessageSquareHeart className="w-8 h-8 text-indigo-400" />
        </div>
      </div>

      <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight font-['Plus_Jakarta_Sans']">
        Namaste! I am Nova AI 🙏
      </h2>
      <p className="text-sm sm:text-base text-slate-300 mt-1 max-w-lg mx-auto font-['Noto_Sans_Devanagari']">
        नमस्ते! मैं आपका दोस्ताना सहायक हूँ। Always ready to help you with short & simple answers in Hindi & English.
      </p>

      {/* Feature Highlights Banner */}
      <div className="grid grid-cols-3 gap-2 mt-6 mb-8 text-left max-w-md mx-auto">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-base">🇮🇳 + 🇬🇧</span>
          <div className="text-[11px] font-semibold text-slate-200 mt-1">Bilingual</div>
          <div className="text-[9px] text-slate-400">Hindi + English</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-base">⚡</span>
          <div className="text-[11px] font-semibold text-slate-200 mt-1">Short & Crisp</div>
          <div className="text-[9px] text-slate-400">To the point</div>
        </div>
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-base">🎙️</span>
          <div className="text-[11px] font-semibold text-slate-200 mt-1">Voice & Audio</div>
          <div className="text-[9px] text-slate-400">Listen & Speak</div>
        </div>
      </div>

      {/* Suggested Prompts Title */}
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
        <span className="flex items-center gap-1 font-medium text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Try asking / ये सवाल पूछ कर देखें:
        </span>
        <span className="text-[11px]">Click to send directly</span>
      </div>

      {/* Prompt Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
        {PROMPT_SUGGESTIONS.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelectPrompt(s.prompt)}
            className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/40 transition-all text-left group cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-slate-800 group-hover:bg-indigo-950/50 group-hover:text-indigo-300 transition-colors shrink-0">
              {getIcon(s.icon)}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                {s.titleEn}
              </div>
              <div className="text-[11px] text-slate-400 group-hover:text-indigo-300 transition-colors font-['Noto_Sans_Devanagari']">
                {s.titleHi}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
