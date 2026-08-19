import { hasSupabaseEnv } from "@/lib/env";
import { createClient } from "@/lib/supabase/server";
import { regions, SETTINGS_REGION_CODE } from "./model";

export const ELECTRICITY_SETTING_KEY = "electricity_cost_per_kwh";

/** Tope de espera para no bloquear el render si Supabase está caído. */
const SETTINGS_TIMEOUT_MS = 2000;

export type CalculatorSettings = {
  electricityCostPerKwh: number;
  note: string | null;
  updatedAt: string | null;
};

function fallbackSettings(): CalculatorSettings {
  const region = regions.find((item) => item.code === SETTINGS_REGION_CODE);
  return {
    electricityCostPerKwh: region?.avgElectricityCost ?? 0,
    note: region?.tariffNote ?? null,
    updatedAt: null,
  };
}

/**
 * Lee la tarifa vigente en cada request, así la calculadora arranca siempre con
 * el último valor cargado sin necesidad de un deploy. Si no hay Supabase o la
 * consulta falla, cae al valor por defecto de la región.
 */
export async function getCalculatorSettings(): Promise<CalculatorSettings> {
  if (!hasSupabaseEnv()) return fallbackSettings();

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("calculator_settings")
      .select("value, note, updated_at")
      .eq("key", ELECTRICITY_SETTING_KEY)
      // Si la base no responde, la calculadora abre igual con el valor por defecto.
      .abortSignal(AbortSignal.timeout(SETTINGS_TIMEOUT_MS))
      .maybeSingle();

    if (error || !data) return fallbackSettings();

    const value = Number(data.value);
    if (!Number.isFinite(value) || value < 0) return fallbackSettings();

    return {
      electricityCostPerKwh: value,
      note: data.note ?? null,
      updatedAt: data.updated_at ?? null,
    };
  } catch {
    return fallbackSettings();
  }
}
