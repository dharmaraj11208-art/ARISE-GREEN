import React, { useState } from 'react';
import { ReuseProject, ComponentCategory } from '../types';
import { X, Plus, Trash2, Layers } from 'lucide-react';

interface CreateProjectModalProps {
  onClose: () => void;
  onAddProject: (project: ReuseProject) => void;
}

const CATEGORIES: ComponentCategory[] = [
  'Power & Batteries',
  'Motors & Actuators',
  'Sensors & Inputs',
  'Displays & LEDs',
  'Audio & Buzzers',
  'Switches & Controls',
  'Microcontrollers & ICs',
  'Passive & Connectors',
  'Enclosures & Hardware',
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  onClose,
  onAddProject,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Home & Automation');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [estimatedTime, setEstimatedTime] = useState('30 mins');
  const [reductionKg, setReductionKg] = useState('0.35');
  const [description, setDescription] = useState('');
  const [circuitOverview, setCircuitOverview] = useState('');
  const [instructionsText, setInstructionsText] = useState('');
  const [reqComponents, setReqComponents] = useState<
    { name: string; category: ComponentCategory; quantity: number }[]
  >([{ name: '', category: 'Displays & LEDs', quantity: 1 }]);

  const handleAddComponentRow = () => {
    setReqComponents((prev) => [...prev, { name: '', category: 'Displays & LEDs', quantity: 1 }]);
  };

  const handleRemoveComponentRow = (index: number) => {
    setReqComponents((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || reqComponents.length === 0) return;

    const validReqs = reqComponents
      .filter((r) => r.name.trim().length > 0)
      .map((r) => ({
        name: r.name.trim(),
        category: r.category,
        quantity: Math.max(1, r.quantity),
      }));

    if (validReqs.length === 0) return;

    const instructions = instructionsText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const reduction = parseFloat(reductionKg) || 0.3;

    const newProj: ReuseProject = {
      id: `proj-custom-${Date.now()}`,
      title: title.trim(),
      category: category.trim(),
      difficulty,
      estimatedTime: estimatedTime.trim(),
      image: '/src/assets/images/project_usb_desk_light_1791115769843.jpg', // fallback image
      description: description.trim() || 'Custom upcycled electronic hardware design.',
      circuitOverview: circuitOverview.trim() || 'Custom wired circuit topology.',
      safetyPrecautions: ['Verify solder joints and ensure insulated housing.'],
      instructions:
        instructions.length > 0
          ? instructions
          : ['Assemble components on breadboard or prototype board.', 'Test power rails.', 'House securely in enclosure.'],
      requiredComponents: validReqs,
      estimatedEwasteReductionKg: reduction,
      reusableWeightKg: reduction,
      completedCount: 0,
    };

    onAddProject(newProj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Add Custom Reuse Blueprint
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-neutral-400 hover:text-white rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                Project Name <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Solar Bug Zapper, Battery Tester..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                Category
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Robotics, Home, Agritech..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                Estimated Time
              </label>
              <input
                type="text"
                value={estimatedTime}
                onChange={(e) => setEstimatedTime(e.target.value)}
                placeholder="40 mins"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
                E-Waste Saved (kg)
              </label>
              <input
                type="number"
                step="0.05"
                min="0.01"
                value={reductionKg}
                onChange={(e) => setReductionKg(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this circular project do?"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Circuit Overview
            </label>
            <textarea
              rows={2}
              value={circuitOverview}
              onChange={(e) => setCircuitOverview(e.target.value)}
              placeholder="Describe power flow, resistor values, switch connections..."
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white resize-none font-mono"
            />
          </div>

          {/* Required Components */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                Required Components (for Feasibility Engine)
              </label>
              <button
                type="button"
                onClick={handleAddComponentRow}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Component
              </button>
            </div>

            <div className="space-y-2">
              {reqComponents.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Component Name (e.g. 18650 Li-ion Cell, SPST Switch)"
                    value={item.name}
                    onChange={(e) => {
                      const val = e.target.value;
                      setReqComponents((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, name: val } : r))
                      );
                    }}
                    className="flex-1 bg-neutral-950 border border-neutral-800 rounded px-2.5 py-1.5 text-xs text-white"
                  />
                  <select
                    value={item.category}
                    onChange={(e) => {
                      const val = e.target.value as ComponentCategory;
                      setReqComponents((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, category: val } : r))
                      );
                    }}
                    className="bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-xs text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setReqComponents((prev) =>
                        prev.map((r, i) => (i === idx ? { ...r, quantity: val } : r))
                      );
                    }}
                    className="w-16 bg-neutral-950 border border-neutral-800 rounded px-2 py-1.5 text-xs text-white font-mono text-center"
                  />
                  {reqComponents.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveComponentRow(idx)}
                      className="text-neutral-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1">
              Step-by-step Assembly Instructions (One step per line)
            </label>
            <textarea
              rows={3}
              value={instructionsText}
              onChange={(e) => setInstructionsText(e.target.value)}
              placeholder="Step 1: Test cell voltage&#10;Step 2: Solder charging module&#10;Step 3: Secure in housing"
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white resize-none font-mono"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
            >
              Save Project to Directory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
