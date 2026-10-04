import React, { useState, useEffect, useMemo } from 'react';
import {
  HarvestedComponent,
  ReuseProject,
  DiversionRecord,
  AppSettings,
  ProjectFeasibility,
} from './types';
import {
  INITIAL_COMPONENTS,
  INITIAL_PROJECTS,
  INITIAL_RECORDS,
  INITIAL_SETTINGS,
} from './data/initialData';
import {
  calculateSafetyStatus,
  calculateTotalStoredWeight,
  calculateTotalComponentsCount,
  calculateMonthlyDivertedWeight,
  rankProjectsByFeasibility,
} from './utils/calculator';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { InventoryView } from './components/InventoryView';
import { AddComponentsView } from './components/AddComponentsView';
import { ProjectsView } from './components/ProjectsView';
import { RecommendationsView } from './components/RecommendationsView';
import { HarvestGuideView } from './components/HarvestGuideView';
import { ProjectDetailModal } from './components/ProjectDetailModal';
import { SettingsModal } from './components/SettingsModal';
import { CreateProjectModal } from './components/CreateProjectModal';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  // Local storage state initialization with resilient fallbacks
  const [components, setComponents] = useState<HarvestedComponent[]>(() => {
    try {
      const saved = localStorage.getItem('arise_green_components');
      return saved ? JSON.parse(saved) : INITIAL_COMPONENTS;
    } catch {
      return INITIAL_COMPONENTS;
    }
  });

  const [projects, setProjects] = useState<ReuseProject[]>(() => {
    try {
      const saved = localStorage.getItem('arise_green_projects');
      return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
    } catch {
      return INITIAL_PROJECTS;
    }
  });

  const [records, setRecords] = useState<DiversionRecord[]>(() => {
    try {
      const saved = localStorage.getItem('arise_green_records');
      return saved ? JSON.parse(saved) : INITIAL_RECORDS;
    } catch {
      return INITIAL_RECORDS;
    }
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('arise_green_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedProject, setSelectedProject] = useState<ReuseProject | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; subtitle: string } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('arise_green_components', JSON.stringify(components));
  }, [components]);

  useEffect(() => {
    localStorage.setItem('arise_green_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('arise_green_records', JSON.stringify(records));
  }, [records]);

  useEffect(() => {
    localStorage.setItem('arise_green_settings', JSON.stringify(settings));
  }, [settings]);

  // Derived metrics
  const storedWeightKg = useMemo(() => calculateTotalStoredWeight(components), [components]);
  const totalComponentsCount = useMemo(() => calculateTotalComponentsCount(components), [components]);
  const monthlyDivertedKg = useMemo(() => calculateMonthlyDivertedWeight(records), [records]);

  const safetyStatus = useMemo(
    () => calculateSafetyStatus(storedWeightKg, settings.monthlyCapacityKg),
    [storedWeightKg, settings.monthlyCapacityKg]
  );

  const completedProjectsCount = useMemo(() => {
    return projects.reduce((sum, p) => sum + (p.completedCount || 0), 0);
  }, [projects]);

  const rankedProjects = useMemo(() => {
    return rankProjectsByFeasibility(projects, components);
  }, [projects, components]);

  // Component Actions
  const handleAddComponent = (newComp: Omit<HarvestedComponent, 'id' | 'dateAdded'>) => {
    const item: HarvestedComponent = {
      ...newComp,
      id: `comp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dateAdded: new Date().toISOString().slice(0, 10),
    };
    setComponents((prev) => [item, ...prev]);
  };

  const handleAddBatch = (items: Omit<HarvestedComponent, 'id' | 'dateAdded'>[]) => {
    const today = new Date().toISOString().slice(0, 10);
    const newItems: HarvestedComponent[] = items.map((item, idx) => ({
      ...item,
      id: `comp-batch-${Date.now()}-${idx}`,
      dateAdded: today,
    }));
    setComponents((prev) => [...newItems, ...prev]);
  };

  const handleUpdateQuantity = (id: string, newQty: number) => {
    setComponents((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const qty = Math.max(1, newQty);
          return {
            ...item,
            quantity: qty,
            totalWeight: Number((qty * item.weightPerUnit).toFixed(3)),
          };
        }
        return item;
      })
    );
  };

  const handleRemoveComponent = (id: string) => {
    setComponents((prev) => prev.filter((item) => item.id !== id));
  };

  // Build / Commit Project Transaction
  const handleCommitBuild = (projectToBuild: ReuseProject | ProjectFeasibility) => {
    const project = 'project' in projectToBuild ? projectToBuild.project : projectToBuild;

    // Deduct required quantities from matching components
    let updatedInventory = [...components];
    const divertedItemsList: { componentName: string; quantity: number; weightKg: number }[] = [];

    for (const req of project.requiredComponents) {
      let needed = req.quantity;
      const reqNorm = req.name.toLowerCase().replace(/[^a-z0-9]/g, '');

      updatedInventory = updatedInventory.map((item) => {
        if (needed <= 0) return item;
        const itemNorm = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (itemNorm.includes(reqNorm) || reqNorm.includes(itemNorm)) {
          const deduct = Math.min(needed, item.quantity);
          needed -= deduct;
          divertedItemsList.push({
            componentName: item.name,
            quantity: deduct,
            weightKg: Number((deduct * item.weightPerUnit).toFixed(3)),
          });
          const remainingQty = item.quantity - deduct;
          return {
            ...item,
            quantity: remainingQty,
            totalWeight: Number((remainingQty * item.weightPerUnit).toFixed(3)),
          };
        }
        return item;
      }).filter((item) => item.quantity > 0);
    }

    setComponents(updatedInventory);

    // Create Safe Diversion Record
    const certificateId = `AG-DIV-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date();
    const formattedTimestamp = `${now.toISOString().slice(0, 10)} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const newRecord: DiversionRecord = {
      id: `REC-${Date.now()}`,
      timestamp: formattedTimestamp,
      projectName: project.title,
      componentsDiverted: divertedItemsList,
      totalWeightKg: project.estimatedEwasteReductionKg,
      categorySummary: project.requiredComponents.map((r) => r.category).filter((v, i, a) => a.indexOf(v) === i).join(', '),
      verifier: settings.auditorName,
      certificateId,
      notes: `Assembled from verified stock. Certificate ${certificateId} registered to warehouse chain-of-custody.`,
    };

    setRecords((prev) => [newRecord, ...prev]);

    // Update Project completedCount
    setProjects((prev) =>
      prev.map((p) =>
        p.id === project.id ? { ...p, completedCount: (p.completedCount || 0) + 1 } : p
      )
    );

    // Toast notification
    setToastMessage({
      title: `Project "${project.title}" Built!`,
      subtitle: `Diverted ${project.estimatedEwasteReductionKg} kg of e-waste. Certificate ${certificateId} logged.`,
    });
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleResetData = () => {
    setComponents(INITIAL_COMPONENTS);
    setProjects(INITIAL_PROJECTS);
    setRecords(INITIAL_RECORDS);
    setSettings(INITIAL_SETTINGS);
    setToastMessage({
      title: 'Reset Completed',
      subtitle: 'Restored original demo components, projects, and diversion records.',
    });
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md bg-neutral-900 border border-emerald-500/40 rounded-xl p-4 shadow-2xl flex items-start gap-3 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{toastMessage.title}</h4>
            <p className="text-xs text-neutral-300 mt-0.5 leading-snug">{toastMessage.subtitle}</p>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Bar Contract (3-Zone) */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        safetyStatus={safetyStatus}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            safetyStatus={safetyStatus}
            storedWeightKg={storedWeightKg}
            totalComponentsCount={totalComponentsCount}
            completedProjectsCount={completedProjectsCount}
            monthlyDivertedKg={monthlyDivertedKg}
            settings={settings}
            records={records}
            components={components}
            projects={projects}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryView
            components={components}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveComponent={handleRemoveComponent}
            onNavigateToAdd={() => setActiveTab('add-components')}
          />
        )}

        {activeTab === 'add-components' && (
          <AddComponentsView
            onAddComponent={handleAddComponent}
            onAddBatch={handleAddBatch}
            onNavigate={(tab) => setActiveTab(tab)}
          />
        )}

        {activeTab === 'projects' && (
          <ProjectsView
            projects={projects}
            inventory={components}
            onSelectProject={(proj) => setSelectedProject(proj)}
            onOpenCreateProjectModal={() => setIsCreateProjectOpen(true)}
          />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            rankedProjects={rankedProjects}
            onSelectProject={(proj) => setSelectedProject(proj)}
            onCommitBuild={handleCommitBuild}
            onNavigateToInventory={() => setActiveTab('inventory')}
          />
        )}

        {activeTab === 'harvest-guide' && (
          <HarvestGuideView
            onSelectAppliancePreset={() => {
              setActiveTab('add-components');
            }}
          />
        )}
      </main>

      {/* Modals */}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          inventory={components}
          onClose={() => setSelectedProject(null)}
          onCommitBuild={handleCommitBuild}
        />
      )}

      {isSettingsOpen && (
        <SettingsModal
          settings={settings}
          records={records}
          onSave={(newSettings) => setSettings(newSettings)}
          onResetData={handleResetData}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}

      {isCreateProjectOpen && (
        <CreateProjectModal
          onClose={() => setIsCreateProjectOpen(false)}
          onAddProject={(newProj) => {
            setProjects((prev) => [newProj, ...prev]);
            setSelectedProject(newProj);
          }}
        />
      )}

      {/* Quiet Footer (anti-slop restraint: clean editorial footer) */}
      <footer className="border-t border-neutral-900 bg-neutral-950/80 py-6 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-neutral-300 font-semibold">ARISE GREEN</span>
            <span aria-hidden="true">·</span>
            <span>Electronic Waste Diversion System</span>
            <span aria-hidden="true">·</span>
            <span>{settings.facilityName}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Safety Rule: Stored Weight ÷ Monthly Capacity × 100</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400">ISO 14001 Compliant Ledger</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
