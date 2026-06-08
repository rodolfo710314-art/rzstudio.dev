'use client';

import { Project } from './data';
import { Ticker } from './Ticker';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
  onAndroidRequest: (project: Project) => void;
}

export function ProjectCard({ project, onClick, onAndroidRequest }: ProjectCardProps) {
  const showWeb = project.platform === 'web' || project.platform === 'both';
  const showAndroid = project.platform === 'android' || project.platform === 'both';

  return (
    <div
      className="border border-slate-800 bg-black/30 flex flex-col group cursor-pointer hover:border-slate-700 transition-colors duration-300"
      onClick={() => onClick(project)}
    >
      {/* Telemetry header / Ticker */}
      <div className="border-b border-slate-800 px-4 py-2 bg-[#030303] overflow-hidden">
        <Ticker project={project} />
      </div>

      {/* Body */}
      <div className="flex-1 px-4 py-5 space-y-3">
        <div>
          <span className="font-mono text-[8px] text-slate-700 tracking-widest">
            [{project.id}]
          </span>
          <h3 className="font-mono text-sm text-white lowercase mt-1 leading-snug group-hover:text-copper transition-colors duration-300">
            {project.name}
          </h3>
        </div>

        <p className="font-mono text-[11px] text-slate-600 leading-relaxed lowercase">
          {project.description}
        </p>

        <div className="pt-1">
          <span className="font-mono text-[8px] text-slate-800 border border-slate-800 px-2 py-0.5 inline-block">
            {project.agent}
          </span>
        </div>
      </div>

      {/* Ghost buttons */}
      <div
        className="border-t border-slate-800 px-4 py-3 flex gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        {showWeb && (
          <button
            onClick={() => onClick(project)}
            className="flex-1 font-mono text-[8px] uppercase tracking-wider border border-slate-800 text-slate-600 py-1.5 hover:border-copper hover:text-copper transition-colors duration-200"
          >
            iniciar entorno de prueba
          </button>
        )}
        {showAndroid && (
          <button
            onClick={() => onAndroidRequest(project)}
            className="flex-1 font-mono text-[8px] uppercase tracking-wider border border-slate-800 text-slate-600 py-1.5 hover:border-emerald-800 hover:text-emerald-500 transition-colors duration-200"
          >
            obtener binario seguro
          </button>
        )}
      </div>
    </div>
  );
}
