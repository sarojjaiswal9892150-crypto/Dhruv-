import React, { useState } from 'react';
import { Bot, User, Copy, Check, Volume2, Square, Sparkles } from 'lucide-react';
import { ChatMessage } from '../types.ts';
import { MarkdownRenderer } from './MarkdownRenderer.tsx';
import { speakText, stopSpeaking } from '../utils/speech.ts';

interface ChatMessageItemProps {
  message: ChatMessage;
  onRetry?: (content: string) => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({ message }) => {
  const isBot = message.role === 'model';
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleSpeak = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(
        message.content,
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  const formattedTime = new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  }).format(new Date(message.timestamp));

  return (
    <div
      className={`group flex gap-3 px-3 sm:px-4 py-3.5 rounded-2xl transition-all ${
        isBot
          ? 'bg-slate-900/60 border border-slate-800/80 shadow-sm'
          : 'bg-indigo-950/20 border border-indigo-900/30'
      }`}
    >
      {/* Avatar */}
      <div className="shrink-0 pt-0.5">
        {isBot ? (
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-purple-500 shadow-md shadow-indigo-600/30 text-white">
            <Bot className="w-4 h-4" />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-1 -right-1" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-300">
            <User className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Content Body */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-200">
              {isBot ? 'Nova AI' : 'You'}
            </span>
            <span className="text-[10px] text-slate-400 font-normal">
              {formattedTime}
            </span>
            {isBot && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Hindi + English
              </span>
            )}
          </div>

          {/* Action buttons on message */}
          {isBot && !message.isStreaming && (
            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleToggleSpeak}
                className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors cursor-pointer ${
                  isSpeaking ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-slate-200'
                }`}
                title={isSpeaking ? 'Stop voice reading' : 'Listen in Hindi/English'}
              >
                {isSpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                title="Copy response"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="text-slate-200 text-sm">
          {message.content ? (
            <>
              <MarkdownRenderer content={message.content} />
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-0.5 align-middle" />
              )}
            </>
          ) : (
            <div className="flex items-center gap-1.5 py-1 text-xs text-indigo-300 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="ml-1.5 text-[11px] text-indigo-300 font-medium font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif]">
                Nova AI is replying fast... ⚡ / तुरंत उत्तर आ रहा है
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
