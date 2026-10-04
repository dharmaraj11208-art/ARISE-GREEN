import React from 'react';
import {
  SafetyStatusResult,
  DiversionRecord,
  HarvestedComponent,
  ReuseProject,
  AppSettings,
} from '../types';
import {
  ShieldCheck,
  Scale,
  Cpu,
  Layers,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  AlertOctagon,
  Sparkles,
  PlusCircle,
  Clock,
} from 'lucide-react';

interface DashboardViewProps {
  safetyStatus: SafetyStatusResult;
  storedWeightKg: number;
  totalComponentsCount: number;
  completedProjectsCount: number;
  monthlyDivertedKg: number;
  settings: AppSettings;
  records: DiversionRecord[];
  components: HarvestedComponent[];
  projects: ReuseProject[];
  onNavigate: (tab: string) => void;
  onOpenRecordModal?: (rec: DiversionRecord) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  safetyStatus,
  storedWeightKg,
  totalComponentsCount,
  completedProjectsCount,
  monthlyDivertedKg,
  settings,
  records,
  onNavigate,
}) => {
  const targetPercentage = Math.min(
    100,
    Math.round((monthlyDivertedKg / settings.monthlyDiversionTargetKg) * 100)
  );

  return (
    <div className="space-y-8 pb-12">
      {/* Editorial Title Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <span>{settings.facilityName}</span>
            <span aria-hidden="true">·</span>
            <span>Circular Electronics Intelligence</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">October 2026 Audit Period</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            E-Waste Diversion & Reuse Ledger
          </h1>
          <p className="mt-1 text-sm text-neutral-400 max-w-2xl">
            Real-time tracking of salvaged components, safety thresholds, and circular reuse
            projects preventing hazardous landfill emissions.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigate('add-components')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Component Harvest</span>
          </button>
          <button
            onClick={() => onNavigate('recommendations')}
            className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 rounded-lg transition-colors whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Project Matcher</span>
          </button>
        </div>
      </div>

      {/* Safety Status & Monthly Target Hero Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Safety Status Card (Formula Displayed) */}
        <div className="lg:col-span-7 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {safetyStatus.level === 'critical' ? (
                <AlertOctagon className="w-5 h-5 text-rose-400" />
              ) : safetyStatus.level === 'attention' ? (
                <AlertTriangle className="w-5 h-5 text-amber-400" />
              ) : (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              )}
              <h2 className="text-sm font-semibold text-neutral-200 tracking-wide uppercase">
                Warehouse Safety Status
              </h2>
            </div>
            <div
              className={`px-3 py-1 rounded border text-xs font-mono tabular-nums font-medium ${safetyStatus.badgeBg}`}
            >
              {safetyStatus.statusLabel}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center mb-5">
            <div>
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {safetyStatus.percentage}%
              </div>
              <p className="text-xs text-neutral-400 mt-1">
                Capacity utilization ({storedWeightKg.toFixed(2)} kg / {settings.monthlyCapacityKg}{' '}
                kg max)
              </p>
            </div>

            {/* Formula breakdown */}
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-lg p-3 text-xs font-mono">
              <div className="text-neutral-400 text-[11px] mb-1">Standard Safety Equation:</div>
              <div className="text-neutral-300">
                <span className="text-emerald-400">{storedWeightKg.toFixed(2)} kg</span>
                {' ÷ '}
                <span className="text-neutral-400">{settings.monthlyCapacityKg} kg</span>
                {' × 100 = '}
                <span className={safetyStatus.colorClass}>{safetyStatus.percentage}%</span>
              </div>
            </div>
          </div>

          {/* Visual Progress Bar */}
          <div className="space-y-1.5 mb-4">
            <div className="w-full h-3 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  safetyStatus.level === 'critical'
                    ? 'bg-rose-500'
                    : safetyStatus.level === 'attention'
                    ? 'bg-amber-400'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, safetyStatus.percentage)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-neutral-400 font-mono">
              <span className="text-emerald-400">0% – 50% Safe</span>
              <span className="text-amber-400">51% – 100% Attention</span>
              <span className="text-rose-400">&gt; 100% Critical</span>
            </div>
          </div>

          <p className="text-xs text-neutral-400 leading-relaxed">{safetyStatus.description}</p>
        </div>

        {/* Monthly Waste-Diversion Target Card */}
        <div className="lg:col-span-5 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-neutral-200 uppercase tracking-wide">
                  Monthly Diversion Target
                </h2>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-medium">
                {targetPercentage}% Reached
              </span>
            </div>

            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {monthlyDivertedKg.toFixed(2)}
              </span>
              <span className="text-sm text-neutral-400 font-mono">
                / {settings.monthlyDiversionTargetKg.toFixed(1)} kg Target
              </span>
            </div>

            <div className="w-full h-2.5 bg-neutral-950 rounded-full overflow-hidden border border-neutral-800 mb-3">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${targetPercentage}%` }}
              />
            </div>

            <p className="text-xs text-neutral-400 leading-relaxed">
              Target for safe certified diversion from e-waste stream into active upcycling
              projects this month.
            </p>
          </div>

          <div className="mt-5 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-xs text-neutral-400 font-mono">
            <span>
              Remaining:{' '}
              <strong className="text-neutral-200">
                {Math.max(0, settings.monthlyDiversionTargetKg - monthlyDivertedKg).toFixed(2)} kg
              </strong>
            </span>
            <button
              onClick={() => onNavigate('projects')}
              className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1"
            >
              Browse Projects <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Primary Metric Counters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Stored E-Waste</span>
            <Scale className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {storedWeightKg.toFixed(2)} <span className="text-xs font-normal text-neutral-400">kg</span>
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Total recoverable scrap</p>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Components Saved</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {totalComponentsCount}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Ready for re-engineering</p>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Reuse Projects Built</span>
            <Layers className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {completedProjectsCount}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Active upcycled devices</p>
        </div>

        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-5">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Certified Diversions</span>
            <FileCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono tabular-nums">
            {records.length}
          </div>
          <p className="text-[11px] text-neutral-400 mt-1">Audit verification logs</p>
        </div>
      </div>

      {/* Safe Diversion Record & History Table */}
      <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-base font-semibold text-white">Safe Diversion Ledger</h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              Verified chain-of-custody documentation of components repurposed into circular
              hardware.
            </p>
          </div>
          <div className="text-xs font-mono text-neutral-400 flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Auditor: {settings.auditorName}</span>
          </div>
        </div>

        {records.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-neutral-800 rounded-lg">
            <FileCheck className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
            <p className="text-sm text-neutral-400">No safe diversion records logged yet.</p>
            <button
              onClick={() => onNavigate('recommendations')}
              className="mt-3 px-3 py-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium"
            >
              Build a project to log your first record →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Certificate ID</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Target Project / Destination</th>
                  <th className="py-3 px-4">Recovered Components</th>
                  <th className="py-3 px-4 text-right">Diverted Weight</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60 font-mono">
                {records.map((rec) => (
                  <tr key={rec.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-emerald-400">
                      {rec.certificateId}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400">{rec.timestamp}</td>
                    <td className="py-3.5 px-4 font-sans text-neutral-200 font-medium">
                      {rec.projectName || 'Direct Component Refurbishment'}
                    </td>
                    <td className="py-3.5 px-4 font-sans text-neutral-400">
                      <div className="truncate max-w-xs">{rec.categorySummary}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-white tabular-nums">
                      {rec.totalWeightKg.toFixed(2)} kg
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="text-emerald-400 font-medium">Verified Safe</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Callout: Component Harvest Matrix teaser */}
      <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-emerald-300">
            Have old appliances waiting to be disassembled?
          </h3>
          <p className="text-xs text-neutral-400 mt-1">
            Reference our electronics harvesting guide to learn pinouts, safe capacitor discharging,
            and component extraction.
          </p>
        </div>
        <button
          onClick={() => onNavigate('harvest-guide')}
          className="px-4 py-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-colors shrink-0"
        >
          View Disassembly Matrix
        </button>
      </div>
    </div>
  );
};
