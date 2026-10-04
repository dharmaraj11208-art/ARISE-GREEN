import {
  HarvestedComponent,
  ReuseProject,
  ProjectFeasibility,
  SafetyStatusResult,
  SafetyLevel,
  DiversionRecord,
} from '../types';

/**
 * Calculates Safety Status based on:
 * Stored e-waste weight ÷ Monthly processing capacity × 100
 * - Green: 0–50% capacity used — Safe
 * - Yellow: 51–100% capacity used — Attention needed
 * - Red: Above 100% capacity used — Critical
 */
export function calculateSafetyStatus(
  storedWeightKg: number,
  monthlyCapacityKg: number
): SafetyStatusResult {
  const safeCapacity = monthlyCapacityKg > 0 ? monthlyCapacityKg : 80;
  const percentage = Math.round((storedWeightKg / safeCapacity) * 100);

  let level: SafetyLevel = 'safe';
  let statusLabel = 'Safe Capacity';
  let colorClass = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let description = 'Optimal warehouse volume. Storage conditions are within safe fire and handling thresholds.';

  if (percentage > 100) {
    level = 'critical';
    statusLabel = 'Critical Overcapacity';
    colorClass = 'text-rose-400';
    badgeBg = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    description = 'Overcapacity limit reached. Immediate sorting and processing required to prevent storage hazards.';
  } else if (percentage > 50) {
    level = 'attention';
    statusLabel = 'Attention Needed';
    colorClass = 'text-amber-400';
    badgeBg = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    description = 'Capacity utilization exceeds 50%. Schedule disassembly batches and diversion projects soon.';
  }

  return {
    level,
    percentage,
    statusLabel,
    colorClass,
    badgeBg,
    description,
  };
}

/**
 * Normalizes text for lenient component matching
 */
function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Evaluates feasibility of a project against current inventory
 */
export function evaluateProjectFeasibility(
  project: ReuseProject,
  inventory: HarvestedComponent[]
): ProjectFeasibility {
  let fulfilledPartsScoreSum = 0;
  const missingComponents: ProjectFeasibility['missingComponents'] = [];
  const satisfiedComponents: ProjectFeasibility['satisfiedComponents'] = [];

  for (const req of project.requiredComponents) {
    const reqNorm = normalizeName(req.name);

    // Find inventory match: exact or contains name or match alternative names
    const matchedComponents = inventory.filter((item) => {
      const itemNorm = normalizeName(item.name);
      if (itemNorm === reqNorm) return true;
      if (itemNorm.includes(reqNorm) || reqNorm.includes(itemNorm)) return true;
      if (req.alternativeNames?.some((alt) => itemNorm.includes(normalizeName(alt)))) return true;
      return false;
    });

    const totalAvailable = matchedComponents.reduce((sum, item) => sum + item.quantity, 0);

    const fraction = Math.min(1, totalAvailable / req.quantity);
    fulfilledPartsScoreSum += fraction;

    if (totalAvailable >= req.quantity) {
      satisfiedComponents.push({
        requiredName: req.name,
        category: req.category,
        neededQuantity: req.quantity,
        availableQuantity: totalAvailable,
      });
    } else {
      missingComponents.push({
        requiredName: req.name,
        category: req.category,
        neededQuantity: req.quantity - totalAvailable,
        availableQuantity: totalAvailable,
        harvestHint: req.harvestHint,
      });
    }
  }

  const rawPercentage = project.requiredComponents.length > 0
    ? (fulfilledPartsScoreSum / project.requiredComponents.length) * 100
    : 100;

  const feasibilityScore = Math.round(rawPercentage);
  const isFullyFeasible = missingComponents.length === 0;

  return {
    project,
    feasibilityScore,
    isFullyFeasible,
    missingComponents,
    satisfiedComponents,
    divertedWeightKg: project.estimatedEwasteReductionKg,
  };
}

/**
 * Ranks all projects by feasibility (100% at top, then descending by score, then by completed count)
 */
export function rankProjectsByFeasibility(
  projects: ReuseProject[],
  inventory: HarvestedComponent[]
): ProjectFeasibility[] {
  const evaluated = projects.map((p) => evaluateProjectFeasibility(p, inventory));

  return evaluated.sort((a, b) => {
    if (a.isFullyFeasible && !b.isFullyFeasible) return -1;
    if (!a.isFullyFeasible && b.isFullyFeasible) return 1;
    if (b.feasibilityScore !== a.feasibilityScore) {
      return b.feasibilityScore - a.feasibilityScore;
    }
    return (b.project.completedCount || 0) - (a.project.completedCount || 0);
  });
}

/**
 * Calculates sum of stored e-waste weight in kg
 */
export function calculateTotalStoredWeight(inventory: HarvestedComponent[]): number {
  const sum = inventory.reduce((total, item) => total + (item.totalWeight || item.quantity * item.weightPerUnit), 0);
  return Number(sum.toFixed(3));
}

/**
 * Calculates total count of components saved
 */
export function calculateTotalComponentsCount(inventory: HarvestedComponent[]): number {
  return inventory.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Calculates monthly diverted weight from safe diversion records
 */
export function calculateMonthlyDivertedWeight(records: DiversionRecord[]): number {
  const sum = records.reduce((total, rec) => total + rec.totalWeightKg, 0);
  return Number(sum.toFixed(2));
}
