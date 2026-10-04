import React, { useState } from 'react';
import { ComponentCategory, ComponentCondition, HarvestedComponent } from '../types';
import { APPLIANCE_PRESETS } from '../data/initialData';
import { Plus, Check, Sparkles, AlertCircle } from 'lucide-react';

interface AddComponentsViewProps {
  onAddComponent: (comp: Omit<HarvestedComponent, 'id' | 'dateAdded'>) => void;
  onAddBatch: (components: Omit<HarvestedComponent, 'id' | 'dateAdded'>[]) => void;
  onNavigate: (tab: string) => void;
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

const CONDITIONS: ComponentCondition[] = [
  'Tested Working',
  'Untested',
  'Refurbished',
  'Needs Repair',
];

export const AddComponentsView: React.FC<AddComponentsViewProps> = ({
  onAddComponent,
  onAddBatch,
  onNavigate,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ComponentCategory>('Power & Batteries');
  const [quantity, setQuantity] = useState<number>(1);
  const [weightInput, setWeightInput] = useState<string>('0.05');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'g'>('kg');
  const [condition, setCondition] = useState<ComponentCondition>('Tested Working');
  const [sourceAppliance, setSourceAppliance] = useState('');
  const [notes, setNotes] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numWeight = parseFloat(weightInput) || 0.01;
    const weightInKg = weightUnit === 'g' ? numWeight / 1000 : numWeight;
    const totalWeight = Number((weightInKg * quantity).toFixed(3));

    onAddComponent({
      name: name.trim(),
      category,
      quantity: Math.max(1, quantity),
      weightPerUnit: weightInKg,
      totalWeight,
      condition,
      sourceAppliance: sourceAppliance.trim() || 'Salvaged Appliance',
      notes: notes.trim(),
    });

    setFeedbackMessage(`Logged ${quantity}x "${name.trim()}" into inventory.`);
    setName('');
    setNotes('');
    setSourceAppliance('');
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleApplyPreset = (presetIndex: number) => {
    const preset = APPLIANCE_PRESETS[presetIndex];
    if (!preset) return;

    const items = preset.components.map((c) => ({
      name: c.name,
      category: c.category,
      quantity: c.qty,
      weightPerUnit: c.weightPerUnit,
      totalWeight: Number((c.qty * c.weightPerUnit).toFixed(3)),
      condition: 'Tested Working' as ComponentCondition,
      sourceAppliance: preset.appliance,
      notes: `Batch harvested from decommissioned ${preset.appliance}`,
    }));

    onAddBatch(items);
    setFeedbackMessage(`Successfully harvested batch from "${preset.appliance}" (${items.length} component types added).`);
    setTimeout(() => setFeedbackMessage(null), 4500);
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto">
      {/* Title */}
      <div className="border-b border-neutral-800/80 pb-6">
        <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
          <span>Inventory Intake</span>
          <span aria-hidden="true">·</span>
          <span>Harvest Recovery Logging</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
          Add Harvested Components
        </h1>
        <p className="mt-1 text-sm text-neutral-400">
          Register salvaged electrical components recovered from disassembled electronic waste.
          These immediately factor into project feasibility algorithms and warehouse safety capacity.
        </p>
      </div>

      {feedbackMessage && (
        <div className="p-4 bg-emerald-950/40 border border-emerald-500/30 rounded-xl flex items-center justify-between text-sm text-emerald-300">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{feedbackMessage}</span>
          </div>
          <button
            onClick={() => onNavigate('inventory')}
            className="text-xs underline text-emerald-400 hover:text-emerald-200"
          >
            View Available Inventory →
          </button>
        </div>
      )}

      {/* Main Grid: Form + Quick Batch Intake */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Component Entry Form */}
        <div className="lg:col-span-7 bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="comp-name" className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Component Name <span className="text-rose-400">*</span>
              </label>
              <input
                id="comp-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. 18650 Li-ion Cell (3.7V), 12V DC Brushless Fan..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="comp-category" className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Category <span className="text-rose-400">*</span>
                </label>
                <select
                  id="comp-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ComponentCategory)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white transition-colors"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="comp-condition" className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Functional Condition
                </label>
                <select
                  id="comp-condition"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as ComponentCondition)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white transition-colors"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="comp-qty" className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                  Quantity (Units) <span className="text-rose-400">*</span>
                </label>
                <input
                  id="comp-qty"
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono tabular-nums transition-colors"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="comp-weight" className="text-xs font-semibold uppercase tracking-wider text-neutral-300">
                    Unit Weight <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded p-0.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => setWeightUnit('kg')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        weightUnit === 'kg' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-500'
                      }`}
                    >
                      kg
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeightUnit('g')}
                      className={`px-1.5 py-0.5 rounded transition-colors ${
                        weightUnit === 'g' ? 'bg-neutral-800 text-emerald-400' : 'text-neutral-500'
                      }`}
                    >
                      g
                    </button>
                  </div>
                </div>
                <input
                  id="comp-weight"
                  type="number"
                  step="0.001"
                  min="0.001"
                  required
                  value={weightInput}
                  onChange={(e) => setWeightInput(e.target.value)}
                  placeholder={weightUnit === 'kg' ? '0.048' : '48'}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white font-mono tabular-nums transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="comp-source" className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Source Appliance / Donor Item
              </label>
              <input
                id="comp-source"
                type="text"
                value={sourceAppliance}
                onChange={(e) => setSourceAppliance(e.target.value)}
                placeholder="e.g. Scrapped Dell Inspiron Battery, Broken Desk Microwave..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="comp-notes" className="block text-xs font-semibold uppercase tracking-wider text-neutral-300 mb-1.5">
                Technical Notes & Testing Status
              </label>
              <textarea
                id="comp-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Voltage tested at 4.1V, continuous contact verified, cleaned heatsink..."
                className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 transition-colors resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save to Available Inventory</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right: Quick Batch Intake from Common Appliances */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
                Rapid Appliance Intake
              </h2>
            </div>
            <p className="text-xs text-neutral-400 mb-4 leading-relaxed">
              Disassembled a whole device? Rapidly import standard salvaged component bundles with
              tested weights and categories in 1-click.
            </p>

            <div className="space-y-3">
              {APPLIANCE_PRESETS.map((preset, idx) => (
                <div
                  key={preset.appliance}
                  className="p-3.5 bg-neutral-950/80 border border-neutral-800 hover:border-neutral-700 rounded-lg transition-colors flex items-center justify-between gap-3"
                >
                  <div>
                    <h3 className="text-xs font-semibold text-neutral-200">
                      {preset.appliance}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-mono mt-0.5">
                      <span>{preset.components.length} component types</span>
                      <span aria-hidden="true">·</span>
                      <span>~{preset.typicalWeightKg} kg total</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyPreset(idx)}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-md transition-colors whitespace-nowrap"
                  >
                    + Import Batch
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-neutral-900/30 border border-neutral-800/80 rounded-xl p-5 text-xs text-neutral-400 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-neutral-200">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span>Safe Handling Reminder</span>
            </div>
            <p className="leading-relaxed">
              Discharge all high-voltage electrolytic capacitors before handling PCBs. Never short
              salvaged 18650 cells. Store lithium packs in insulated fire-safe bins.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
