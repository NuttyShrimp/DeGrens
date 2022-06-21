activePlants = {}

config = {}
configLoaded = false

Citizen.CreateThread(function()
    while not exports['dg-config']:areConfigsReady() do Wait(10) end
    config = exports['dg-config']:getModuleConfig('weed')
    configLoaded = true

    for gender, itemName in pairs(config.seeds) do
        DGCore.Functions.CreateUseableItem(itemName, function(source, item)
            local Player = DGCore.Functions.GetPlayer(source)
            if not Player.Functions.GetItemByName(item.name) then return end
            TriggerClientEvent("dg-weed:client:Plant", source, gender)
        end)
    end
end)

DGCore.Functions.CreateCallback('dg-weed:server:getConfig', function(src, cb)
    while not configLoaded do Wait(10) end
    cb(config)
end)

DGCore.Functions.CreateUseableItem("weed_bud", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    if not Player.Functions.GetItemByName(item.name) then return end
    
    local bagInfo = Player.Functions.GetItemByName("empty_bag")
    if not bagInfo then
        TriggerClientEvent("DGCore:Notify", source, "Waar ga je dit insteken?", "error")
        return
    end

    if os.time() >= item.createtime + config.dry.timeout then
        local amount = math.random(config.dry.amount.min, config.dry.amount.max)
        if amount > bagInfo.amount then
            amount = bagInfo.amount
        end

        Player.Functions.RemoveItem("empty_bag", amount)
        TriggerClientEvent("inventory:client:ItemBox", source, "empty_bag", "remove")
        Player.Functions.RemoveItem(item.name, 1)
        TriggerClientEvent("inventory:client:ItemBox", source, item.name, "remove")

        Player.Functions.AddItem("weed_bag", amount)
        TriggerClientEvent("inventory:client:ItemBox", source, "weed_bag", "add")
    else
        TriggerClientEvent("DGCore:Notify", source, "Dit is nog niet droog", "error")
    end
end)

DGCore.Functions.CreateCallback("dg-weed:server:GetPlants", function(source, cb)
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
        Citizen.Wait(1000 * 60 * 10) -- check every 10 min
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
        Citizen.Wait(config.food.decayTime)
    end
end)

DGCore.Functions.CreateCallback("dg-weed:server:CanCut", function(source, cb, index)
    cb(canCut(index))
end)