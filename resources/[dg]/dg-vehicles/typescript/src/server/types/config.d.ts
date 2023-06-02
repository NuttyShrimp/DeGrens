declare namespace Config {
  type PriceCategory = Record<keyof Vehicles.Upgrades.AllCosmeticModIds | 'extras', number>;
  interface Prices {
    categories: PriceCategory;
    classMultiplier: Record<string, number>;
  }
}
