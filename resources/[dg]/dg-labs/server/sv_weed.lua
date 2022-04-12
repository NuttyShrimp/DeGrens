local isValidPlantId = function(id)
    return id and id >= 1 and id <= 36
end

DGCore.Functions.CreateCallback('dg-labs:server:weed:GetPlantData', function(source, cb, labId, plantId)
    if not labId or getLabTypeFromId(labId) ~= "weed" then return end
    if not isValidPlantId(plantId) then return end

    if not Config.Labs[labId].data.plants[plantId] then
        Config.Labs[labId].data.plants[plantId] = {
            canFertilize = true,
            canHarvest = false,
        }
    end

    cb(Config.Labs[labId].data.plants[plantId])
end)

RegisterServerEvent('dg-labs:server:weed:Fertilize', function(labId, plantId)
    if not labId or getLabTypeFromId(labId) ~= "weed" then return end
    if not isValidPlantId(plantId) then return end
    if not Config.Labs[labId].data.plants[plantId].canFertilize then return end

    Config.Labs[labId].data.plants[plantId].canFertilize = false
    Citizen.SetTimeout(Config.Weed.FertilizeDelay, function()
        Config.Labs[labId].data.plants[plantId].canHarvest = true
    end)
end)

RegisterServerEvent('dg-labs:server:weed:Harvest', function(labId, plantId)
    if not labId or getLabTypeFromId(labId) ~= "weed" then return end
    if not isValidPlantId(plantId) then return end
    if Config.Labs[labId].data.plants[plantId].canFertilize or not Config.Labs[labId].data.plants[plantId].canHarvest then return end

    Config.Labs[labId].data.plants[plantId].canHarvest = false
    Citizen.SetTimeout(Config.Weed.HarvestDelay, function()
        Config.Labs[labId].data.plants[plantId] = {
            canFertilize = true,
            canHarvest = false,
        }
    end)
end)

RegisterServerEvent('dg-labs:server:weed:Search', function(labId)
    if not labId or getLabTypeFromId(labId) ~= "weed" then return end

    if math.random(1, 100) <= Config.Weed.RewardChance then
        local Player = DGCore.Functions.GetPlayer(source)
        local item = Config.Weed.Rewards[math.random(1, #Config.Weed.Rewards)]
        Player.Functions.AddItem(item, 1)
        TriggerClientEvent("inventory:client:ItemBox", source, item, "add")
        TriggerClientEvent('dg-ui:client:addNotification', source, "Je hebt iets nuttig gevonden!", "success")
    else
        TriggerClientEvent('dg-ui:client:addNotification', source, "Er zat niks nuttig tussen...", "error")
    end
end)