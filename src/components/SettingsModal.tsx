import React, { useState } from 'react';
import { AppSettings, DiversionRecord } from '../types';
import { X, Save, RotateCcw, Download, ShieldCheck, Building } from 'lucide-react';

interface SettingsModalProps {
  settings: AppSettings;
  records: DiversionRecord[];
  onSave: (newSettings: AppSettings) => void;
  onResetData: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  records,
  onSave,
  onResetData,
  onClose,
}) => {
  const [capacity, setCapacity] = useState(settings.monthlyCapacityKg.toString());
  const [target, setTarget] = useState(settings.monthlyDiversionTargetKg.toString());
  const [facilityName, setFacilityName] = useState(settings.facilityName);
  const [auditorName, setAuditorName] = useState(settings.auditorName);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      monthlyCapacityKg: parseFloat(capacity) || 80,
      monthlyDiversionTargetKg: parseFloat(target) || 50,
      facilityName: facilityName.trim() || 'ARISE Urban Recovery Hub',
      auditorName: auditorName.trim() || 'Lead Environmental Auditor',
    });
    onClose();
  };

  const handleExportLedgerJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `arise_green_audit_ledger_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Facility Configuration & Thresholds
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Monthly Processing Capacity (kg)
            </label>
            <input
              type="number"
              step="1"
              min="10"
              max="5000"
              required
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono tabular-nums"
            />
            <p className="text-[11px] text-neutral-400 mt-1 font-mono">
              Governs safety formula: Stored Weight ÷ {capacity || 80} kg × 100
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Monthly Diversion Target (kg)
            </label>
            <input
              type="number"
              step="1"
              min="5"
              max="5000"
              required
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Facility / Hub Name
            </label>
            <input
              type="text"
              required
              value={facilityName}
              onChange={(e) => setFacilityName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
              Environmental Auditor Name / Title
            </label>
            <input
              type="text"
              required
              value={auditorName}
              onChange={(e) => setAuditorName(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white"
            />
          </div>

          <div className="pt-3 border-t border-neutral-800 space-y-3">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportLedgerJSON}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-950 border border-neutral-800 rounded-lg transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Audit JSON</span>
              </button>

              {confirmReset ? (
                <button
                  type="button"
                  onClick={() => {
                    onResetData();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-800/60 rounded-lg transition-colors"
                >
                  Confirm Reset
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-400 hover:text-rose-400 bg-neutral-950 border border-neutral-800 rounded-lg transition-colors"
                  title="Reset sample inventory and projects"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo</span>
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
