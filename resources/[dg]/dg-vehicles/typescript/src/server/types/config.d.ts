declare namespace Config {
  type PriceCategory = Record<keyof Upgrades.AllCosmeticModIds | 'extras', number>;
  interface Prices {
    categories: PriceCategory;
    classMultiplier: Record<string, number>;
  }
}
