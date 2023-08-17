export const MODEL_CATEGORISATION = ['brand', 'class', 'category'] as const;

export type ModelCategorisation = (typeof MODEL_CATEGORISATION)[number];

export const CATEGORY_LABEL: Record<ModelCategorisation, string> = {
  brand: 'Op Merk',
  class: 'Op Klasse',
  category: 'Op Categorie',
};

export const VEHICLE_CATEGORY_TO_LABEL: Record<Vehicles.Category, string> = {
  compacts: 'Kleine Voertuigen',
  sedans: 'Sedans',
  suvs: 'SUVs',
  coupes: 'Coupes',
  muscle: 'Musclecars',
  sportsclassics: 'Klassieke Sportwagens',
  sports: 'Sportwagens',
  super: 'Supercars',
  motorcycles: 'Motors',
  offroad: 'Offroad Voertuigen',
  industrial: 'Industriele Voertuigen',
  utility: 'Werkvoertuigen',
  vans: 'Bestelwagens',
  cycles: 'Fietsen',
  boats: 'Boten',
  helicopters: 'Helicopters',
  planes: 'Vliegtuigen',
  service: 'Werkvoertuigen',
  emergency: 'Overheidsvoertuigen',
  military: 'Militaire Voertuigen',
  commercial: 'Commerciele Voertuigen',
  trains: 'Treinen',
  openwheel: 'Open Wheel',
};
