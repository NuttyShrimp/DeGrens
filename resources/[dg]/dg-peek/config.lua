Config, Types = {}, {}
Types[1], Types[2], Types[3] = {}, {}, {}

Config.MaxDistance = 3.0
Config.OpenKey = "LMENU" -- L ALT, used for opening
Config.OpenControlKey = 19 -- L ALT, used for closin
Config.MenuControlKey = 238 -- RMB, used for showeing options

Config.CircleZones = {
    ["test_circlezone"] = { 
        name = "testcircle",
        coords = vector3(252.09, 211.91, 106.28),
        radius = 1.0,
        debugPoly = false,
        options = {
            {
                type = "client",
                event = "dg-peek:Test",
                icon = "fas fa-credit-card",
                label = "Test Circle",
                -- params
                string = "Test Circle",
            }
        },
        distance = 2.5,
    },
}

Config.BoxZones = {
    ["test_boxzone"] = { 
        name = "testbox",
        coords = vector3(244.92, 213.79, 106.28),
        length = 2.0,
        width = 2.0,
        heading = 68.5,
        debugPoly = false,
        minZ = 105.27,
        maxZ = 107.27,
        options = {
            {
                type = "client",
                event = "dg-peek:Test",
                icon = "fas fa-credit-card",
                label = "Test Box",
                -- params
                string = "Test Box",
            }
        },
        distance = 2.5,
    },
}

Config.TargetModels = {
    ["dumpsters"] = {
        models = {"p_dumpster_t", "prop_cs_dumpster_01a", "prop_dumpster_01a", "prop_dumpster_02a", "prop_dumpster_02b", "prop_dumpster_3a", "prop_dumpster_4a", "prop_dumpster_4b"},
        options = {
            {
                icon = "fas fa-dumpster",
                label = "Open Dumpster",
                action = function(entity)
                    local pos = GetEntityCoords(entity)
                    TriggerEvent('inventory:client:OpenDumpster', pos)
                end,
            },
        },
        distance = 1
    },
}

Config.PedFlags = {
    ["test_pedflag"] = {
        flags = "isBanker",
        options = {
            {
                type = "client",
                event = "dg-peek:Test",
                icon = "fas fa-credit-card",
                label = "Test Banker",
                -- params
                string = "Test Banker",
            },
        },
    },
}

-- Global objects are on every entity of the type
Config.GlobalPedOptions = {
    options = {
        {
            type = "client",
            event = "dg-peek:Test",
            icon = "fas fa-credit-card",
            label = "Test Global Ped",
            -- params
            string = "Test Global Ped"
        },
    },
}

Config.GlobalVehicleOptions = {
    options = {
        {
            type = "client",
            event = "dg-peek:Test",
            icon = "fas fa-credit-card",
            label = "Test Global Vehicle",
            -- params
            string = "Test Global Vehicle"
        },
    },
}

Config.GlobalObjectOptions = {

}

Config.GlobalPlayerOptions = {
    options = {
        {
            type = "client",
            event = "dg-peek:Test",
            icon = "fas fa-credit-card",
            label = "Test Global Player",
            -- params
            string = "Test Global Player"
        },
        {
            icon = "fas fa-handshake",
            label = "Give Item",
            action = function(entity)
                local player = DGCore.Functions.GetClosestPlayer(GetEntityCoords(entity))
                local playerId = GetPlayerServerId(player)
                TriggerEvent("inventory:server:GiveItemToPlayer", playerId)
            end,
        },
    },
}
