import type { Conductor, FaultCase, Phase, Point, Topology } from '../data/feeder'
import {
  BUSES,
  CONDUCTORS,
  PHASE_COLOR,
  SPOT_LOADS,
} from '../data/feeder'

const PHASE_SPACING = 9

/**
 * Offset an axis-aligned polyline sideways so the three phase conductors run
 * parallel, the way they are drawn on a one-line diagram.
 */
function offsetPath(points: Point[], offset: number): string {
  if (points.length < 2) return ''
  const kinds: ('h' | 'v')[] = []
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    kinds.push(Math.abs(x2 - x1) >= Math.abs(y2 - y1) ? 'h' : 'v')
  }
  return points
    .map(([x, y], i) => {
      let dx = 0
      let dy = 0
      for (const kind of [i > 0 ? kinds[i - 1] : null, i < kinds.length ? kinds[i] : null]) {
        if (kind === 'h') dy = offset
        if (kind === 'v') dx = offset
      }
      return `${i === 0 ? 'M' : 'L'}${x + dx} ${y + dy}`
    })
    .join(' ')
}

function phaseOffsets(phases: Phase[]): number[] {
  return phases.map((_, i) => (i - (phases.length - 1) / 2) * PHASE_SPACING)
}

/** Midpoint of the longest segment — a stable place to hang a fault marker. */
function markerPoint(points: Point[]): Point {
  let best: Point = points[0]
  let bestLength = -1
  for (let i = 0; i < points.length - 1; i += 1) {
    const [x1, y1] = points[i]
    const [x2, y2] = points[i + 1]
    const length = Math.abs(x2 - x1) + Math.abs(y2 - y1)
    if (length > bestLength) {
      bestLength = length
      best = [(x1 + x2) / 2, (y1 + y2) / 2]
    }
  }
  return best
}

interface Props {
  topology: Topology
  fault: FaultCase
  phaseFilter: Phase | 'all'
  energized: Set<string>
  selectedBus: string | null
  onSelectBus: (bus: string | null) => void
  onSelectConductor: (conductor: Conductor) => void
}

export default function FeederDiagram({
  topology,
  fault,
  phaseFilter,
  energized,
  selectedBus,
  onSelectBus,
  onSelectConductor,
}: Props) {
  const visible = CONDUCTORS.filter((c) => c.present === 'both' || c.present === topology)
  const faultableIds = new Set(['692-675', '645-646', '684-652'])
  const isLive = (c: Conductor) =>
    c.id !== fault.conductorId &&
    (c.from === 'SUB' || energized.has(c.from)) &&
    energized.has(c.to)

  return (
    <svg
      viewBox="45 8 570 585"
      className="w-full h-auto select-none"
      role="img"
      aria-label="Interactive one-line diagram of the IEEE 13-bus test feeder"
      onClick={() => onSelectBus(null)}
    >
      <defs>
        <marker id="load-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M0 0 L10 5 L0 10 z" fill="#38bdf8" />
        </marker>
        <filter id="fault-glow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* conductors */}
      {visible.map((conductor) => {
        const live = isLive(conductor)
        const faulted = conductor.id === fault.conductorId
        const offsets = phaseOffsets(conductor.phases)
        return (
          <g key={conductor.id}>
            {faulted && (
              <path
                d={offsetPath(conductor.points, 0)}
                stroke="#f43f5e"
                strokeWidth={PHASE_SPACING * conductor.phases.length + 14}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                opacity={0.28}
                filter="url(#fault-glow)"
                className="fault-pulse"
              />
            )}
            {conductor.phases.map((phase, i) => {
              const dimmed = phaseFilter !== 'all' && phaseFilter !== phase
              return (
                <path
                  key={phase}
                  d={offsetPath(conductor.points, offsets[i])}
                  stroke={PHASE_COLOR[phase]}
                  strokeWidth={3.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  strokeDasharray={live ? undefined : '7 6'}
                  opacity={dimmed ? 0.12 : live ? 1 : 0.3}
                  style={{ transition: 'opacity 180ms ease' }}
                />
              )
            })}
            {conductor.present === 'modified' && (
              <text
                x={602}
                y={350}
                fill="#38bdf8"
                fontSize={11}
                fontWeight={600}
                textAnchor="middle"
                transform="rotate(90 602 350)"
              >
                BACKUP
              </text>
            )}
            {faultableIds.has(conductor.id) && (
              <path
                d={offsetPath(conductor.points, 0)}
                stroke="transparent"
                strokeWidth={26}
                fill="none"
                className="cursor-pointer"
                onClick={(event) => {
                  event.stopPropagation()
                  onSelectConductor(conductor)
                }}
              >
                <title>{`${conductor.label} — click to inject a fault here`}</title>
              </path>
            )}
            {faulted && (
              <g filter="url(#fault-glow)" className="fault-pulse" pointerEvents="none">
                <circle cx={markerPoint(conductor.points)[0]} cy={markerPoint(conductor.points)[1]} r={13} fill="#0f172a" stroke="#f43f5e" strokeWidth={2.5} />
                <path
                  d="M-3 -7 L3 -7 L-1 -1 L4 -1 L-3 8 L0 0 L-4 0 Z"
                  transform={`translate(${markerPoint(conductor.points)[0]} ${markerPoint(conductor.points)[1]})`}
                  fill="#fb7185"
                />
              </g>
            )}
          </g>
        )
      })}

      {/* transformer between 633 and 634 */}
      <g fill="none" stroke="#e2e8f0" strokeWidth={2.5}>
        <circle cx={452} cy={180} r={13} />
        <circle cx={470} cy={180} r={13} />
      </g>
      <text x={461} y={214} fill="#94a3b8" fontSize={11} textAnchor="middle">
        Transformer
      </text>

      {/* substation */}
      <g>
        <rect x={322} y={20} width={36} height={36} fill="none" stroke="#e2e8f0" strokeWidth={2.5} />
        <path d="M322 20 L358 56 M358 20 L322 56" stroke="#e2e8f0" strokeWidth={2} />
        <text x={368} y={42} fill="#e2e8f0" fontSize={13} fontWeight={600}>
          Substation
        </text>
      </g>

      {/* spot loads */}
      {SPOT_LOADS.map((load) => {
        const dead = !energized.has(load.bus)
        return (
          <g key={load.region} opacity={dead ? 0.35 : 1}>
            <line
              x1={load.x}
              y1={load.y1}
              x2={load.x}
              y2={load.y2}
              stroke={dead ? '#f43f5e' : '#38bdf8'}
              strokeWidth={2.5}
              markerEnd="url(#load-arrow)"
            />
            <circle cx={load.x} cy={load.y2 + 13} r={9} fill={dead ? '#f43f5e' : '#22c55e'} opacity={dead ? 0.9 : 0.85} />
            <text x={load.x} y={load.y2 + 17} fontSize={10} fontWeight={700} fill="#0f172a" textAnchor="middle">
              {load.region}
            </text>
          </g>
        )
      })}

      {/* buses */}
      {BUSES.map((bus) => {
        const horizontal = bus.orientation === 'h'
        const half = bus.length / 2
        const x1 = horizontal ? bus.x - half : bus.x
        const x2 = horizontal ? bus.x + half : bus.x
        const y1 = horizontal ? bus.y : bus.y - half
        const y2 = horizontal ? bus.y : bus.y + half
        const dead = !energized.has(bus.id)
        const selected = selectedBus === bus.id
        return (
          <g
            key={bus.id}
            className="cursor-pointer"
            onClick={(event) => {
              event.stopPropagation()
              onSelectBus(selected ? null : bus.id)
            }}
          >
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="transparent" strokeWidth={22} />
            {selected && (
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth={17} strokeLinecap="round" opacity={0.35} />
            )}
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={dead ? '#f43f5e' : '#e2e8f0'}
              strokeWidth={8}
              strokeLinecap="round"
              style={{ transition: 'stroke 180ms ease' }}
            />
            <text
              x={bus.x + bus.labelDx}
              y={bus.y + bus.labelDy}
              fill={selected ? '#38bdf8' : '#f1f5f9'}
              fontSize={14}
              fontWeight={700}
              textAnchor={bus.anchor}
            >
              {bus.id}
            </text>
            {bus.pmu && (
              <circle
                cx={horizontal ? x1 - 12 : bus.x + 13}
                cy={horizontal ? bus.y - 12 : y1 - 9}
                r={3.5}
                fill="#38bdf8"
                opacity={0.9}
              />
            )}
            <title>{`Bus ${bus.id}${bus.pmu ? ' — micro-PMU installed' : ' — slack bus'}`}</title>
          </g>
        )
      })}
    </svg>
  )
}
