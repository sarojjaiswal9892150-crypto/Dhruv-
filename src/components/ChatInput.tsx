import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Square, Sparkles } from 'lucide-react';
import { createSpeechRecognizer, isSpeechRecognitionSupported } from '../utils/speech.ts';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onStopGeneration: () => void;
  languageMode: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isLoading,
  onStopGeneration,
  languageMode,
}) => {
  const [text, setText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [listeningTranscript, setListeningTranscript] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognizerRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    const trimmed = text.trim();
    if (!trimmed) return;

    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleVoiceInput = () => {
    if (!isSpeechRecognitionSupported()) {
      alert('Speech recognition is not supported in this browser. Please use Google Chrome or Edge.');
      return;
    }

    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      setListeningTranscript('');
    } else {
      // Pick recognition language based on mode
      const lang = languageMode === 'english' ? 'en-IN' : 'hi-IN';
      const recognizer = createSpeechRecognizer(
        (transcript) => {
          setListeningTranscript(transcript);
          setText((prev) => {
            const base = prev.trim();
            return base ? `${base} ${transcript}` : transcript;
          });
        },
        (_err) => {
          setIsListening(false);
          setListeningTranscript('');
        },
        () => {
          setIsListening(false);
          setListeningTranscript('');
        },
        lang
      );

      if (recognizer) {
        recognizerRef.current = recognizer;
        setIsListening(true);
        try {
          recognizer.start();
        } catch {
          setIsListening(false);
        }
      }
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto w-full px-3 sm:px-6 pb-4">
      {/* Listening Banner if voice is active */}
      {isListening && (
        <div className="flex items-center justify-between mb-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-pulse">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>Listening in {languageMode === 'english' ? 'English' : 'Hindi/English'}... speak now</span>
          </div>
          <button
            onClick={toggleVoiceInput}
            className="text-[11px] underline hover:text-white cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Input container */}
      <div className="relative flex flex-col rounded-2xl bg-slate-900/90 border border-slate-700/80 focus-within:border-indigo-500/80 focus-within:ring-2 focus-within:ring-indigo-500/20 shadow-xl transition-all">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask Nova AI anything in Hindi or English... / कुछ भी पूछें..."
          rows={1}
          className="w-full resize-none bg-transparent px-4 pt-3 pb-2 text-sm text-slate-100 placeholder:text-slate-400 focus:outline-none min-h-[46px] max-h-[140px] font-['Noto_Sans_Devanagari','Plus_Jakarta_Sans',sans-serif]"
        />

        {/* Bottom toolbar inside input box */}
        <div className="flex items-center justify-between px-3 pb-2 pt-1">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 border border-slate-700/60">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              Short & Helpful
            </span>
            <span className="hidden sm:inline text-slate-400">
              Enter ↵ to send • Shift+Enter for new line
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mic voice input */}
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                isListening
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
              title={isListening ? 'Stop recording voice' : 'Speak your question (Hindi & English)'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send or Stop button */}
            {isLoading ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors cursor-pointer"
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={!text.trim()}
                className={`p-2 rounded-xl transition-all cursor-pointer ${
                  text.trim()
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:opacity-95'
                    : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
                title="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
