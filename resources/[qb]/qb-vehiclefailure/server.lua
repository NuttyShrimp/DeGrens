DGCore.Commands.Add("fix", "Repair your vehicle (Admin Only)", {}, false, function(source, args)
    TriggerClientEvent('iens:repaira', source)
    TriggerClientEvent('vehiclemod:client:fixEverything', source)
end, "admin")

DGCore.Functions.CreateUseableItem("repairkit", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.GetItemBySlot(item.slot) ~= nil then
        TriggerClientEvent("qb-vehiclefailure:client:RepairVehicle", source)
    end
end)

DGCore.Functions.CreateUseableItem("cleaningkit", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.GetItemBySlot(item.slot) ~= nil then
        TriggerClientEvent("qb-vehiclefailure:client:CleanVehicle", source)
    end
end)

DGCore.Functions.CreateUseableItem("advancedrepairkit", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.GetItemBySlot(item.slot) ~= nil then
        TriggerClientEvent("qb-vehiclefailure:client:RepairVehicleFull", source)
    end
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

