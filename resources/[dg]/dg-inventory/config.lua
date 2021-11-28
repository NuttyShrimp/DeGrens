Config = {}

Config.MaxInventorySlots = 40

Config.MaximumAmmoValues = {
    ["pistol"] = 250,
    ["smg"] = 250,
    ["shotgun"] = 200,
    ["rifle"] = 250,
}

-- vehicle trunksweight and slots
Config.TrunkSize = {
    Classes = {
        [0] = {maxweight = 38000, slots = 30}, -- compacts
        [1] = {maxweight = 50000, slots = 40}, -- sedans
        [2] = {maxweight = 75000, slots = 50}, -- suvs
        [3] = {maxweight = 42000, slots = 35}, -- coupes
        [4] = {maxweight = 30000, slots = 30}, -- muscles
        [5] = {maxweight = 30000, slots = 25}, -- sport classics
        [6] = {maxweight = 30000, slots = 25}, -- sport
        [7] = {maxweight = 30000, slots = 25}, -- super
        [8] = {maxweight = 15000, slots = 15}, -- motors
        [9] = {maxweight = 60000, slots = 35}, -- offroad
        [12] = {maxweight = 120000, slots = 35}, -- vans
        [13] = {maxweight = 5000, slots = 1}, -- bikes
        [14] = {maxweight = 120000, slots = 50}, -- boats
        [15] = {maxweight = 38000, slots = 50}, -- helis
        [16] = {maxweight = 38000, slots = 50}, -- planes
    },
    SpecificModels = {

    },
    Default = {weigh = 15000, slots = 15}
}