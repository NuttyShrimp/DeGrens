local isValidPlantId = function(id)
    return id and id >= 1 and id <= 36
end

DGCore.Functions.CreateCallback('dg-labs:server:weed:GetPlantData', function(source, cb, labId, plantId)
    if not labId or getLabTypeFromId(labId) ~= "weed" then return end
    if not isValidPlantId(plantId) then return end

    if not states[labId].plants[plantId] then
        states[labId].plants[plantId] = {
            canFertilize = true,
            canHarvest = false,
        }
    end

    cb(states[labId].plants[plantId])
end)

RegisterServerEvent('dg-labs:server:weed:Fertilize', function(labId, plantId)
    if not labId or getLabTypeFromId(labId) ~= "weed" then return end
    if not isValidPlantId(plantId) then return end
    if not states[labId].plants[plantId].canFertilize then return end

    states[labId].plants[plantId].canFertilize = false
    local harvestDelay = getConfig().weed.harvestDelay * 60 * 1000
    Citizen.SetTimeout(harvestDelay, function()
        states[labId].plants[plantId].canHarvest = true
    end)
end)

RegisterServerEvent('dg-labs:server:weed:Harvest', function(labId, plantId)
    if not labId or getLabTypeFromId(labId) ~= "weed" then return end
    if not isValidPlantId(plantId) then return end
    if states[labId].plants[plantId].canFertilize or not states[labId].plants[plantId].canHarvest then return end

    states[labId].plants[plantId].canHarvest = false
    local timeout = getConfig().weed.timeout * 60 * 1000
    Citizen.SetTimeout(timeout, function()
        states[labId].plants[plantId] = {
            canFertilize = true,
            canHarvest = false,
        }
    end)
end)

RegisterServerEvent('dg-labs:server:weed:Search', function(labId)
    if not labId or getLabTypeFromId(labId) ~= "weed" then return end

    if math.random(1, 100) <= getConfig().weed.rewardChance then
        local Player = DGCore.Functions.GetPlayer(source)
        local item = getConfig().weed.rewards[math.random(1, #getConfig().weed.rewards)]
        Player.Functions.AddItem(item, 1)
        TriggerClientEvent("inventory:client:ItemBox", source, item, "add")
        TriggerClientEvent('dg-ui:client:addNotification', source, "Je hebt iets nuttig gevonden!", "success")
    else
        TriggerClientEvent('dg-ui:client:addNotification', source, "Er zat niks nuttig tussen...", "error")
    end
end)