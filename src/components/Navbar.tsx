import React from 'react';
import { SafetyStatusResult } from '../types';
import { Settings, ShieldCheck, AlertTriangle, AlertOctagon } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  safetyStatus: SafetyStatusResult;
  onOpenSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  safetyStatus,
  onOpenSettings,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'inventory', label: 'Components' },
    { id: 'add-components', label: 'Add Harvest' },
    { id: 'projects', label: 'Reuse Projects' },
    { id: 'recommendations', label: 'Recommendations' },
    { id: 'harvest-guide', label: 'Disassembly Guide' },
  ];

  const getStatusIcon = () => {
    switch (safetyStatus.level) {
      case 'critical':
        return <AlertOctagon className="w-3.5 h-3.5 text-rose-400" />;
      case 'attention':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-neutral-950/90 backdrop-blur-md border-b border-neutral-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => setActiveTab('dashboard')}
          className="text-left group cursor-pointer focus:outline-none"
        >
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
            ARISE GREEN
          </span>
        </button>

        {/* Zone 2: Navigation Links (clean typography, single line) */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`transition-colors whitespace-nowrap py-1 relative ${
                  isActive
                    ? 'text-emerald-400 font-semibold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions (Safety Beacon & Config) */}
        <div className="flex items-center gap-3">
          <div
            className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-md border text-xs font-mono tabular-nums ${safetyStatus.badgeBg}`}
            title={`Status: ${safetyStatus.statusLabel} (${safetyStatus.percentage}% capacity used)`}
          >
            {getStatusIcon()}
            <span>
              {safetyStatus.percentage}% Cap · {safetyStatus.statusLabel}
            </span>
          </div>

          <button
            onClick={onOpenSettings}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-900 rounded-lg border border-neutral-800/80 transition-colors"
            title="Configure Facility & Targets"
            aria-label="Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="md:hidden flex overflow-x-auto border-t border-neutral-850 px-4 py-2 gap-3 text-xs scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-2.5 py-1 whitespace-nowrap rounded font-medium ${
              activeTab === item.id
                ? 'bg-neutral-800 text-emerald-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
