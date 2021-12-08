Config = Config or {}

Config.ReloadTime = 5 * 1000 -- In ms
Config.ReloadAmount = 50 -- Aantal kogels die elke keer worden bijgeladen
Config.RepairCost = 5000 -- Prijs voor wapen te repairen

-- Wapens die verwijderd worden uit inv na gebruik
Config.OneTimeWeapons = {
    "weapon_snowball",
    "weapon_pipebomb",
    "weapon_molotov",
    "weapon_stickybomb",
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

Config.Recoils = {
	[453432689] = 0.3, -- PISTOL
	[3219281620] = 0.5, -- PISTOL MK2
	[1593441988] = 0.2, -- COMBAT PISTOL
	[584646201] = 0.3, -- AP PISTOL
	[-1716589765] = 0.6, -- PISTOL .50
	[324215364] = 0.5, -- MICRO SMG
	[736523883] = 0.4, -- SMG
	[2024373456] = 0.1, -- SMG MK2
	[-270015777] = 0.1, -- ASSAULT SMG
	[-1074790547] = 0.5, -- ASSAULT RIFLE
	[961495388] = 0.2, -- ASSAULT RIFLE MK2
	[-2084633992] = 0.3, -- CARBINE RIFLE
	[4208062921] = 0.1, -- CARBINE RIFLE MK2
	[-1357824103] = 0.1, -- ADVANCED RIFLE
	[-1660422300] = 0.1, -- MG
	[2144741730] = 0.1, -- COMBAT MG
	[3686625920] = 0.1, -- COMBAT MG MK2
	[487013001] = 0.4, -- PUMP SHOTGUN
	[1432025498] = 0.35, -- PUMP SHOTGUN MK2
	[2017895192] = 0.7, -- SAWNOFF SHOTGUN
	[-494615257] = 0.4, -- ASSAULT SHOTGUN
	[-1654528753] = 0.2, -- BULLPUP SHOTGUN
	[911657153] = 0.1, -- STUN GUN
	[100416529] = 0.5, -- SNIPER RIFLE
	[205991906] = 0.7, -- HEAVY SNIPER
	[177293209] = 0.6, -- HEAVY SNIPER MK2
	[856002082] = 1.2, -- REMOTE SNIPER
	[-1568386805] = 1.0, -- GRENADE LAUNCHER
	[1305664598] = 1.0, -- GRENADE LAUNCHER SMOKE
	[-1312131151] = 0.0, -- RPG
	[1752584910] = 0.0, -- STINGER
	[1119849093] = 0.01, -- MINIGUN
	[-1076751822] = 0.2, -- SNS PISTOL
	[1627465347] = 0.1, -- GUSENBERG
	[-1063057011] = 0.2, -- SPECIAL CARBINE
	[-1768145561] = 0.15, -- SPECIAL CARBINE MK2
	[-771403250] = 0.5, -- HEAVY PISTOL
	[2132975508] = 0.2, -- BULLPUP RIFLE
	[-2066285827] = 0.15, -- BULLPUP RIFLE MK2
	[137902532] = 0.4, -- VINTAGE PISTOL
	[-1466123874] = 0.7, -- MUSKET
	[984333226] = 0.2, -- HEAVY SHOTGUN
	[-952879014] = 0.3, -- MARKSMAN RIFLE
	[1785463520] = 0.25, -- MARKSMAN RIFLE MK2
	[1672152130] = 0, -- HOMING LAUNCHER
	[1198879012] = 0.9, -- FLARE GUN
	[171789620] = 0.2, -- COMBAT PDW
	[-598887786] = 0.9, -- MARKSMAN PISTOL
	[1834241177] = 2.4, -- RAILGUN
	[-619010992] = 0.3, -- MACHINE PISTOL
	[-1045183535] = 0.6, -- REVOLVER
	[-879347409] = 0.6, -- REVOLVER MK2
	[-275439685] = 0.7, -- DOUBLE BARREL SHOTGUN
	[1649403952] = 0.3, -- COMPACT RIFLE
	[317205821] = 0.2, -- AUTO SHOTGUN
	[125959754] = 0.5, -- COMPACT LAUNCHER
	[-1121678507] = 0.1, -- MINI SMG		
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
