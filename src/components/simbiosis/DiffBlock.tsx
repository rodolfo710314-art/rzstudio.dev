'use client';

import type { Project } from './data';

interface DiffBlockProps {
  codeDiff: Project['codeDiff'];
}

// Safe to use dangerouslySetInnerHTML — content is static data, never user input
function tokenize(line: string): string {
  const safe = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  return safe
    // Strings first (before keywords, to avoid highlighting keywords inside strings)
    .replace(
      /(["'`][^"'`\n]*["'`])/g,
      '<span style="color:rgba(251,191,36,0.65)">$1</span>',
    )
    // Language keywords
    .replace(
      /\b(const|let|var|async|await|function|return|export|default|import|from|if|throw|new|for|of|in|type|interface)\b/g,
      '<span style="color:rgba(125,211,252,0.75)">$1</span>',
    )
    // Boolean / null literals
    .replace(
      /\b(true|false|null|undefined)\b/g,
      '<span style="color:rgba(192,132,252,0.7)">$1</span>',
    );
}

export function DiffBlock({ codeDiff }: DiffBlockProps) {
  return (
    <div className="bg-black border border-slate-800 p-3 overflow-x-auto">
      {codeDiff.old.map((line, i) => (
        <div
          key={`old-${i}`}
          className="font-mono text-[11px] text-red-400/60 whitespace-pre leading-5"
          dangerouslySetInnerHTML={{ __html: `- ${tokenize(line)}` }}
        />
      ))}
      <div className="h-1.5" />
      {codeDiff.new.map((line, i) => (
        <div
          key={`new-${i}`}
          className="font-mono text-[11px] text-emerald-400/70 whitespace-pre leading-5"
          dangerouslySetInnerHTML={{ __html: `+ ${tokenize(line)}` }}
        />
      ))}
    </div>
  );
}
