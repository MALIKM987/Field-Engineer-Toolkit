import { ProjectForm } from "../components/ProjectForm";
import { ProjectList } from "../components/ProjectList";
import { useI18n } from "../i18n";
import type { Project, ProjectFormData } from "../types";

interface ProjectsScreenProps {
  projects: Project[];
  onCreateProject: (data: ProjectFormData) => void;
}

export function ProjectsScreen({ projects, onCreateProject }: ProjectsScreenProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-950">{t("projectsTitle")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("projectsLead")}</p>
      </div>

      <ProjectForm onSubmit={onCreateProject} />

      <section className="space-y-3 lg:hidden">
        <h2 className="text-lg font-bold text-slate-950">{t("projectsListTitle")}</h2>
        <ProjectList projects={projects} />
      </section>
    </div>
  );
}
