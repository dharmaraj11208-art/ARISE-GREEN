import React, { useState, useMemo } from 'react';
import { HarvestedComponent, ComponentCategory } from '../types';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Download,
  Filter,
  Layers,
  Scale,
  Cpu,
  Table as TableIcon,
  LayoutGrid,
} from 'lucide-react';

interface InventoryViewProps {
  components: HarvestedComponent[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveComponent: (id: string) => void;
  onNavigateToAdd: () => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  components,
  onUpdateQuantity,
  onRemoveComponent,
  onNavigateToAdd,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(components.map((c) => c.category)));
    return ['All', ...cats];
  }, [components]);

  const filteredComponents = useMemo(() => {
    return components.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.sourceAppliance && item.sourceAppliance.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.notes && item.notes.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;

      return matchesSearch && matchesCat;
    });
  }, [components, searchTerm, selectedCategory]);

  const totalInventoryWeightKg = useMemo(() => {
    return Number(
      filteredComponents.reduce((sum, item) => sum + (item.totalWeight || item.quantity * item.weightPerUnit), 0).toFixed(3)
    );
  }, [filteredComponents]);

  const totalFilteredCount = useMemo(() => {
    return filteredComponents.reduce((sum, item) => sum + item.quantity, 0);
  }, [filteredComponents]);

  const handleExportCSV = () => {
    const headers = ['ID', 'Component Name', 'Category', 'Quantity', 'Unit Weight (kg)', 'Total Weight (kg)', 'Condition', 'Source Appliance', 'Notes', 'Date Added'];
    const rows = filteredComponents.map((c) => [
      c.id,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      c.quantity,
      c.weightPerUnit,
      c.totalWeight,
      `"${c.condition}"`,
      `"${(c.sourceAppliance || '').replace(/"/g, '""')}"`,
      `"${(c.notes || '').replace(/"/g, '""')}"`,
      c.dateAdded,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `arise_green_components_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <span>Material Recovery</span>
            <span aria-hidden="true">·</span>
            <span>Salvaged Hardware Ledger</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{components.length} Line Items</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Available Components Inventory
          </h1>
          <p className="mt-1 text-sm text-neutral-400">
            Catalog of tested parts ready for immediate diversion into circular reuse projects.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-900 hover:bg-neutral-850 border border-neutral-800 rounded-lg transition-colors"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={onNavigateToAdd}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Add Components</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by component name, donor appliance, or notes..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* View toggle & metrics */}
        <div className="flex items-center justify-between md:justify-end gap-3 text-xs">
          <div className="flex items-center gap-3 text-neutral-400 font-mono">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              <strong>{totalFilteredCount}</strong> units
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-emerald-400" />
              <strong>{totalInventoryWeightKg}</strong> kg
            </span>
          </div>

          <div className="flex items-center bg-neutral-950 border border-neutral-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'table' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Table View"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded transition-colors ${
                viewMode === 'grid' ? 'bg-neutral-800 text-white' : 'text-neutral-500 hover:text-neutral-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Filter Segments (Zero-Pill: segmented button controls) */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none text-xs">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-neutral-800 text-emerald-400 font-semibold border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Content: Table or Grid */}
      {filteredComponents.length === 0 ? (
        <div className="text-center py-16 bg-neutral-900/30 border border-dashed border-neutral-800 rounded-xl">
          <Layers className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
          <h2 className="text-sm font-semibold text-neutral-300">No components matched</h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or log new disassembled items into the inventory.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('All');
            }}
            className="mt-4 px-3 py-1.5 text-xs text-emerald-400 hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400 uppercase tracking-wider font-mono">
                  <th className="py-3 px-4">Component Details</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Condition</th>
                  <th className="py-3 px-4 text-center">Quantity (Units)</th>
                  <th className="py-3 px-4 text-right">Unit Weight</th>
                  <th className="py-3 px-4 text-right">Total Weight</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {filteredComponents.map((item) => (
                  <tr key={item.id} className="hover:bg-neutral-800/30 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-neutral-100">{item.name}</div>
                      {item.sourceAppliance && (
                        <div className="text-[11px] text-neutral-400 mt-0.5">
                          From: {item.sourceAppliance}
                        </div>
                      )}
                      {item.notes && (
                        <div className="text-[11px] text-neutral-500 mt-0.5 truncate max-w-sm">
                          {item.notes}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-neutral-400 font-mono">
                      {item.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-neutral-300 font-mono text-[11px]">
                        {item.condition}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-2 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 font-mono">
                        <button
                          onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="text-neutral-400 hover:text-white p-0.5 transition-colors"
                          title="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="font-semibold text-white min-w-[20px] text-center tabular-nums">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-neutral-400 hover:text-white p-0.5 transition-colors"
                          title="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-neutral-400 tabular-nums">
                      {(item.weightPerUnit * 1000).toFixed(0)} g
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-emerald-400 tabular-nums">
                      {(item.totalWeight || item.quantity * item.weightPerUnit).toFixed(3)} kg
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {confirmDeleteId === item.id ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              onRemoveComponent(item.id);
                              setConfirmDeleteId(null);
                            }}
                            className="px-2 py-1 text-[11px] font-semibold text-rose-400 hover:bg-rose-950/40 border border-rose-800/60 rounded"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(null)}
                            className="px-2 py-1 text-[11px] text-neutral-400 hover:text-neutral-200"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmDeleteId(item.id)}
                          className="p-1.5 text-neutral-500 hover:text-rose-400 rounded transition-colors"
                          title="Remove component"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredComponents.map((item) => (
            <div
              key={item.id}
              className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-5 flex flex-col justify-between hover:border-neutral-700 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-[11px] text-neutral-400 font-mono">{item.category}</span>
                  <span className="text-[11px] text-neutral-400 font-mono">{item.condition}</span>
                </div>
                <h3 className="text-sm font-semibold text-white leading-snug">{item.name}</h3>
                {item.sourceAppliance && (
                  <p className="text-xs text-neutral-400 mt-1">From: {item.sourceAppliance}</p>
                )}
                {item.notes && (
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{item.notes}</p>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-neutral-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Weight: {(item.totalWeight || item.quantity * item.weightPerUnit).toFixed(3)} kg
                  </div>
                  <div className="text-[10px] text-neutral-500 font-mono">
                    ({(item.weightPerUnit * 1000).toFixed(0)}g each)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="inline-flex items-center gap-1.5 bg-neutral-950 border border-neutral-800 rounded px-2 py-1 font-mono text-xs">
                    <button
                      onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="text-neutral-400 hover:text-white"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="font-semibold text-white tabular-nums px-1">{item.quantity}</span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                      className="text-neutral-400 hover:text-white"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveComponent(item.id)}
                    className="p-1.5 text-neutral-500 hover:text-rose-400 rounded"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
