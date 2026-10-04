import React, { useState } from 'react';
import {
  Wrench,
  AlertTriangle,
  Zap,
  Cpu,
  Layers,
  Search,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface HarvestGuideViewProps {
  onSelectAppliancePreset: (applianceName: string) => void;
}

interface GuideItem {
  id: string;
  name: string;
  category: string;
  difficulty: 'Low Risk' | 'Medium Risk' | 'High Risk';
  salvageYield: string[];
  hazardousCautions: string[];
  recommendedTools: string[];
  typicalWeightKg: number;
}

const APPLIANCE_GUIDES: GuideItem[] = [
  {
    id: 'guide-laptop',
    name: 'Broken Laptops & Notebooks',
    category: 'Consumer Computing',
    difficulty: 'Low Risk',
    salvageYield: [
      '18650 or Li-Po battery cells (3.7V - check resting charge)',
      'High-grade copper heat pipes and sintered radiators',
      'Ultra-compact 5V blower fans (brushless, silent)',
      'Mini neodymium magnets (from display lid sensor latch)',
      'Stereo miniature speaker drivers (4Ω to 8Ω)',
      'Microphone and web-cam USB sensor modules',
    ],
    hazardousCautions: [
      'Never puncture lithium pouch cells or dent 18650 cylinders.',
      'Check older non-LED screens for CCFL backlights which contain traces of mercury.',
    ],
    recommendedTools: ['Precision Phillips PH00 / PH0', 'Plastic pry spudger', 'Digital multimeter'],
    typicalWeightKg: 2.2,
  },
  {
    id: 'guide-microwave',
    name: 'Microwave Ovens',
    category: 'Household Heavy Appliances',
    difficulty: 'High Risk',
    salvageYield: [
      '10A to 16A heavy-duty SPDT microswitches (door interlocks)',
      'Loud 5V/12V piezo buzzer modules',
      'Turntable synchronous AC motor (high torque, low RPM)',
      'Digital LED 4-digit clock display modules',
      'High-volume 230V/115V shaded-pole cooling fan',
      'High-current thermal cutoff switches (bimetallic snap discs)',
    ],
    hazardousCautions: [
      'DANGER: High-Voltage Transformer (MOT) and High-Voltage Capacitor (>2,000 Volts). ALWAYS verify discharge before touching interior.',
      'Magnetron tube ceramic insulator contains Beryllium Oxide dust if broken. Do not crush or break magnetron.',
    ],
    recommendedTools: ['Insulated screwdriver for HV discharge', 'Wire cutters', 'Safety glasses'],
    typicalWeightKg: 12.5,
  },
  {
    id: 'guide-psu',
    name: 'Desktop PC Power Supplies (ATX PSU)',
    category: 'Computer Hardware',
    difficulty: 'Medium Risk',
    salvageYield: [
      '80mm / 120mm 12V DC brushless cooling fans',
      'Large extruded aluminum heatsinks with thermal pads',
      'Toroidal choke inductors and ferrite beads',
      'Heavy gauge stranded copper hookup wire (18 AWG)',
      'IEC C14 power inlet socket with rocker toggle switch',
      'Bridge rectifiers and Schottky barrier dual diodes',
    ],
    hazardousCautions: [
      'Primary filter capacitors (200V-400V) can hold lethal charge even after unplugging. Wait 48 hours or manually discharge with a resistor.',
    ],
    recommendedTools: ['Phillips PH2', 'Insulated resistor discharge probe', 'Soldering desoldering braid'],
    typicalWeightKg: 1.8,
  },
  {
    id: 'guide-powerbank',
    name: 'Discarded USB Power Banks',
    category: 'Portable Electronics',
    difficulty: 'Low Risk',
    salvageYield: [
      'TP4056 or dedicated boost converter / charging IC boards',
      'Standard USB-A and USB Type-C female receptacles',
      'SMD battery level indicator LEDs',
      'Push button momentary tactile switches',
      'Aluminum extruded enclosures or ABS housings',
    ],
    hazardousCautions: [
      'Puffed or swollen lithium batteries must be isolated in sand immediately and taken to hazardous recycling.',
    ],
    recommendedTools: ['Plastic pry tool', 'Digital multimeter', 'Insulating Kapton tape'],
    typicalWeightKg: 0.28,
  },
  {
    id: 'guide-printer',
    name: 'Office Inkjet & Laser Printers',
    category: 'Office Automation',
    difficulty: 'Medium Risk',
    salvageYield: [
      'Bipolar and unipolar stepper motors (NEMA 17 / high precision)',
      'Stainless steel linear guide rods (ground and polished)',
      'Optical interrupter sensors (photo-interrupters)',
      'Mini timing belts and pulleys',
      'Compression springs and steel torsion springs',
      'Solenoids and gear assemblies',
    ],
    hazardousCautions: [
      'Laser toner powder is a micro-particulate respiratory irritant. Wear an N95 dust mask if disassembling laser drums.',
    ],
    recommendedTools: ['Hex keys', 'Long-reach Phillips screwdriver', 'Dust mask'],
    typicalWeightKg: 6.0,
  },
  {
    id: 'guide-toys',
    name: 'RC Toys, Drones & Gadgets',
    category: 'Consumer Toys',
    difficulty: 'Low Risk',
    salvageYield: [
      'Coreless micro DC motors (high RPM 3V-5V)',
      'HC-SR04 ultrasonic distance sensors',
      'Mini piezo sounders and buzzers',
      'Infrared receiver diodes and transmitters',
      'Battery snap connectors (9V, AA/AAA holders)',
      'Miniature toggle switches and slide switches',
    ],
    hazardousCautions: [
      'Inspect battery compartments for alkaline electrolyte leakage or corrosion.',
    ],
    recommendedTools: ['Micro precision screwdriver kit', 'Wire strippers'],
    typicalWeightKg: 0.45,
  },
];

export const HarvestGuideView: React.FC<HarvestGuideViewProps> = ({
  onSelectAppliancePreset,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('All');

  const filtered = APPLIANCE_GUIDES.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.salvageYield.some((y) => y.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRisk = selectedRisk === 'All' || item.difficulty === selectedRisk;

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-neutral-400 mb-2">
            <span>Knowledge Base</span>
            <span aria-hidden="true">·</span>
            <span>Appliance Disassembly & Component Matrix</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">{APPLIANCE_GUIDES.length} Recovery Guides</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Appliance Harvesting Guide
          </h1>
          <p className="mt-1 text-sm text-neutral-400 max-w-2xl">
            Learn which parts to recover from discarded electronic appliances, how to navigate
            hazardous electrical components safely, and extract maximum circular value.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search appliance or desired component (e.g. stepper motor, fan, 18650)..."
            className="w-full bg-neutral-950 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-neutral-400 font-mono">Safety Risk:</span>
          {['All', 'Low Risk', 'Medium Risk', 'High Risk'].map((risk) => (
            <button
              key={risk}
              onClick={() => setSelectedRisk(risk)}
              className={`px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                selectedRisk === risk
                  ? 'bg-neutral-800 text-emerald-400 font-semibold border border-neutral-700'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {risk}
            </button>
          ))}
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="bg-neutral-900/60 border border-neutral-800 rounded-xl p-6 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-mono text-neutral-400">{item.category}</span>
                  <h2 className="text-lg font-bold text-white mt-0.5">{item.name}</h2>
                </div>
                <span
                  className={`text-[11px] font-mono px-2 py-0.5 rounded border tabular-nums ${
                    item.difficulty === 'High Risk'
                      ? 'bg-rose-950/60 text-rose-400 border-rose-800/60'
                      : item.difficulty === 'Medium Risk'
                      ? 'bg-amber-950/60 text-amber-400 border-amber-800/60'
                      : 'bg-emerald-950/60 text-emerald-400 border-emerald-800/60'
                  }`}
                >
                  {item.difficulty}
                </span>
              </div>

              {/* Harvest Yield */}
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                  <Cpu className="w-3.5 h-3.5" />
                  Recoverable Components:
                </h3>
                <ul className="space-y-1 text-xs text-neutral-300">
                  {item.salvageYield.map((part, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-mono">›</span>
                      <span>{part}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Safety Hazards */}
              <div className="bg-neutral-950/80 border border-neutral-800/80 rounded-lg p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Safety Protocol & Hazards</span>
                </div>
                <ul className="space-y-1 text-[11px] text-neutral-400 leading-relaxed">
                  {item.hazardousCautions.map((caution, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400">·</span>
                      <span>{caution}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tools */}
              <div className="text-[11px] text-neutral-400 font-mono">
                <span className="text-neutral-500">Recommended Tools: </span>
                {item.recommendedTools.join(', ')}
              </div>
            </div>

            {/* Bottom Action */}
            <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-between">
              <span className="text-xs font-mono text-neutral-400">
                Avg. Unit: ~{item.typicalWeightKg} kg
              </span>
              <button
                onClick={() => onSelectAppliancePreset(item.name)}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 hover:underline"
              >
                <span>Log Harvest From This</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
