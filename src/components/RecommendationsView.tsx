import React, { useState, useMemo } from 'react';
import { ProjectFeasibility, ReuseProject } from '../types';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Hammer,
  Scale,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface RecommendationsViewProps {
  rankedProjects: ProjectFeasibility[];
  onSelectProject: (project: ReuseProject) => void;
  onCommitBuild: (feasibility: ProjectFeasibility) => void;
  onNavigateToInventory: () => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  rankedProjects,
  onSelectProject,
  onCommitBuild,
  onNavigateToInventory,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'ready' | 'partial'>('all');

  const filteredRankings = useMemo(() => {
    if (filterMode === 'ready') {
      return rankedProjects.filter((r) => r.isFullyFeasible);
    }
    if (filterMode === 'partial') {
      return rankedProjects.filter((r) => !r.isFullyFeasible);
    }
    return rankedProjects;
  }, [rankedProjects, filterMode]);

  const fullyReadyCount = useMemo(() => {
    return rankedProjects.filter((r) => r.isFullyFeasible).length;
  }, [rankedProjects]);

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <span>Intelligent Matching</span>
            <span aria-hidden="true">·</span>
            <span>Automated Bill-of-Materials Cross-Reference</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{fullyReadyCount} Build-Ready</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Project Feasibility & Recommendations
          </h1>
          <p className="mt-1 text-sm text-neutral-400 max-w-2xl">
            Our recommendation engine dynamically compares your current component inventory against
            standard upcycling schematics, ranking build-ready circular hardware first.
          </p>
        </div>

        {/* Filter Segmented Control */}
        <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-lg p-1 text-xs shrink-0">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === 'all'
                ? 'bg-neutral-800 text-white shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            All Ranked ({rankedProjects.length})
          </button>
          <button
            onClick={() => setFilterMode('ready')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === 'ready'
                ? 'bg-neutral-800 text-emerald-400 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            100% Ready ({fullyReadyCount})
          </button>
          <button
            onClick={() => setFilterMode('partial')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
              filterMode === 'partial'
                ? 'bg-neutral-800 text-amber-400 font-semibold shadow-sm'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            Missing Parts ({rankedProjects.length - fullyReadyCount})
          </button>
        </div>
      </div>

      {/* Overview Stat Callout */}
      <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {fullyReadyCount > 0
                ? `${fullyReadyCount} Projects can be built immediately with 0 missing parts!`
                : 'Harvest a few more components to unlock 100% build feasibility.'}
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Clicking "Commit Build" will deduct the required items from inventory and log a verified
              Safe Diversion Record in the ledger.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToInventory}
          className="text-xs text-neutral-300 hover:text-white flex items-center gap-1 font-medium whitespace-nowrap self-start sm:self-auto"
        >
          Check Inventory Stock <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Ranked Project Cards Grid */}
      <div className="space-y-4">
        {filteredRankings.map((item, index) => {
          const { project, feasibilityScore, isFullyFeasible, missingComponents, satisfiedComponents } =
            item;

          return (
            <div
              key={project.id}
              className={`bg-neutral-900/60 border rounded-xl p-6 transition-all ${
                isFullyFeasible
                  ? 'border-emerald-500/40 hover:border-emerald-500/70'
                  : 'border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                {/* Left Side: Thumbnail & Info */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
                  <div
                    onClick={() => onSelectProject(project)}
                    className="w-full sm:w-36 h-28 rounded-lg overflow-hidden border border-neutral-800 shrink-0 cursor-pointer group relative bg-neutral-950"
                  >
                    <img
                      src={project.image}
                      alt={project.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-2">
                      <span className="text-[10px] font-mono text-neutral-300">
                        {project.estimatedTime}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
                      <span>#{index + 1} Suggested</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{project.difficulty}</span>
                    </div>

                    <h2
                      onClick={() => onSelectProject(project)}
                      className="text-base font-bold text-white hover:text-emerald-400 cursor-pointer transition-colors"
                    >
                      {project.title}
                    </h2>

                    <p className="text-xs text-neutral-400 line-clamp-2 max-w-xl">
                      {project.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-xs font-mono text-neutral-400">
                      <span className="flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-emerald-400" />
                        Diverts <strong>{project.estimatedEwasteReductionKg} kg</strong> e-waste
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5 text-neutral-400" />
                        {satisfiedComponents.length}/{project.requiredComponents.length} parts in stock
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Feasibility Bar & Actions */}
                <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end justify-between gap-4 shrink-0 lg:min-w-[240px]">
                  {/* Feasibility score indicator */}
                  <div className="w-full sm:w-auto lg:w-full space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-neutral-400">Feasibility</span>
                      <span
                        className={`font-bold tabular-nums ${
                          isFullyFeasible
                            ? 'text-emerald-400'
                            : feasibilityScore >= 50
                            ? 'text-amber-400'
                            : 'text-neutral-400'
                        }`}
                      >
                        {feasibilityScore}%
                      </span>
                    </div>

                    <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          isFullyFeasible
                            ? 'bg-emerald-400'
                            : feasibilityScore >= 50
                            ? 'bg-amber-400'
                            : 'bg-neutral-600'
                        }`}
                        style={{ width: `${feasibilityScore}%` }}
                      />
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto lg:w-full">
                    {isFullyFeasible ? (
                      <button
                        onClick={() => onCommitBuild(item)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap"
                        title="Deduct components and record diversion"
                      >
                        <Hammer className="w-3.5 h-3.5" />
                        <span>Commit Build</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSelectProject(project)}
                        className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-amber-300 hover:text-white bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition-colors whitespace-nowrap"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>View Missing ({missingComponents.length})</span>
                      </button>
                    )}

                    <button
                      onClick={() => onSelectProject(project)}
                      className="px-3 py-2 text-xs font-medium text-neutral-400 hover:text-white bg-neutral-950 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors"
                      title="Inspect circuit and components"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Missing Components Drawer if any */}
              {!isFullyFeasible && missingComponents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-neutral-800/80 text-xs">
                  <div className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Missing Components Needed to Build:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {missingComponents.map((missing) => (
                      <div
                        key={missing.requiredName}
                        className="bg-neutral-950/60 border border-neutral-800/80 rounded p-2 flex items-start justify-between gap-2"
                      >
                        <div>
                          <div className="font-medium text-neutral-200">
                            {missing.requiredName}
                          </div>
                          {missing.harvestHint && (
                            <div className="text-[10px] text-amber-400/90 mt-0.5">
                              Hint: {missing.harvestHint}
                            </div>
                          )}
                        </div>
                        <div className="text-right font-mono text-[11px] text-amber-400 tabular-nums shrink-0">
                          Need +{missing.neededQuantity}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
