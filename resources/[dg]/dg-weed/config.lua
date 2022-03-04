Config = {}

Config.GrowTime = 12 * 60 * 60 -- aantal seconden voordat een plant groeit (12u per stage)

Config.Cut = {}
Config.Cut.Time = 24 * 60 * 60 -- aantal seconden voordat je een plant weer kan knippen (1 dag)
Config.Cut.BreakChance = 10 -- percent kans dat een plant kapot gaat na knippen
Config.Cut.Item = "weed_bud" -- item dat je krijgt bij knippen

Config.Dry = {}
Config.Dry.Item = "weed_bag"
Config.Dry.Time = 3 * 24 * 60 * 60 -- aantal seconden dat een bud moet drogen (3 dagen)
Config.Dry.Amount = {
    min = 10,
    max = 20
}

Config.Food = {}
Config.Food.Item = "plant_fertilizer" -- naam van het item waarmee je een plant voed
Config.Food.DecayTime = 20 * 60 * 1000 -- aantal milliseconden per 1% decay
Config.Food.Amount = { -- aantal percent dat bijkomt bij voederen
    min = 40, 
    max = 60
}

Config.Seeds = {
    ["M"] = "weed_seed_male",
    ["F"] = "weed_seed_female"
}

Config.Stages = {
    [1] = `bkr_prop_weed_01_small_01b`,
    [2] = `bkr_prop_weed_med_01b`,
    [3] = `bkr_prop_weed_lrg_01a`,
    [4] = `bkr_prop_weed_lrg_01b`,
}

-- https://pastebin.com/PBE6wQSG list of materialhashes
Config.GroundMaterials = {
    [1333033863] = true, -- Grass
    [-1286696947] = true, -- GrassShort
    [-461750719] = true, -- GrassLong
    [951832588] = true, -- GravelSmall
    [2128369009] = true, -- GravelLarge
    [-356706482] = true, -- GravelDeep
    [-1885547121] = true, -- DirtTrack
    [1913209870] = true, -- SandstoneBrittle
    [510490462] = true, -- SandCompact
    [909950165] = true, -- SandWet
    [-1595148316] = true, -- SandLoose
    [-1942898710] = true, -- MudHard
    [1635937914] = true, -- MudSoft
}

















Config.HarvestTime = 40 * 1000

Config.Plants = {
    ["og-kush"] = {
        ["label"] = "OGKush 2g",
        ["item"] = "weed_og-kush",
        ["stages"] = {
            ["stage-a"] = "bkr_prop_weed_01_small_01c",
            ["stage-b"] = "bkr_prop_weed_01_small_01b",
            ["stage-c"] = "bkr_prop_weed_01_small_01a",
            ["stage-d"] = "bkr_prop_weed_med_01b",
            ["stage-e"] = "bkr_prop_weed_lrg_01a",
            ["stage-f"] = "bkr_prop_weed_lrg_01b",
            ["stage-g"] = "bkr_prop_weed_lrg_01b",
        },
        ["highestStage"] = "stage-g"
    },
    ["amnesia"] = {
        ["label"] = "Amnesia 2g",
        ["item"] = "weed_amnesia",
        ["stages"] = {
            ["stage-a"] = "bkr_prop_weed_01_small_01c",
            ["stage-b"] = "bkr_prop_weed_01_small_01b",
            ["stage-c"] = "bkr_prop_weed_01_small_01a",
            ["stage-d"] = "bkr_prop_weed_med_01b",
            ["stage-e"] = "bkr_prop_weed_lrg_01a",
            ["stage-f"] = "bkr_prop_weed_lrg_01b",
            ["stage-g"] = "bkr_prop_weed_lrg_01b",
        },
        ["highestStage"] = "stage-g"
    },
    ["skunk"] = {
        ["label"] = "Skunk 2g",
        ["item"] = "weed_skunk",
        ["stages"] = {
            ["stage-a"] = "bkr_prop_weed_01_small_01c",
            ["stage-b"] = "bkr_prop_weed_01_small_01b",
            ["stage-c"] = "bkr_prop_weed_01_small_01a",
            ["stage-d"] = "bkr_prop_weed_med_01b",
            ["stage-e"] = "bkr_prop_weed_lrg_01a",
            ["stage-f"] = "bkr_prop_weed_lrg_01b",
            ["stage-g"] = "bkr_prop_weed_lrg_01b",
        },
        ["highestStage"] = "stage-g"
    },
    ["ak47"] = {
        ["label"] = "AK47 2g",
        ["item"] = "weed_ak47",
        ["stages"] = {
            ["stage-a"] = "bkr_prop_weed_01_small_01c",
            ["stage-b"] = "bkr_prop_weed_01_small_01b",
            ["stage-c"] = "bkr_prop_weed_01_small_01a",
            ["stage-d"] = "bkr_prop_weed_med_01b",
            ["stage-e"] = "bkr_prop_weed_lrg_01a",
            ["stage-f"] = "bkr_prop_weed_lrg_01b",
            ["stage-g"] = "bkr_prop_weed_lrg_01b",
        },
        ["highestStage"] = "stage-g"
    },
    ["purple-haze"] = {
        ["label"] = "Purple Haze 2g",
        ["item"] = "weed_purple-haze",
        ["stages"] = {
            ["stage-a"] = "bkr_prop_weed_01_small_01c",
            ["stage-b"] = "bkr_prop_weed_01_small_01b",
            ["stage-c"] = "bkr_prop_weed_01_small_01a",
            ["stage-d"] = "bkr_prop_weed_med_01b",
            ["stage-e"] = "bkr_prop_weed_lrg_01a",
            ["stage-f"] = "bkr_prop_weed_lrg_01b",
            ["stage-g"] = "bkr_prop_weed_lrg_01b",
        },
        ["highestStage"] = "stage-g"
    },
    ["white-widow"] = {
        ["label"] = "White Widow 2g",
        ["item"] = "weed_white-widow",
        ["stages"] = {
            ["stage-a"] = "bkr_prop_weed_01_small_01c",
            ["stage-b"] = "bkr_prop_weed_01_small_01b",
            ["stage-c"] = "bkr_prop_weed_01_small_01a",
            ["stage-d"] = "bkr_prop_weed_med_01b",
            ["stage-e"] = "bkr_prop_weed_lrg_01a",
            ["stage-f"] = "bkr_prop_weed_lrg_01b",
            ["stage-g"] = "bkr_prop_weed_lrg_01b",
        },
        ["highestStage"] = "stage-g"
    },
}