'use client';

import { useReducer } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PROJECTS, Project } from './data';
import { ProjectCard } from './ProjectCard';
import { DiagnosticDrawer } from './DiagnosticDrawer';
import { AndroidModal } from './AndroidModal';
import { WarRoom } from './WarRoom';

type OverlayMode = 'idle' | 'drawer' | 'android' | 'warroom';

interface OverlayState {
  mode: OverlayMode;
  project: Project | null;
}

type OverlayAction =
  | { type: 'open_drawer'; project: Project }
  | { type: 'open_android'; project: Project }
  | { type: 'open_warroom'; project: Project }
  | { type: 'close' };

function overlayReducer(_state: OverlayState, action: OverlayAction): OverlayState {
  switch (action.type) {
    case 'open_drawer':  return { mode: 'drawer',  project: action.project };
    case 'open_android': return { mode: 'android', project: action.project };
    case 'open_warroom': return { mode: 'warroom', project: action.project };
    case 'close':        return { mode: 'idle',    project: null };
  }
}

export function SandboxGrid() {
  const [overlay, dispatch] = useReducer(overlayReducer, { mode: 'idle', project: null });

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROJECTS.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={(p) => dispatch({ type: 'open_drawer', project: p })}
            onAndroidRequest={(p) => dispatch({ type: 'open_android', project: p })}
          />
        ))}
      </div>

      <DiagnosticDrawer
        project={overlay.mode === 'drawer' ? overlay.project : null}
        onClose={() => dispatch({ type: 'close' })}
        onMerge={() => dispatch({ type: 'close' })}
        onPurge={() => dispatch({ type: 'close' })}
        onDebate={(p) => dispatch({ type: 'open_warroom', project: p })}
      />

      <AndroidModal
        project={overlay.mode === 'android' ? overlay.project : null}
        onClose={() => dispatch({ type: 'close' })}
      />

      <AnimatePresence>
        {overlay.mode === 'warroom' && overlay.project && (
          <WarRoom
            key="war-room"
            project={overlay.project}
            onClose={() => dispatch({ type: 'close' })}
            onMerge={() => setTimeout(() => dispatch({ type: 'close' }), 2200)}
            onPurge={() => setTimeout(() => dispatch({ type: 'close' }), 2200)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
