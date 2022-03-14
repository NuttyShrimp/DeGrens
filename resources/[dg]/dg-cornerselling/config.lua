Config = {}

Config.RequiredCops = 0 -- aantal agenten nodig
Config.SaleDecayTime = 10 -- aantal dagen dat verkopen een invloed hebben op prijs
Config.CleanChance = 25 -- kans dat er ook zwart geld wordt geruild
Config.SellAmount = { -- aantal items dat je per keer verkoopt
    min = 1, 
    max = 10,
}

-- items dat je kan verkopen met min/max prijs
Config.SellableItems = {
    ["weed_bag"] = {
        min = 10, 
        max = 20,
    },
}