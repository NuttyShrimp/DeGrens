RegisterNetEvent("weapons:server:SetWeaponQuality", function(data, hp)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local WeaponSlot = Player.PlayerData.items[data.slot]
    WeaponSlot.quality = hp
    Player.Functions.SetInventory(Player.PlayerData.items, true)
end)

RegisterNetEvent("weapons:server:UpdateWeaponQuality", function(data, durabilityDecrease)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local WeaponSlot = Player.PlayerData.items[data.slot]
    local decreaseAmount = Config.DurabilityMultiplier[data.name] and Config.DurabilityMultiplier[data.name] or 0.15

    if WeaponSlot then
        if not IsWeaponBlocked(data.name) then
            if not WeaponSlot.quality then
                WeaponSlot.quality = 100
            end

            local durability = WeaponSlot.quality - decreaseAmount * durabilityDecrease

            if durability > 0 then
                WeaponSlot.quality = durability
            else
                WeaponSlot.quality = 0
                TriggerClientEvent("weapons:client:UseWeapon", src, data, false)
                TriggerClientEvent("DGCore:Notify", src, "Je wapen is kapot.", "error")
            end
        end
    end

    Player.Functions.SetInventory(Player.PlayerData.items, true)
end)

RegisterNetEvent("weapons:server:SaveWeaponAmmo", function(currentWeaponData, amount)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)

    if currentWeaponData then
        if Player.PlayerData.items[currentWeaponData.slot] then
            Player.PlayerData.items[currentWeaponData.slot].info.ammo = amount
        end
        Player.Functions.SetInventory(Player.PlayerData.items, true)
    end
end)

RegisterNetEvent("weapons:server:EquipAttachment", function(ItemData, currentWeaponData, AttachmentData)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local Inventory = Player.PlayerData.items

    if Inventory[currentWeaponData.slot] then
        if Inventory[currentWeaponData.slot].info.attachments and next(Inventory[currentWeaponData.slot].info.attachments) then
            if HasAttachment(AttachmentData.component, Inventory[currentWeaponData.slot].info.attachments) then
                TriggerClientEvent("DGCore:Notify", src, "Je hebt deze attachment al op je wapen.", "error", 3500)
            end
        else
            Inventory[currentWeaponData.slot].info.attachments = {}
        end

        Inventory[currentWeaponData.slot].info.attachments[#Inventory[currentWeaponData.slot].info.attachments + 1] = {
            component = AttachmentData.component,
            label = AttachmentData.label,
            item = AttachmentData.item,
        }
    
        TriggerClientEvent("weapons:client:AddAttachment", src, AttachmentData.component)
        Player.Functions.SetInventory(Player.PlayerData.items, true)
        Player.Functions.RemoveItem(ItemData.name, 1)
    
        SetTimeout(1000, function()
            TriggerClientEvent("inventory:client:ItemBox", src, ItemData.name, "remove")
        end)
    end
end)

RegisterNetEvent("weapons:server:ApplyTint", function(currentWeaponData, tint)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local Inventory = Player.PlayerData.items

    if currentWeaponData then
        if Inventory[currentWeaponData.slot] then
            Inventory[currentWeaponData.slot].info.tint = tint
        end
        Player.Functions.SetInventory(Player.PlayerData.items, true)
    end
end)

RegisterNetEvent("weapons:server:TakeBackWeapon", function(data)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local itemData = Config.RepairData.Weapon
    itemData.quality = 100
    Player.Functions.AddItem(itemData.name, 1, false, itemData.info)
    TriggerClientEvent("inventory:client:ItemBox", src, itemData.name, "add")
    Config.RepairData.IsFinished = false
    Config.RepairData.Weapon = {}
    TriggerClientEvent("weapons:client:SyncRepairData", -1, Config.RepairData)
end)