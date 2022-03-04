Config = {}

Config.RequiredPolice = 1 -- aantal politie dat nodig is
Config.ZOffset = vector3(0, 0, 45) -- hoever onder shell huis gespawned wordt
Config.MailTime = 4 * 60 * 1000 -- tijd dat mails worden verzonden (4 MIN)

-- search options
Config.Search = {}
Config.Search.Timeout = 3 * 60 * 1000 -- timeout van locaties doorzoeken
Config.Search.Duration = 15 * 1000 -- tijd dat het neemt om locatie te doorzoeken
Config.Search.SpecialItem = 'drive_v1' -- speciaal item 
Config.Search.SpecialItemChance = 20 -- speciaal item 

-- alle loot uit locations
Config.Loot ={ 
    'moneyroll',
    'camera',
    'gameboy',
    'hifi',
    'nintendoswitch',
    'nokia',
    'psp',
}

-- sell options
Config.Sell = {}
Config.Sell.Time = 7 * 1000 -- tijd dat het neemt om items te verkopen
Config.Sell.Price = { 
    ['camera'] = 400,
    ['gameboy'] = 150,
    ['hifi'] = 250,
    ['nintendoswitch'] = 250,
    ['nokia'] = 800,
    ['psp'] = 150,
    ['crttv'] = 750,
    ['tv'] = 1500,
}

-- lockpick opties
Config.Lockpick = {}
Config.Lockpick.Difficulty = "medium" -- easy, medium, hard of extreme
Config.Lockpick.Amount = 1 -- aantal keer dat je keygame moet voltooien om te lockpicken
Config.Lockpick.BreakChance = 15 -- kans dat lockpick kapot gaat bij falen

Config.GainStressChance = 50 -- kans dat je stress krijgt bij zoeken
Config.FingerdropChance = 50 -- kans dat je vingerafdrukken achterlaat bij openbreken van deur

Config.Houses = {
    {
        coords = vector3(-273.23, -934.74, 31.22),
        heading = 162,
        type = "big",
        data = {
            unlocked = false,
            searched = {},
            takeableSpawned = false,
        }
    },
    {
        coords = vector3(-278.34, -940.49, 31.22),
        heading = 207.54,
        type = "big",
        data = {
            unlocked = false,
            searched = {},
            takeableSpawned = false,
        }
    }
}

Config.Interiors = {
    ["small"] = {
        shell = `playerhouse_hotel`,
        exit = {
            offset = vector3(1.66, 3.88, 44.08),
            heading = 2.4,
        },
        lootables = {
            `Prop_TV_Cabinet_03`,
            `Prop_LD_Toilet_01`,
            `prop_iron_01`,
            `v_res_binder`,
            `v_res_j_phone`,
        },
        takeable = {
            model = `prop_tv_06`,
            item = "crttv",
        }
    },
    ["medium"] = {
        shell = `playerhouse_tier1_full`,
        exit = {
            offset = vector3(-3.71, 15.51, 42.7),
            heading = 1.85,
        },
        lootables = {
            `V_Res_Tre_BedSideTable`,
            `v_res_tre_storagebox`,
            `V_Res_Tre_SideBoard`,
            `prop_micro_01`,
            `v_res_tre_plant`,
            `v_res_tre_washbasket`,
            `Prop_Tapeplayer_01`
        },
        takeable = {
            model = `Prop_TV_Flat_01`,
            item = "tv",
        }
    },
    ["big"] = {
        shell = `micheal_shell`,
        exit = {
            offset = vector3(10.11, -2.64, 43.84),
            heading = 273.18,
        },
        lootables = {
            `v_res_tre_storagebox`,
            `prop_ld_int_safe_01`,
            `prop_toilet_01`,
            `v_res_cabinet`,
            `v_res_d_dressingtable`,
            `prop_golf_bag_01c`,
            `v_res_m_bananaplant`;
            `v_res_mcupboard`,
            `apa_mp_h_str_sideboardl_11`;
            `prop_cs_kitchen_cab_l`
        },
        takeable = {
            model = `v_med_p_vaseround`,
            item = "vaas",
        }
    }
}