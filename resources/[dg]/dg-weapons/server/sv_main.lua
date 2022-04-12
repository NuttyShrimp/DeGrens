DGCore.Functions.CreateCallback("weapons:server:GetConfig", function(source, cb)
    cb(Config.RepairData)
end)

DGCore.Functions.CreateCallback("weapons:server:GetWeaponAmmo", function(source, cb, WeaponData)
    local Player = DGCore.Functions.GetPlayer(source)
    local retval = 0

    if WeaponData then
        if Player then
            local ItemData = Player.Functions.GetItemBySlot(WeaponData.slot)

            if ItemData then
                retval = ItemData.info.ammo and ItemData.info.ammo or 0
            end
        end
    end

    cb(retval)
end)

DGCore.Functions.CreateCallback("weapons:server:RemoveAttachment", function(source, cb, AttachmentData, ItemData)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local Inventory = Player.PlayerData.items
    local AttachmentComponent = WeaponAttachments[ItemData.name:upper()][AttachmentData.attachment]

    if Inventory[ItemData.slot] then
        if Inventory[ItemData.slot].info.attachments and next(Inventory[ItemData.slot].info.attachments) then
            local HasAttach, key = HasAttachment(AttachmentComponent.component, Inventory[ItemData.slot].info.attachments)

            if HasAttach then
                table.remove(Inventory[ItemData.slot].info.attachments, key)
                Player.Functions.SetInventory(Player.PlayerData.items, true)
                Player.Functions.AddItem(AttachmentComponent.item, 1)
                TriggerClientEvent("inventory:client:ItemBox", src, AttachmentComponent.item, "add")
                cb(Inventory[ItemData.slot].info.attachments)
            else
                cb(false)
            end
        else
            cb(false)
        end
    else
        cb(false)
    end
end)

DGCore.Functions.CreateCallback("weapons:server:RepairWeapon", function(source, cb, data)
    local src = source

    if not Config.RepairData.IsFinished and not Config.RepairData.IsRepairing then
        local Player = DGCore.Functions.GetPlayer(src)
    
        if Player.PlayerData.items[data.slot] then
            if Player.PlayerData.items[data.slot].quality and Player.PlayerData.items[data.slot].quality ~= 100 then
                if exports['dg-financials']:removeCash(src, Config.RepairCost, 'Weapon repair') then
                    Config.RepairData.IsRepairing = true
                    Config.RepairData.Weapon = Player.PlayerData.items[data.slot]
    
                    Player.Functions.RemoveItem(data.name, 1, data.slot)
                    TriggerClientEvent("inventory:client:ItemBox", src, data.name, "remove")
                    TriggerClientEvent("weapons:client:SyncRepairData", -1, Config.RepairData)
    
                    Citizen.SetTimeout(7 * 1 * 1000, function()
                        Config.RepairData.IsRepairing = false
                        Config.RepairData.IsFinished = true
                        TriggerClientEvent("weapons:client:SyncRepairData", -1, Config.RepairData)

												exports["dg-phone"]:addOfflineMail(
														Player.PlayerData.citizenid,
														"Wapenreparatie",
														"Tyrone",
														("Je %s is gerepareerd, je kan het komen ophalen."):format(exports["dg-inventory"]:GetItemData(data.name).label)
												)
                    end)
    
                    cb(true)
                else
                    TriggerClientEvent("DGCore:Notify", src, "Niet genoeg cash...", "error")
                    cb(false)
                end
            else
                TriggerClientEvent("DGCore:Notify", src, "Dit wapen is al gerepareerd...", "error")
                cb(false)
            end
        else
            cb(false)
        end
    end
end)

-- Commands

DGCore.Commands.Add("repairweapon", "Repair Weapon (Admin Only)", {{name="hp", help="HP of the weapon"}}, true, function(source, args)
    TriggerClientEvent("weapons:client:SetWeaponQuality", source, tonumber(args[1]))
end, "admin")

DGCore.Commands.Add("setammo", "Zet ammo hoeveelheid (Admin Only)", {{name="amount", help="Aantal, bv: 20"}}, false, function(source, args)
    TriggerClientEvent("weapons:client:SetAmmoManual", source, tonumber(args[1]))
end, "admin")

-- Ammo
DGCore.Functions.CreateUseableItem("pistol_ammo", function(source, item)
    TriggerClientEvent("weapons:client:AddAmmo", source, "AMMO_PISTOL", Config.ReloadAmount, item)
end)

DGCore.Functions.CreateUseableItem("smg_ammo", function(source, item)
    TriggerClientEvent("weapons:client:AddAmmo", source, "AMMO_SMG", Config.ReloadAmount, item)
end)

DGCore.Functions.CreateUseableItem("shotgun_ammo", function(source, item)
    TriggerClientEvent("weapons:client:AddAmmo", source, "AMMO_SHOTGUN", Config.ReloadAmount, item)
end)

DGCore.Functions.CreateUseableItem("rifle_ammo", function(source, item)
    TriggerClientEvent("weapons:client:AddAmmo", source, "AMMO_RIFLE", Config.ReloadAmount, item)
end)

DGCore.Functions.CreateUseableItem("mg_ammo", function(source, item)
    TriggerClientEvent("weapons:client:AddAmmo", source, "AMMO_MG", Config.ReloadAmount, item)
end)

DGCore.Functions.CreateUseableItem("sniper_ammo", function(source, item)
    TriggerClientEvent("weapons:client:AddAmmo", source, "AMMO_SNIPER", Config.ReloadAmount, item)
end)

-- Visuals
DGCore.Functions.CreateUseableItem("luxuryfinish", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "luxuryfinish")
end)

DGCore.Functions.CreateUseableItem("grip", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "grip")
end)

DGCore.Functions.CreateUseableItem("flashlight", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "flashlight")
end)

-- Extended clips
DGCore.Functions.CreateUseableItem("pistol_extendedclip", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "extendedclip")
end)

DGCore.Functions.CreateUseableItem("smg_extendedclip", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "extendedclip")
end)

DGCore.Functions.CreateUseableItem("shotgun_extendedclip", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "extendedclip")
end)

DGCore.Functions.CreateUseableItem("rifle_extendedclip", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "extendedclip")
end)

DGCore.Functions.CreateUseableItem("mg_extendedclip", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "extendedclip")
end)

DGCore.Functions.CreateUseableItem("sniper_extendedclip", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "extendedclip")
end)

-- Suppressors
DGCore.Functions.CreateUseableItem("pistol_suppressor", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "suppressor")
end)

DGCore.Functions.CreateUseableItem("smg_suppressor", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "suppressor")
end)

DGCore.Functions.CreateUseableItem("shotgun_suppressor", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "suppressor")
end)

DGCore.Functions.CreateUseableItem("rifle_suppressor", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "suppressor")
end)

DGCore.Functions.CreateUseableItem("sniper_suppressor", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "suppressor")
end)

-- Scopes
DGCore.Functions.CreateUseableItem("smg_scope", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "scope")
end)

DGCore.Functions.CreateUseableItem("rifle_scope", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "scope")
end)

DGCore.Functions.CreateUseableItem("sniper_scope", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "scope")
end)

-- Drums
DGCore.Functions.CreateUseableItem("smg_drum", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "drum")
end)

DGCore.Functions.CreateUseableItem("shotgun_drum", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "drum")
end)

DGCore.Functions.CreateUseableItem("rifle_drum", function(source, item)
    TriggerClientEvent("weapons:client:EquipAttachment", source, item, "drum")
end)