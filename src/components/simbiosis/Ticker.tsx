'use client';

import { useState, useEffect } from 'react';
import { Project } from './data';

interface TickerProps {
  project: Project;
}

export function Ticker({ project }: TickerProps) {
  const fullText =
    project.status === 'live'
      ? `[EN TIEMPO REAL: ${project.statusLabel}]`
      : `[STANDBY: ${project.statusLabel}]`;

  const [displayed, setDisplayed] = useState('');
  const [charIdx, setCharIdx] = useState(0);

  // Reset when project changes
  useEffect(() => {
    setDisplayed('');
    setCharIdx(0);
  }, [project.id]);

  // Type characters one at a time
  useEffect(() => {
    if (charIdx >= fullText.length) return;
    const t = setTimeout(() => {
      setDisplayed((prev) => prev + fullText[charIdx]);
      setCharIdx((i) => i + 1);
    }, 22);
    return () => clearTimeout(t);
  }, [charIdx, fullText]);

  return (
    <div className="flex items-center gap-2 min-w-0">
      <span
        className={`w-1.5 h-1.5 flex-shrink-0 ${
          project.status === 'live' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700'
        }`}
      />
      <span className="font-mono text-[9px] text-slate-500 truncate">
        {displayed}
        {charIdx < fullText.length && (
          <span className="animate-pulse text-slate-700">_</span>
        )}
      </span>
    </div>
  );
}
