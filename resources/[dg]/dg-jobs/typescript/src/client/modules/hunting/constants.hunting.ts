export const PLACING_ANIMATIONS = {
  start: {
    animDict: 'amb@world_human_gardener_plant@male@enter',
    anim: 'enter',
  },
  end: {
    animDict: 'amb@world_human_gardener_plant@male@exit',
    anim: 'exit',
  },
};

// excludes sea animals, used to handle huntingrifle shot
export const ALL_ANIMAL_MODELS = new Set(
  [
    'a_c_boar',
    'a_c_cat_01',
    'a_c_chickenhawk',
    'a_c_chimp',
    'a_c_chop',
    'a_c_cormorant',
    'a_c_cow',
    'a_c_coyote',
    'a_c_crow',
    'a_c_deer',
    'a_c_hen',
    'a_c_husky',
    'a_c_mtlion',
    'a_c_pig',
    'a_c_pigeon',
    'a_c_poodle',
    'a_c_pug',
    'a_c_rabbit_01',
    'a_c_rat',
    'a_c_retriever',
    'a_c_rhesus',
    'a_c_rottweiler',
    'a_c_seagull',
    'a_c_shepherd',
    'a_c_westy',
  ].map(GetHashKey)
);

export const TIME_TO_LEAVE_AREA = 60;
export const TIME_TO_KILL_ANIMAL = 300_000;
