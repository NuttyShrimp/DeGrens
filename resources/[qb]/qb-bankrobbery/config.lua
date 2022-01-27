Config = Config or {}

Config.ItemTiers = 1

Config.MinimumPaletoPolice = 4
Config.MinimumPacificPolice = 5
Config.MinimumFleecaPolice = 3
Config.MinimumThermitePolice = 2

Config.RewardTypes = {
    [1] = {
        type = "item"
    },
    [2] = {
        type = "money",
        maxAmount = 500
    }
}

Config.LockerRewards = {
    ["tier1"] = {
        [1] = {item = "goldchain", minAmount = 5, maxAmount = 15},
    },
    ["tier2"] = {
        [1] = {item = "rolex", minAmount = 5, maxAmount = 15},
    },
    ["tier3"] = {
        [1] = {item = "goldbar", minAmount = 1, maxAmount = 2},
    },
}

Config.LockerRewardsPaleto = {
    ["tier1"] = {
        [1] = {item = "goldchain", minAmount = 10, maxAmount = 20},
    },
    ["tier2"] = {
        [1] = {item = "rolex", minAmount = 10, maxAmount = 20},
    },
    ["tier3"] = {
        [1] = {item = "goldbar", minAmount = 2, maxAmount = 4},
    },
}

Config.LockerRewardsPacific = {
    ["tier1"] = {
        [1] = {item = "goldbar", minAmount = 4, maxAmount = 8},
    },
    ["tier2"] = {
        [1] = {item = "goldbar", minAmount = 4, maxAmount = 8},
    },
    ["tier3"] = {
        [1] = {item = "goldbar", minAmount = 4, maxAmount = 8},
    },
}

Config.PowerStations = {
    [1] = {
        coords = vector3(2835.24, 1505.68, 24.72),
        hit = false
    },
    [2] = {
        coords = vector3(2811.76, 1500.6, 24.72),
        hit = false
    },
    [3] = {
        coords = vector3(2137.73, 1949.62, 93.78),
        hit = false
    },
    [4] = {
        coords = vector3(708.92, 117.49, 80.95),
        hit = false
    },
    [5] = {
        coords = vector3(670.23, 128.14, 80.95),
        hit = false
    },
    [6] = {
        coords = vector3(692.17, 160.28, 80.94),
        hit = false
    },
    [7] = {
        coords = vector3(2459.16, 1460.94, 36.2),
        hit = false
    },
    [8] = {
        coords = vector3(2280.45, 2964.83, 46.75),
        hit = false
    },
    [9] = {
        coords = vector3(2059.68, 3683.8, 34.58),
        hit = false
    },
    [10] = {
        coords = vector3(2589.5, 5057.38, 44.91),
        hit = false
    },
    [11] = {
        coords = vector3(1343.61, 6388.13, 33.4),
        hit = false
    },
    [12] = {
        coords = vector3(236.61, 6406.1, 31.83),
        hit = false
    },
    [13] = {
        coords = vector3(-293.1, 6023.54, 31.54),
        hit = false
    }
}

Config.SmallBanks = {
    [1] = {
        ["label"] = "Pinkcage hotel",
        ["coords"] = vector3(311.15, -284.49, 54.16),
        ["alarm"] = true,
        ["object"] = GetHashKey("v_ilev_gb_vauldr"),
        ["heading"] = {
            closed = 250.0,
            open = 160.0
        },
        ["camId"] = 21,
        ["isOpened"] = false,
        ["lockers"] = {
            [1] = {
                ["coords"] = vector3(311.16, -287.71, 54.14),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [2] = {
                ["coords"] = vector3(311.86, -286.21, 54.14),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [3] = {
                ["coords"] = vector3(313.39, -289.15, 54.14),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [4] = {
                ["coords"] = vector3(311.7, -288.45, 54.14),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [5] = {
                ["coords"] = vector3(314.23, -288.77, 54.14),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [6] = {
                ["coords"] = vector3(314.83, -287.33, 54.14),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [7] = {
                ["coords"] = vector3(315.24, -284.85, 54.14),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [8] = {
                ["coords"] = vector3(314.08, -283.38, 54.14),
                ["isBusy"] = false,
                ["isOpened"] = false
            }
        }
    },
    [2] = {
        ["label"] = "Legion Square",
        ["coords"] = vector3(146.92, -1046.11, 29.36),
        ["alarm"] = true,
        ["object"] = GetHashKey("v_ilev_gb_vauldr"),
        ["heading"] = {
            closed = 250.0,
            open = 160.0
        },
        ["camId"] = 22,
        ["isOpened"] = false,
        ["lockers"] = {
            [1] = {
                ["coords"] = vector3(149.84, -1044.9, 29.34),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [2] = {
                ["coords"] = vector3(151.16, -1046.64, 29.34),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [3] = {
                ["coords"] = vector3(147.16, -1047.72, 29.34),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [4] = {
                ["coords"] = vector3(146.54, -1049.28, 29.34),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [5] = {
                ["coords"] = vector3(146.88, -1050.33, 29.34),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [6] = {
                ["coords"] = vector3(150.0, -1050.67, 29.34),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [7] = {
                ["coords"] = vector3(149.47, -1051.28, 29.34),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [8] = {
                ["coords"] = vector3(150.58, -1049.09, 29.34),
                ["isBusy"] = false,
                ["isOpened"] = false
            }
        }
    },
    [3] = {
        ["label"] = "Hawick Ave",
        ["coords"] = vector3(-353.82, -55.37, 49.03),
        ["alarm"] = true,
        ["object"] = GetHashKey("v_ilev_gb_vauldr"),
        ["heading"] = {
            closed = 250.0,
            open = 160.0
        },
        ["camId"] = 23,
        ["isOpened"] = false,
        ["lockers"] = {
            [1] = {
                ["coords"] = vector3(350.99, -54.13, 49.01),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [2] = {
                ["coords"] = vector3(-349.53, -55.77, 49.01),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [3] = {
                ["coords"] = vector3(-353.54, -56.94, 49.01),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [4] = {
                ["coords"] = vector3(-354.09, -58.55, 49.01),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [5] = {
                ["coords"] = vector3(-353.81, -59.48, 49.01),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [6] = {
                ["coords"] = vector3(-349.8, -58.3, 49.01),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [7] = {
                ["coords"] = vector3(-351.14, -60.37, 49.01),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [8] = {
                ["coords"] = vector3(-350.4, -59.92, 49.01),
                ["isBusy"] = false,
                ["isOpened"] = false
            }
        }
    },
    [4] = {
        ["label"] = "Del Perro Blvd",
        ["coords"] = vector3(-1210.77, -336.57, 37.78),
        ["alarm"] = true,
        ["object"] = GetHashKey("v_ilev_gb_vauldr"),
        ["heading"] = {
            closed = 296.863,
            open = 206.863
        },
        ["camId"] = 24,
        ["isOpened"] = false,
        ["lockers"] = {
            [1] = {
                ["coords"] = vector3(-1209.68, -333.65, 37.75),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [2] = {
                ["coords"] = vector3(-1207.46, -333.77, 37.75),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [3] = {
                ["coords"] = vector3(-1209.45, -337.47, 37.75),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [4] = {
                ["coords"] = vector3(-1208.65, -339.06, 37.75),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [5] = {
                ["coords"] = vector3(-1207.75, -339.42, 37.75),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [6] = {
                ["coords"] = vector3(-1205.28, -338.14, 37.75),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [7] = {
                ["coords"] = vector3(-1205.08, -337.28, 37.75),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [8] = {
                ["coords"] = vector3(-1205.92, -335.75, 37.75),
                ["isBusy"] = false,
                ["isOpened"] = false
            }
        }
    },
    [5] = {
        ["label"] = "Great Ocean Hwy",
        ["coords"] = vector3(-2956.55, 481.74, 15.69),
        ["alarm"] = true,
        ["object"] = GetHashKey("hei_prop_heist_sec_door"),
        ["heading"] = {
            closed = 357.542,
            open = 267.542
        },
        ["camId"] = 25,
        ["isOpened"] = false,
        ["lockers"] = {
            [1] = {
                ["coords"] = vector3(-2958.54, 484.1, 15.67),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [2] = {
                ["coords"] = vector3(-2957.3, 485.95, 15.67),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [3] = {
                ["coords"] = vector3(-2955.09, 482.43, 15.67),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [4] = {
                ["coords"] = vector3(-2953.26, 482.42, 15.67),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [5] = {
                ["coords"] = vector3(-2952.63, 483.09, 15.67),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [6] = {
                ["coords"] = vector3(-2952.45, 485.66, 15.67),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [7] = {
                ["coords"] = vector3(-2953.13, 486.26, 15.67),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [8] = {
                ["coords"] = vector3(-2954.98, 486.37, 15.67),
                ["isBusy"] = false,
                ["isOpened"] = false
            }
        }
    }
}

Config.BigBanks = {
    ["paleto"] = {
        ["label"] = "Blaine County Savings Bank",
        ["coords"] = vector3(-105.61, 6472.03, 31.62),
        ["alarm"] = true,
        ["object"] = -1185205679,
        ["heading"] = {
            closed = 45.45,
            open = 130.45
        },
        ["thermite"] = {
            [1] = {
                ["coords"] = vector3(-106.11, 6475.36, 31.62),
                ["isOpened"] = false,
                ["doorId"] = 5
            }
        },
        ["camId"] = 26,
        ["isOpened"] = false,
        ["lockers"] = {
            [1] = {
                ["coords"] = vector3(-107.4, 6473.87, 31.62),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [2] = {
                ["coords"] = vector3(-107.66, 6475.61, 31.62),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [3] = {
                ["coords"] = vector3(-103.52, 6475.03, 31.62),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [4] = {
                ["coords"] = vector3(-102.3, 6476.13, 31.66),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [5] = {
                ["coords"] = vector3(-102.43, 6477.45, 31.67),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [6] = {
                ["coords"] = vector3(-103.97, 6478.97, 31.62),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [7] = {
                ["coords"] = vector3(-105.39, 6479.19, 31.67),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [8] = {
                ["coords"] = vector3(-106.57, 6478.01, 31.62),
                ["isBusy"] = false,
                ["isOpened"] = false
            }
        }
    },
    ["pacific"] = {
        ["label"] = "Pacific Standard",
        ["coords"] = {
            [1] = vector3(261.95, 223.11, 106.28),
            [2] = vector3(253.25, 228.44, 101.68)
        },
        ["alarm"] = true,
        ["object"] = 961976194,
        ["heading"] = {
            closed = 160.00001,
            open = 70.00001
        },
        ["thermite"] = {
            [1] = {
                ["coords"] = vector3(252.55, 221.15, 101.68),
                ["isOpened"] = false,
                ["doorId"] = 2
            },
            [2] = {
                ["coords"] = vector3(261.15, 215.21, 101.68),
                ["isOpened"] = false,
                ["doorId"] = 3
            }
        },
        ["camId"] = 26,
        ["isOpened"] = false,
        ["lockers"] = {
            [1] = {
                ["coords"] = vector3(258.57, 218.36, 101.68),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [2] = {
                ["coords"] = vector3(260.82, 217.62, 101.68),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [3] = {
                ["coords"] = vector3(259.33, 213.76, 101.68),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [4] = {
                ["coords"] = vector3(257.09, 214.55, 101.68),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [5] = {
                ["coords"] = vector3(263.7, 216.48, 101.68),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [6] = {
                ["coords"] = vector3(265.81, 215.81, 101.68),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [7] = {
                ["coords"] = vector3(266.43, 214.37, 101.68),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [8] = {
                ["coords"] = vector3(265.71, 212.49, 101.68),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [9] = {
                ["coords"] = vector3(264.24, 211.92, 101.68),
                ["isBusy"] = false,
                ["isOpened"] = false
            },
            [10] = {
                ["coords"] = vector3(262.21, 212.67, 101.68),
                ["isBusy"] = false,
                ["isOpened"] = false
            }
        }
    }
}

Config.MaleNoHandshoes = {
    [0] = true, [1] = true, [2] = true, [3] = true, [4] = true, [5] = true, [6] = true, [7] = true, [8] = true, [9] = true, [10] = true, [11] = true, [12] = true, [13] = true, [14] = true, [15] = true, [18] = true, [26] = true, [52] = true, [53] = true, [54] = true, [55] = true, [56] = true, [57] = true, [58] = true, [59] = true, [60] = true, [61] = true, [62] = true, [112] = true, [113] = true, [114] = true, [118] = true, [125] = true, [132] = true
}

Config.FemaleNoHandshoes = {
    [0] = true, [1] = true, [2] = true, [3] = true, [4] = true, [5] = true, [6] = true, [7] = true, [8] = true, [9] = true, [10] = true, [11] = true, [12] = true, [13] = true, [14] = true, [15] = true, [19] = true, [59] = true, [60] = true, [61] = true, [62] = true, [63] = true, [64] = true, [65] = true, [66] = true, [67] = true, [68] = true, [69] = true, [70] = true, [71] = true, [129] = true, [130] = true, [131] = true, [135] = true, [142] = true, [149] = true, [153] = true, [157] = true, [161] = true, [165] = true
}
