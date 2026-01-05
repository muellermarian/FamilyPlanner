/**
 * Common constants used across the application
 */

export const QUANTITY_UNITS = [
  'Stk',
  'kg',
  'g',
  'L',
  'ml',
  'Packung',
  'Bund',
  'EL',
  'TL',
  'Prise',
  'Dose',
  'Glas',
  'Portion',
] as const;

export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

export const STORES = [
  'Aldi',
  'Lidl',
  'Rewe',
  'Edeka',
  'Penny',
  'Netto',
  'Kaufland',
  'Rossmann',
  'dm',
  'Müller',
  'Real',
  'Globus',
  'Marktkauf',
  'Sonstige',
] as const;

export type Store = (typeof STORES)[number];
