export const ALARM_NAME = 'JEWEL_STORE_HEIST_ALARMS';

export const WHITELISTED_WEAPONS = [
  'weapon_microsmg',
  'weapon_assaultrifle',
  'weapon_advancedrifle',
  'weapon_assaultsmg',
];

export const VITRINE_MODEL_DATA = [
  {
    start: 'des_jewel_cab_start',
    end: 'des_jewel_cab_end',
    animName: 'smash_case_necklace',
    delay: 630,
    particleOffset: { x: 0, y: 0, z: 0.5 },
  },
  {
    start: 'des_jewel_cab2_start',
    end: 'des_jewel_cab2_end',
    animName: 'smash_case_f',
    delay: 260,
    particleOffset: { x: 0, y: 0, z: 0.5 },
  },
  {
    start: 'des_jewel_cab3_start',
    end: 'des_jewel_cab3_end',
    animName: 'smash_case_d',
    delay: 360,
    particleOffset: { x: 0, y: 0, z: 0.5 },
  },
  {
    start: 'des_jewel_cab4_start',
    end: 'des_jewel_cab4_end',
    animName: 'smash_case_necklace_skull',
    delay: 160,
    particleOffset: { x: 0.5, y: 0, z: 0 },
  },
].map(x => ({ ...x, start: GetHashKey(x.start), end: GetHashKey(x.end) }));
