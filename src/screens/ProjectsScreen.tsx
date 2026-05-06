import { ProjectForm } from "../components/ProjectForm";
import { ProjectList } from "../components/ProjectList";
import type { Project, ProjectFormData } from "../types";

interface ProjectsScreenProps {
  projects: Project[];
  onCreateProject: (data: ProjectFormData) => void;
}

export function ProjectsScreen({ projects, onCreateProject }: ProjectsScreenProps) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">Projekty</h1>
        <p className="mt-1 text-sm text-slate-600">Zarządzanie pomiarami terenowymi i laboratoryjnymi.</p>
      </div>

      <ProjectForm onCreateProject={onCreateProject} />

      <section className="space-y-3 lg:hidden">
        <h2 className="text-lg font-bold text-slate-950">Lista projektów</h2>
        <ProjectList projects={projects} />
      </section>
    </div>
  );
}
