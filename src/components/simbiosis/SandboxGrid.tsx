'use client';

import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { PROJECTS, Project } from './data';
import { ProjectCard } from './ProjectCard';
import { DiagnosticDrawer } from './DiagnosticDrawer';
import { AndroidModal } from './AndroidModal';
import { WarRoom } from './WarRoom';

export function SandboxGrid() {
  const [drawerProject, setDrawerProject] = useState<Project | null>(null);
  const [androidProject, setAndroidProject] = useState<Project | null>(null);
  const [warRoomProject, setWarRoomProject] = useState<Project | null>(null);

  function openDrawer(project: Project) {
    setAndroidProject(null);
    setDrawerProject(project);
  }

  function openAndroid(project: Project) {
    setDrawerProject(null);
    setAndroidProject(project);
  }

  function enterWarRoom(project: Project) {
    setDrawerProject(null);
    setWarRoomProject(project);
  }

  function closeWarRoom() {
    setWarRoomProject(null);
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {PROJECTS.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onClick={openDrawer}
            onAndroidRequest={openAndroid}
          />
        ))}
      </div>

      <DiagnosticDrawer
        project={drawerProject}
        onClose={() => setDrawerProject(null)}
        onMerge={() => setDrawerProject(null)}
        onPurge={() => setDrawerProject(null)}
        onDebate={enterWarRoom}
      />

      <AndroidModal
        project={androidProject}
        onClose={() => setAndroidProject(null)}
      />

      {/* War Room — full-screen overlay */}
      <AnimatePresence>
        {warRoomProject && (
          <WarRoom
            key="war-room"
            project={warRoomProject}
            onClose={closeWarRoom}
            onMerge={() => setTimeout(closeWarRoom, 2200)}
            onPurge={() => setTimeout(closeWarRoom, 2200)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
