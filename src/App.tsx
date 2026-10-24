/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { ChatMessageItem } from './components/ChatMessageItem.tsx';
import { ChatInput } from './components/ChatInput.tsx';
import { HelpModal } from './components/HelpModal.tsx';
import { ChatMessage, LanguageMode } from './types.ts';
import { playChime, speakText, stopSpeaking } from './utils/speech.ts';

const STORAGE_KEY = 'nova_ai_chat_messages_v1';
const LANG_STORAGE_KEY = 'nova_ai_language_mode_v1';
const AUTO_SPEAK_KEY = 'nova_ai_auto_speak_v1';

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed to load chat history:', e);
    }
    return [];
  });

  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved && ['bilingual', 'hinglish', 'hindi', 'english'].includes(saved)) {
        return saved as LanguageMode;
      }
    } catch {}
    return 'bilingual';
  });

  const [autoSpeak, setAutoSpeak] = useState<boolean>(() => {
    try {
      return localStorage.getItem(AUTO_SPEAK_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Save messages to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.warn('Could not save messages:', e);
    }
  }, [messages]);

  // Save languageMode
  useEffect(() => {
    try {
      localStorage.setItem(LANG_STORAGE_KEY, languageMode);
    } catch {}
  }, [languageMode]);

  // Save autoSpeak
  useEffect(() => {
    try {
      localStorage.setItem(AUTO_SPEAK_KEY, autoSpeak.toString());
    } catch {}
  }, [autoSpeak]);

  // Auto-scroll when messages change or stream updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    if (soundEnabled) playChime('send');

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    const botMessageId = `bot-${Date.now() + 1}`;
    const botPlaceholder: ChatMessage = {
      id: botMessageId,
      role: 'model',
      content: '',
      timestamp: Date.now() + 1,
      isStreaming: true,
    };

    const newMessages = [...messages, userMessage];
    setMessages([...newMessages, botPlaceholder]);
    setIsLoading(true);

    const controller = new AbortController();
    abortControllerRef.current = controller;

    let accumulatedText = '';

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          languageMode,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      if (!response.body) {
        throw new Error('ReadableStream not supported by server');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('data:')) {
              const dataStr = trimmed.replace(/^data:\s*/, '');
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }

              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  accumulatedText += parsed.text;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, content: accumulatedText }
                        : msg
                    )
                  );
                } else if (parsed.error) {
                  accumulatedText += `\n*(Note: ${parsed.error})*`;
                  setMessages((prev) =>
                    prev.map((msg) =>
                      msg.id === botMessageId
                        ? { ...msg, content: accumulatedText }
                        : msg
                    )
                  );
                }
              } catch {
                // Non-JSON or raw text fallback
              }
            }
          }
        }
      }

      // Finalize bot message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === botMessageId
            ? { ...msg, content: accumulatedText || 'Namaste! How else can I assist you?', isStreaming: false }
            : msg
        )
      );

      if (soundEnabled) playChime('receive');

      // Auto-read aloud if enabled
      if (autoSpeak && accumulatedText) {
        speakText(accumulatedText);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // User stopped generation manually
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? {
                  ...msg,
                  content: accumulatedText || '*(Response stopped by user / उत्तर रोक दिया गया)*',
                  isStreaming: false,
                }
              : msg
          )
        );
      } else {
        console.error('Chat error:', err);
        const errorFallback =
          "Namaste! 🙏 I'm Nova AI. I had a small hiccup connecting. Please try asking again!\n\n" +
          'नमस्ते! संपर्क में थोड़ी समस्या आई। कृपया अपना सवाल दोबारा पूछें।';

        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, content: errorFallback, isStreaming: false }
              : msg
          )
        );
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopSpeaking();
    setIsLoading(false);
  };

  const handleClearChat = () => {
    stopSpeaking();
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setMessages([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950 text-slate-100 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background ambient lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-[10%] right-[15%] w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Header */}
      <Header
        languageMode={languageMode}
        onLanguageChange={setLanguageMode}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={() => setAutoSpeak(!autoSpeak)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onClearChat={handleClearChat}
        onOpenHelp={() => setIsHelpOpen(true)}
        hasMessages={messages.length > 0}
      />

      {/* Main Conversation Area */}
      <main className="relative z-10 flex-1 overflow-y-auto px-2 sm:px-4 py-4 scroll-smooth">
        <div className="max-w-4xl mx-auto flex flex-col justify-between min-h-full">
          {messages.length === 0 ? (
            <EmptyState onSelectPrompt={handleSendMessage} />
          ) : (
            <div className="space-y-4 pb-6">
              {messages.map((message) => (
                <ChatMessageItem key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Sticky Input */}
      <footer className="relative z-20 shrink-0">
        <ChatInput
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          onStopGeneration={handleStopGeneration}
          languageMode={languageMode}
        />
      </footer>

      {/* Help & Info Modal */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
