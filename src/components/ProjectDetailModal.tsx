import React from 'react';
import { ReuseProject, HarvestedComponent } from '../types';
import { evaluateProjectFeasibility } from '../utils/calculator';
import {
  X,
  Scale,
  Clock,
  CheckCircle,
  AlertTriangle,
  Hammer,
  HelpCircle,
  ShieldAlert,
  ListOrdered,
  Cpu,
} from 'lucide-react';

interface ProjectDetailModalProps {
  project: ReuseProject | null;
  inventory: HarvestedComponent[];
  onClose: () => void;
  onCommitBuild: (project: ReuseProject) => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({
  project,
  inventory,
  onClose,
  onCommitBuild,
}) => {
  if (!project) return null;

  const evalResult = evaluateProjectFeasibility(project, inventory);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.difficulty} Level</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-semibold">{evalResult.feasibilityScore}% Feasible</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-6 space-y-6">
          {/* Hero Banner with Image & Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-5 aspect-[4/3] rounded-xl overflow-hidden border border-neutral-800 bg-neutral-950">
              <img
                src={project.image}
                alt={project.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="md:col-span-7 space-y-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">{project.title}</h1>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                  {project.description}
                </p>
              </div>

              {/* Metric stats row */}
              <div className="grid grid-cols-3 gap-3 p-3.5 bg-neutral-950/70 border border-neutral-800 rounded-xl font-mono text-xs">
                <div>
                  <div className="text-[11px] text-neutral-400">Build Time</div>
                  <div className="font-semibold text-white mt-0.5">{project.estimatedTime}</div>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400">Waste Prevented</div>
                  <div className="font-semibold text-emerald-400 mt-0.5">
                    {project.estimatedEwasteReductionKg} kg
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-neutral-400">Times Built</div>
                  <div className="font-semibold text-white mt-0.5">
                    {project.completedCount || 0} units
                  </div>
                </div>
              </div>

              {/* Feasibility Summary Alert */}
              <div
                className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                  evalResult.isFullyFeasible
                    ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  {evalResult.isFullyFeasible ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                  )}
                  <span>
                    {evalResult.isFullyFeasible
                      ? '100% of required components are in warehouse inventory!'
                      : `${evalResult.missingComponents.length} component types missing to complete build.`}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Bill of Materials: Required vs Available */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              Bill of Materials (Inventory Matching)
            </h2>

            <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-mono">
                    <th className="py-2.5 px-4">Required Component</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4 text-center">Req. Qty</th>
                    <th className="py-2.5 px-4 text-center">In Stock</th>
                    <th className="py-2.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/60">
                  {project.requiredComponents.map((req) => {
                    const matchedAvailable = inventory
                      .filter((i) => i.name.toLowerCase().includes(req.name.toLowerCase().split(' ')[0]))
                      .reduce((sum, i) => sum + i.quantity, 0);

                    const isSatisfied = matchedAvailable >= req.quantity;

                    return (
                      <tr key={req.name} className="hover:bg-neutral-850/40">
                        <td className="py-3 px-4">
                          <div className="font-medium text-neutral-200">{req.name}</div>
                          {req.harvestHint && (
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                              Harvest source: {req.harvestHint}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-neutral-400 font-mono">{req.category}</td>
                        <td className="py-3 px-4 text-center font-mono font-semibold text-white">
                          {req.quantity}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-semibold">
                          <span className={isSatisfied ? 'text-emerald-400' : 'text-rose-400'}>
                            {matchedAvailable}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`font-mono text-[11px] font-semibold ${
                              isSatisfied ? 'text-emerald-400' : 'text-amber-400'
                            }`}
                          >
                            {isSatisfied ? '✓ Ready' : `Missing ${req.quantity - matchedAvailable}`}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Circuit Overview & Step-by-Step Build Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Circuit & Schematics */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300">
                Circuit Architecture
              </h2>
              <div className="bg-neutral-950/60 border border-neutral-800 rounded-xl p-4 text-xs text-neutral-300 leading-relaxed font-mono">
                {project.circuitOverview}
              </div>

              {/* Safety Precautions */}
              <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                  <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Workshop Safety Precautions</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-neutral-400 space-y-1">
                  {project.safetyPrecautions.map((safe, idx) => (
                    <li key={idx}>{safe}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Step-by-step Assembly */}
            <div className="space-y-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-emerald-400" />
                Assembly Sequence
              </h2>
              <div className="space-y-2.5">
                {project.instructions.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-neutral-950/60 border border-neutral-800/80 rounded-lg flex items-start gap-3 text-xs"
                  >
                    <span className="font-mono font-bold text-emerald-400 shrink-0">
                      0{idx + 1}.
                    </span>
                    <span className="text-neutral-300 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer CTA */}
        <div className="px-6 py-4 border-t border-neutral-800 bg-neutral-950/80 flex items-center justify-between shrink-0">
          <div className="text-xs font-mono text-neutral-400">
            Diverts: <strong className="text-emerald-400">{project.estimatedEwasteReductionKg} kg</strong> e-waste from landfill
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white transition-colors"
            >
              Close
            </button>

            <button
              onClick={() => {
                onCommitBuild(project);
                onClose();
              }}
              disabled={!evalResult.isFullyFeasible}
              className={`flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-lg transition-colors ${
                evalResult.isFullyFeasible
                  ? 'bg-emerald-400 hover:bg-emerald-300 text-neutral-950 cursor-pointer'
                  : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
              }`}
              title={
                evalResult.isFullyFeasible
                  ? 'Deduct components and generate diversion certificate'
                  : 'Cannot build: inventory is missing components'
              }
            >
              <Hammer className="w-4 h-4" />
              <span>{evalResult.isFullyFeasible ? 'Deduct Components & Record Diversion' : 'Parts Missing'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
