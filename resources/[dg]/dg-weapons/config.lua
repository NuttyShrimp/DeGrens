Config = Config or {}

Config.ReloadTime = 5 * 1000 -- In ms
Config.ReloadAmount = 50 -- Aantal kogels die elke keer worden bijgeladen
Config.RepairCost = 10000 -- Prijs voor wapen te repairen

-- Wapens die verwijderd worden uit inv na gebruik
Config.OneTimeWeapons = {
    "weapon_snowball",
    "weapon_pipebomb",
    "weapon_molotov",
    "weapon_stickybomb",
    "weapon_grenade",
}

-- Wapens die niet geholstered moeten worden
Config.NoHolsterWeapons = {
    "weapon_snowball",
    "weapon_knuckle",
}

-- Wapens die geen last hebben van durability
Config.DurabilityBlockedWeapons = {
    "weapon_unarmed",
}

-- Wapens die sneller of trager moeten kapotgaan
Config.DurabilityMultiplier = {
    ["weapon_hazardcan"] = 0.10,
}

Config.Recoil = {
	[`weapon_pistol`] = {vertical = 0.6, explosion = 0.02},
	[`weapon_pistol_mk2`] = {vertical = 0.9, explosion = 0.02},
	[`weapon_combatpistol`] = {vertical = 0.5, explosion = 0.02},
	[`weapon_appistol`] = {vertical = 0.8, explosion = 0.02},
	[`weapon_pistol50`] = {vertical = 2.0, explosion = 0.03},
	[`weapon_microsmg`] = {vertical = 0.6, explosion = 0.03},
	[`weapon_smg`] = {vertical = 0.7, explosion = 0.04},
	[`weapon_smg_mk2`] = {vertical = 0.8, explosion = 0.03},
	[`weapon_assaultsmg`] = {vertical = 0.1, explosion = 0.02},
	[`weapon_assaultrifle`] = {vertical = 0.5, explosion = 0.02},
	[`weapon_assaultrifle_mk2`] = {vertical = 0.2, explosion = 0.02},
	[`weapon_carbinerifle`] = {vertical = 0.3, explosion = 0.02},
	[`weapon_carbinerifle_mk2`] = {vertical = 0.1, explosion = 0.02},
	[`weapon_advancedrifle`] = {vertical = 0.1, explosion = 0.02},
	[`weapon_mg`] = {vertical = 0.1, explosion = 0.02},
	[`weapon_combatmg`] = {vertical = 0.1, explosion = 0.02},
	[`weapon_combatmg_mk2`] = {vertical = 0.1, explosion = 0.02},
	[`weapon_pumpshotgun`] = {vertical = 0.4, explosion = 0.02},
	[`weapon_pumpshotgun_mk2`] = {vertical = 0.35, explosion = 0.02},
	[`weapon_sawnoffshotgun`] = {vertical = 0.7, explosion = 0.02},
	[`weapon_assaultshotgun`] = {vertical = 0.4, explosion = 0.02},
	[`weapon_bullpupshotgun`] = {vertical = 0.2, explosion = 0.02},
	[`weapon_stungun`] = {vertical = 0.1, explosion = 0.02},
	[`weapon_sniperrifle`] = {vertical = 0.5, explosion = 0.02},
	[`weapon_heavysniper`] = {vertical = 0.7, explosion = 0.02},
	[`weapon_heavysniper_mk2`] = {vertical = 0.6, explosion = 0.02},
	[`weapon_remotesniper`] = {vertical = 1.2, explosion = 0.02},
	[`weapon_grenadelauncher`] = {vertical = 1.0, explosion = 0.02},
	[`weapon_grenadelauncher_smoke`] = {vertical = 1.0, explosion = 0.02},
	[`weapon_rpg`] = {vertical = 0.0, explosion = 0.02},
	[`weapon_hominglauncher`] = {vertical = 0.0, explosion = 0.02},
	[`weapon_minigun`] = {vertical = 0.01, explosion = 0.02},
	[`weapon_snspistol`] = {vertical = 0.2, explosion = 0.02},
	[`weapon_gusenberg`] = {vertical = 0.1, explosion = 0.02},
	[`weapon_specialcarbine`] = {vertical = 0.2, explosion = 0.02},
	[`weapon_specialcarbine_mk2`] = {vertical = 0.15, explosion = 0.02},
	[`weapon_heavypistol`] = {vertical = 0.5, explosion = 0.02},
	[`weapon_bullpuprifle`] = {vertical = 0.2, explosion = 0.02},
	[`weapon_bullpuprifle_mk2`] = {vertical = 0.15, explosion = 0.02},
	[`weapon_vintagepistol`] = {vertical = 0.4, explosion = 0.02},
	[`weapon_musket`] = {vertical = 0.7, explosion = 0.02},
	[`weapon_heavyshotgun`] = {vertical = 0.2, explosion = 0.02},
	[`weapon_marksmanrifle`] = {vertical = 0.3, explosion = 0.02},
	[`weapon_marksmanrifle_mk2`] = {vertical = 0.25, explosion = 0.02},
	[`weapon_flare`] = {vertical = 0.9, explosion = 0.02},
	[`weapon_combatpdw`] = {vertical = 0.2, explosion = 0.02},
	[`weapon_railgun`] = {vertical = 2.4, explosion = 0.02},
	[`weapon_machinepistol`] = {vertical = 0.3, explosion = 0.02},
	[`weapon_revolver`] = {vertical = 0.6, explosion = 0.02},
	[`weapon_doubleaction`] = {vertical = 0.6, explosion = 0.02},
    [`weapon_navyrevolver`] = {vertical = 0.6, explosion = 0.02},
	[`weapon_dbshotgun`] = {vertical = 0.7, explosion = 0.02},
	[`weapon_compactrifle`] = {vertical = 0.3, explosion = 0.02},
	[`weapon_autoshotgun`] = {vertical = 0.2, explosion = 0.02},
	[`weapon_compactlauncher`] = {vertical = 0.5, explosion = 0.02},
	[`weapon_minismg`] = {vertical = 0.1, explosion = 0.02},		
}

WeaponAttachments = {
    -- PISTOLS
    ["WEAPON_PISTOL"] = {
        ["extendedclip"] = {
            component = "COMPONENT_PISTOL_CLIP_02",
            label = "Extended Clip",
            item = "pistol_extendedclip",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_PI_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_PI_SUPP_02",
            label = "Suppressor",
            item = "pistol_suppressor",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_PISTOL_VARMOD_LUXE",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },
    },
    ["WEAPON_COMBATPISTOL"] = {
        ["extendedclip"] = {
            component = "COMPONENT_COMBATPISTOL_CLIP_02",
            label = "Extended Clip",
            item = "pistol_extendedclip",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_PI_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_PI_SUPP",
            label = "Suppressor",
            item = "pistol_suppressor",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_COMBATPISTOL_VARMOD_LOWRIDER",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                                                     
    },
    ["WEAPON_APPISTOL"] = {
        ["extendedclip"] = {
            component = "COMPONENT_APPISTOL_CLIP_02",
            label = "Extended Clip",
            item = "pistol_extendedclip",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_PI_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_PI_SUPP",
            label = "Suppressor",
            item = "pistol_suppressor",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_APPISTOL_VARMOD_LUXE",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                                                     
    },
    ["WEAPON_PISTOL50"] = {
        ["extendedclip"] = {
            component = "COMPONENT_PISTOL50_CLIP_02",
            label = "Extended Clip",
            item = "pistol_extendedclip",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_PI_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP_02",
            label = "Suppressor",
            item = "pistol_suppressor",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_PISTOL50_VARMOD_LUXE",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                                             
    },
    ["WEAPON_REVOLVER"] = {
        ["luxuryfinish"] = {
            component = "COMPONENT_REVOLVER_VARMOD_GOON",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },
        ["grip"] = {
            component = "COMPONENT_REVOLVER_VARMOD_BOSS",
            label = "Grip",
            item = "grip",
        },                                            
    },
    ["WEAPON_SNSPISTOL"] = {
        ["extendedclip"] = {
            component = "COMPONENT_SNSPISTOL_CLIP_02",
            label = "Extended Clip",
            item = "pistol_extendedclip",
        },                                     
    },
    ["WEAPON_HEAVYPISTOL"] = {
        ["extendedclip"] = {
            component = "COMPONENT_HEAVYPISTOL_CLIP_02",
            label = "Extended Clip",
            item = "pistol_extendedclip",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_PI_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_PI_SUPP",
            label = "Suppressor",
            item = "pistol_suppressor",
        },
        ["grip"] = {
            component = "COMPONENT_HEAVYPISTOL_VARMOD_LUXE",
            label = "Grip",
            item = "grip",
        },                                             
    },
    ["WEAPON_VINTAGEPISTOL"] = {
        ["extendedclip"] = {
            component = "COMPONENT_VINTAGEPISTOL_CLIP_02",
            label = "Extended Clip",
            item = "pistol_extendedclip",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_PI_SUPP",
            label = "Suppressor",
            item = "pistol_suppressor",
        },                                           
    },
    -- SMG"S
    ["WEAPON_MICROSMG"] = {
        ["extendedclip"] = {
            component = "COMPONENT_MICROSMG_CLIP_02",
            label = "Extended Clip",
            item = "smg_extendedclip",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_PI_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_MACRO",
            label = "Scope",
            item = "smg_scope",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP_02",
            label = "Suppressor",
            item = "smg_suppressor",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_MICROSMG_VARMOD_LUXE",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                                             
    },
    ["WEAPON_SMG"] = {
        ["extendedclip"] = {
            component = "COMPONENT_SMG_CLIP_02",
            label = "Extended Clip",
            item = "smg_extendedclip",
        },
        ["drum"] = {
            component = "COMPONENT_SMG_CLIP_03",
            label = "Drum Magazine",
            item = "smg_drum",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_MACRO_02",
            label = "Scope",
            item = "smg_scope",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_PI_SUPP",
            label = "Suppressor",
            item = "smg_suppressor",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_SMG_VARMOD_LUXE",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                                             
    },
    ["WEAPON_ASSAULTSMG"] = {
        ["extendedclip"] = {
            component = "COMPONENT_ASSAULTSMG_CLIP_02",
            label = "Extended Clip",
            item = "smg_extendedclip",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_MACRO",
            label = "Scope",
            item = "smg_scope",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP_02",
            label = "Suppressor",
            item = "smg_suppressor",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_ASSAULTSMG_VARMOD_LOWRIDER",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                                             
    },
    ["WEAPON_MINISMG"] = {
        ["extendedclip"] = {
            component = "COMPONENT_MINISMG_CLIP_02",
            label = "Extended Clip",
            item = "smg_extendedclip",
        },
    },
    ["WEAPON_MACHINEPISTOL"] = {
        ["extendedclip"] = {
            component = "COMPONENT_MACHINEPISTOL_CLIP_02",
            label = "Extended Clip",
            item = "smg_extendedclip",
        },
        ["drum"] = {
            component = "COMPONENT_MACHINEPISTOL_CLIP_03",
            label = "Drum Magazine",
            item = "smg_drum",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_PI_SUPP",
            label = "Suppressor",
            item = "smg_suppressor",
        },                                            
    },
    ["WEAPON_COMBATPDW"] = {
        ["extendedclip"] = {
            component = "COMPONENT_COMBATPDW_CLIP_02",
            label = "Extended Clip",
            item = "smg_extendedclip",
        },
        ["drum"] = {
            component = "COMPONENT_COMBATPDW_CLIP_03",
            label = "Drum Magazine",
            item = "smg_drum",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["grip"] = {
            component = "COMPONENT_AT_AR_AFGRIP",
            label = "Grip",
            item = "grip",
        },
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_SMALL",
            label = "Scope",
            item = "smg_scope",
        },                                            
    },
    -- SHOTGUNS
    ["WEAPON_PUMPSHOTGUN"] = {
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_SR_SUPP",
            label = "Suppressor",
            item = "shotgun_suppressor",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_PUMPSHOTGUN_VARMOD_LOWRIDER",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                                            
    },
    ["WEAPON_SAWNOFFSHOTGUN"] = {
        ["luxuryfinish"] = {
            component = "COMPONENT_SAWNOFFSHOTGUN_VARMOD_LUXE",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                                            
    },
    ["WEAPON_ASSAULTSHOTGUN"] = {
        ["extendedclip"] = {
            component = "COMPONENT_ASSAULTSHOTGUN_CLIP_02",
            label = "Extended Clip",
            item = "shotgun_extendedclip",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP",
            label = "Suppressor",
            item = "shotgun_suppressor",
        },
        ["grip"] = {
            component = "COMPONENT_AT_AR_AFGRIP",
            label = "Grip",
            item = "grip",
        },                                   
    },
    ["WEAPON_BULLPUPSHOTGUN"] = {
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP_02",
            label = "Suppressor",
            item = "shotgun_suppressor",
        },
        ["grip"] = {
            component = "COMPONENT_AT_AR_AFGRIP",
            label = "Grip",
            item = "grip",
        },                                   
    },
    ["WEAPON_HEAVYSHOTGUN"] = {
        ["extendedclip"] = {
            component = "COMPONENT_HEAVYSHOTGUN_CLIP_02",
            label = "Extended Clip",
            item = "shotgun_extendedclip",
        },
        ["drum"] = {
            component = "COMPONENT_HEAVYSHOTGUN_CLIP_03",
            label = "Drum Magazine",
            item = "shotgun_drum",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP_02",
            label = "Suppressor",
            item = "shotgun_suppressor",
        },
        ["grip"] = {
            component = "COMPONENT_AT_AR_AFGRIP",
            label = "Grip",
            item = "grip",
        },                                    
    },
    ["WEAPON_COMBATSHOTGUN"] = {
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP",
            label = "Suppressor",
            item = "shotgun_suppressor",
        },                                  
    },
    -- RIFLES
    ["WEAPON_ASSAULTRIFLE"] = {
        ["extendedclip"] = {
            component = "COMPONENT_ASSAULTRIFLE_CLIP_02",
            label = "Extended Clip",
            item = "rifle_extendedclip",
        },
        ["drum"] = {
            component = "COMPONENT_ASSAULTRIFLE_CLIP_03",
            label = "Drum Magazine",
            item = "rifle_drum",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_MACRO",
            label = "Scope",
            item = "rifle_scope",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP_02",
            label = "Suppressor",
            item = "rifle_suppressor",
        },
        ["grip"] = {
            component = "COMPONENT_AT_AR_AFGRIP",
            label = "Grip",
            item = "grip",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_ASSAULTRIFLE_VARMOD_LUXE",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                              
    },
    ["WEAPON_CARBINERIFLE"] = {
        ["extendedclip"] = {
            component = "COMPONENT_CARBINERIFLE_CLIP_02",
            label = "Extended Clip",
            item = "rifle_extendedclipp",
        },
        ["drum"] = {
            component = "COMPONENT_CARBINERIFLE_CLIP_03",
            label = "Drum Magazine",
            item = "rifle_drum",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_MEDIUM",
            label = "Scope",
            item = "rifle_scope",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP",
            label = "Suppressor",
            item = "rifle_suppressor",
        },
        ["grip"] = {
            component = "COMPONENT_AT_AR_AFGRIP",
            label = "Grip",
            item = "grip",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_CARBINERIFLE_VARMOD_LUXE",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                              
    },
    ["WEAPON_ADVANCEDRIFLE"] = {
        ["extendedclip"] = {
            component = "COMPONENT_ADVANCEDRIFLE_CLIP_02",
            label = "Extended Clip",
            item = "rifle_extendedclip",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_SMALL",
            label = "Scope",
            item = "rifle_scope",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP",
            label = "Suppressor",
            item = "rifle_suppressor",
        },
        ["grip"] = {
            component = "COMPONENT_AT_AR_AFGRIP",
            label = "Grip",
            item = "grip",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_ADVANCEDRIFLE_VARMOD_LUXE",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                              
    },
    ["WEAPON_SPECIALCARBINE"] = {
        ["extendedclip"] = {
            component = "COMPONENT_SPECIALCARBINE_CLIP_02",
            label = "Extended Clip",
            item = "rifle_extendedclip",
        },
        ["drum"] = {
            component = "COMPONENT_SPECIALCARBINE_CLIP_03",
            label = "Drum Magazine",
            item = "rifle_drum",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_MEDIUM",
            label = "Scope",
            item = "rifle_scope",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP_02",
            label = "Suppressor",
            item = "rifle_suppressor",
        },
        ["grip"] = {
            component = "COMPONENT_AT_AR_AFGRIP",
            label = "Grip",
            item = "grip",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_SPECIALCARBINE_VARMOD_LOWRIDER",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                              
    },
    ["WEAPON_BULLPUPRIFLE"] = {
        ["extendedclip"] = {
            component = "COMPONENT_BULLPUPRIFLE_CLIP_02",
            label = "Extended Clip",
            item = "rifle_extendedclip",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_SMALL",
            label = "Scope",
            item = "rifle_scope",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP",
            label = "Suppressor",
            item = "rifle_suppressor",
        },
        ["grip"] = {
            component = "COMPONENT_AT_AR_AFGRIP",
            label = "Grip",
            item = "grip",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_BULLPUPRIFLE_VARMOD_LOW",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                              
    },
    ["WEAPON_COMPACTRIFLE"] = {
        ["extendedclip"] = {
            component = "COMPONENT_COMPACTRIFLE_CLIP_02",
            label = "Extended Clip",
            item = "rifle_extendedclip",
        },
        ["drum"] = {
            component = "COMPONENT_COMPACTRIFLE_CLIP_03",
            label = "Drum Magazine",
            item = "rifle_drum",
        },                               
    },
    -- MACHINE GUNS
    ["WEAPON_GUSENBERG"] = {
        ["extendedclip"] = {
            component = "COMPONENT_GUSENBERG_CLIP_02",
            label = "Extended Clip",
            item = "mg_extendedclip",
        },                               
    },
    -- SNIPERS
    ["WEAPON_SNIPERRIFLE"] = {
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP_02",
            label = "Suppressor",
            item = "sniper_suppressor",
        },
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_MAX",
            label = "Scope",
            item = "sniper_scope",
        },
        ["grip"] = {
            component = "COMPONENT_SNIPERRIFLE_VARMOD_LUXE",
            label = "Grip",
            item = "grip",
        },                             
    },
    ["WEAPON_HEAVYSNIPER"] = {
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_MAX",
            label = "Scope",
            item = "sniper_scope",
        },                         
    },
    ["WEAPON_MARKSMANRIFLE"] = {
        ["extendedclip"] = {
            component = "COMPONENT_MARKSMANRIFLE_CLIP_02",
            label = "Extended Clip",
            item = "sniper_extendedclip",
        },
        ["flashlight"] = {
            component = "COMPONENT_AT_AR_FLSH",
            label = "Flashlight",
            item = "flashlight",
        },
        ["scope"] = {
            component = "COMPONENT_AT_SCOPE_LARGE_FIXED_ZOOM",
            label = "Scope",
            item = "sniper_scope",
        },
        ["suppressor"] = {
            component = "COMPONENT_AT_AR_SUPP",
            label = "Suppressor",
            item = "sniper_suppressor",
        },
        ["grip"] = {
            component = "COMPONENT_AT_AR_AFGRIP",
            label = "Grip",
            item = "grip",
        },
        ["luxuryfinish"] = {
            component = "COMPONENT_MARKSMANRIFLE_VARMOD_LUXE",
            label = "Luxury Finish",
            item = "luxuryfinish",
        },                              
    },
}

-- Do not touch!
Config.RepairData = {
    IsRepairing = false,
    IsFinished = false,
    Weapon = {},
}
