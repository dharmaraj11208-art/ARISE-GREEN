export type ComponentCategory =
  | 'Power & Batteries'
  | 'Motors & Actuators'
  | 'Sensors & Inputs'
  | 'Displays & LEDs'
  | 'Audio & Buzzers'
  | 'Switches & Controls'
  | 'Microcontrollers & ICs'
  | 'Passive & Connectors'
  | 'Enclosures & Hardware';

export type ComponentCondition = 'Tested Working' | 'Untested' | 'Refurbished' | 'Needs Repair';

export interface HarvestedComponent {
  id: string;
  name: string;
  category: ComponentCategory;
  quantity: number;
  weightPerUnit: number; // in kilograms
  totalWeight: number; // in kilograms
  condition: ComponentCondition;
  sourceAppliance?: string;
  notes?: string;
  dateAdded: string;
}

export interface ProjectComponentRequirement {
  name: string;
  category: ComponentCategory;
  quantity: number;
  alternativeNames?: string[];
  harvestHint?: string;
}

export interface ReuseProject {
  id: string;
  title: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  image: string;
  description: string;
  circuitOverview: string;
  safetyPrecautions: string[];
  instructions: string[];
  requiredComponents: ProjectComponentRequirement[];
  estimatedEwasteReductionKg: number;
  reusableWeightKg: number;
  completedCount?: number;
}

export interface ProjectFeasibility {
  project: ReuseProject;
  feasibilityScore: number; // 0 to 100
  isFullyFeasible: boolean;
  missingComponents: {
    requiredName: string;
    category: ComponentCategory;
    neededQuantity: number;
    availableQuantity: number;
    harvestHint?: string;
  }[];
  satisfiedComponents: {
    requiredName: string;
    category: ComponentCategory;
    neededQuantity: number;
    availableQuantity: number;
  }[];
  divertedWeightKg: number;
}

export interface DiversionRecord {
  id: string;
  timestamp: string;
  projectName?: string;
  componentsDiverted: {
    componentName: string;
    quantity: number;
    weightKg: number;
  }[];
  totalWeightKg: number;
  categorySummary: string;
  verifier: string;
  certificateId: string;
  notes?: string;
}

export type SafetyLevel = 'safe' | 'attention' | 'critical';

export interface SafetyStatusResult {
  level: SafetyLevel;
  percentage: number;
  statusLabel: string;
  colorClass: string;
  badgeBg: string;
  description: string;
}

export interface AppSettings {
  monthlyCapacityKg: number; // e.g., 80 kg
  monthlyDiversionTargetKg: number; // e.g., 50 kg
  facilityName: string;
  auditorName: string;
}
