DGCore.Functions.CreateUseableItem("joint", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:UseJoint", source)
    end
end)

DGCore.Functions.CreateUseableItem("armor", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("consumables:client:UseArmor", source)
end)

DGCore.Functions.CreateUseableItem("heavyarmor", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("consumables:client:UseHeavyArmor", source)
end)

-- DGCore.Functions.CreateUseableItem("smoketrailred", function(source, item)
--     local Player = DGCore.Functions.GetPlayer(source)
-- 	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
--         TriggerClientEvent("consumables:client:UseRedSmoke", source)
--     end
-- end)

DGCore.Functions.CreateUseableItem("parachute", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:UseParachute", source)
    end
end)

DGCore.Commands.Add("resetparachute", "Resets Parachute", {}, false, function(source, args)
    local Player = DGCore.Functions.GetPlayer(source)
        TriggerClientEvent("consumables:client:ResetParachute", source)
end)

RegisterServerEvent("qb-smallpenis:server:AddParachute")
AddEventHandler("qb-smallpenis:server:AddParachute", function()
    local src = source
    local Ply = DGCore.Functions.GetPlayer(src)

    Ply.Functions.AddItem("parachute", 1)
end)

DGCore.Functions.CreateUseableItem("water_bottle", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Drink", source, item.name)
    end
end)

DGCore.Functions.CreateUseableItem("vodka", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("consumables:client:DrinkAlcohol", source, item.name)
end)

DGCore.Functions.CreateUseableItem("beer", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("consumables:client:DrinkAlcohol", source, item.name)
end)

DGCore.Functions.CreateUseableItem("whiskey", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("consumables:client:DrinkAlcohol", source, item.name)
end)

DGCore.Functions.CreateUseableItem("coffee", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Drink", source, item.name)
    end
end)

DGCore.Functions.CreateUseableItem("kurkakola", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Drink", source, item.name)
    end
end)

DGCore.Functions.CreateUseableItem("sandwich", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Eat", source, item.name)
    end
end)

DGCore.Functions.CreateUseableItem("twerks_candy", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Eat", source, item.name)
    end
end)

DGCore.Functions.CreateUseableItem("snikkel_candy", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Eat", source, item.name)
    end
end)

DGCore.Functions.CreateUseableItem("tosti", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Eat", source, item.name)
    end
end)

DGCore.Functions.CreateUseableItem("binoculars", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("binoculars:Toggle", source)
end)

DGCore.Functions.CreateUseableItem("cokebaggy", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("consumables:client:Cokebaggy", source)
end)

DGCore.Functions.CreateUseableItem("crack_baggy", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("consumables:client:Crackbaggy", source)
end)

DGCore.Functions.CreateUseableItem("xtcbaggy", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("consumables:client:EcstasyBaggy", source)
end)

DGCore.Functions.CreateUseableItem("firework1", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("fireworks:client:UseFirework", source, item.name, "proj_indep_firework")
end)

DGCore.Functions.CreateUseableItem("firework2", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("fireworks:client:UseFirework", source, item.name, "proj_indep_firework_v2")
end)

DGCore.Functions.CreateUseableItem("firework3", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("fireworks:client:UseFirework", source, item.name, "proj_xmas_firework")
end)

DGCore.Functions.CreateUseableItem("firework4", function(source, item)
    local Player = DGCore.Functions.GetPlayer(source)
    TriggerClientEvent("fireworks:client:UseFirework", source, item.name, "scr_indep_fireworks")
end)

DGCore.Commands.Add("resetarmor", "Resets Vest (Police Only)", {}, false, function(source, args)
    local Player = DGCore.Functions.GetPlayer(source)
    if Player.PlayerData.job.name == "police" then
        TriggerClientEvent("consumables:client:ResetArmor", source)
    else
        TriggerClientEvent('DGCore:Notify', source,  "For Emergency Service Only", "error")
    end
end)