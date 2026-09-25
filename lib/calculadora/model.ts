export type Region = {
  code: string;
  name: string;
  flag: string;
  locale: string;
  currencyIso: string;
  currencySymbol: string;
  exchangeRate: number;
  avgElectricityCost: number;
  defaultLaborCost: number;
  defaultMaterialCost: number;
  /** Origen de la tarifa eléctrica sugerida, para mostrar bajo el campo. */
  tariffNote?: string;
};

export const regions: Region[] = [
  { code: "US", name: "Internacional", flag: "🇺🇸", locale: "en-US", currencyIso: "USD", currencySymbol: "$", exchangeRate: 1, avgElectricityCost: 0.15, defaultLaborCost: 15, defaultMaterialCost: 20 },
  {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    locale: "es-AR",
    currencyIso: "ARS",
    currencySymbol: "$",
    exchangeRate: 1500,
    avgElectricityCost: 115.28,
    defaultLaborCost: 10000,
    defaultMaterialCost: 22000,
    tariffNote: "Ref. Edenor T1 residencial: costo variable ~$115,28/kWh (sin cargo fijo ni impuestos).",
  },
  { code: "MX", name: "México", flag: "🇲🇽", locale: "es-MX", currencyIso: "MXN", currencySymbol: "$", exchangeRate: 17, avgElectricityCost: 3, defaultLaborCost: 100, defaultMaterialCost: 450 },
  { code: "ES", name: "España", flag: "🇪🇸", locale: "es-ES", currencyIso: "EUR", currencySymbol: "€", exchangeRate: 0.92, avgElectricityCost: 0.2, defaultLaborCost: 12, defaultMaterialCost: 22 },
  { code: "CO", name: "Colombia", flag: "🇨🇴", locale: "es-CO", currencyIso: "COP", currencySymbol: "$", exchangeRate: 3900, avgElectricityCost: 800, defaultLaborCost: 20000, defaultMaterialCost: 90000 },
  { code: "CL", name: "Chile", flag: "🇨🇱", locale: "es-CL", currencyIso: "CLP", currencySymbol: "$", exchangeRate: 950, avgElectricityCost: 130, defaultLaborCost: 8000, defaultMaterialCost: 18000 },
];

/** Región cuyos valores por defecto administra el taller desde el panel. */
export const SETTINGS_REGION_CODE = "AR";

/** Valores que la calculadora recibe del servidor en vez de tomarlos del código. */
export type TariffSettings = {
  electricityCostPerKwh: number;
  note?: string | null;
};

/** Valor hora base de referencia en USD para regiones sin tarifa propia. */
const BASE_RATE_USD = 2;

/** Tarifa base por hora de la región (AR usa la referencia local de ~0.70 USD). */
export function marketRateFor(region: Region) {
  if (region.code === "AR") return 1050;
  return Number((BASE_RATE_USD * (region.defaultLaborCost / 15)).toFixed(2));
}

export type Machine = {
  id: string;
  name: string;
  /** Velocidad relativa contra una Ender 3 estándar (1.0). */
  f_factor: number;
  watts: number;
  /** Precio de compra en USD base. */
  price: number;
  lifespanHours: number;
  /** Mantenimiento en USD por mes. */
  maintenanceMonthly: number;
  hoursPerMonth: number;
};

export const defaultMachines: Machine[] = [
  { id: "anycubic_kobra", name: "Anycubic Kobra / 2 / 3 / Neo", f_factor: 2.5, watts: 150, price: 300, lifespanHours: 3000, maintenanceMonthly: 6, hoursPerMonth: 90 },
  // Kobra X: precio y velocidad publicados por Anycubic (USD 279, 600 mm/s, 20.000 mm/s²).
  // Los 1450 W de la ficha son potencia nominal, el pico al calentar; el
  // consumo promedio imprimiendo se estima en 180 W por comparación con otras
  // bedslinger rápidas. Vida útil, mantenimiento y horas son estimados.
  { id: "anycubic_kobra_x", name: "Anycubic Kobra X", f_factor: 3, watts: 180, price: 279, lifespanHours: 3500, maintenanceMonthly: 6, hoursPerMonth: 100 },
  { id: "artillery_genius", name: "Artillery Genius / Sidewinder X1-X2", f_factor: 1.2, watts: 110, price: 350, lifespanHours: 3000, maintenanceMonthly: 6, hoursPerMonth: 80 },
  { id: "bambu_a1", name: "Bambu Lab A1 / Mini", f_factor: 3, watts: 130, price: 400, lifespanHours: 4000, maintenanceMonthly: 4, hoursPerMonth: 120 },
  { id: "bambu_p1s", name: "Bambu Lab P1S", f_factor: 3.5, watts: 300, price: 700, lifespanHours: 5000, maintenanceMonthly: 5, hoursPerMonth: 150 },
  { id: "bambu_x1c", name: "Bambu Lab X1C", f_factor: 3.8, watts: 350, price: 1200, lifespanHours: 6000, maintenanceMonthly: 10, hoursPerMonth: 150 },
  { id: "creality_ender3_legacy", name: "Creality Ender-3 (Pro, Max, Neo, V2)", f_factor: 1, watts: 120, price: 200, lifespanHours: 3000, maintenanceMonthly: 5, hoursPerMonth: 80 },
  { id: "creality_ender3_v3_ke", name: "Creality Ender-3 V3 / KE", f_factor: 2.5, watts: 200, price: 280, lifespanHours: 3500, maintenanceMonthly: 8, hoursPerMonth: 100 },
  { id: "creality_ender3_se", name: "Creality Ender-3 V3 SE", f_factor: 1.8, watts: 150, price: 220, lifespanHours: 3500, maintenanceMonthly: 5, hoursPerMonth: 100 },
  { id: "creality_k1", name: "Creality K1 / K1 Max", f_factor: 3.5, watts: 350, price: 600, lifespanHours: 4000, maintenanceMonthly: 10, hoursPerMonth: 120 },
  { id: "prusa_mk", name: "Prusa MK3S+ / MK4", f_factor: 1.5, watts: 130, price: 800, lifespanHours: 10000, maintenanceMonthly: 2, hoursPerMonth: 120 },
  { id: "custom", name: "Otra / Custom", f_factor: 1, watts: 150, price: 300, lifespanHours: 3000, maintenanceMonthly: 5, hoursPerMonth: 80 },
];

export type MaterialProfile = { priceFactor: number; risk: number; difficultyMult: number };

export const materials: Record<string, MaterialProfile> = {
  PLA: { priceFactor: 1, risk: 5, difficultyMult: 1 },
  PETG: { priceFactor: 1.2, risk: 8, difficultyMult: 1.1 },
  TPU: { priceFactor: 1.8, risk: 15, difficultyMult: 1.3 },
  "ABS/ASA": { priceFactor: 1.4, risk: 20, difficultyMult: 1.4 },
  Resina: { priceFactor: 2, risk: 15, difficultyMult: 1.5 },
  Otro: { priceFactor: 1.5, risk: 10, difficultyMult: 1.2 },
};

export const printTypes: Record<string, number> = {
  "Producto Simple (Articulados/Macetas)": 1,
  "Producto Elaborado (Chops/Llaveros)": 1.25,
  "Industrial (Piezas Técnicas/Empresas)": 2,
  Cortantes: 1.5,
};

export const deliveries: Record<string, number> = {
  Normal: 1,
  "48-72hs": 1.2,
  "24hs": 1.5,
};

export type CalculatorState = {
  /** "service" cotiza a precio de mercado; "cost" duplica el costo interno. */
  mode: "service" | "cost";
  countryCode: string;
  currencySymbol: string;
  currencyIso: string;
  locale: string;
  exchangeRate: number;
  machineId: string;
  material: string;
  materialPricePerKg: number;
  gramsTotal: number;
  printTimeHours: number;
  printTimeMinutes: number;
  printType: string;
  delivery: string;
  quantity: number;
  manualPrice: number | null;
  electricityCostPerKwh: number;
  laborCostPerHour: number;
  prepTimeMinutes: number;
  postTimeMinutes: number;
  failRatePercent: number;
  consumablesCost: number;
  minOrderPrice: number;
  marketRatePerHour: number;
  /** Suma la electricidad real (watts x horas x tarifa) al precio de venta. */
  chargeEnergy: boolean;
};

/**
 * Los ajustes cargados en el panel mandan sobre los valores por defecto del
 * código, pero solo para la región que administra el taller.
 */
export function applyTariff(region: Region, tariff?: TariffSettings | null) {
  if (!tariff || region.code !== SETTINGS_REGION_CODE) {
    return { electricityCostPerKwh: region.avgElectricityCost, tariffNote: region.tariffNote ?? null };
  }

  return {
    electricityCostPerKwh: tariff.electricityCostPerKwh,
    tariffNote: tariff.note ?? region.tariffNote ?? null,
  };
}

export function createInitialState(region: Region = regions[1], tariff?: TariffSettings | null): CalculatorState {
  return {
    mode: "service",
    countryCode: region.code,
    currencySymbol: region.currencySymbol,
    currencyIso: region.currencyIso,
    locale: region.locale,
    exchangeRate: region.exchangeRate,
    machineId: "anycubic_kobra_x",
    material: "PLA",
    materialPricePerKg: region.defaultMaterialCost,
    gramsTotal: 0,
    printTimeHours: 0,
    printTimeMinutes: 0,
    printType: "Producto Simple (Articulados/Macetas)",
    delivery: "Normal",
    quantity: 1,
    manualPrice: null,
    electricityCostPerKwh: applyTariff(region, tariff).electricityCostPerKwh,
    laborCostPerHour: region.defaultLaborCost,
    prepTimeMinutes: 10,
    postTimeMinutes: 5,
    failRatePercent: 5,
    consumablesCost: 0,
    minOrderPrice: 0,
    marketRatePerHour: marketRateFor(region),
    chargeEnergy: true,
  };
}

export type Breakdown = {
  materialCost: number;
  machineElectricity: number;
  machineDepreciation: number;
  machineMaintenance: number;
  laborCost: number;
  riskCost: number;
  consumables: number;
  totalInternalCost: number;
};

export type CalculationResult = {
  breakdown: Breakdown;
  /** Electricidad efectivamente cobrada dentro del precio de venta. */
  energyCharged: number;
  /** Horas reales x factor de velocidad de la máquina. */
  normalizedTimeHours: number;
  totalActualHours: number;
  baseMarketPrice: number;
  recommendedPrice: number;
  economyPrice: number;
  premiumPrice: number;
  activePrice: number;
  margin: number;
  marginPercent: number;
  markupPercent: number;
};

export function calculate(state: CalculatorState, machine: Machine): CalculationResult {
  const difficulty = materials[state.material]?.difficultyMult ?? 1;

  const totalActualHours = (state.printTimeHours + state.printTimeMinutes / 60) * state.quantity;
  const materialCost = (state.gramsTotal / 1000) * state.materialPricePerKg * state.quantity;
  const machineElectricity = (machine.watts / 1000) * totalActualHours * state.electricityCostPerKwh;
  const machineDepreciation =
    ((machine.price * state.exchangeRate) / machine.lifespanHours) * totalActualHours * difficulty;
  const machineMaintenance =
    ((machine.maintenanceMonthly * state.exchangeRate) / machine.hoursPerMonth) * totalActualHours * difficulty;

  const prepHours = state.prepTimeMinutes / 60;
  const postHours = (state.postTimeMinutes / 60) * state.quantity;
  const handlingHours = 10 / 60;
  const efficiency = state.printType === "Cortantes" ? 0.5 : 1;
  const laborCost = (prepHours + postHours + handlingHours) * state.laborCostPerHour * efficiency;

  const consumables = state.consumablesCost * state.quantity;
  const rawCost = materialCost + machineElectricity + machineDepreciation + machineMaintenance + consumables;
  const riskCost = rawCost * (state.failRatePercent / 100);
  const totalInternalCost = rawCost + riskCost;

  let baseMarketPrice = 0;
  let recommendedPrice = 0;

  // En modo costo la luz ya viaja dentro del costo interno que se duplica.
  const energyCharged = state.mode === "service" && state.chargeEnergy ? machineElectricity : 0;

  if (state.mode === "service") {
    const normalizedHours = totalActualHours * machine.f_factor;
    const typeMult = printTypes[state.printType] ?? 1;
    const deliveryMult = deliveries[state.delivery] ?? 1;
    const ratePerHour = state.marketRatePerHour * difficulty;
    const machineValue = normalizedHours * ratePerHour;

    baseMarketPrice =
      (materialCost + laborCost + machineValue) * typeMult * deliveryMult + consumables + energyCharged;
    if (baseMarketPrice < state.minOrderPrice) baseMarketPrice = state.minOrderPrice;
    recommendedPrice = Math.ceil(baseMarketPrice);
  } else {
    baseMarketPrice = (totalInternalCost + laborCost) * 2;
    recommendedPrice = Math.ceil(baseMarketPrice);
  }

  const activePrice = state.manualPrice !== null && state.manualPrice > 0 ? state.manualPrice : recommendedPrice;
  const economyPrice = Math.ceil(recommendedPrice * 0.85);
  const premiumPrice = Math.ceil(recommendedPrice * 1.3);
  const margin = activePrice - totalInternalCost;

  return {
    breakdown: {
      materialCost,
      machineElectricity,
      machineDepreciation,
      machineMaintenance,
      laborCost,
      riskCost,
      consumables,
      totalInternalCost,
    },
    energyCharged,
    normalizedTimeHours: totalActualHours * machine.f_factor,
    totalActualHours,
    baseMarketPrice,
    recommendedPrice,
    economyPrice,
    premiumPrice,
    activePrice,
    margin,
    marginPercent: activePrice > 0 ? (margin / activePrice) * 100 : 0,
    markupPercent: totalInternalCost > 0 ? (margin / totalInternalCost) * 100 : 0,
  };
}
