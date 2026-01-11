// Common constants used across the application

// Supported quantity units for recipes and shopping items
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

// Type for quantity unit
export type QuantityUnit = (typeof QUANTITY_UNITS)[number];

// Supported store names for shopping items
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

// Type for store name
export type Store = (typeof STORES)[number];
