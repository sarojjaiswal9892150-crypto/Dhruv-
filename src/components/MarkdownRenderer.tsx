import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Simple, resilient markdown renderer without bulky dependencies
  const parseBlocks = (text: string) => {
    const blocks = text.split('\n\n');
    return blocks.map((block, idx) => {
      // Check for code blocks ```lang ... ```
      if (block.startsWith('```')) {
        const lines = block.split('\n');
        const firstLine = lines[0].replace('```', '').trim();
        const code = lines.slice(1, lines[lines.length - 1].endsWith('```') ? -1 : undefined).join('\n');
        return <CodeBlock key={idx} language={firstLine || 'text'} code={code} />;
      }

      // Check for headings
      if (block.startsWith('### ')) {
        return (
          <h4 key={idx} className="text-base font-semibold text-indigo-300 mt-2 mb-1">
            {formatInline(block.replace(/^###\s+/, ''))}
          </h4>
        );
      }
      if (block.startsWith('## ')) {
        return (
          <h3 key={idx} className="text-lg font-bold text-indigo-200 mt-3 mb-1.5 flex items-center gap-1.5">
            {formatInline(block.replace(/^##\s+/, ''))}
          </h3>
        );
      }
      if (block.startsWith('# ')) {
        return (
          <h2 key={idx} className="text-xl font-bold text-white mt-3 mb-2">
            {formatInline(block.replace(/^#\s+/, ''))}
          </h2>
        );
      }

      // Check for Blockquote
      if (block.startsWith('>')) {
        const quoteText = block
          .split('\n')
          .map((line) => line.replace(/^>\s?/, ''))
          .join('\n');
        return (
          <blockquote
            key={idx}
            className="border-l-3 border-indigo-400 bg-indigo-950/30 pl-3.5 py-1.5 my-2 rounded-r-md text-slate-300 italic text-sm"
          >
            {formatInline(quoteText)}
          </blockquote>
        );
      }

      // Check for bullet list or numbered list
      const lines = block.split('\n');
      const isBulletList = lines.every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '));
      const isNumberedList = lines.every((line) => /^\d+\.\s/.test(line.trim()));

      if (isBulletList) {
        return (
          <ul key={idx} className="space-y-1.5 my-2 list-none">
            {lines.map((line, lIdx) => {
              const item = line.trim().replace(/^[-*]\s+/, '');
              return (
                <li key={lIdx} className="flex items-start gap-2 text-slate-200 text-sm leading-relaxed">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 shrink-0" />
                  <span>{formatInline(item)}</span>
                </li>
              );
            })}
          </ul>
        );
      }

      if (isNumberedList) {
        return (
          <ol key={idx} className="space-y-1.5 my-2 list-none">
            {lines.map((line, lIdx) => {
              const match = line.trim().match(/^(\d+)\.\s+(.*)$/);
              const num = match ? match[1] : lIdx + 1;
              const item = match ? match[2] : line;
              return (
                <li key={lIdx} className="flex items-start gap-2 text-slate-200 text-sm leading-relaxed">
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold shrink-0 mt-0.5">
                    {num}
                  </span>
                  <span>{formatInline(item)}</span>
                </li>
              );
            })}
          </ol>
        );
      }

      // Default paragraph (may have single-line breaks)
      return (
        <p key={idx} className="text-sm leading-relaxed text-slate-200 my-1.5 font-normal">
          {lines.map((line, lIdx) => (
            <React.Fragment key={lIdx}>
              {formatInline(line)}
              {lIdx < lines.length - 1 && <br />}
            </React.Fragment>
          ))}
        </p>
      );
    });
  };

  // Helper to format inline code, bold, italic
  const formatInline = (text: string): React.ReactNode => {
    // Regex splits by inline code, bold, italic
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

    return parts.map((part, index) => {
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code
            key={index}
            className="px-1.5 py-0.5 bg-slate-800 text-indigo-300 rounded text-xs font-mono border border-slate-700/60"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={index} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={index} className="italic text-slate-300">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return <div className="space-y-1 overflow-x-auto select-text">{parseBlocks(content)}</div>;
};

const CodeBlock: React.FC<{ language: string; code: string }> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-2.5 rounded-lg overflow-hidden border border-slate-800 bg-slate-900/90 text-slate-200">
      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-800/80 text-xs text-slate-400 font-mono">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer text-xs"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-3 text-xs font-mono overflow-x-auto text-emerald-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
};
