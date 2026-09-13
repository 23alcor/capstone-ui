// IEEE 13-bus test feeder — geometry and scenario data.
//
// Layout follows Fig. 2 of Li et al., "A Hardware-in-the-Loop-Based Digital Twin
// Cyber-Physical System for Microgrids." Load mapping is Table I, fault cases are
// Table II. Coordinates are in SVG user units.

export type Phase = 'A' | 'B' | 'C'
export type Topology = 'original' | 'modified'
export type Point = [number, number]

export const PHASES: Phase[] = ['A', 'B', 'C']

export const PHASE_COLOR: Record<Phase, string> = {
  A: '#f0b429', // yellow
  B: '#22c55e', // green
  C: '#ef4444', // red
}

export const SUBSTATION_BUS = '650'

export interface Bus {
  id: string
  orientation: 'h' | 'v'
  x: number
  y: number
  length: number
  labelDx: number
  labelDy: number
  anchor: 'start' | 'middle' | 'end'
  /** every bus except the slack bus carries a micro-PMU (12 of 13) */
  pmu: boolean
  slack?: boolean
  note?: string
}

export const BUSES: Bus[] = [
  { id: '650', orientation: 'h', x: 340, y: 90, length: 90, labelDx: 52, labelDy: 5, anchor: 'start', pmu: false, slack: true, note: 'Slack bus at the substation. No micro-PMU.' },
  { id: '632', orientation: 'h', x: 270, y: 180, length: 180, labelDx: 95, labelDy: -12, anchor: 'start', pmu: true },
  { id: '633', orientation: 'v', x: 400, y: 185, length: 55, labelDx: 0, labelDy: -38, anchor: 'middle', pmu: true },
  { id: '634', orientation: 'v', x: 520, y: 185, length: 55, labelDx: 0, labelDy: -38, anchor: 'middle', pmu: true, note: 'Served through the step-down transformer from bus 633.' },
  { id: '645', orientation: 'v', x: 145, y: 195, length: 70, labelDx: 0, labelDy: -45, anchor: 'middle', pmu: true },
  { id: '646', orientation: 'v', x: 75, y: 195, length: 70, labelDx: 0, labelDy: -45, anchor: 'middle', pmu: true },
  { id: '671', orientation: 'h', x: 270, y: 330, length: 180, labelDx: 95, labelDy: -22, anchor: 'start', pmu: true },
  { id: '684', orientation: 'v', x: 145, y: 345, length: 70, labelDx: 0, labelDy: -45, anchor: 'middle', pmu: true, note: 'Junction only — no spot load.' },
  { id: '611', orientation: 'v', x: 75, y: 345, length: 70, labelDx: 0, labelDy: -45, anchor: 'middle', pmu: true },
  { id: '652', orientation: 'v', x: 100, y: 490, length: 60, labelDx: 22, labelDy: 38, anchor: 'start', pmu: true },
  { id: '692', orientation: 'v', x: 400, y: 425, length: 62, labelDx: 0, labelDy: -44, anchor: 'middle', pmu: true },
  { id: '675', orientation: 'v', x: 520, y: 425, length: 62, labelDx: 0, labelDy: -44, anchor: 'middle', pmu: true },
  { id: '680', orientation: 'h', x: 340, y: 560, length: 90, labelDx: 52, labelDy: 5, anchor: 'start', pmu: true, note: 'Open end, grounded. No spot load, so the micro-PMU here reads zero current.' },
]

export interface Conductor {
  id: string
  from: string
  to: string
  phases: Phase[]
  points: Point[]
  /** which topology the segment exists in */
  present: 'both' | Topology
  label: string
}

export const CONDUCTORS: Conductor[] = [
  { id: 'sub-650', from: 'SUB', to: '650', phases: ['A', 'B', 'C'], points: [[340, 56], [340, 90]], present: 'both', label: 'Substation – 650' },
  { id: '650-632', from: '650', to: '632', phases: ['A', 'B', 'C'], points: [[340, 90], [340, 180]], present: 'both', label: 'Line 650-632' },
  { id: '632-671', from: '632', to: '671', phases: ['A', 'B', 'C'], points: [[340, 180], [340, 330]], present: 'both', label: 'Line 632-671' },
  { id: '671-680', from: '671', to: '680', phases: ['A', 'B', 'C'], points: [[340, 330], [340, 560]], present: 'both', label: 'Line 671-680' },
  { id: '632-633', from: '632', to: '633', phases: ['A', 'B', 'C'], points: [[360, 180], [400, 180]], present: 'both', label: 'Line 632-633' },
  { id: '633-634', from: '633', to: '634', phases: ['A', 'B', 'C'], points: [[400, 180], [520, 180]], present: 'both', label: 'Transformer 633-634' },
  { id: '632-645', from: '632', to: '645', phases: ['B', 'C'], points: [[180, 180], [180, 212], [145, 212]], present: 'both', label: 'Line 632-645' },
  { id: '645-646', from: '645', to: '646', phases: ['B', 'C'], points: [[145, 212], [75, 212]], present: 'both', label: 'Line 645-646' },
  { id: '671-684', from: '671', to: '684', phases: ['A', 'C'], points: [[180, 330], [180, 362], [145, 362]], present: 'both', label: 'Line 671-684' },
  { id: '684-611', from: '684', to: '611', phases: ['C'], points: [[145, 362], [75, 362]], present: 'both', label: 'Line 684-611' },
  { id: '684-652', from: '684', to: '652', phases: ['A'], points: [[145, 362], [145, 490], [100, 490]], present: 'both', label: 'Line 652-684' },
  { id: '671-692', from: '671', to: '692', phases: ['A', 'B', 'C'], points: [[360, 330], [360, 420], [400, 420]], present: 'both', label: 'Line 671-692' },
  { id: '692-675', from: '692', to: '675', phases: ['A', 'B', 'C'], points: [[400, 420], [520, 420]], present: 'original', label: 'Line 675-692' },
  { id: '633-675', from: '633', to: '675', phases: ['A', 'B', 'C'], points: [[400, 212], [400, 290], [580, 290], [580, 420], [520, 420]], present: 'modified', label: 'Backup line 633-675' },
]

export interface SpotLoad {
  region: number
  bus: string
  phases: Phase[]
  building: string
  /** arrow tail and head */
  x: number
  y1: number
  y2: number
}

/** Table I — load mapping of the microgrid onto the physical diorama. */
export const SPOT_LOADS: SpotLoad[] = [
  { region: 1, bus: '671', phases: ['A', 'B', 'C'], building: 'Campus building', x: 230, y1: 332, y2: 362 },
  { region: 2, bus: '652', phases: ['A'], building: 'Residential building', x: 100, y1: 521, y2: 551 },
  { region: 3, bus: '675', phases: ['A', 'B', 'C'], building: 'Hospital', x: 520, y1: 457, y2: 487 },
  { region: 4, bus: '692', phases: ['A', 'B', 'C'], building: 'Commercial building', x: 400, y1: 457, y2: 487 },
  { region: 5, bus: '634', phases: ['A', 'B', 'C'], building: 'Commercial building', x: 520, y1: 214, y2: 244 },
  { region: 6, bus: '645', phases: ['B'], building: 'Commercial building', x: 145, y1: 232, y2: 262 },
  { region: 7, bus: '611', phases: ['C'], building: 'Residential building', x: 75, y1: 382, y2: 412 },
  { region: 8, bus: '646', phases: ['B', 'C'], building: 'Commercial building', x: 75, y1: 232, y2: 262 },
]

export interface FaultCase {
  label: number
  symbol: string
  faultType: string
  location: string
  conductorId: string | null
  phases: Phase[]
  ground: boolean
}

/** Table II — 16 short-circuit scenarios plus normal operation. */
function fc(label: number, conductorId: string, busPair: string, code: string): FaultCase {
  const ground = code.endsWith('N')
  const phases = code.replace(/N$/, '').split('') as Phase[]
  return {
    label,
    symbol: `${busPair.replace('-', ' ')} ${code}`,
    faultType: code.split('').join('-'),
    location: `Line ${busPair}`,
    conductorId,
    phases,
    ground,
  }
}

export const FAULT_CASES: FaultCase[] = [
  { label: 0, symbol: 'NoFault', faultType: 'No Fault', location: '—', conductorId: null, phases: [], ground: false },
  ...(['AN', 'BN', 'CN', 'AB', 'AC', 'BC', 'ABN', 'ACN', 'BCN', 'ABC', 'ABCN'] as const).map((code, i) =>
    fc(i + 1, '692-675', '675-692', code),
  ),
  ...(['BN', 'CN', 'BC', 'BCN'] as const).map((code, i) => fc(i + 12, '645-646', '645-646', code)),
  fc(16, '684-652', '652-684', 'AN'),
]

/** Buses reachable from the substation with `openId` removed from service. */
export function energizedBuses(topology: Topology, openId: string | null): Set<string> {
  const adjacency = new Map<string, string[]>()
  for (const c of CONDUCTORS) {
    if (c.present !== 'both' && c.present !== topology) continue
    if (c.id === openId) continue
    if (c.from === 'SUB') continue
    for (const [a, b] of [[c.from, c.to], [c.to, c.from]]) {
      const list = adjacency.get(a) ?? []
      list.push(b)
      adjacency.set(a, list)
    }
  }
  const seen = new Set<string>([SUBSTATION_BUS])
  const queue = [SUBSTATION_BUS]
  while (queue.length) {
    const node = queue.shift()!
    for (const next of adjacency.get(node) ?? []) {
      if (!seen.has(next)) {
        seen.add(next)
        queue.push(next)
      }
    }
  }
  return seen
}

export const MODEL_RESULTS = {
  citation: 'Li et al., HIL-Based Digital Twin CPS for Microgrids',
  gcnLstm: { accuracy: 94.12, f1: 0.9216 },
  denseLstm: { accuracy: 100, f1: 1.0 },
  transferBefore: 16.67,
  transferAfter: 100,
  samples: 34000,
  tensor: '12 x 12 x 10',
}
