Config = Config or {}

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
Config.Safe.HackGridSize = 2
Config.Safe.HackTime = 15
Config.Safe.Reward = "moneyroll"
Config.Safe.RewardAmount = 5
Config.Safe.Timeout = 60 * 60 * 1000 -- tijd dat het neemt tegen dat kluis is gereset
Config.Safe.LootDelay = 1 * 30 * 1000 -- tijd dat je moet wachten na mail voor kluis te looten

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
            }
        },
        storezone = {
            vectors = {
                vector2(-47.288570404053, -1761.001953125),
                vector2(-58.139656066895, -1751.9344482422),
                vector2(-53.071319580078, -1745.1441650391),
                vector2(-45.989807128906, -1750.3532714844),
                vector2(-43.615028381348, -1747.2941894531),
                vector2(-38.783176422119, -1750.8874511719)
            },
            options = {
                debugPoly = true,
                minZ = 27.42,
                maxZ = 31.42,
            }
        },
        safe = vector3(-43.69, -1748.18, 28.87),
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
        cam = 0, -- make cam for this
    },
    ["del_vecchio"] = { -- MLO nodig
        name = "del_vecchio",
        registerzone = {
            center = vector3(-161.53, 6320.64, 31.68),
            width = 1,
            length = 1,
            options = {
                debugPoly = true,
                heading = 313.18,
                minZ = 29.68,
                maxZ = 33.68,
            }
        },
        cam = 27, 
    },
    ["paleto_bay"] = { -- MLO nodig
        name = "paleto_bay",
        registerzone = {
            center = vector3(161.74, 6642.75, 31.27),
            width = 3.5,
            length = 1,
            options = {
                debugPoly = true,
                heading = 225.13,
                minZ = 29.27,
                maxZ = 35.27,
            }
        },
        cam = 28, 
    },
}