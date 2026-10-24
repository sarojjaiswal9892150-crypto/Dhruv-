/**
 * Web Speech API wrappers for Nova AI:
 * - Text-to-Speech (TTS) for Hindi and English
 * - Speech-to-Text (STT) voice recognition
 */

// Strip markdown characters so speech synthesis sounds natural
export function stripMarkdownForSpeech(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, 'Code block omitted.')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~#>]/g, '')
    .replace(/\n+/g, '. ')
    .trim();
}

// Speak text using browser SpeechSynthesis
export function speakText(
  text: string,
  onEnd?: () => void,
  onError?: () => void
): SpeechSynthesisUtterance | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const cleaned = stripMarkdownForSpeech(text);
  if (!cleaned) return null;

  const utterance = new SpeechSynthesisUtterance(cleaned);
  
  // Detect if text contains Devanagari Hindi characters
  const hasHindi = /[\u0900-\u097F]/.test(cleaned);

  const voices = window.speechSynthesis.getVoices();
  
  // Attempt to select best matching voice
  let selectedVoice = null;
  if (hasHindi) {
    selectedVoice =
      voices.find((v) => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi')) ||
      voices.find((v) => v.lang.includes('IN')) ||
      voices.find((v) => v.lang.startsWith('en'));
    utterance.lang = selectedVoice?.lang || 'hi-IN';
  } else {
    selectedVoice =
      voices.find((v) => v.lang.includes('IN')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];
    utterance.lang = selectedVoice?.lang || 'en-IN';
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  }

  utterance.rate = 1.0;
  utterance.pitch = 1.05; // Slightly warmer/friendly pitch

  utterance.onend = () => {
    if (onEnd) onEnd();
  };

  utterance.onerror = () => {
    if (onError) onError();
  };

  window.speechSynthesis.speak(utterance);
  return utterance;
}

export function stopSpeaking(): void {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

// Check if Speech Recognition is available
export function isSpeechRecognitionSupported(): boolean {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  );
}

// Speech recognition helper
export function createSpeechRecognizer(
  onResult: (transcript: string) => void,
  onError: (err: any) => void,
  onEnd: () => void,
  lang: string = 'hi-IN'
) {
  if (!isSpeechRecognitionSupported()) return null;

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = lang; // 'hi-IN' or 'en-IN'

  recognition.onresult = (event: any) => {
    let current = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      current += event.results[i][0].transcript;
    }
    onResult(current);
  };

  recognition.onerror = (event: any) => {
    console.warn('Speech recognition error:', event.error);
    onError(event);
  };

  recognition.onend = () => {
    onEnd();
  };

  return recognition;
}

// Sound effects using Web Audio API (subtle and friendly)
export function playChime(type: 'send' | 'receive' | 'pop') {
  if (typeof window === 'undefined' || !window.AudioContext) return;
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'send') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.13);
    } else if (type === 'receive') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now);
      osc.stop(now + 0.17);
    } else {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.09);
    }
  } catch {
    // AudioContext might be blocked until user gesture, ignore safely
  }
}
