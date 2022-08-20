DGCore.Commands.Add("fix", "Repair your vehicle (Admin Only)", {}, false, function(source, args)
    TriggerClientEvent('iens:repaira', source)
    TriggerClientEvent('vehiclemod:client:fixEverything', source)
end, "admin")

DGX.Inventory.registerUseable("repairkit", function(src)
    TriggerClientEvent("qb-vehiclefailure:client:RepairVehicle", src)
end)

DGX.Inventory.registerUseable("cleaningkit", function(src)
    TriggerClientEvent("qb-vehiclefailure:client:CleanVehicle", src)
end)

DGX.Inventory.registerUseable("advancedrepairkit", function(src)
    TriggerClientEvent("qb-vehiclefailure:client:RepairVehicleFull", src)
end)

RegisterServerEvent('qb-vehiclefailure:removeItem')
AddEventHandler('qb-vehiclefailure:removeItem', function(item)
    local src = source
    local ply = DGCore.Functions.GetPlayer(src)
    ply.Functions.RemoveItem(item, 1)
end)

RegisterServerEvent('qb-vehiclefailure:server:removewashingkit')
AddEventHandler('qb-vehiclefailure:server:removewashingkit', function(veh)
    local src = source
    local ply = DGCore.Functions.GetPlayer(src)
    ply.Functions.RemoveItem("cleaningkit", 1)
    TriggerClientEvent('qb-vehiclefailure:client:SyncWash', -1, veh)
end)

