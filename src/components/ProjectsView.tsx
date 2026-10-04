import React, { useState, useMemo } from 'react';
import { ReuseProject, HarvestedComponent } from '../types';
import { evaluateProjectFeasibility } from '../utils/calculator';
import {
  Search,
  Clock,
  Scale,
  Plus,
  Layers,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Filter,
} from 'lucide-react';

interface ProjectsViewProps {
  projects: ReuseProject[];
  inventory: HarvestedComponent[];
  onSelectProject: (project: ReuseProject) => void;
  onOpenCreateProjectModal: () => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({
  projects,
  inventory,
  onSelectProject,
  onOpenCreateProjectModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDiff = selectedDifficulty === 'All' || p.difficulty === selectedDifficulty;

      return matchesSearch && matchesDiff;
    });
  }, [projects, searchTerm, selectedDifficulty]);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <span>Circular Hardware Blueprint</span>
            <span aria-hidden="true">·</span>
            <span>Electronic Upcycling Directory</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{projects.length} Verified Schematics</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Reuse Projects Catalog
          </h1>
          <p className="mt-1 text-sm text-neutral-400 max-w-2xl">
            Tested open hardware designs optimized specifically for salvaged electronic waste components.
            Build emergency lamps, cooling devices, alarms, and smart soil probes.
          </p>
        </div>

        <button
          onClick={onOpenCreateProjectModal}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Blueprint</span>
        </button>
      </div>

      {/* Search & Filter */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by name, component, or category..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400 font-mono">Difficulty:</span>
          {['All', 'Beginner', 'Intermediate', 'Advanced'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                selectedDifficulty === diff
                  ? 'bg-neutral-800 text-emerald-400 font-semibold border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => {
          const evalResult = evaluateProjectFeasibility(project, inventory);

          return (
            <div
              key={project.id}
              onClick={() => onSelectProject(project)}
              className="bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 rounded-xl overflow-hidden cursor-pointer group flex flex-col justify-between transition-all duration-200 hover:-translate-y-0.5"
            >
              <div>
                {/* Image Container with measured contrast overlay */}
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-950">
                  <img
                    src={project.image}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-transparent" />

                  {/* Top metadata strip (Zero-Pill: subtle text on scrim) */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-neutral-300 drop-shadow">
                    <span className="bg-neutral-950/70 backdrop-blur px-2 py-0.5 rounded text-neutral-300 border border-neutral-800/80">
                      {project.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded border backdrop-blur text-[11px] font-mono tabular-nums ${
                        evalResult.isFullyFeasible
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                          : 'bg-neutral-950/80 text-neutral-300 border-neutral-800'
                      }`}
                    >
                      {evalResult.feasibilityScore}% Feasible
                    </span>
                  </div>

                  {/* Bottom title */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {project.title}
                    </h3>
                  </div>
                </div>

                {/* Body description */}
                <div className="p-5 space-y-3">
                  <p className="text-xs text-neutral-400 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  <div className="flex items-center gap-3 text-xs text-neutral-400 font-mono pt-1">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-neutral-400" />
                      {project.estimatedTime}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Scale className="w-3.5 h-3.5 text-emerald-400" />
                      {project.estimatedEwasteReductionKg} kg saved
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom footer button */}
              <div className="px-5 py-3.5 border-t border-neutral-800/80 bg-neutral-950/40 flex items-center justify-between text-xs">
                <span className="text-neutral-400 font-mono">
                  {evalResult.satisfiedComponents.length}/{project.requiredComponents.length} parts in stock
                </span>
                <span className="text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1 font-medium">
                  Inspect Project <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
