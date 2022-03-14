local DGCore = exports['dg-core']:GetCoreObject()
local allScenes = {}

DGCore.Functions.CreateCallback('dg-scenes:server:GetAllScenes', function(source, cb)
    cb(scenes)
end)

RegisterServerEvent('dg-scenes:server:Create', function(data)
    local id = #allScenes+1
    allScenes[id] = data
    TriggerClientEvent('dg-scenes:client:UpdateAllScenes', -1, allScenes)

    Citizen.SetTimeout(Config.Time, function()
        allScenes[id] = nil
        TriggerClientEvent('dg-scenes:client:UpdateAllScenes', -1, allScenes)
    end)
end)

RegisterServerEvent('dg-scenes:server:Delete', function(id)
    allScenes[id] = nil
    TriggerClientEvent('dg-scenes:client:UpdateAllScenes', -1, allScenes)
end)