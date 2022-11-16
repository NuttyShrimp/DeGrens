DGX.Inventory.registerUseable("joint", function(src, item)
    local Player = DGCore.Functions.GetPlayer(src)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:UseJoint", src)
    end
end)

DGX.Inventory.registerUseable("armor", function(src)
    TriggerClientEvent("consumables:client:UseArmor", src)
end)

DGX.Inventory.registerUseable("heavyarmor", function(src)
    TriggerClientEvent("consumables:client:UseHeavyArmor", src)
end)

-- DGX.Inventory.registerUseable("smoketrailred", function(src, item)
--     local Player = DGCore.Functions.GetPlayer(src)
-- 	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
--         TriggerClientEvent("consumables:client:UseRedSmoke", src)
--     end
-- end)

DGX.Inventory.registerUseable("parachute", function(src, item)
    local Player = DGCore.Functions.GetPlayer(src)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:UseParachute", src)
    end
end)

DGCore.Commands.Add("resetparachute", "Resets Parachute", {}, false, function(src, args)
    local Player = DGCore.Functions.GetPlayer(src)
        TriggerClientEvent("consumables:client:ResetParachute", src)
end)

RegisterServerEvent("qb-smallpenis:server:AddParachute")
AddEventHandler("qb-smallpenis:server:AddParachute", function()
    local src = src
    local Ply = DGCore.Functions.GetPlayer(src)

    -- Ply.Functions.AddItem("parachute", 1)
end)

DGX.Inventory.registerUseable("water_bottle", function(src, item)
    local Player = DGCore.Functions.GetPlayer(src)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Drink", src, item.name)
    end
end)

DGX.Inventory.registerUseable("vodka", function(src, item)
    TriggerClientEvent("consumables:client:DrinkAlcohol", src, item.name)
end)

DGX.Inventory.registerUseable("beer", function(src, item)
    TriggerClientEvent("consumables:client:DrinkAlcohol", src, item.name)
end)

DGX.Inventory.registerUseable("whiskey", function(src, item)
    TriggerClientEvent("consumables:client:DrinkAlcohol", src, item.name)
end)

DGX.Inventory.registerUseable("coffee", function(src, item)
    local Player = DGCore.Functions.GetPlayer(src)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Drink", src, item.name)
    end
end)

DGX.Inventory.registerUseable("kurkakola", function(src, item)
    local Player = DGCore.Functions.GetPlayer(src)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Drink", src, item.name)
    end
end)

DGX.Inventory.registerUseable("sandwich", function(src, item)
    local Player = DGCore.Functions.GetPlayer(src)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Eat", src, item.name)
    end
end)

DGX.Inventory.registerUseable("twerks_candy", function(src, item)
    local Player = DGCore.Functions.GetPlayer(src)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Eat", src, item.name)
    end
end)

DGX.Inventory.registerUseable("snikkel_candy", function(src, item)
    local Player = DGCore.Functions.GetPlayer(src)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Eat", src, item.name)
    end
end)

DGX.Inventory.registerUseable("tosti", function(src, item)
    local Player = DGCore.Functions.GetPlayer(src)
	if Player.Functions.RemoveItem(item.name, 1, item.slot) then
        TriggerClientEvent("consumables:client:Eat", src, item.name)
    end
end)

DGX.Inventory.registerUseable("cokebaggy", function(src, item)
    TriggerClientEvent("consumables:client:Cokebaggy", src)
end)

DGX.Inventory.registerUseable("crack_baggy", function(src, item)
    TriggerClientEvent("consumables:client:Crackbaggy", src)
end)

DGX.Inventory.registerUseable("xtcbaggy", function(src, item)
    TriggerClientEvent("consumables:client:EcstasyBaggy", src)
end)

DGX.Inventory.registerUseable("firework1", function(src, item)
    TriggerClientEvent("fireworks:client:UseFirework", src, item.name, "proj_indep_firework")
end)

DGX.Inventory.registerUseable("firework2", function(src, item)
    TriggerClientEvent("fireworks:client:UseFirework", src, item.name, "proj_indep_firework_v2")
end)

DGX.Inventory.registerUseable("firework3", function(src, item)
    TriggerClientEvent("fireworks:client:UseFirework", src, item.name, "proj_xmas_firework")
end)

DGX.Inventory.registerUseable("firework4", function(src, item)
    TriggerClientEvent("fireworks:client:UseFirework", src, item.name, "scr_indep_fireworks")
end)