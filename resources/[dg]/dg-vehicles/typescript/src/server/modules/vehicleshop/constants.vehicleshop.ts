export const MODEL_CATEGORISATION = ['brand', 'class', 'category'] as const;

export type ModelCategorisation = (typeof MODEL_CATEGORISATION)[number];

export const CATEGORY_LABEL: Record<ModelCategorisation, string> = {
  brand: 'Op Merk',
  class: 'Op Klasse',
  category: 'Op Categorie',
};

export const VEHICLE_CATEGORY_TO_LABEL: Record<Category, string> = {
  coupes: 'Coupes',
  offroad: 'Offroad Voertuigen',
  compacts: 'Kleine Voertuigen',
  motorcycles: 'Motors',
  sedans: 'Sedans',
  sports: 'Sportwagens',
  sportsclassics: 'Klassieke Sportwagens',
  super: 'Supercars',
  suvs: 'SUVs',
  muscle: 'Musclecars',
  vans: 'Bestelwagens',
  cycles: 'Fietsen',
  service: 'Werkvoertuigen',
};
