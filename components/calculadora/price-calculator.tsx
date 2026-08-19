"use client";

import { useMemo, useState } from "react";
import {
  applyTariff,
  calculate,
  createInitialState,
  defaultMachines,
  materials,
  printTypes,
  regions,
  marketRateFor,
  type CalculatorState,
  type Machine,
  type TariffSettings,
} from "@/lib/calculadora/model";
import { ResultsPanel } from "./results-panel";
import {
  AlertIcon,
  BookIcon,
  BoltIcon,
  BoxIcon,
  ClockIcon,
  CoinIcon,
  Collapsible,
  CostDonut,
  Field,
  LockIcon,
  PrinterIcon,
  SlidersIcon,
  TableIcon,
  TagIcon,
  TrendUpIcon,
  UnlockIcon,
  UserIcon,
  WalletIcon,
  WeightIcon,
  calculatorThemes,
  donutColors,
  inputClass,
  selectClass,
  type CalculatorVariant,
} from "./ui";

function MachineSettings({ machine, onChange }: { machine: Machine; onChange: (machine: Machine) => void }) {
  const set = (key: keyof Machine, value: string) => onChange({ ...machine, [key]: Number(value) });
  const field = "w-full rounded border border-[var(--calc-border)] bg-[var(--calc-bg)] p-2 text-xs font-semibold text-[var(--calc-text)] outline-none focus:ring-1 focus:ring-[var(--calc-accent)]";

  return (
    <div className="mt-2 rounded-lg border border-[var(--calc-border)] bg-[var(--calc-panel)] p-4 shadow-inner">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[var(--calc-text)]">
        Configuración de máquina: {machine.name}
      </h4>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-[var(--calc-muted)]">Consumo (Watts)</label>
          <input type="number" className={field} value={machine.watts} onChange={(e) => set("watts", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--calc-muted)]">Velocidad relativa (F)</label>
          <input type="number" step="0.1" className={field} value={machine.f_factor} onChange={(e) => set("f_factor", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--calc-muted)]">Precio compra ($USD base)</label>
          <input type="number" className={field} value={machine.price} onChange={(e) => set("price", e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-xs text-[var(--calc-muted)]">Mantenimiento ($USD/mes)</label>
          <input type="number" className={field} value={machine.maintenanceMonthly} onChange={(e) => set("maintenanceMonthly", e.target.value)} />
        </div>
      </div>
      <p className="mt-3 text-[10px] leading-relaxed text-[var(--calc-muted)]">
        <strong className="text-[var(--calc-text)]">F (factor de velocidad):</strong> 1.0 es una Ender 3 estándar. 3.0 es
        una máquina 3 veces más rápida. Se usa para normalizar el precio de mercado.
      </p>
    </div>
  );
}

export function PriceCalculator({
  variant = "dark",
  tariff,
}: {
  variant?: CalculatorVariant;
  /** Tarifa vigente leída en el servidor; si falta, se usa el valor de la región. */
  tariff?: TariffSettings | null;
}) {
  const [state, setState] = useState<CalculatorState>(() => createInitialState(regions[1], tariff));
  const [machines, setMachines] = useState<Machine[]>(defaultMachines);
  const [advanced, setAdvanced] = useState(false);
  const [showMachineSettings, setShowMachineSettings] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isPriceLocked, setIsPriceLocked] = useState(false);

  const machine = useMemo(
    () => machines.find((item) => item.id === state.machineId) ?? machines[0],
    [machines, state.machineId],
  );
  const region = useMemo(() => regions.find((item) => item.code === state.countryCode), [state.countryCode]);
  const tariffNote = region ? applyTariff(region, tariff).tariffNote : null;
  const results = useMemo(() => calculate(state, machine), [state, machine]);
  const isValid = state.gramsTotal > 0 && (state.printTimeHours > 0 || state.printTimeMinutes > 0);

  const money = (value: number, digits = 2) =>
    new Intl.NumberFormat(state.locale, {
      style: "currency",
      currency: state.currencyIso,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(value);

  const update = <K extends keyof CalculatorState>(key: K, value: CalculatorState[K]) => {
    setState((current) => {
      const next = { ...current, [key]: value };
      if (key !== "manualPrice" && !isPriceLocked) next.manualPrice = null;
      return next;
    });
    if (key !== "manualPrice" && !isPriceLocked) setIsManualMode(false);
  };

  const changeRegion = (code: string) => {
    const region = regions.find((item) => item.code === code) ?? regions[0];
    setState((current) => ({
      ...current,
      countryCode: region.code,
      currencySymbol: region.currencySymbol,
      currencyIso: region.currencyIso,
      locale: region.locale,
      exchangeRate: region.exchangeRate,
      electricityCostPerKwh: applyTariff(region, tariff).electricityCostPerKwh,
      laborCostPerHour: region.defaultLaborCost,
      materialPricePerKg: region.defaultMaterialCost,
      marketRatePerHour: marketRateFor(region),
      minOrderPrice: Number((region.defaultLaborCost * 0.5).toFixed(2)),
      manualPrice: isPriceLocked ? current.manualPrice : null,
    }));
    if (!isPriceLocked) setIsManualMode(false);
  };

  const changeMaterial = (name: string) => {
    const profile = materials[name];
    setState((current) => ({
      ...current,
      material: name,
      failRatePercent: profile.risk,
      manualPrice: isPriceLocked ? current.manualPrice : null,
    }));
    if (!isPriceLocked) setIsManualMode(false);
  };

  const changeMachine = (updated: Machine) => {
    setMachines((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    if (!isPriceLocked) {
      setState((current) => ({ ...current, manualPrice: null }));
      setIsManualMode(false);
    }
  };

  const numeric = (raw: string) => parseFloat(raw) || 0;

  const slices = [
    { name: "Material", value: results.breakdown.materialCost },
    { name: "Electricidad", value: results.breakdown.machineElectricity },
    { name: "Depreciación", value: results.breakdown.machineDepreciation + results.breakdown.machineMaintenance },
    { name: "Riesgo", value: results.breakdown.riskCost },
    { name: "Otros", value: results.breakdown.consumables },
  ]
    .filter((slice) => slice.value > 0)
    .map((slice, index) => ({ ...slice, color: donutColors[index % donutColors.length] }));

  const typeMultiplier = printTypes[state.printType] ?? 1;
  const materialProfile = materials[state.material];
  const isCutter = state.printType === "Cortantes";

  return (
    <div
      style={calculatorThemes[variant]}
      className="w-full bg-[var(--calc-bg)] pb-12 text-[var(--calc-text)]"
    >
      <div className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8">
        <div className="mb-6 flex flex-col items-center justify-between gap-4 pt-2 md:flex-row">
          <h2 className="text-2xl font-black tracking-tight md:text-3xl">Calculadora de Impresión 3D</h2>
          <div className="flex items-center gap-3">
            <select
              aria-label="Región"
              value={state.countryCode}
              onChange={(event) => changeRegion(event.target.value)}
              className={`${selectClass} w-auto`}
            >
              {regions.map((region) => (
                <option key={region.code} value={region.code}>
                  {region.flag} {region.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setAdvanced((value) => !value)}
              aria-pressed={advanced}
              className="relative flex w-40 items-center rounded-full border border-[var(--calc-border)] bg-[var(--calc-bg)] p-1"
            >
              <span
                className={`absolute inset-y-1 w-[calc(50%-4px)] rounded-full transition-all duration-300 ${
                  advanced ? "left-[calc(50%+2px)] bg-[var(--calc-accent)]" : "left-1 bg-[var(--calc-border)]"
                }`}
              />
              <span className="relative z-10 grid w-full grid-cols-2 text-center">
                <span className={`py-1.5 text-xs font-bold transition ${advanced ? "text-[var(--calc-muted)]" : "text-[var(--calc-text)]"}`}>
                  Simple
                </span>
                <span className={`py-1.5 text-xs font-bold transition ${advanced ? "text-white" : "text-[var(--calc-muted)]"}`}>
                  Avanzado
                </span>
              </span>
            </button>
          </div>
        </div>

        <p className="max-w-2xl text-sm text-[var(--calc-muted)]">
          Calculá el <strong className="text-[var(--calc-text)]">costo</strong> y el{" "}
          <strong className="text-[var(--calc-text)]">precio de venta</strong> de tus impresiones 3D: filamento,
          electricidad, tiempo de máquina, desgaste y margen.
        </p>

        <section className="rounded-2xl border border-[var(--calc-border)] bg-[var(--calc-surface)] p-5 shadow-[var(--calc-shadow)] md:p-6">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <Field
              label="Máquina"
              icon={<PrinterIcon />}
              className="md:col-span-2"
              tooltip="Seleccioná tu impresora para ajustar el cálculo según su velocidad de mercado."
            >
              <div className="flex gap-2">
                <select
                  className={selectClass}
                  value={state.machineId}
                  onChange={(event) => update("machineId", event.target.value)}
                >
                  {machines.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  aria-label="Editar detalles de máquina"
                  onClick={() => setShowMachineSettings((value) => !value)}
                  className={`rounded-lg border border-[var(--calc-border)] px-3 py-2 transition ${
                    showMachineSettings
                      ? "bg-[var(--calc-accent-soft)] text-[var(--calc-text)]"
                      : "bg-[var(--calc-bg)] text-[var(--calc-muted)] hover:text-[var(--calc-text)]"
                  }`}
                >
                  <SlidersIcon />
                </button>
              </div>
              <div
                className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                  showMachineSettings ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                }`}
              >
                <div className="overflow-hidden">
                  <MachineSettings machine={machine} onChange={changeMachine} />
                </div>
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-4 md:col-span-2">
              <Field label="Material" tooltip="El material afecta el costo y el riesgo.">
                <select className={selectClass} value={state.material} onChange={(event) => changeMaterial(event.target.value)}>
                  {Object.keys(materials).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label={`Precio (${state.currencySymbol}/kg)`}>
                <input
                  type="number"
                  className={inputClass}
                  value={state.materialPricePerKg}
                  onChange={(event) => update("materialPricePerKg", numeric(event.target.value))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3">
              <div className="grid grid-cols-2 gap-4 md:contents">
                <Field label="Horas" icon={<ClockIcon />} tooltip="Horas completas de impresión.">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      className={inputClass}
                      value={state.printTimeHours || ""}
                      onChange={(event) => update("printTimeHours", numeric(event.target.value))}
                    />
                    <span className="absolute right-3 top-2 text-xs text-[var(--calc-muted)]">h</span>
                  </div>
                </Field>
                <Field label="Minutos">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="0"
                      className={inputClass}
                      value={state.printTimeMinutes || ""}
                      onChange={(event) => update("printTimeMinutes", numeric(event.target.value))}
                    />
                    <span className="absolute right-3 top-2 text-xs text-[var(--calc-muted)]">min</span>
                  </div>
                </Field>
              </div>
              <Field label="Peso (g)" icon={<WeightIcon />}>
                <input
                  type="number"
                  placeholder="0"
                  className={inputClass}
                  value={state.gramsTotal || ""}
                  onChange={(event) => update("gramsTotal", numeric(event.target.value))}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-4 md:col-span-2 md:grid-cols-3">
              <Field
                label="Tipo de impresión"
                icon={<TagIcon />}
                tooltip="Define el multiplicador de valor. Industrial/técnica aplica tarifas más altas."
              >
                <select className={selectClass} value={state.printType} onChange={(event) => update("printType", event.target.value)}>
                  {Object.keys(printTypes).map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-4 md:contents">
                <Field
                  label="Consumibles"
                  icon={<BoxIcon />}
                  tooltip="Costo por unidad de extras: laca, pegamento, argollas, etc."
                >
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm font-bold text-[var(--calc-muted)]">
                      {state.currencySymbol}
                    </span>
                    <input
                      type="number"
                      placeholder="0"
                      className={`${inputClass} pl-8`}
                      value={state.consumablesCost || ""}
                      onChange={(event) => update("consumablesCost", numeric(event.target.value))}
                    />
                  </div>
                </Field>
                <Field label="Cantidad">
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    className={inputClass}
                    value={state.quantity === 0 ? "" : state.quantity}
                    onChange={(event) => {
                      const parsed = parseInt(event.target.value, 10);
                      update("quantity", Number.isNaN(parsed) ? 0 : parsed);
                    }}
                  />
                </Field>
              </div>
            </div>

            <div
              className={`grid transition-[grid-template-rows] duration-500 ease-in-out md:col-span-2 ${
                advanced ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="mt-2 space-y-5 border-t border-[var(--calc-border)] pt-4">
                  <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.16em] text-[var(--calc-muted)]">
                    <SlidersIcon className="size-3.5" /> Ajustes finos
                  </h2>

                  <div className="rounded-lg border border-[var(--calc-border)] bg-[var(--calc-panel)] p-4">
                    <Field
                      label={`Valor base configurable (${state.currencySymbol}/h)`}
                      icon={<CoinIcon />}
                      tooltip="ESTE NO ES EL PRECIO FINAL. Es una base de cálculo que se multiplica por la velocidad de tu máquina, la dificultad del material y el tipo de impresión para llegar al precio de mercado."
                    >
                      <input
                        type="number"
                        className={`${inputClass} py-3 text-lg font-black text-[var(--calc-accent-bright)]`}
                        value={state.marketRatePerHour}
                        onChange={(event) => update("marketRatePerHour", numeric(event.target.value))}
                      />
                    </Field>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <Field
                      label={`Costo mano de obra (${state.currencySymbol}/h)`}
                      icon={<UserIcon />}
                      tooltip="Costo interno: cuánto pagás (o te pagás) por hora de operario."
                    >
                      <input
                        type="number"
                        className={inputClass}
                        value={state.laborCostPerHour}
                        onChange={(event) => update("laborCostPerHour", numeric(event.target.value))}
                      />
                    </Field>
                    <Field
                      label={`Electricidad (${state.currencySymbol}/kWh)`}
                      icon={<BoltIcon />}
                      tooltip="Tarifa de tu factura de luz. El consumo se calcula solo con los watts de la máquina y el tiempo de impresión."
                    >
                      <input
                        type="number"
                        step="0.01"
                        className={inputClass}
                        value={state.electricityCostPerKwh}
                        onChange={(event) => update("electricityCostPerKwh", numeric(event.target.value))}
                      />
                      {tariffNote ? (
                        <span className="text-[10px] leading-relaxed text-[var(--calc-muted)]">{tariffNote}</span>
                      ) : null}
                    </Field>
                    <Field label="Riesgo de falla (%)" icon={<AlertIcon />}>
                      <input
                        type="number"
                        className={inputClass}
                        value={state.failRatePercent}
                        onChange={(event) => update("failRatePercent", numeric(event.target.value))}
                      />
                    </Field>
                  </div>

                  <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--calc-border)] bg-[var(--calc-panel)] p-4">
                    <input
                      type="checkbox"
                      className="mt-0.5 size-4 accent-[var(--calc-accent)]"
                      checked={state.chargeEnergy}
                      onChange={(event) => update("chargeEnergy", event.target.checked)}
                    />
                    <span>
                      <span className="flex items-center gap-2 text-sm font-semibold text-[var(--calc-text)]">
                        <BoltIcon className="size-3.5 text-[var(--calc-accent-bright)]" />
                        Cobrar la electricidad en el precio
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-[var(--calc-muted)]">
                        Suma el consumo real ({machine.watts} W x horas x tarifa) al precio de venta, además del valor
                        hora de máquina. Si lo desactivás, la luz sigue contando en el costo técnico pero se descuenta
                        de tu margen.
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ResultsPanel
          results={results}
          currencySymbol={state.currencySymbol}
          locale={state.locale}
          currencyIso={state.currencyIso}
          manualPrice={state.manualPrice}
          onManualPriceChange={(value) => update("manualPrice", value)}
          isManualMode={isManualMode}
          setIsManualMode={setIsManualMode}
          isValid={isValid}
          isPriceLocked={isPriceLocked}
          onToggleLock={() => setIsPriceLocked((value) => !value)}
        />

        {isValid ? (
          <Collapsible title="Desglose de costos" icon={<WalletIcon className="size-3.5 text-[var(--calc-accent-bright)]" />}>
            <div className="flex flex-col items-center gap-6 pt-2 md:flex-row">
              <CostDonut
                slices={slices}
                total={results.breakdown.totalInternalCost}
                label="Costo total"
                format={(value) => money(value, 0)}
              />
              <div className="w-full space-y-2">
                {slices.map((slice) => (
                  <div key={slice.name} className="flex items-center justify-between gap-3 text-sm">
                    <span className="flex items-center gap-2 text-[var(--calc-muted)]">
                      <span className="size-3 rounded-sm" style={{ background: slice.color }} />
                      {slice.name}
                    </span>
                    <span className="font-bold text-[var(--calc-text)]">{money(slice.value)}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-3 border-t border-[var(--calc-border)] pt-2 text-sm">
                  <span className="font-bold text-[var(--calc-text)]">Costo interno total</span>
                  <span className="font-black text-[var(--calc-text)]">
                    {money(results.breakdown.totalInternalCost)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-[var(--calc-muted)]">Mano de obra (no incluida en costo interno)</span>
                  <span className="font-bold text-[var(--calc-text)]">{money(results.breakdown.laborCost)}</span>
                </div>
              </div>
            </div>
          </Collapsible>
        ) : null}

        <Collapsible title="Ayuda & guía de uso" icon={<BookIcon className="size-3.5 text-[var(--calc-accent-bright)]" />}>
          <div className="space-y-5 pt-2 text-sm">
            <div>
              <h3 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--calc-muted)]">
                Guía de interfaz
              </h3>
              <div className="space-y-3">
                <div className="rounded-lg border border-[var(--calc-warn-border)] bg-[var(--calc-warn-bg)] p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--calc-warn)]">
                    <UnlockIcon className="size-3.5" /> Manual
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--calc-muted)]">
                    Si escribís sobre el precio, entrás en modo manual. El sistema deja de sugerirte precios
                    automáticamente, pero si cambiás las horas o el material, el precio manual se borra para recalcular
                    uno nuevo.
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--calc-accent)] bg-[var(--calc-accent-soft)] p-3">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase text-[var(--calc-accent-bright)]">
                    <LockIcon className="size-3.5" /> Bloqueado
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--calc-muted)]">
                    Al tocar el candado, el precio se vuelve inmune a cambios automáticos. Podés cambiar el tiempo,
                    material o máquina para ver cómo varía tu margen, pero el precio de venta se mantiene fijo.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-[var(--calc-border)] bg-[var(--calc-panel)] p-4">
              <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--calc-text)]">
                <CoinIcon className="size-4 text-[var(--calc-good)]" /> ¿Por qué el &ldquo;valor base&rdquo; no es tu
                precio final?
              </h3>
              <p className="mt-2 text-xs text-[var(--calc-muted)]">
                En el modo avanzado configurás un valor por hora. Ese número es solo una{" "}
                <strong className="text-[var(--calc-text)]">base de cálculo</strong>: tu precio real por hora se expande
                según estos multiplicadores.
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-center gap-2 rounded border border-[var(--calc-border)] bg-[var(--calc-surface)] p-2 font-mono text-xs">
                <span className="font-bold text-[var(--calc-text)]">Base</span>
                <span className="text-[var(--calc-muted)]">×</span>
                <span className="font-bold text-[var(--calc-accent-bright)]">Velocidad</span>
                <span className="text-[var(--calc-muted)]">×</span>
                <span className="font-bold text-[var(--calc-accent-bright)]">Material</span>
                <span className="text-[var(--calc-muted)]">×</span>
                <span className="font-bold text-[var(--calc-accent-bright)]">Complejidad</span>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  title: "Normalización (factor F)",
                  body: "Tomamos la Ender 3 como referencia (1.0). Si tu máquina es el triple de rápida (factor 3.0), cobrás 3 horas virtuales por cada hora real. Tu velocidad es tu margen, no un regalo.",
                },
                {
                  title: "Material técnico",
                  body: "Materiales complejos (ABS, ASA, resina) agregan costo automático de amortización por mayor desgaste de boquilla/mecánica y consumo eléctrico.",
                },
                {
                  title: "Tipo de trabajo",
                  body: "Un repuesto funcional o una pieza industrial tiene mayor valor percibido (y responsabilidad) que un objeto decorativo simple.",
                },
                {
                  title: "Electricidad",
                  body: "El consumo se calcula solo: watts de la máquina x horas de impresión x tu tarifa por kWh. Con la opción activada se suma al precio de venta al costo real, así la luz no te la comés del margen.",
                },
                {
                  title: "Factor de riesgo",
                  body: "Incluimos un % de fallas probable en el precio. Cuando una impresión falla, el costo ya estaba cubierto por las impresiones exitosas anteriores.",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-lg border border-[var(--calc-border)] bg-[var(--calc-panel)] p-3">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--calc-text)]">{item.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-[var(--calc-muted)]">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Collapsible>

        <Collapsible title="Variables de cálculo" icon={<TableIcon className="size-3.5 text-[var(--calc-accent-bright)]" />}>
          <div className="overflow-x-auto border-t border-[var(--calc-border)] pt-2">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--calc-border)] text-[10px] uppercase text-[var(--calc-muted)]">
                  <th className="py-3 pr-4 font-bold">Variable</th>
                  <th className="py-3 pr-4 font-bold">Valor</th>
                  <th className="py-3 font-bold">Detalle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--calc-border)]">
                <tr className="align-top">
                  <td className="py-3 font-mono text-xs text-[var(--calc-accent-bright)]">Costo material</td>
                  <td className="py-3 text-sm font-bold text-[var(--calc-text)]">{money(state.materialPricePerKg / 1000)} /g</td>
                  <td className="py-3 text-xs text-[var(--calc-muted)]">Base: {money(state.materialPricePerKg, 0)}/kg</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 font-mono text-xs text-[var(--calc-accent-bright)]">Valor hora base</td>
                  <td className="py-3 text-sm font-bold text-[var(--calc-text)]">{money(state.marketRatePerHour / 60)} /min</td>
                  <td className="py-3 text-xs text-[var(--calc-muted)]">
                    Ref: {money(state.marketRatePerHour, 0)}/h ({(state.marketRatePerHour / state.exchangeRate).toFixed(2)} USD)
                  </td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 font-mono text-xs text-[var(--calc-muted)]">Mult. tipo</td>
                  <td className="py-3 text-sm font-bold text-[var(--calc-text)]">x{typeMultiplier.toFixed(2)}</td>
                  <td className="py-3 text-xs text-[var(--calc-muted)]">Tipo: {state.printType}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 font-mono text-xs text-[var(--calc-muted)]">Factor máquina</td>
                  <td className="py-3 text-sm font-bold text-[var(--calc-text)]">x{machine.f_factor.toFixed(1)}</td>
                  <td className="py-3 text-xs text-[var(--calc-muted)]">Velocidad vs Ender 3</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 font-mono text-xs text-[var(--calc-muted)]">Factor material</td>
                  <td className="py-3 text-sm font-bold text-[var(--calc-text)]">x{materialProfile.difficultyMult.toFixed(1)}</td>
                  <td className="py-3 text-xs text-[var(--calc-muted)]">Dificultad {state.material}</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 font-mono text-xs text-[var(--calc-accent-bright)]">Electricidad</td>
                  <td className="py-3 text-sm font-bold text-[var(--calc-text)]">
                    {money(results.breakdown.machineElectricity)}
                  </td>
                  <td className="py-3 text-xs text-[var(--calc-muted)]">
                    {machine.watts} W x {results.totalActualHours.toFixed(2)} h x {money(state.electricityCostPerKwh)}/kWh ·{" "}
                    {state.chargeEnergy ? "se suma al precio" : "sale de tu margen"}
                  </td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 font-mono text-xs text-[var(--calc-muted)]">Riesgo configurado</td>
                  <td className="py-3 text-sm font-bold text-[var(--calc-text)]">{state.failRatePercent}%</td>
                  <td className="py-3 text-xs text-[var(--calc-muted)]">{money(results.breakdown.riskCost)} agregados</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 font-mono text-xs text-[var(--calc-text)]">Mano de obra (est.)</td>
                  <td className="py-3 text-sm font-bold text-[var(--calc-text)]">{money(results.breakdown.laborCost)}</td>
                  <td className="py-3 text-xs text-[var(--calc-muted)]">
                    Ganancia.
                    {isCutter ? <span className="ml-1 font-bold text-[var(--calc-bad)]">x 0.5 (eficiencia)</span> : null}
                  </td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 font-mono text-xs text-[var(--calc-text)]">Costo interno</td>
                  <td className="py-3 text-sm font-bold text-[var(--calc-text)]">{money(results.breakdown.totalInternalCost)}</td>
                  <td className="py-3 text-xs text-[var(--calc-muted)]">Material + máquina + luz (sin mano de obra)</td>
                </tr>
                <tr className="align-top">
                  <td className="py-3 font-mono text-xs text-[var(--calc-text)]">Tiempo normalizado</td>
                  <td className="py-3 text-sm font-bold text-[var(--calc-text)]">{results.normalizedTimeHours.toFixed(2)} h</td>
                  <td className="py-3 text-xs text-[var(--calc-muted)]">
                    {results.totalActualHours.toFixed(2)} h reales x{machine.f_factor.toFixed(1)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Collapsible>

        <p className="flex items-center justify-center gap-2 text-center text-xs text-[var(--calc-muted)]">
          <TrendUpIcon className="size-3.5" />
          Los valores son una referencia: ajustá el valor base y el riesgo según tu taller.
        </p>
      </div>
    </div>
  );
}
