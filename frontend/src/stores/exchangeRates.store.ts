import { create } from "zustand";

export interface ExchangeRates {
  VES: number;
  COP: number;
}

interface ExchangeRateSnapshot {
  rates: ExchangeRates;
  timestamp: string;
}

interface ExchangeRatesState {
  rates: ExchangeRates;
  lastUpdated: string;

  /** Update a single rate */
  setRate: (code: keyof ExchangeRates, value: number) => void;

  /** Overwrite all rates at once */
  setAllRates: (rates: ExchangeRates) => void;

  /** Get a frozen snapshot of current rates + timestamp */
  snapshot: () => ExchangeRateSnapshot;

  /** Convert USD to a local currency */
  toLocal: (usd: number, code: keyof ExchangeRates) => number;

  /** Convert local currency to USD */
  toUSD: (amount: number, code: keyof ExchangeRates) => number;
}

export const useExchangeRatesStore = create<ExchangeRatesState>((set, get) => ({
  rates: {
    VES: 40.5,
    COP: 4150.0,
  },
  lastUpdated: new Date().toISOString(),

  setRate: (code, value) =>
    set((state) => ({
      rates: { ...state.rates, [code]: value },
      lastUpdated: new Date().toISOString(),
    })),

  setAllRates: (rates) =>
    set({
      rates,
      lastUpdated: new Date().toISOString(),
    }),

  snapshot: () => ({
    rates: { ...get().rates },
    timestamp: new Date().toISOString(),
  }),

  toLocal: (usd, code) => usd * get().rates[code],

  toUSD: (amount, code) => {
    const rate = get().rates[code];
    return rate > 0 ? amount / rate : 0;
  },
}));
