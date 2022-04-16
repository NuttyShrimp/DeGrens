DGCore.Functions.CreateCallback('weapons:server:shouldHolster', function(source, cb, pWeaponHash)
    if not pWeaponHash then return end
    local shouldHolster = not Weapons[pWeaponHash].noHolstering
    cb(shouldHolster)
end)

DGCore.Functions.CreateCallback('weapons:server:GetAmmo', function(source, cb, pWeaponData)
    if not pWeaponData then return end

    local ammoCount = 0
    if Weapons[pWeaponData.hash].oneTimeUse then
        ammoCount = 1
    elseif Weapons[pWeaponData.hash].unlimitedAmmo then
        ammoCount = 9999
    else
        local Player = DGCore.Functions.GetPlayer(source)
        local itemData = Player.Functions.GetItemBySlot(pWeaponData.slot)
        if itemData then
            ammoCount = itemData.info.ammo or 0
            ammoCount = tonumber(ammoCount)
        end
    end

    cb(ammoCount)
end)

RegisterServerEvent('weapons:server:SetAmmo', function(pWeaponData, pAmmoCount)
    if not pWeaponData or not pAmmoCount then return end

    local Player = DGCore.Functions.GetPlayer(source)
    local itemData = Player.Functions.GetItemBySlot(pWeaponData.slot)
    if not itemData then return end

    Player.PlayerData.items[pWeaponData.slot].info.ammo = pAmmoCount
    Player.Functions.SetInventory(Player.PlayerData.items, true)
end)

RegisterServerEvent('weapons:server:ForceSetQuality', function(pWeaponData, pQuality)
    if not pWeaponData or not pQuality then return end

    local Player = DGCore.Functions.GetPlayer(source)
    local itemData = Player.Functions.GetItemBySlot(pWeaponData.slot)
    if not itemData then return end

    Player.PlayerData.items[pWeaponData.slot].quality = pQuality
    Player.Functions.SetInventory(Player.PlayerData.items, true)
end)

RegisterServerEvent('weapons:server:StoppedShooting', function(pWeaponData, pAmmoCount, pQualityDecrease)
    if not pWeaponData or not pAmmoCount or not pQualityDecrease then return end

    local Player = DGCore.Functions.GetPlayer(source)

    if Weapons[pWeaponData.hash].oneTimeUse then
        --Citizen.Wait(1000) -- TODO test if needed
        Player.Functions.RemoveItem(pWeaponData.name, 1)
        TriggerClientEvent('weapons:client:RemoveWeapon', source)
        return
    end

    local itemData = Player.Functions.GetItemBySlot(pWeaponData.slot)
    if not itemData then return end

    local newQuality = itemData.quality - Weapons[pWeaponData.hash].durabilityMultiplier * pQualityDecrease
    
    if newQuality <= 0 then
        newQuality = 0
        TriggerClientEvent('weapons:client:RemoveWeapon', source)
        TriggerClientEvent('dg-ui:client:addNotification', source, "Je wapen is kapot...", "error")
    end

    Player.PlayerData.items[pWeaponData.slot].quality = newQuality
    Player.PlayerData.items[pWeaponData.slot].info.ammo = pAmmoCount
    Player.Functions.SetInventory(Player.PlayerData.items, true)
end)

RegisterServerEvent('weapons:server:AddAttachment', function(pWeaponData, pAttachmentName)
    if not pWeaponData or not pAttachmentName then return end

    if not Weapons[pWeaponData.hash].attachments or not Weapons[pWeaponData.hash].attachments[pAttachmentName] then
        TriggerClientEvent('dg-ui:client:addNotification', source, "Dit past niet op je wapen...", "error")
        return
    end

    local Player = DGCore.Functions.GetPlayer(source)
    if not Player.PlayerData.items[pWeaponData.slot] then return end

    if not Player.PlayerData.items[pWeaponData.slot].info.components then
        Player.PlayerData.items[pWeaponData.slot].info.components = {}
    end

    local component = Weapons[pWeaponData.hash].attachments[pAttachmentName]
    local components = Player.PlayerData.items[pWeaponData.slot].info.components
    if hasComponent(components, component) then
        TriggerClientEvent('dg-ui:client:addNotification', source, "Je hebt dit al op je wapen...", "error")
        return
    end

    if Player.Functions.GetItemByName(pAttachmentName) then
        Player.PlayerData.items[pWeaponData.slot].info.components[#components+1] = component
        Player.Functions.SetInventory(Player.PlayerData.items, true)
        Player.Functions.RemoveItem(pAttachmentName, 1)
        TriggerClientEvent('inventory:client:ItemBox', source, pAttachmentName, 'remove')

        local allAttachmentsForWeapon = Weapons[pWeaponData.hash].attachments
        local componentsOnWeapon = Player.PlayerData.items[pWeaponData.slot].info.components
        TriggerClientEvent('weapons:client:UpdateAttachments', source, allAttachmentsForWeapon, componentsOnWeapon)
    end
end)

DGCore.Functions.CreateCallback('weapons:server:GetAttachmentsMenuEntries', function(source, cb, pWeaponData)
    local entries = {
        {
            title = 'Attachments',
            description = 'Selecteer een attachment om deze te verwijderen.',
        },
    }

    if pWeaponData then
        local components = {}
        local Player = DGCore.Functions.GetPlayer(source)
        if Player.PlayerData.items[pWeaponData.slot] then
            components = Player.PlayerData.items[pWeaponData.slot].info.components or {}
        end

        for _, component in pairs(components) do
            local attachmentName = getAttachmentNameFromWeaponComponent(pWeaponData.hash, component)
            entries[#entries+1] = {
                title = exports['dg-inventory']:GetItemData(attachmentName).label,
                icon = 'trash',
                callbackURL = 'weapons:client:RemoveAttachment',
                data = {
                    name = attachmentName,
                }
            }
        end
    end
    cb(entries)
end)

RegisterServerEvent('weapons:server:RemoveAttachment', function(pWeaponData, pAttachmentName)
    if not pWeaponData or not pAttachmentName then return end

    local Player = DGCore.Functions.GetPlayer(source)
    if not Player.PlayerData.items[pWeaponData.slot] then return end

    local component = Weapons[pWeaponData.hash].attachments[pAttachmentName]
    local components = Player.PlayerData.items[pWeaponData.slot].info.components
    local index = hasComponent(components, component)
    if not index then return end

    table.remove(Player.PlayerData.items[pWeaponData.slot].info.components, index)
    Player.Functions.SetInventory(Player.PlayerData.items, true)
    Player.Functions.AddItem(pAttachmentName, 1)
    TriggerClientEvent('inventory:client:ItemBox', source, pAttachmentName, 'add')

    local allAttachmentsForWeapon = Weapons[pWeaponData.hash].attachments
    local componentsOnWeapon = Player.PlayerData.items[pWeaponData.slot].info.components
    TriggerClientEvent('weapons:client:UpdateAttachments', source, allAttachmentsForWeapon, componentsOnWeapon)
end)

RegisterServerEvent('weapons:server:SetTint', function(pWeaponData, pTint)
    if not pWeaponData or not pTint then return end

    local Player = DGCore.Functions.GetPlayer(source)
    if not Player.PlayerData.items[pWeaponData.slot] then return end

    Player.PlayerData.items[pWeaponData.slot].info.tint = pTint
    Player.Functions.SetInventory(Player.PlayerData.items, true)
end)