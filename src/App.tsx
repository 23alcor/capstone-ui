import { useMemo, useState } from 'react'
import FeederDiagram from './components/FeederDiagram'
import type { Conductor, Phase, Topology } from './data/feeder'
import {
  BUSES,
  FAULT_CASES,
  MODEL_RESULTS,
  PHASES,
  PHASE_COLOR,
  SPOT_LOADS,
  energizedBuses,
} from './data/feeder'

const TOPOLOGY_LABEL: Record<Topology, string> = {
  original: 'Original',
  modified: 'Backup active (633–675)',
}

function App() {
  const [topology, setTopology] = useState<Topology>('original')
  const [faultLabel, setFaultLabel] = useState(0)
  const [phaseFilter, setPhaseFilter] = useState<Phase | 'all'>('all')
  const [selectedBus, setSelectedBus] = useState<string | null>(null)

  const fault = FAULT_CASES.find((f) => f.label === faultLabel) ?? FAULT_CASES[0]
  const faultIsPresent =
    fault.conductorId === null ||
    (fault.conductorId === '692-675' ? topology === 'original' : true)
  const openConductor = faultIsPresent ? fault.conductorId : null

  const energized = useMemo(() => energizedBuses(topology, openConductor), [topology, openConductor])
  const darkRegions = SPOT_LOADS.filter((load) => !energized.has(load.bus))
  const hospitalDown = darkRegions.some((r) => r.bus === '675')

  const bus = BUSES.find((b) => b.id === selectedBus) ?? null
  const busLoad = SPOT_LOADS.find((l) => l.bus === selectedBus) ?? null

  const selectConductor = (conductor: Conductor) => {
    const next = FAULT_CASES.find((f) => f.conductorId === conductor.id)
    if (next) setFaultLabel(next.label)
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
            Hardware-in-the-Loop Digital Twin
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            IEEE 13-Bus Feeder Explorer
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-400">
            The one-line diagram of the microgrid our HIL simulation runs on. Each colored
            conductor is one phase, the blue arrows are the eight spot loads mapped onto the
            physical diorama, and the small cyan dots mark the twelve micro-PMUs feeding the
            fault-detection model. Inject any of the sixteen short-circuit scenarios to see which
            part of the network goes dark.
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          {/* diagram */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 sm:p-6">
            <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Topology
                </span>
                <div className="flex rounded-lg border border-slate-700 p-0.5">
                  {(['original', 'modified'] as Topology[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setTopology(option)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                        topology === option
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-slate-100'
                      }`}
                    >
                      {TOPOLOGY_LABEL[option]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Phase
                </span>
                <div className="flex rounded-lg border border-slate-700 p-0.5">
                  <button
                    type="button"
                    onClick={() => setPhaseFilter('all')}
                    className={`rounded-md px-3 py-1 text-xs font-medium transition ${
                      phaseFilter === 'all'
                        ? 'bg-slate-200 text-slate-900'
                        : 'text-slate-400 hover:text-slate-100'
                    }`}
                  >
                    All
                  </button>
                  {PHASES.map((phase) => (
                    <button
                      key={phase}
                      type="button"
                      onClick={() => setPhaseFilter(phase)}
                      className="rounded-md px-3 py-1 text-xs font-semibold transition"
                      style={{
                        color: phaseFilter === phase ? '#0f172a' : PHASE_COLOR[phase],
                        background: phaseFilter === phase ? PHASE_COLOR[phase] : 'transparent',
                      }}
                    >
                      {phase}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <FeederDiagram
              topology={topology}
              fault={fault}
              phaseFilter={phaseFilter}
              energized={energized}
              selectedBus={selectedBus}
              onSelectBus={setSelectedBus}
              onSelectConductor={selectConductor}
            />

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-800 pt-4 text-xs text-slate-400">
              {PHASES.map((phase) => (
                <span key={phase} className="flex items-center gap-1.5">
                  <span className="h-0.5 w-6 rounded" style={{ background: PHASE_COLOR[phase] }} />
                  Phase {phase}
                </span>
              ))}
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-sky-400" />
                Spot load / micro-PMU
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-0.5 w-6 rounded border-t-2 border-dashed border-slate-500" />
                De-energized
              </span>
              <span className="ml-auto text-slate-600">
                Click a bus for details · click line 675–692, 645–646 or 652–684 to fault it
              </span>
            </div>
          </section>

          {/* side panel */}
          <aside className="space-y-4">
            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Inject fault scenario
              </h2>
              <select
                value={faultLabel}
                onChange={(event) => setFaultLabel(Number(event.target.value))}
                className="mt-3 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-cyan-500"
              >
                <option value={0}>Label 0 — No fault (normal operation)</option>
                <optgroup label="Line 675-692">
                  {FAULT_CASES.filter((f) => f.conductorId === '692-675').map((f) => (
                    <option key={f.label} value={f.label}>
                      Label {f.label} — {f.faultType}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Line 645-646">
                  {FAULT_CASES.filter((f) => f.conductorId === '645-646').map((f) => (
                    <option key={f.label} value={f.label}>
                      Label {f.label} — {f.faultType}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Line 652-684">
                  {FAULT_CASES.filter((f) => f.conductorId === '684-652').map((f) => (
                    <option key={f.label} value={f.label}>
                      Label {f.label} — {f.faultType}
                    </option>
                  ))}
                </optgroup>
              </select>

              <div
                className={`mt-4 rounded-xl border p-4 ${
                  darkRegions.length
                    ? 'border-rose-500/40 bg-rose-500/10'
                    : 'border-emerald-500/40 bg-emerald-500/10'
                }`}
              >
                <p className="text-sm font-semibold">
                  {fault.label === 0
                    ? 'Normal operation'
                    : `Label ${fault.label} · ${fault.faultType}`}
                </p>
                <p className="mt-1 text-xs text-slate-300">
                  {fault.label === 0
                    ? 'All eight regions energized.'
                    : faultIsPresent
                      ? `${fault.location} · ${darkRegions.length} region${darkRegions.length === 1 ? '' : 's'} de-energized`
                      : 'Line 675\u2013692 is out of service while the backup feeds the hospital, so this scenario does not apply.'}
                </p>
                {darkRegions.length > 0 && (
                  <p className="mt-2 text-xs text-rose-200">
                    Dark: {darkRegions.map((r) => `Region ${r.region} (${r.bus})`).join(', ')}
                  </p>
                )}
                {hospitalDown && topology === 'original' && (
                  <button
                    type="button"
                    onClick={() => setTopology('modified')}
                    className="mt-3 w-full rounded-lg bg-cyan-500 px-3 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
                  >
                    Hospital offline — activate backup line 633–675
                  </button>
                )}
                {fault.label !== 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setFaultLabel(0)
                      setTopology('original')
                    }}
                    className="mt-2 w-full rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-slate-500"
                  >
                    Clear fault
                  </button>
                )}
              </div>
            </section>

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Diorama regions
              </h2>
              <ul className="mt-3 space-y-1.5">
                {SPOT_LOADS.map((load) => {
                  const dark = !energized.has(load.bus)
                  return (
                    <li key={load.region}>
                      <button
                        type="button"
                        onClick={() => setSelectedBus(selectedBus === load.bus ? null : load.bus)}
                        className={`flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left transition ${
                          selectedBus === load.bus ? 'bg-slate-800' : 'hover:bg-slate-800/60'
                        }`}
                      >
                        <span
                          className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                            dark ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-emerald-400 shadow-[0_0_8px_#34d399]'
                          }`}
                        />
                        <span className="w-6 shrink-0 text-xs font-semibold text-slate-500">
                          {load.region}
                        </span>
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-300">
                          {load.building}
                        </span>
                        <span className="shrink-0 font-mono text-xs text-slate-500">
                          {load.bus} · {load.phases.join('')}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>

            {bus && (
              <section className="rounded-2xl border border-cyan-500/40 bg-slate-900/60 p-5">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-cyan-400">
                  Bus {bus.id}
                </h2>
                <dl className="mt-3 space-y-2 text-xs">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Status</dt>
                    <dd className={energized.has(bus.id) ? 'text-emerald-400' : 'text-rose-400'}>
                      {energized.has(bus.id) ? 'Energized' : 'De-energized'}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Micro-PMU</dt>
                    <dd className="text-slate-300">{bus.pmu ? 'Installed' : 'None (slack bus)'}</dd>
                  </div>
                  {busLoad && (
                    <>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Diorama region</dt>
                        <dd className="text-slate-300">
                          {busLoad.region} · {busLoad.building}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-slate-500">Load phases</dt>
                        <dd className="font-mono text-slate-300">{busLoad.phases.join('')}</dd>
                      </div>
                    </>
                  )}
                  {!busLoad && (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">Spot load</dt>
                      <dd className="text-slate-300">None</dd>
                    </div>
                  )}
                </dl>
                {bus.note && <p className="mt-3 text-xs leading-relaxed text-slate-400">{bus.note}</p>}
              </section>
            )}

            <section className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Reference model results
              </h2>
              <dl className="mt-3 space-y-2 text-xs">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">GCN + LSTM</dt>
                  <dd className="font-mono text-slate-200">
                    {MODEL_RESULTS.gcnLstm.accuracy}% · F1 {MODEL_RESULTS.gcnLstm.f1}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Dense LSTM</dt>
                  <dd className="font-mono text-slate-200">
                    {MODEL_RESULTS.denseLstm.accuracy}% · F1 {MODEL_RESULTS.denseLstm.f1.toFixed(4)}
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">After topology change</dt>
                  <dd className="font-mono text-slate-200">
                    {MODEL_RESULTS.transferBefore}% → {MODEL_RESULTS.transferAfter}%
                  </dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-400">Input tensor</dt>
                  <dd className="font-mono text-slate-200">{MODEL_RESULTS.tensor}</dd>
                </div>
              </dl>
              <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                Published figures from {MODEL_RESULTS.citation}. Placeholder until our own HIL
                training runs replace them.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  )
}

export default App
