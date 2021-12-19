Config = {}

Config.RequiredCops = 0 -- aantal politie nodig om te starten

-- kassa opties
Config.Registers = {}
Config.Registers.Model = `prop_till_01`
Config.Registers.Timeout = 30 * 60 * 1000 -- tijd dat het neemt tegen dat kassa gereset is
Config.Registers.RobTime = 20 * 1000 -- tijd dat het neemt om kassa leeg te halen
Config.Registers.Reward = "moneyroll" -- item dat je krijgt van kassa
Config.Registers.RewardAmount = 2 -- wordt gerandomized tussen 1 hoger en lager dus bv 2 wordt random van 1 tm 3

-- lockpick opties
Config.Lockpick = {}
Config.Lockpick.Difficulty = "easy" -- easy, medium, hard of extreme
Config.Lockpick.Amount = 3 -- aantal keer dat je keygame moet voltooien om te lockpicken
Config.Lockpick.BreakChance = 10 -- kans dat lockpick kapot gaat bij falen

-- safe options
Config.Safe = {}
Config.Safe.Item = "decoding_tool" -- item dat nodig is om te hacken
Config.Safe.Timeout = 60 * 60 * 1000 -- tijd dat het neemt tegen dat kluis is gereset
Config.Safe.LootDelay = 5 * 60 * 1000 -- tijd dat je moet wachten na mail voor kluis te looten
Config.Safe.Reward = "moneyroll" -- item dat je krijgt uit de kluis
Config.Safe.RewardAmount = 5 -- wordt gerandomized tussen 1 hoger en lager dus bv 5 wordt random van 4 tm 6
Config.Safe.SpecialItem = "drive_v1" -- speciaal item dat verkregen kan worden
Config.Safe.SpecialItemChance = 50 -- kans in percent om special item te krijgen

-- hack options
Config.Hack = {}
Config.Hack.GridSize = 2
Config.Hack.Time = 15

-- random chances in percent
Config.FingerdropChance = 50
Config.GainStressChance = 50

Config.Stores = {
    ["little_seoul"] = {
        name = "little_seoul",
        registerzone = {
            center = vector3(-706.17, -914.59, 19.22),
            width = 3,
            length = 1,
            options = {
                heading = 88.93,
                minZ = 17.21,
                maxZ = 21.21,
            }
        },
        storezone = {
            center = vector3(-711.53, -909.74, 19.22),
            width = 14,
            length = 13,
            options = {
                heading = 0.69,
                minZ = 17.21,
                maxZ = 21.21,
            }
        },
        safe = {
            coords = vector3(-709.77, -904.12, 19.22),
            state = "closed",
        },
        cam = 7,
    },
    ["grove_street"] = {
        name = "grove_street",
        registerzone = {
            center = vector3(-47.38, -1758.61, 29.42),
            width = 3,
            length = 1,
            options = {
                heading = 49.5,
                minZ = 27.42,
                maxZ = 31.42,
            },
        },
        storezone = {
            center = vector3(-48.41, -1751.49, 29.42),
            width = 14,
            length = 13,
            options = {
                heading = 323.81,
                minZ = 27.42,
                maxZ = 31.42,
            }
        },
        safe = {
            coords = vector3(-43.43, -1748.3, 29.42),
            state = "closed",
        },
        cam = 4,
    },
    ["mirror_park"] = {
        name = "mirror_park",
        registerzone = {
            center = vector3(1164.84, -323.66, 69.21),
            width = 3,
            length = 1,
            options = {
                heading = 100.5,
                minZ = 67.21,
                maxZ = 71.21,
            }
        },
        storezone = {
            center = vector3(1158.68, -319.84, 69.21),
            width = 14,
            length = 13,
            options = {
                heading = 7.34,
                minZ = 67.21,
                maxZ = 71.21,
            }
        },
        safe = {
            coords = vector3(1159.48, -314.0, 69.21),
            state = "closed",
        },
        cam = 10,
    },
    ["richman_glen"] = {
        name = "richman_glen",
        registerzone = {
            center = vector3(-1819.53, 793.5, 138.09),
            width = 3,
            length = 1,
            options = {
                heading = 132.3,
                minZ = 136.21,
                maxZ = 140.21,
            }
        },
        storezone = {
            center = vector3(-1826.77, 793.43, 138.21),
            width = 14,
            length = 13,
            options = {
                heading = 44.46,
                minZ = 136.21,
                maxZ = 140.21,
            }
        },
        safe = {
            coords = vector3(-1829.22, 798.72, 138.19),
            state = "closed",
        },
        cam = 12,
    },
    ["grape_seed"] = {
        name = "grape_seed",
        registerzone = {
            center = vector3(1697.29, 4923.5, 42.06),
            width = 3,
            length = 1,
            options = {
                heading = 326,
                minZ = 40.06,
                maxZ = 44.06,
            }
        },
        storezone = {
            center = vector3(1704.34, 4925.1, 42.06),
            width = 14,
            length = 13,
            options = {
                heading = 237.94,
                minZ = 40.06,
                maxZ = 44.06,
            }
        },
        safe = {
            coords = vector3(1707.94, 4920.44, 42.06),
            state = "closed",
        },
        cam = 0, -- make cam for this
    },
    ["vespucci_canals"] = {
        name = "vespucci_canals",
        registerzone = {
            center = vector3(-1222.01, -908.3, 12.33),
            width = 1,
            length = 1,
            options = {
                heading = 33.91,
                minZ = 10.33,
                maxZ = 14.33,
            }
        },
        storezone = {
            center = vector3(-1221.45, -909.31, 12.33),
            width = 9,
            length = 16,
            options = {
                heading = 214.32,
                minZ = 10.33,
                maxZ = 14.33,
            }
        },
        safe = {
            coords = vector3(-1220.87, -916.05, 11.33),
            state = "closed",
        },
        cam = 6,
    },
    ["grand_senora"] = {
        name = "grand_senora",
        registerzone = {
            center = vector3(1165.94, 2710.78, 38.16),
            width = 1,
            length = 1,
            options = {
                heading = 178.48,
                minZ = 36.16,
                maxZ = 40.16,
            }
        },
        storezone = {
            center = vector3(1166.05, 2711.9, 38.16),
            width = 9,
            length = 16,
            options = {
                heading = 358.63,
                minZ = 36.16,
                maxZ = 40.16,
            }
        },
        safe = {
            coords = vector3(1169.24, 2717.82, 37.16),
            state = "closed",
        },
        cam = 17,
    },
    ["murrieta_heights"] = {
        name = "murrieta_heights",
        registerzone = {
            center = vector3(1134.23, -982.48, 46.42),
            width = 1,
            length = 1,
            options = {
                heading = 279.9,
                minZ = 44.42,
                maxZ = 48.42,
            }
        },
        storezone = {
            center = vector3(1133.11, -982.53, 46.42),
            width = 9,
            length = 16,
            options = {
                heading = 95.88,
                minZ = 44.42,
                maxZ = 48.42,
            }
        },
        safe = {
            coords = vector3(1126.78, -980.15, 45.42),
            state = "closed",
        },
        cam = 9,
    },
    ["del_perro"] = {
        name = "del_perro",
        registerzone = {
            center = vector3(-1486.27, -378.01, 40.16),
            width = 1,
            length = 1,
            options = {
                heading = 137.42,
                minZ = 38.16,
                maxZ = 42.16,
            }
        },
        storezone = {
            center = vector3(-1485.42, -377.31, 40.16),
            width = 9,
            length = 16,
            options = {
                heading = 313.66,
                minZ = 38.16,
                maxZ = 42.16,
            }
        },
        safe = {
            coords = vector3(-1478.91, -375.45, 39.16),
            state = "closed",
        },
        cam = 5,
    },
    ["great_ocean"] = {
        name = "great_ocean",
        registerzone = {
            center = vector3(-2966.45, 390.89, 15.04),
            width = 1,
            length = 1,
            options = {
                heading = 87.86,
                minZ = 13.04,
                maxZ = 17.04,
            }
        },
        storezone = {
            center = vector3(-2965.32, 390.76, 15.04),
            width = 9,
            length = 16,
            options = {
                heading = 269.51,
                minZ = 13.04,
                maxZ = 17.04,
            }
        },
        safe = {
            coords = vector3(-2959.66, 387.09, 14.04),
            state = "closed",
        },
        cam = 13,
    },
    ["banham_canyon"] = {
        name = "banham_canyon",
        registerzone = {
            center = vector3(-3040.09, 584.18, 7.91),
            width = 3.5,
            length = 1,
            options = {
                heading = 14.51,
                minZ = 5.91,
                maxZ = 9.91,
            }
        },
        storezone = {
            center = vector3(-3044.85, 587.65, 7.91),
            width = 12,
            length = 12,
            options = {
                heading = 107.3,
                minZ = 5.91,
                maxZ = 9.91,
            }
        },
        safe = {
            coords = vector3(-3047.89, 585.58, 7.91),
            state = "closed",
        },
        cam = 14,
    },
    ["chumash"] = {
        name = "chumash",
        registerzone = {
            center = vector3(-3243.4, 1000.1, 12.83),
            width = 3.5,
            length = 1,
            options = {
                heading = 357.29,
                minZ = 10.83,
                maxZ = 14.83,
            }
        },
        storezone = {
            center = vector3(-3246.58, 1005.06, 12.83),
            width = 12,
            length = 12,
            options = {
                heading = 87.67,
                minZ = 10.83,
                maxZ = 14.83,
            }
        },
        safe = {
            coords = vector3(-3250.1, 1004.43, 12.83),
            state = "closed",
        },
        cam = 15,
    },
    ["senora_freeway"] = {
        name = "senora_freeway",
        registerzone = {
            center = vector3(2677.05, 3279.99, 55.24),
            width = 3.5,
            length = 1,
            options = {
                heading = 334.06,
                minZ = 53.24,
                maxZ = 57.24,
            }
        },
        storezone = {
            center = vector3(2676.18, 3285.83, 55.24),
            width = 12,
            length = 12,
            options = {
                heading = 60.89,
                minZ = 53.24,
                maxZ = 57.24,
            }
        },
        safe = {
            coords = vector3(2672.74, 3286.67, 55.24),
            state = "closed",
        },
        cam = 18,
    },
    ["strawberry"] = {
        name = "strawberry",
        registerzone = {
            center = vector3(24.5, -1346.1, 29.5),
            width = 3.5,
            length = 1,
            options = {
                heading = 267.31,
                minZ = 27.5,
                maxZ = 31.5,
            }
        },
        storezone = {
            center = vector3(29.2, -1342.56, 29.5),
            width = 12,
            length = 12,
            options = {
                heading = 1.3,
                minZ = 27.5,
                maxZ = 31.5,
            }
        },
        safe = {
            coords = vector3(28.23, -1339.15, 29.5),
            state = "closed",
        },
        cam = 8,
    },
    ["harmony"] = {
        name = "harmony",
        registerzone = {
            center = vector3(549.19, 2670.15, 42.16),
            width = 3.5,
            length = 1,
            options = {
                heading = 99.02,
                minZ = 40.16,
                maxZ = 44.16,
            }
        },
        storezone = {
            center = vector3(545.0, 2666.02, 42.16),
            width = 12,
            length = 12,
            options = {
                heading = 184.09,
                minZ = 40.16,
                maxZ = 44.16,
            }
        },
        safe = {
            coords = vector3(546.43, 2662.74, 42.16),
            state = "closed",
        },
        cam = 16,
    },
    ["vinewood"] = {
        name = "vinewood",
        registerzone = {
            center = vector3(372.88, 327.55, 103.57),
            width = 3.5,
            length = 1,
            options = {
                heading = 258.23,
                minZ = 101.57,
                maxZ = 105.57,
            }
        },
        storezone = {
            center = vector3(378.25, 329.88, 103.57),
            width = 12,
            length = 12,
            options = {
                heading = 347.16,
                minZ = 101.57,
                maxZ = 105.57,
            }
        },
        safe = {
            coords = vector3(378.18, 333.4, 103.57),
            state = "closed",
        },
        cam = 11,
    },
    ["mount_chiliad"] = {
        name = "mount_chiliad",
        registerzone = {
            center = vector3(1728.38, 6416.24, 35.04),
            width = 3.5,
            length = 1,
            options = {
                heading = 244.71,
                minZ = 33.04,
                maxZ = 37.04,
            }
        },
        storezone = {
            center = vector3(1734.17, 6417.37, 35.04),
            width = 12,
            length = 12,
            options = {
                heading = 333.28,
                minZ = 33.04,
                maxZ = 37.04,
            }
        },
        safe = {
            coords = vector3(1734.81, 6420.89, 35.04),
            state = "closed",
        },
        cam = 20,
    },
    ["sandy_shores"] = {
        name = "sandy_shores",
        registerzone = {
            center = vector3(1959.55, 3741.01, 32.34),
            width = 3.5,
            length = 1,
            options = {
                heading = 297.72,
                minZ = 30.34,
                maxZ = 34.34,
            }
        },
        storezone = {
            center = vector3(1961.79, 3746.45, 32.34),
            width = 12,
            length = 12,
            options = {
                heading = 35.81,
                minZ = 30.34,
                maxZ = 34.34,
            }
        },
        safe = {
            coords = vector3(1959.25, 3748.97, 32.34),
            state = "closed",
        },
        cam = 19,
    },
    ["tataviam_mountains"] = {
        name = "tataviam_mountains",
        registerzone = {
            center = vector3(2556.02, 380.9, 108.62),
            width = 3.5,
            length = 1,
            options = {
                heading = 359.63,
                minZ = 106.62,
                maxZ = 110.62,
            }
        },
        storezone = {
            center = vector3(2552.75, 385.68, 108.62),
            width = 12,
            length = 12,
            options = {
                heading = 86.91,
                minZ = 106.62,
                maxZ = 110.62,
            }
        },
        safe = {
            coords = vector3(2549.24, 384.89, 108.62),
            state = "closed",
        },
        cam = 0, -- make cam for this
    },
    ["del_vecchio"] = {
        name = "del_vecchio",
        registerzone = {
            center = vector3(-161.07, 6321.37, 31.59),
            width = 1,
            length = 1,
            options = {
                heading = 315.21,
                minZ = 29.59,
                maxZ = 33.59,
            }
        },
        storezone = {
            center = vector3(-161.93, 6320.62, 31.59),
            width = 9,
            length = 16,
            options = {
                heading = 137.09,
                minZ = 29.59,
                maxZ = 33.59,
            }
        },
        safe = {
            coords = vector3(-168.46, 6318.8, 30.59),
            state = "closed",
        },
        cam = 27, 
    },
    ["paleto_bay"] = {
        name = "paleto_bay",
        registerzone = {
            center = vector3(161.34, 6642.4, 31.7),
            width = 3.5,
            length = 1,
            options = {
                heading = 223.7,
                minZ = 29.7,
                maxZ = 33.7,
            }
        },
        storezone = {
            center = vector3(167.17, 6641.61, 31.7),
            width = 12,
            length = 12,
            options = {
                heading = 317.83,
                minZ = 29.7,
                maxZ = 33.7,
            }
        },
        safe = {
            coords = vector3(168.97, 6644.72, 31.7),
            state = "closed",
        },
        cam = 28, 
    },
}