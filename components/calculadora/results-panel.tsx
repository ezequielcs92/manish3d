"use client";

import type { CalculationResult } from "@/lib/calculadora/model";
import {
  BoltIcon,
  CalendarIcon,
  ClockIcon,
  LockIcon,
  PiggyIcon,
  RefreshIcon,
  SparkIcon,
  SunIcon,
  TagIcon,
  TargetIcon,
  TrendDownIcon,
  TrendUpIcon,
  UnlockIcon,
  WalletIcon,
} from "./ui";

export function ResultsPanel({
  results,
  currencySymbol,
  locale,
  currencyIso,
  manualPrice,
  onManualPriceChange,
  isManualMode,
  setIsManualMode,
  isValid,
  isPriceLocked,
  onToggleLock,
}: {
  results: CalculationResult;
  currencySymbol: string;
  locale: string;
  currencyIso: string;
  manualPrice: number | null;
  onManualPriceChange: (value: number | null) => void;
  isManualMode: boolean;
  setIsManualMode: (value: boolean) => void;
  isValid: boolean;
  isPriceLocked: boolean;
  onToggleLock: () => void;
}) {
  const lowMargin = results.marginPercent < 20;
  const losing = results.marginPercent < 0;

  const money = (value: number, compact = false) =>
    new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyIso,
      minimumFractionDigits: 0,
      maximumFractionDigits: compact ? 1 : 2,
      notation: compact ? "compact" : "standard",
    }).format(value);

  const handleInput = (raw: string) => {
    if (raw === "") {
      onManualPriceChange(null);
    } else {
      const parsed = parseFloat(raw);
      onManualPriceChange(Number.isNaN(parsed) ? 0 : parsed);
    }
    setIsManualMode(true);
  };

  const applyStrategy = (value: number) => {
    if (isPriceLocked) return;
    onManualPriceChange(value);
    setIsManualMode(true);
  };

  const reset = () => {
    onManualPriceChange(null);
    setIsManualMode(false);
    if (isPriceLocked) onToggleLock();
  };

  const perHour = results.totalActualHours > 0 ? results.margin / results.totalActualHours : 0;
  const perDay = perHour * 20;
  const perMonth = perDay * 22;

  let priceBoxClass = "border-[var(--calc-border)] bg-[var(--calc-bg)] text-[var(--calc-text)]";
  if (!isValid) {
    priceBoxClass = "border-[var(--calc-border)] bg-[var(--calc-bg)] text-[var(--calc-muted)]";
  } else if (isPriceLocked) {
    priceBoxClass = "border-[var(--calc-accent)] bg-[var(--calc-accent-soft)] text-[var(--calc-accent-bright)]";
  } else if (losing) {
    priceBoxClass = "border-[var(--calc-bad-border)] bg-[var(--calc-bad-bg)] text-[var(--calc-bad)]";
  } else if (isManualMode) {
    priceBoxClass = "border-[var(--calc-warn-border)] bg-[var(--calc-warn-bg)] text-[var(--calc-warn)]";
  }

  const inputValue = isManualMode ? (manualPrice === null ? "" : manualPrice) : results.recommendedPrice;
  const dimmed = isValid ? "opacity-100" : "pointer-events-none opacity-30 blur-[2px]";

  return (
    <section className="overflow-hidden rounded-2xl border border-[var(--calc-border)] bg-[var(--calc-surface)] shadow-[var(--calc-shadow)]">
      <header className="flex items-center justify-between gap-3 border-b border-[var(--calc-border)] bg-[var(--calc-bg)] p-4">
        <h3 className="flex items-center gap-2 text-lg font-black text-[var(--calc-text)]">
          <SparkIcon className="size-5 text-[var(--calc-accent-bright)]" />
          Simulador de Ganancia
        </h3>
        {isValid ? (
          losing ? (
            <span className="flex items-center gap-1 rounded-full border border-[var(--calc-bad-border)] bg-[var(--calc-bad-bg)] px-3 py-1 text-xs font-bold text-[var(--calc-bad)]">
              <TrendDownIcon className="size-3.5" /> PÉRDIDA
            </span>
          ) : (
            <span
              className={`flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${
                lowMargin
                  ? "border-[var(--calc-warn-border)] bg-[var(--calc-warn-bg)] text-[var(--calc-warn)]"
                  : "border-[var(--calc-good-border)] bg-[var(--calc-good-bg)] text-[var(--calc-good)]"
              }`}
            >
              {lowMargin ? <TrendDownIcon className="size-3.5" /> : <TrendUpIcon className="size-3.5" />}
              {results.marginPercent.toFixed(1)}% Margen
            </span>
          )
        ) : null}
      </header>

      <div className="p-6">
        <div className="relative mb-8 text-center">
          <span className="mb-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--calc-muted)]">
            Precio de Venta Final
            {isValid && isPriceLocked ? (
              <span className="flex items-center gap-1 rounded-full border border-[var(--calc-accent)] bg-[var(--calc-accent-soft)] px-2 py-0.5 text-[10px] text-[var(--calc-accent-bright)]">
                <LockIcon className="size-2.5" /> BLOQUEADO
              </span>
            ) : isValid && isManualMode ? (
              <span className="flex items-center gap-1 rounded-full border border-[var(--calc-warn-border)] bg-[var(--calc-warn-bg)] px-2 py-0.5 text-[10px] text-[var(--calc-warn)]">
                <UnlockIcon className="size-2.5" /> MANUAL
              </span>
            ) : null}
          </span>

          <div className="flex items-center justify-center gap-3">
            <div
              className={`relative flex w-full max-w-[280px] items-center justify-center gap-2 rounded-xl border-2 px-6 py-3 transition-all ${priceBoxClass}`}
            >
              <span className={`pb-1 text-2xl font-bold ${isValid ? "text-[var(--calc-muted)]" : "text-[var(--calc-border)]"}`}>
                {currencySymbol}
              </span>
              {isValid ? (
                <input
                  type="number"
                  aria-label="Precio de venta final"
                  className="w-40 bg-transparent text-left text-4xl font-black outline-none"
                  value={inputValue}
                  onChange={(event) => handleInput(event.target.value)}
                />
              ) : (
                <span className="select-none text-4xl font-black text-[var(--calc-muted)]">---</span>
              )}
              {isValid && isManualMode && !isPriceLocked ? (
                <button
                  type="button"
                  onClick={reset}
                  aria-label="Volver al precio sugerido"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[var(--calc-warn-bg)] p-1.5 text-[var(--calc-warn)] transition hover:brightness-110"
                >
                  <RefreshIcon className="size-4" />
                </button>
              ) : null}
            </div>

            {isValid && isManualMode ? (
              <button
                type="button"
                onClick={onToggleLock}
                title={isPriceLocked ? "Desbloquear precio" : "Bloquear precio (fijar para comparar)"}
                className={`flex size-14 items-center justify-center rounded-xl border-2 transition ${
                  isPriceLocked
                    ? "border-[var(--calc-accent)] bg-[var(--calc-accent)] text-white"
                    : "border-[var(--calc-border)] bg-[var(--calc-bg)] text-[var(--calc-muted)] hover:text-[var(--calc-text)]"
                }`}
              >
                {isPriceLocked ? <LockIcon className="size-5" /> : <UnlockIcon className="size-5" />}
              </button>
            ) : null}
          </div>

          {!isValid ? (
            <p className="mt-2 text-xs font-semibold text-[var(--calc-accent-bright)]">
              Ingresá tiempo y peso para calcular
            </p>
          ) : null}
        </div>

        <div className={`mb-8 transition-opacity duration-300 ${dimmed}`}>
          <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[var(--calc-muted)]">
            Estrategias de precio
          </h4>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <button
              type="button"
              disabled={isPriceLocked}
              onClick={() => applyStrategy(results.economyPrice)}
              className="group flex flex-col items-center rounded-lg border border-[var(--calc-border)] bg-[var(--calc-panel)] p-3 transition hover:border-[var(--calc-muted)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="mb-1 flex items-center gap-1 text-xs font-bold uppercase text-[var(--calc-muted)]">
                <TagIcon className="size-3" /> Mayorista
              </span>
              <span className="text-lg font-black text-[var(--calc-text)]">{money(results.economyPrice)}</span>
              <span className="mt-1 text-center text-[10px] leading-tight text-[var(--calc-muted)]">
                Por cantidad / Lotes.
              </span>
            </button>

            <button
              type="button"
              disabled={isPriceLocked}
              onClick={() => applyStrategy(results.recommendedPrice)}
              className="group relative flex flex-col items-center rounded-lg border-2 border-[var(--calc-accent)] bg-[var(--calc-accent-soft)] p-3 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="absolute -top-2 rounded-full bg-[var(--calc-accent)] px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                Recomendado
              </span>
              <span className="mb-1 mt-1 flex items-center gap-1 text-xs font-bold uppercase text-[var(--calc-accent-bright)]">
                <TargetIcon className="size-3" /> Ideal
              </span>
              <span className="text-lg font-black text-[var(--calc-text)]">{money(results.recommendedPrice)}</span>
              <span className="mt-1 text-center text-[10px] leading-tight text-[var(--calc-accent-bright)]">
                Equilibrio perfecto.
              </span>
            </button>

            <button
              type="button"
              disabled={isPriceLocked}
              onClick={() => applyStrategy(results.premiumPrice)}
              className="group flex flex-col items-center rounded-lg border border-[var(--calc-border)] bg-[var(--calc-panel)] p-3 transition hover:border-[var(--calc-muted)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span className="mb-1 flex items-center gap-1 text-xs font-bold uppercase text-[var(--calc-muted)]">
                <BoltIcon className="size-3" /> Premium
              </span>
              <span className="text-lg font-black text-[var(--calc-text)]">{money(results.premiumPrice)}</span>
              <span className="mt-1 text-center text-[10px] leading-tight text-[var(--calc-muted)]">
                Urgencia / Prioridad.
              </span>
            </button>
          </div>
        </div>

        <div className={`mb-6 grid grid-cols-2 gap-4 transition-opacity duration-300 ${dimmed}`}>
          <div className="flex flex-col items-center justify-between rounded-xl border border-[var(--calc-border)] bg-[var(--calc-bg)] p-4 text-center">
            <span className="mb-2 flex items-center gap-1 text-xs font-bold uppercase text-[var(--calc-muted)]">
              <WalletIcon className="size-3.5" /> Costo técnico
            </span>
            <span className="text-xl font-black text-[var(--calc-text)]">
              {money(results.breakdown.totalInternalCost)}
            </span>
            <p className="mt-1 text-[10px] leading-tight text-[var(--calc-muted)]">Material, luz, máquina.</p>
          </div>

          <div
            className={`flex flex-col items-center justify-between rounded-xl border p-4 text-center ${
              results.margin < 0
                ? "border-[var(--calc-bad-border)] bg-[var(--calc-bad-bg)]"
                : "border-[var(--calc-good-border)] bg-[var(--calc-good-bg)]"
            }`}
          >
            <span
              className={`mb-2 flex items-center gap-1 text-xs font-bold uppercase ${
                results.margin < 0 ? "text-[var(--calc-bad)]" : "text-[var(--calc-good)]"
              }`}
            >
              <PiggyIcon className="size-3.5" /> Tu ganancia
            </span>
            <span
              className={`text-xl font-black ${results.margin < 0 ? "text-[var(--calc-bad)]" : "text-[var(--calc-good)]"}`}
            >
              {results.margin > 0 ? "+" : ""}
              {money(results.margin)}
            </span>
            <span
              className={`mt-1 text-xs font-bold ${results.margin < 0 ? "text-[var(--calc-bad)]" : "text-[var(--calc-good)]"}`}
            >
              {results.markupPercent.toFixed(0)}% Rentabilidad
            </span>
            <span className="text-[10px] text-[var(--calc-muted)]">sobre gastos</span>
          </div>
        </div>

        <div className={`border-t border-[var(--calc-border)] pt-6 transition-opacity duration-300 ${dimmed}`}>
          <h4 className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--calc-muted)]">
            <TrendUpIcon className="size-3.5 text-[var(--calc-text)]" /> Proyección operativa (ganancia limpia)
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Hora", value: perHour, Icon: ClockIcon },
              { label: "Día", value: perDay, Icon: SunIcon },
              { label: "Mes", value: perMonth, Icon: CalendarIcon },
            ].map(({ label, value, Icon }) => (
              <div
                key={label}
                className="flex flex-col items-center justify-center rounded-lg border border-[var(--calc-border)] bg-[var(--calc-bg)] p-3 text-center"
              >
                <span className="mb-1 flex items-center gap-1 text-[10px] font-bold uppercase text-[var(--calc-muted)]">
                  <Icon className="size-2.5" /> {label}
                </span>
                <span className="text-sm font-black text-[var(--calc-good)]">{money(value, true)}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[10px] text-[var(--calc-muted)]">
            *Estimado: máquina operando 20hs diarias durante 22 días hábiles.
          </p>
        </div>

      </div>
    </section>
  );
}
