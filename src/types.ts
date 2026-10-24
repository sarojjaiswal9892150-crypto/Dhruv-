export type LanguageMode = 'bilingual' | 'hinglish' | 'hindi' | 'english';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  isStreaming?: boolean;
}

export interface PromptSuggestion {
  id: string;
  category: string;
  titleEn: string;
  titleHi: string;
  prompt: string;
  icon: string;
}
