'use client';

const VIEWS = [
  { id: 'inteligencia', label: 'INTELIGENCIA ADAPTATIVA' },
  { id: 'simbiosis', label: 'NÚCLEO SIMBIÓTICO' },
] as const;

type ViewId = (typeof VIEWS)[number]['id'];

interface ViewSwitchProps {
  currentView: string;
  onSwitch: (view: ViewId) => void;
}

export function ViewSwitch({ currentView, onSwitch }: ViewSwitchProps) {
  return (
    <div
      className="inline-flex border border-slate-800"
      role="tablist"
      aria-label="modo de vista"
    >
      {VIEWS.map(({ id, label }) => {
        const active = currentView === id;
        return (
          <button
            key={id}
            role="tab"
            id={`tab-${id}`}
            aria-selected={active}
            aria-controls={`panel-${id}`}
            onClick={() => onSwitch(id)}
            className={`font-mono text-[10px] uppercase tracking-widest px-5 py-2.5 transition-colors duration-200 border-r border-slate-800 last:border-r-0 ${
              active
                ? 'bg-copper text-black'
                : 'bg-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            {'[ MODO: '}
            {label}
            {' ]'}
          </button>
        );
      })}
    </div>
  );
}
