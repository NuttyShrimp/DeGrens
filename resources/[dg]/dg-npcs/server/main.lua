<<<<<<< HEAD
=======
DGCore = exports['dg-core']:GetCoreObject()

>>>>>>> nutty
RegisterServerEvent("dg-npc:server:FetchNpcs")
AddEventHandler("dg-npc:server:FetchNpcs", function()
    TriggerClientEvent("dg-npc:client:SetPed", source, Config.NPCS)
end)
