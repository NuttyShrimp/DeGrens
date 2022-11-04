activePlants = {}

config = {}
configLoaded = false

Citizen.CreateThread(function()
    while not exports['dg-config']:areConfigsReady() do Wait(10) end
    config = exports['dg-config']:getModuleConfig('weed')
    configLoaded = true

    -- TODO: Put gender in item metadata
    for gender, itemName in pairs(config.seeds) do
        DGX.Inventory.registerUseable(itemName, function(src)
            TriggerClientEvent("dg-weed:client:Plant", src, gender)
        end)
    end
end)

DGCore.Functions.CreateCallback('dg-weed:server:getConfig', function(src, cb)
    while not configLoaded do Wait(10) end
    cb(config)
end)

DGX.Inventory.registerUseable("weed_bud", function(src, item)
    local hasBags = DGX.Inventory.doesPlayerHaveItems(src, "empty_bags")
    if not bagInfo then
      DGX.Notifications.add(src, "Waar ga je dit insteken?", "error")
        return
    end

    -- TODO: Update to metadata
    if os.time() >= item.createtime + (config.dry.timeout * 60 * 60) then
        local amount = math.random(config.dry.amount.min, config.dry.amount.max)
        if amount > bagInfo.amount then
            amount = bagInfo.amount
        end

        DGX.Inventory.removeItemFromPlayer(src, "empty_bags")
        DGX.Inventory.removeItemFromPlayer(src, item.name)

        DGX.Inventory.addItemToPlayer(src, 'weed_bag', amount)
    else
      DGX.Notifications.add(src, "Dit is nog niet droog", "error")
    end
end)

DGCore.Functions.CreateCallback("dg-weed:server:GetPlants", function(src, cb)
    cb(activePlants)
end)

-- growth cycle
Citizen.CreateThread(function()
    while not configLoaded do Wait(10) end

    while true do
        for index, plant in pairs(activePlants) do
            local currentTime = os.time()
            if plant.data.stage < #config.stages and currentTime >= plant.data.growtime + (config.growTime * 60 * 60) then -- if not endstage and enough time has passed
                activePlants[index].data.stage = plant.data.stage + 1
                activePlants[index].data.growtime = currentTime
            end
        end

        updatePlantData()
        Citizen.Wait(10 * 60 * 1000) -- check every 10 min
    end
end)

-- food cycle
Citizen.CreateThread(function()
    while not configLoaded do Wait(10) end

    while true do 
        for index, plant in pairs(activePlants) do
            activePlants[index].data.food = plant.data.food - 1

            if activePlants[index].data.food <= 0 then
                removePlant(index)
            end
        end

        updatePlantData()
        Citizen.Wait(config.food.decayTime * 60 * 1000)
    end
end)

DGCore.Functions.CreateCallback("dg-weed:server:CanCut", function(source, cb, index)
    cb(canCut(index))
end)