local alarmTriggered = false
local certificateAmount = 43

RegisterServerEvent('qb-ifruitstore:server:LoadLocationList')
AddEventHandler('qb-ifruitstore:server:LoadLocationList', function()
    local src = source 
    TriggerClientEvent("qb-ifruitstore:server:LoadLocationList", src, Config.Locations)
end)

RegisterServerEvent('qb-ifruitstore:server:setSpotState')
AddEventHandler('qb-ifruitstore:server:setSpotState', function(stateType, state, spot)
    if stateType == "isBusy" then
        Config.Locations["takeables"][spot].isBusy = state
    elseif stateType == "isDone" then
        Config.Locations["takeables"][spot].isDone = state
    end
    TriggerClientEvent('qb-ifruitstore:client:setSpotState', -1, stateType, state, spot)
end)

RegisterServerEvent('qb-ifruitstore:server:SetThermiteStatus')
AddEventHandler('qb-ifruitstore:server:SetThermiteStatus', function(stateType, state)
    if stateType == "isBusy" then
        Config.Locations["thermite"].isBusy = state
    elseif stateType == "isDone" then
        Config.Locations["thermite"].isDone = state
    end
    TriggerClientEvent('qb-ifruitstore:client:SetThermiteStatus', -1, stateType, state)
end)

RegisterServerEvent('qb-ifruitstore:server:SafeReward')
AddEventHandler('qb-ifruitstore:server:SafeReward', function()
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    Player.Functions.AddMoney('cash', math.random(1500, 2000), "robbery-ifruit")
    Player.Functions.AddItem("certificate", certificateAmount)
    TriggerClientEvent('inventory:client:ItemBox', src, "certificate", "add")
    Citizen.Wait(500)
    local luck = math.random(1, 100)
    if luck <= 10 then
        Player.Functions.AddItem("goldbar", math.random(1, 2))
        TriggerClientEvent('inventory:client:ItemBox', src, "goldbar", "add")
    end
end)

RegisterServerEvent('qb-ifruitstore:server:SetSafeStatus')
AddEventHandler('qb-ifruitstore:server:SetSafeStatus', function(stateType, state)
    if stateType == "isBusy" then
        Config.Locations["safe"].isBusy = state
    elseif stateType == "isDone" then
        Config.Locations["safe"].isDone = state
    end
    TriggerClientEvent('qb-ifruitstore:client:SetSafeStatus', -1, stateType, state)
end)

RegisterServerEvent('qb-ifruitstore:server:itemReward')
AddEventHandler('qb-ifruitstore:server:itemReward', function(spot)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local item = Config.Locations["takeables"][spot].reward

    if Player.Functions.AddItem(item.name, item.amount) then
        TriggerClientEvent('inventory:client:ItemBox', src, item.name, 'add')
    else
        TriggerClientEvent('DGCore:Notify', src, 'You have to much in your pocket ..', 'error')
    end    
end)

RegisterServerEvent('qb-ifruitstore:server:PoliceAlertMessage')
AddEventHandler('qb-ifruitstore:server:PoliceAlertMessage', function(msg, coords, blip)
    local src = source
    for k, v in pairs(DGCore.Functions.GetPlayers()) do
        local Player = DGCore.Functions.GetPlayer(v)
        if Player ~= nil then 
            if (Player.PlayerData.job.name == "police") then  
                TriggerClientEvent("qb-ifruitstore:client:PoliceAlertMessage", v, msg, coords, blip) 
            end
        end
    end
end)

RegisterServerEvent('qb-ifruitstore:server:callCops')
AddEventHandler('qb-ifruitstore:server:callCops', function(streetLabel, coords)
    local place = "iFruitStore"
    local msg = "The Alram has been activated at the "..place.. " at " ..streetLabel

    TriggerClientEvent("qb-ifruitstore:client:robberyCall", -1, streetLabel, coords)

end)