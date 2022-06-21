local hasFertilizer = false
local hasJustHarvested = false

addWeedPeekEntries = function()
    cacheIds[#cacheIds + 1] = exports['dg-peek']:addZoneEntry("drugslab_action", {
        options = {
            {
                icon = "fas fa-oil-can",
                label = "Neem voeding",
                action = function()
                    exports['dg-labs']:takeWeedFertilizer()
                end,
                canInteract = function(_, _, entry)
                    return entry.data.action == "fertilizer" and not exports['dg-labs']:hasWeedFertilizer()
                end
            },
            {
                icon = "fas fa-oil-can",
                label = "Wegleggen",
                action = function()
                    exports['dg-labs']:removeWeedFertilizer()
                end,
                canInteract = function(_, _, entry)
                    return entry.data.action == "fertilizer" and exports['dg-labs']:hasWeedFertilizer()
                end
            },
            {
                icon = "fas fa-oil-can",
                label = "Voeden",
                action = function(entry)
                    local id = tonumber(DGCore.Shared.SplitStr(entry.data.action, '_')[2])
                    exports['dg-labs']:fertilizeWeedPlant(id)
                end,
                canInteract = function(_, _, entry)
                    return DGCore.Shared.SplitStr(entry.data.action, '_')[1] == "plant" and exports['dg-labs']:hasWeedFertilizer()
                end
            },
            {
                icon = "fas fa-cut",
                label = "Knip",
                action = function(entry)
                    local id = tonumber(DGCore.Shared.SplitStr(entry.data.action, '_')[2])
                    exports['dg-labs']:harvestWeedPlant(id)
                end,
                canInteract = function(_, _, entry)
                    return DGCore.Shared.SplitStr(entry.data.action, '_')[1] == "plant"
                end
            },
            {
                icon = "fas fa-cannabis",
                label = "Doorzoek",
                action = function(entry)
                    exports['dg-labs']:searchHarvestedWeed(id)
                end,
                canInteract = function(_, _, entry)
                    return entry.data.action == "search" and exports['dg-labs']:hasHarvestedWeed()
                end
            },
        },
        distance = 1.5
    })
end

exports('hasWeedFertilizer', function()
    return hasFertilizer
end) 

exports("takeWeedFertilizer", function()
    local enoughPlayers = DGCore.Functions.TriggerCallback("dg-labs:server:enoughPlayers", "weed")
    if not enoughPlayers then
        exports['dg-ui']:addNotification("De voeding is momenteel op...", "error")
        return
    end

    DGCore.Functions.Progressbar("weed_take_fertilizer", "Nemen...", 5000, false, true, {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true
    }, {
        animDict = "anim@amb@business@weed@weed_inspecting_lo_med_hi@",
        anim = "weed_crouch_checkingleaves_idle_01_inspector",
        flags = 0
    }, {}, {}, function() -- Done
        StopAnimTask(PlayerPedId(), "anim@amb@business@weed@weed_inspecting_lo_med_hi@", "weed_crouch_checkingleaves_idle_01_inspector", 1.0)
        hasFertilizer = true
        attachBox()
    end, function() -- Cancel
        StopAnimTask(PlayerPedId(), "anim@amb@business@weed@weed_inspecting_lo_med_hi@", "weed_crouch_checkingleaves_idle_01_inspector", 1.0)
        exports['dg-ui']:addNotification("Geannuleerd...", "error")
    end)
end)

exports("removeWeedFertilizer", function()
    removeBox()
    hasFertilizer = false
    exports['dg-ui']:addNotification("Voeding weggelegd...")
end)

exports('fertilizeWeedPlant', function(plantId)
    if not hasFertilizer then return end
    if not plantId then return end

    local plantData = DGCore.Functions.TriggerCallback("dg-labs:server:weed:GetPlantData", currentLabId, plantId)
    if not plantData.canFertilize then
        exports['dg-ui']:addNotification("Deze plant is al gevoed...", "error")
        return
    end

    removeBox()
    hasFertilizer = false
    DGCore.Functions.Progressbar("weed_fertilize_plant", "Voeden...", 5000, false, true, {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true
    }, {
        animDict = "timetable@gardener@filling_can",
        anim = "gar_ig_5_filling_can",
        flags = 16,
    }, {}, {}, function() -- Done
        StopAnimTask(PlayerPedId(), "timetable@gardener@filling_can", "gar_ig_5_filling_can", 1.0)
        TriggerServerEvent('dg-labs:server:weed:Fertilize', currentLabId, plantId)
        exports['dg-ui']:addNotification("Wacht tot de plant volgroeid is..", "success")
    end, function() -- Cancel
        StopAnimTask(PlayerPedId(), "timetable@gardener@filling_can", "gar_ig_5_filling_can", 1.0)
        exports['dg-ui']:addNotification("Geannuleerd...", "error")
    end)
end)

exports('harvestWeedPlant', function(plantId)
    if not plantId then return end

    local plantData = DGCore.Functions.TriggerCallback("dg-labs:server:weed:GetPlantData", currentLabId, plantId)
    if not plantData.canHarvest then
        exports['dg-ui']:addNotification("Deze plant is nog niet volgroeid..", "error")
        return
    end

    DGCore.Functions.Progressbar("weed_harvest_plant", "Knippen...", 10000, false, true, {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true
    }, {
        animDict = "anim@amb@business@weed@weed_inspecting_lo_med_hi@",
        anim = "weed_crouch_checkingleaves_idle_01_inspector",
        flags = 0
    }, {}, {}, function() -- Done
        StopAnimTask(PlayerPedId(), "anim@amb@business@weed@weed_inspecting_lo_med_hi@", "weed_crouch_checkingleaves_idle_01_inspector", 1.0)
        TriggerServerEvent('dg-labs:server:weed:Harvest', currentLabId, plantId)
        attachBox()
        hasJustHarvested = true
        TriggerServerEvent('hud:server:GainStress', math.random(2, 5))
    end, function() -- Cancel
        StopAnimTask(PlayerPedId(), "anim@amb@business@weed@weed_inspecting_lo_med_hi@", "weed_crouch_checkingleaves_idle_01_inspector", 1.0)
        exports['dg-ui']:addNotification("Geannuleerd...", "error")
    end)
end)

exports('hasHarvestedWeed', function()
    return hasJustHarvested
end)

exports("searchHarvestedWeed", function()
    if not hasJustHarvested then return end

    hasJustHarvested = false
    removeBox()
    DGCore.Functions.Progressbar("weed_search_harvest", "Doorzoeken...", 20000, false, true, {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true
    }, {
        animDict = "creatures@rottweiler@tricks@",
        anim = "petting_franklin",
        flags = 0
    }, {}, {}, function() -- Done
        StopAnimTask(PlayerPedId(), "creatures@rottweiler@tricks@", "petting_franklin", 1.0)
        TriggerServerEvent('dg-labs:server:weed:Search', currentLabId)
    end, function() -- Cancel
        StopAnimTask(PlayerPedId(), "creatures@rottweiler@tricks@", "petting_franklin", 1.0)
        exports['dg-ui']:addNotification("Geannuleerd...", "error")
    end)
end)