export const ALL_WEAPONS: Weapons.WeaponConfig[] = [
  // MELEE
  // {
  //     name: 'weapon_dagger',
  //     durabilityDecreasePerShot: 0.01,
  // },
  {
    name: 'weapon_bat',
    durabilityDecreasePerShot: 0.2,
    isMelee: true,
  },
  // {
  //     name: 'weapon_bottle',
  //     durabilityDecreasePerShot: 0.01,
  // },
  {
    name: 'weapon_crowbar',
    durabilityDecreasePerShot: 0.2,
    damageModifier: 0.4,
    isMelee: true,
  },
  {
    name: 'weapon_unarmed',
    durabilityDecreasePerShot: 0.0,
    damageModifier: 0.9,
    isMelee: true,
  },
  {
    name: 'weapon_flashlight',
    durabilityDecreasePerShot: 0.2,
    isMelee: true,
  },
  {
    name: 'weapon_golfclub',
    durabilityDecreasePerShot: 0.2,
    damageModifier: 0.42,
    isMelee: true,
  },
  // {
  //     name: 'weapon_hammer',
  //     durabilityDecreasePerShot: 0.01,
  // },
  {
    name: 'weapon_hatchet',
    durabilityDecreasePerShot: 0.2,
    damageModifier: 0.58,
    isMelee: true,
  },
  {
    name: 'weapon_knuckle',
    durabilityDecreasePerShot: 0.2,
    noHolstering: true,
    damageModifier: 0.42,
    isMelee: true,
  },
  {
    name: 'weapon_knife',
    durabilityDecreasePerShot: 0.2,
    damageModifier: 0.58,
    isMelee: true,
  },
  {
    name: 'weapon_machete',
    durabilityDecreasePerShot: 0.2,
    damageModifier: 0.58,
    isMelee: true,
  },
  {
    name: 'weapon_switchblade',
    durabilityDecreasePerShot: 0.2,
    noHolstering: true,
    damageModifier: 0.58,
    isMelee: true,
  },
  {
    name: 'weapon_nightstick',
    durabilityDecreasePerShot: 0.2,
    damageModifier: 0.58,
    isMelee: true,
  },
  {
    name: 'weapon_wrench',
    durabilityDecreasePerShot: 0.2,
    damageModifier: 0.42,
    isMelee: true,
  },
  // {
  //     name: 'weapon_battleaxe',
  //     durabilityDecreasePerShot: 0.01,
  // },
  {
    name: 'weapon_poolcue',
    durabilityDecreasePerShot: 0.2,
    damageModifier: 0.42,
    isMelee: true,
  },
  // {
  //     name: 'weapon_stone_hatchet',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // PISTOLS
  {
    name: 'weapon_pistol',
    durabilityDecreasePerShot: 0.1,
    attachments: {
      // pistol_suppressor: 'COMPONENT_AT_PI_SUPP_02',
      // 'pistol_extendedclip': 'COMPONENT_PISTOL_CLIP_02',
      // 'flashlight': 'COMPONENT_AT_PI_FLSH',
    },
    dispatchAlertChance: 50,
  },
  {
    name: 'weapon_pistol_mk2',
    durabilityDecreasePerShot: 0.1,
    attachments: {
      // 'pistol_extendedclip': 'COMPONENT_PISTOL_MK2_CLIP_02',
      pistol_flashlight: 'COMPONENT_AT_PI_FLSH_02',
      // 'pistol_suppressor': 'COMPONENT_AT_PI_SUPP_02',
      // 'pistol_scope': 'COMPONENT_AT_PI_RAIL',
    },
  },
  {
    name: 'weapon_combatpistol',
    durabilityDecreasePerShot: 0.1,
    attachments: {
      pistol_suppressor: 'COMPONENT_AT_PI_SUPP',
    },
    dispatchAlertChance: 50,
  },
  {
    name: 'weapon_appistol',
    durabilityDecreasePerShot: 0.05,
    attachments: {
      // 'pistol_extendedclip': 'COMPONENT_APPISTOL_CLIP_02',
      // 'flashlight': 'COMPONENT_AT_PI_FLSH',
      pistol_suppressor: 'COMPONENT_AT_PI_SUPP',
    },
    dispatchAlertChance: 25,
  },
  {
    name: 'weapon_stungun',
    durabilityDecreasePerShot: 0.01,
  },
  {
    name: 'weapon_pistol50',
    durabilityDecreasePerShot: 0.1,
    attachments: {
      // 'pistol_extendedclip': 'COMPONENT_PISTOL50_CLIP_02',
      // 'flashlight': 'COMPONENT_AT_PI_FLSH',
      pistol_suppressor: 'COMPONENT_AT_AR_SUPP_02',
      // luxuryfinish: 'COMPONENT_PISTOL50_VARMOD_LUXE',
    },
    dispatchAlertChance: 50,
  },
  // {
  //     name: 'weapon_snspistol',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'pistol_extendedclip': 'COMPONENT_SNSPISTOL_CLIP_02',
  //         'luxuryfinish': 'COMPONENT_SNSPISTOL_VARMOD_LOWRIDER',
  //     }
  // },
  // {
  //     name: 'weapon_snspistol_mk2',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'pistol_extendedclip': 'COMPONENT_SNSPISTOL_MK2_CLIP_02',
  //         'flashlight': 'COMPONENT_AT_PI_FLSH_03',
  //         'pistol_scope': 'COMPONENT_AT_PI_RAIL_02',
  //         'pistol_suppressor': 'COMPONENT_AT_PI_SUPP_02',
  //         'luxuryfinish': 'COMPONENT_SNSPISTOL_MK2_CAMO_05_SLIDE',
  //     }
  // },
  {
    name: 'weapon_heavypistol',
    durabilityDecreasePerShot: 0.1,
    canTint: true,
    attachments: {
      // 'pistol_extendedclip': 'COMPONENT_HEAVYPISTOL_CLIP_02',
      // 'flashlight': 'COMPONENT_AT_PI_FLSH',
      pistol_suppressor: 'COMPONENT_AT_PI_SUPP',
      luxuryfinish: 'COMPONENT_HEAVYPISTOL_VARMOD_LUXE',
    },
    dispatchAlertChance: 50,
  },
  {
    name: 'weapon_vintagepistol',
    durabilityDecreasePerShot: 0.1,
    attachments: {
      // pistol_extendedclip: 'COMPONENT_VINTAGEPISTOL_CLIP_02',
      // pistol_suppressor: 'COMPONENT_AT_PI_SUPP', // TODO: Move attachment point on gun because suppressor is floating
    },
    dispatchAlertChance: 50,
  },
  // {
  //     name: 'weapon_flaregun',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_marksmanpistol',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_revolver',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'luxuryfinish': 'COMPONENT_REVOLVER_VARMOD_BOSS',
  //     }
  // },
  {
    name: 'weapon_revolver_mk2',
    durabilityDecreasePerShot: 0.2,
    // attachments: {
    //   'pistol_scope': 'COMPONENT_AT_SIGHTS',
    //   'flashlight': 'COMPONENT_AT_PI_FLSH',
    //   luxuryfinish: 'COMPONENT_REVOLVER_MK2_CAMO',
    // },
    dispatchAlertChance: 60,
  },
  // {
  //     name: 'weapon_doubleaction',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_raypistol',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_ceramicpistol',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'pistol_extendedclip': 'COMPONENT_CERAMICPISTOL_CLIP_02',
  //         'pistol_suppressor': 'COMPONENT_CERAMICPISTOL_SUPP',
  //     }
  // },
  // {
  //     name: 'weapon_navyrevolver',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // SMGS
  {
    name: 'weapon_microsmg',
    durabilityDecreasePerShot: 0.05,
    attachments: {
      smg_extendedclip: 'COMPONENT_MICROSMG_CLIP_02',
      // 'flashlight': 'COMPONENT_AT_PI_FLSH',
      // 'smg_scope': 'COMPONENT_AT_scope_MACRO',
      // 'smg_suppressor': 'COMPONENT_AT_AR_SUPP_02',
      // 'luxuryfinish': 'COMPONENT_MICROSMG_VARMOD_LUXE',
    },
    dispatchAlertChance: 25,
    blockInVehicle: true,
  },
  {
    name: 'weapon_smg',
    durabilityDecreasePerShot: 0.05,
    canTint: true,
    attachments: {
      smg_extendedclip: 'COMPONENT_SMG_CLIP_02',
      // 'smg_drum': 'COMPONENT_SMG_CLIP_03',
      // 'flashlight': 'COMPONENT_AT_AR_FLSH',
      // 'smg_scope': 'COMPONENT_AT_scope_MACRO_02',
      // 'smg_suppressor': 'COMPONENT_AT_PI_SUPP',
      // 'luxuryfinish': 'COMPONENT_SMG_VARMOD_LUXE',
    },
  },
  // {
  //     name: 'weapon_smg_mk2',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'smg_extendedclip': 'COMPONENT_SMG_MK2_CLIP_02',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'smg_scope': 'COMPONENT_AT_SCOPE_SMALL_SMG_MK2',
  //         'smg_suppressor': 'COMPONENT_AT_PI_SUPP',
  //         'luxuryfinish': 'COMPONENT_SMG_MK2_CAMO_09',
  //     }
  // },
  {
    name: 'weapon_assaultsmg',
    durabilityDecreasePerShot: 0.05,
    // attachments: {
    //   'smg_extendedclip': 'COMPONENT_ASSAULTSMG_CLIP_02',
    //   'flashlight': 'COMPONENT_AT_AR_FLSH',
    //   'smg_scope': 'COMPONENT_AT_scope_MACRO',
    //   'smg_suppressor': 'COMPONENT_AT_AR_SUPP_02',
    //   'luxuryfinish': 'COMPONENT_ASSAULTSMG_VARMOD_LOWRIDER',
    // },
    dispatchAlertChance: 25,
  },
  // {
  //     name: 'weapon_combatpdw',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'smg_extendedclip': 'COMPONENT_COMBATPDW_CLIP_02',
  //         'smg_drum': 'COMPONENT_COMBATPDW_CLIP_03',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'smg_scope': 'COMPONENT_AT_scope_SMALL',
  //     }
  // },
  {
    name: 'weapon_machinepistol',
    durabilityDecreasePerShot: 0.05,
    attachments: {
      smg_extendedclip: 'COMPONENT_MACHINEPISTOL_CLIP_02',
      // 'smg_drum': 'COMPONENT_MACHINEPISTOL_CLIP_03',
      // 'smg_suppressor': 'COMPONENT_AT_PI_SUPP',
    },
    dispatchAlertChance: 25,
  },
  // {
  //     name: 'weapon_minismg',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'smg_extendedclip': 'COMPONENT_MINISMG_CLIP_02',
  //     }
  // },
  // {
  //     name: 'weapon_raycarbine',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // SHOTGUNS
  {
    name: 'weapon_pumpshotgun',
    durabilityDecreasePerShot: 0.1,
    canTint: true,
    // attachments: {
    //   'flashlight': 'COMPONENT_AT_AR_FLSH',
    //   'shotgun_suppressor': 'COMPONENT_AT_SR_SUPP',
    //   'luxuryfinish': 'COMPONENT_PUMPSHOTGUN_VARMOD_LOWRIDER',
    // },
  },
  // {
  //     name: 'weapon_pumpshotgun_mk2',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'shotgun_scope': 'COMPONENT_AT_SCOPE_MACRO_MK2',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'shotgun_suppressor': 'COMPONENT_AT_SR_SUPP_03',
  //         'luxuryfinish': 'COMPONENT_PUMPSHOTGUN_MK2_CAMO_04',
  //     }
  // },
  // {
  //     name: 'weapon_sawnoffshotgun',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'luxuryfinish': 'COMPONENT_SAWNOFFSHOTGUN_VARMOD_LUXE',
  //     }
  // },
  // {
  //     name: 'weapon_assaultshotgun',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'shotgun_extendedclip': 'COMPONENT_ASSAULTSHOTGUN_CLIP_02',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'shotgun_suppressor': 'COMPONENT_AT_AR_SUPP',
  //     }
  // },
  // {
  //     name: 'weapon_bullpupshotgun',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'shotgun_suppressor': 'COMPONENT_AT_AR_SUPP_02',
  //     }
  // },
  // {
  //     name: 'weapon_musket',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_heavyshotgun',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'shotgun_extendedclip': 'COMPONENT_HEAVYSHOTGUN_CLIP_02',
  //         'shotgun_drum': 'COMPONENT_HEAVYSHOTGUN_CLIP_03',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'shotgun_suppressor': 'COMPONENT_AT_AR_SUPP_02',
  //     }
  // },
  // {
  //     name: 'weapon_dbshotgun',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_autoshotgun',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_combatshotgun',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'shotgun_suppressor': 'COMPONENT_AT_AR_SUPP',
  //     }
  // },
  // RIFLES
  {
    name: 'weapon_assaultrifle',
    durabilityDecreasePerShot: 0.05,
    canTint: true,
    // attachments: {
    //   'rifle_extendedclip': 'COMPONENT_ASSAULTRIFLE_CLIP_02',
    //   'rifle_drum': 'COMPONENT_ASSAULTRIFLE_CLIP_03',
    //   'flashlight': 'COMPONENT_AT_AR_FLSH',
    //   'rifle_suppressor': 'COMPONENT_AT_AR_SUPP_02',
    // },
    dispatchAlertChance: 25,
  },
  // {
  //     name: 'weapon_assaultrifle_mk2',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'rifle_extendedclip': 'COMPONENT_ASSAULTRIFLE_MK2_CLIP_02',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'rifle_scope': 'COMPONENT_AT_SIGHTS',
  //         'rifle_suppressor': 'COMPONENT_AT_AR_SUPP_02',
  //         'luxuryfinish': 'COMPONENT_ASSAULTRIFLE_MK2_CAMO_02',
  //     }
  // },
  {
    name: 'weapon_carbinerifle',
    durabilityDecreasePerShot: 0.05,
  },
  // '{
  //     name: 'weapon_carbinerifle_mk2',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'rifle_extendedclip': 'COMPONENT_CARBINERIFLE_MK2_CLIP_02',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'rifle_scope': 'COMPONENT_AT_SIGHTS',
  //         'rifle_suppressor': 'COMPONENT_AT_AR_SUPP',
  //         'luxuryfinish': 'COMPONENT_CARBINERIFLE_MK2_CAMO_04',
  //     }
  // },
  {
    name: 'weapon_advancedrifle',
    durabilityDecreasePerShot: 0.05,
    // attachments: {
    //   'rifle_extendedclip': 'COMPONENT_ADVANCEDRIFLE_CLIP_02',
    //   'flashlight': 'COMPONENT_AT_AR_FLSH',
    //   'rifle_scope': 'COMPONENT_AT_SCOPE_SMALL',
    //   'rifle_suppressor': 'COMPONENT_AT_AR_SUPP',
    //   'luxuryfinish': 'COMPONENT_ADVANCEDRIFLE_VARMOD_LUXE',
    // },
    dispatchAlertChance: 25,
  },
  {
    name: 'weapon_specialcarbine',
    durabilityDecreasePerShot: 0.05,
  },
  // {
  //     name: 'weapon_specialcarbine_mk2',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'rifle_extendedclip': 'COMPONENT_SPECIALCARBINE_MK2_CLIP_02',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'rifle_scope': 'COMPONENT_AT_scope_MACRO_MK2',
  //         'rifle_suppressor': 'COMPONENT_AT_AR_SUPP_02',
  //         'luxuryfinish': 'COMPONENT_SPECIALCARBINE_MK2_CAMO_06',
  //     }
  // },
  // {
  //     name: 'weapon_bullpuprifle',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'rifle_extendedclip': 'COMPONENT_BULLPUPRIFLE_CLIP_02',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'rifle_scope': 'COMPONENT_AT_SCOPE_SMALL',
  //         'rifle_suppressor': 'COMPONENT_AT_AR_SUPP',
  //         'luxuryfinish': 'COMPONENT_BULLPUPRIFLE_VARMOD_LOW',
  //     }
  // },
  // {
  //     name: 'weapon_bullpuprifle_mk2',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'rifle_extendedclip': 'COMPONENT_BULLPUPRIFLE_MK2_CLIP_02',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'rifle_scope': 'COMPONENT_AT_SCOPE_MACRO_02_MK2',
  //         'rifle_suppressor': 'COMPONENT_AT_AR_SUPP',
  //         'luxuryfinish': 'COMPONENT_BULLPUPRIFLE_MK2_CAMO_02',
  //     }
  // },
  // {
  //     name: 'weapon_compactrifle',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'rifle_extendedclip': 'COMPONENT_COMPACTRIFLE_CLIP_02',
  //         'rifle_drum': 'COMPONENT_COMPACTRIFLE_CLIP_03',
  //     }
  // },
  // '{
  //     name: 'weapon_militaryrifle',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'rifle_extendedclip': 'COMPONENT_MILITARYRIFLE_CLIP_02',
  //         'rifle_scope': 'COMPONENT_AT_SCOPE_SMALL',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'rifle_suppressor': 'COMPONENT_AT_AR_SUPP',
  //     }
  // },
  // MACHINE GUNS
  // {
  //     name: 'weapon_mg',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'mg_extendedclip': 'COMPONENT_MG_CLIP_02',
  //         'mg_scope': 'COMPONENT_AT_SCOPE_SMALL_02',
  //         'luxuryfinish': 'COMPONENT_MG_VARMOD_LOWRIDER',
  //     }
  // },
  // {
  //     name: 'weapon_combatmg',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'mg_extendedclip': 'COMPONENT_COMBATMG_CLIP_02',
  //         'mg_scope': 'COMPONENT_AT_SCOPE_MEDIUM',
  //         'luxuryfinish': 'COMPONENT_COMBATMG_VARMOD_LOWRIDER',
  //     }
  // },
  // {
  //     name: 'weapon_combatmg_mk2',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'mg_extendedclip': 'COMPONENT_COMBATMG_MK2_CLIP_02',
  //         'mg_scope': 'COMPONENT_AT_SIGHTS',
  //         'luxuryfinish': 'COMPONENT_COMBATMG_MK2_CAMO_07',
  //     }
  // },
  // {
  //     name: 'weapon_gusenberg',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // SNIPERS
  {
    name: 'weapon_sniperrifle',
    durabilityDecreasePerShot: 0.1,
    useNativeReticle: true,
    attachments: {
      // 'sniper_suppressor': 'COMPONENT_AT_AR_SUPP_02',
      // 'sniper_scope': 'COMPONENT_AT_SCOPE_MAX',
      // 'luxuryfinish': 'COMPONENT_SNIPERRIFLE_VARMOD_LUXE',
    },
  },
  // {
  //     name: 'weapon_heavysniper',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'sniper_scope': 'COMPONENT_AT_SCOPE_MAX',
  //     }
  // },
  // {
  //     name: 'weapon_heavysniper_mk2',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'sniper_extendedclip': 'COMPONENT_HEAVYSNIPER_MK2_CLIP_02',
  //         'sniper_scope': 'COMPONENT_AT_SCOPE_LARGE_MK2',
  //         'sniper_suppressor': 'COMPONENT_AT_SR_SUPP_03',
  //         'luxuryfinish': 'COMPONENT_HEAVYSNIPER_MK2_CAMO_03',
  //     }
  // },
  // '{
  //     name: 'weapon_marksmanrifle',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'sniper_extendedclip': 'COMPONENT_MARKSMANRIFLE_CLIP_02',
  //         'sniper_scope': 'COMPONENT_AT_SCOPE_LARGE_FIXED_ZOOM',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'sniper_suppressor': 'COMPONENT_AT_AR_SUPP',
  //         'luxuryfinish': 'COMPONENT_MARKSMANRIFLE_VARMOD_LUXE',
  //     }
  // },
  // {
  //     name: 'weapon_marksmanrifle_mk2',
  //     durabilityDecreasePerShot: 0.01,
  //     attachments: {
  //         'sniper_extendedclip': 'COMPONENT_MARKSMANRIFLE_MK2_CLIP_02',
  //         'sniper_scope': 'COMPONENT_AT_SCOPE_LARGE_FIXED_ZOOM_MK2',
  //         'flashlight': 'COMPONENT_AT_AR_FLSH',
  //         'sniper_suppressor': 'COMPONENT_AT_AR_SUPP',
  //         'luxuryfinish': 'COMPONENT_MARKSMANRIFLE_MK2_CAMO_09',
  //     }
  // },
  // HEAVY
  {
    name: 'weapon_rpg',
    durabilityDecreasePerShot: 1,
  },
  // {
  //     name: 'weapon_grenadelauncher',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_grenadelauncher_smoke',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_minigun',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_firework',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_railgun',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_hominglauncher',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // {
  //     name: 'weapon_compactlauncher',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // '{
  //     name: 'weapon_rayminigun',
  //     durabilityDecreasePerShot: 0.01,
  // },
  // THROWABLES
  {
    name: 'weapon_grenade',
    durabilityDecreasePerShot: 0.01,
    oneTimeUse: true,
  },
  // {
  //     name: 'weapon_bzgas',
  //     durabilityDecreasePerShot: 0.01,
  //     oneTimeUse: true,
  // },
  // '{
  //     name: 'weapon_smokegrenade',
  //     durabilityDecreasePerShot: 0.01,
  //     oneTimeUse: true,
  // },
  {
    name: 'weapon_flare',
    durabilityDecreasePerShot: 0.01,
    oneTimeUse: true,
  },
  // {
  //     name: 'weapon_molotov',
  //     durabilityDecreasePerShot: 0.01,
  //     oneTimeUse: true,
  // },
  // {
  //     name: 'weapon_stickybomb',
  //     durabilityDecreasePerShot: 0.01,
  //     oneTimeUse: true,
  // },
  // {
  //     name: 'weapon_proxmine',
  //     durabilityDecreasePerShot: 0.01,
  //     oneTimeUse: true,
  // },
  {
    name: 'weapon_snowball',
    durabilityDecreasePerShot: 0.01,
    oneTimeUse: true,
  },
  {
    name: 'weapon_pipebomb',
    durabilityDecreasePerShot: 0.01,
    oneTimeUse: true,
  },
  // {
  //     name: 'weapon_ball',
  //     durabilityDecreasePerShot: 0.01,
  //     oneTimeUse: true,
  // },
  // MISC
  {
    name: 'weapon_petrolcan',
    durabilityDecreasePerShot: 0.01,
    unlimitedAmmo: true,
    noHolstering: true,
  },
  {
    name: 'weapon_fireextinguisher',
    durabilityDecreasePerShot: 0.01,
    unlimitedAmmo: true,
    noHolstering: true,
  },
  // {
  //     name: 'weapon_hazardcan',
  //     durabilityDecreasePerShot: 0.01,
  //     unlimitedAmmo: true,
  //     noHolstering: true,
  // },
];

export const DEFAULT_SHARED_WEAPON_CONFIG: Weapons.SharedWeaponConfig = {
  noHolstering: false,
  canTint: false,
  oneTimeUse: false,
  useNativeReticle: false,
  damageModifier: 1,
  isMelee: false,
  dispatchAlertChance: 0,
  blockInVehicle: false,
};
