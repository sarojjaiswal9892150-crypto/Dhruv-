import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize GoogleGenAI server-side with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    botName: 'Nova AI',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Helper to construct system instruction
function getSystemInstruction(languageMode?: string): string {
  let modeGuide = '';
  switch (languageMode) {
    case 'hinglish':
      modeGuide = 'Use natural conversational Hinglish (everyday Hindi words written in English alphabet mixed with simple English). Be direct and friendly.';
      break;
    case 'hindi':
      modeGuide = 'Answer primarily in simple, clean Hindi (सरल हिंदी) with common English words in brackets if needed. Keep it crisp.';
      break;
    case 'english':
      modeGuide = 'Answer in simple, clear English, followed by a 1-line friendly Hindi note (सरल हिंदी में: ...).';
      break;
    case 'bilingual':
    default:
      modeGuide = 'Answer concisely in both simple English and simple Hindi (Devanagari or clean dual explanation). Keep both sections brief.';
      break;
  }

  return `You are Nova AI.
You are a friendly, warm, and helpful AI assistant.
Core rules for maximum speed and usefulness:
1. Always answer in simple Hindi and English.
2. Keep answers very short, crisp, and directly helpful (typically 2 to 3 short bullet points or 2 sentences max).
3. Start replying immediately without unnecessary greetings or rambling intros.
4. Tone & Style: ${modeGuide}
5. Formatting: Clean markdown with bold highlights and quick bullet points.`;
}

// Streaming chat endpoint (SSE) - optimized for ultra-fast TTFT (time-to-first-token)
app.post('/api/chat/stream', async (req, res) => {
  const { messages, languageMode } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Valid messages array is required' });
  }

  // Set SSE headers immediately with zero buffering
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  if (!process.env.GEMINI_API_KEY) {
    const fallback =
      'Namaste! 🙏 Main Nova AI hoon. (API Key not detected in environment secrets. Please ensure GEMINI_API_KEY is configured in Secrets panel to chat with live AI.)\n\n' +
      'नमस्ते! मैं नोवा एआई (Nova AI) हूँ। कृपया सेटिंग्स में API Key जोड़ें ताकि हम बात कर सकें।';
    res.write(`data: ${JSON.stringify({ text: fallback })}\n\n`);
    res.write('data: [DONE]\n\n');
    return res.end();
  }

  try {
    const systemInstruction = getSystemInstruction(languageMode);

    // Keep recent history (last 6 messages) to minimize prompt token processing time
    const recentMessages = messages.slice(-6);
    const contents = recentMessages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    let responseStream;

    // Use fast gemini-3.1-flash-lite / gemini-3.8-flash with minimal latency
    try {
      responseStream = await ai.models.generateContentStream({
        model: 'gemini-3.1-flash-lite',
        contents,
        config: {
          systemInstruction,
          temperature: 0.6,
          thinkingConfig: {
            thinkingLevel: ThinkingLevel.MINIMAL,
          },
        },
      });
    } catch (liteErr: any) {
      console.warn('Flash-lite error, falling back to gemini-3.8-flash with LOW thinking:', liteErr?.message);
      try {
        responseStream = await ai.models.generateContentStream({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction,
            temperature: 0.6,
            thinkingConfig: {
              thinkingLevel: ThinkingLevel.LOW,
            },
          },
        });
      } catch (flashErr: any) {
        console.warn('Fallback to gemini-flash-latest:', flashErr?.message);
        responseStream = await ai.models.generateContentStream({
          model: 'gemini-flash-latest',
          contents,
          config: {
            systemInstruction,
            temperature: 0.6,
          },
        });
      }
    }

    for await (const chunk of responseStream) {
      if (chunk.text) {
        res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Gemini Stream Error:', error);
    const friendlyMsg =
      "Namaste! 🙏 Server par thoda load hai. Please ek baar phir try karein! / Please try asking again in a moment.";
    res.write(`data: ${JSON.stringify({ text: friendlyMsg })}\n\n`);
    res.write('data: [DONE]\n\n');
    res.end();
  }
});

// Non-streaming chat endpoint
app.post('/api/chat', async (req, res) => {
  const { messages, languageMode } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Valid messages array is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      reply:
        'Namaste! 🙏 I am Nova AI. Please set GEMINI_API_KEY in the Secrets panel to chat with live Gemini.\nनमस्ते! लाइव चैट के लिए कृपया API Key सेट करें।',
    });
  }

  try {
    const systemInstruction = getSystemInstruction(languageMode);
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    let response;
    try {
      response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
    } catch {
      response = await ai.models.generateContent({
        model: 'gemini-flash-latest',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });
    }

    res.json({ reply: response.text || '' });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    res.json({
      reply:
        "Namaste! 🙏 Server par thoda load hai. Please ek baar phir try karein! / Server is busy. Please try asking again in a moment.",
    });
  }
});

// Start server with Vite middleware in dev or static files in production
async function startServer() {
  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nova AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
