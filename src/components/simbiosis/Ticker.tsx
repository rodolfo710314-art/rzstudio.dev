'use client';

import { useState, useEffect } from 'react';
import { Project } from './data';

interface TickerProps {
  project: Project;
}

// Module-level set — persists across remounts so animation doesn't replay on view switch
const seenProjects = new Set<string>();

export function Ticker({ project }: TickerProps) {
  const fullText =
    project.status === 'live'
      ? `[EN TIEMPO REAL: ${project.statusLabel}]`
      : `[STANDBY: ${project.statusLabel}]`;

  const alreadySeen = seenProjects.has(project.id);
  const [displayed, setDisplayed] = useState(alreadySeen ? fullText : '');
  const [charIdx, setCharIdx] = useState(alreadySeen ? fullText.length : 0);

  useEffect(() => {
    if (!seenProjects.has(project.id)) {
      setDisplayed('');
      setCharIdx(0);
    }
  }, [project.id]);

  useEffect(() => {
    if (charIdx >= fullText.length) {
      seenProjects.add(project.id);
      return;
    }
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
        aria-hidden="true"
      />
      <span className="font-mono text-[9px] text-slate-500 truncate">
        {displayed}
        {charIdx < fullText.length && (
          <span className="animate-pulse text-slate-700" aria-hidden="true">_</span>
        )}
      </span>
    </div>
  );
}
