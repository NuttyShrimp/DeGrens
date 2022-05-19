AddEventHandler('onResourceStart', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end

    -- TODO: test these if needed in loop
    SetWeaponsNoAutoswap(true)
    SetWeaponsNoAutoreload(true)
    SetPickupAmmoAmountScaler(0.0)

	cachedIds[#cachedIds+1] = exports['dg-peek']:addFlagEntry('isWeaponCustomizer', {
		options = {
			{
				icon = 'fas fa-spray-can',
				label = 'Tint Wapen',
                action = function()
                    exports['dg-weapons']:openTintMenu()
                end,
				canInteract = function()
					return exports['dg-weapons']:getCurrentWeaponData() and true or false
				end,
			},
		},
		distance = 1
	})
end)

AddEventHandler('onResourceStop', function(resourceName)
    if resourceName ~= GetCurrentResourceName() then return end
    RemoveAllPedWeapons(PlayerPedId(), true)
    exports['dg-peek']:removeFlagEntry(cachedIds)
end)

RegisterNetEvent('weapons:client:UseWeapon', function(pWeaponData)
    local ped = PlayerPedId()
    RemoveAllPedWeapons(ped, true)

    if currentWeaponData then
        local lastWeaponName = currentWeaponData.name
        TriggerEvent('inventory:client:ItemBox', currentWeaponData.name, 'holster')
        holsterWeapon(currentWeaponData)
        currentWeaponData = nil
        if lastWeaponName == pWeaponData.name then return end -- No need to go any further when holstering current weapon
    end

    -- we need to allow them to take broken weapons to be able to use the repair command
    local isBrokenWeapon = false
    if pWeaponData.quality <= 0 then
        exports['dg-ui']:addNotification("Je wapen is kapot...", "error")
        isBrokenWeapon = true
    end

    currentWeaponData = pWeaponData
    currentWeaponData.hash = GetHashKey(currentWeaponData.name)

    local ammoCount = DGCore.Functions.TriggerCallback('weapons:server:GetAmmo', currentWeaponData)
    
    GiveWeaponToPed(ped, currentWeaponData.hash, ammoCount, false, false)
    TriggerEvent('inventory:client:ItemBox', currentWeaponData.name, 'unholster')
    unholsterWeapon(currentWeaponData)
    startWeaponLoop(isBrokenWeapon)
end)

RegisterNetEvent('weapons:client:RemoveWeapon', function(pWeaponName)
    forceRemoveWeapon(pWeaponName)
end)

RegisterNetEvent('weapons:client:UseAmmo', function(pItemData)
    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)
    if not currentWeaponData or not weapon then 
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
        return
    end

    local ammoType = GetPedAmmoTypeFromWeapon_2(ped, weapon) -- _2 always gives basetype even in the rare case of using for example explosive ammo for some reason
    if ammoType ~= Config.Ammo[pItemData.name].ammoType then 
        exports['dg-ui']:addNotification('Dit past niet in je wapen...', 'error')
        return
    end

    local ammoInWeapon = tonumber(GetAmmoInPedWeapon(ped, weapon))
    if ammoInWeapon >= 250 then
        exports['dg-ui']:addNotification('Je wapen zit al vol...', 'error')
        return
    end

    local wasCancelled, _ = exports['dg-misc']:Taskbar("gun",'Wapen laden...',  Config.ReloadTime, {
        canCancel = true,
        cancelOnDeath = true,
        controlDisables = {
            movement = true,
            carMovement = true,
            combat = true,
        },
    })

    if wasCancelled then
        exports['dg-ui']:addNotification('Geannuleerd...', 'error')
        return
    end

    if not currentWeaponData then 
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
        return
    end

    local removedAmmoItem = DGCore.Functions.TriggerCallback('DGCore:RemoveItem', pItemData.name, 1)
    if not removedAmmoItem then
        exports['dg-ui']:addNotification('Je hebt geen ammo bij...', 'error') -- prevent bugabuse by moving item during taskbar
        return
    end

    local amount = DGCore.Functions.TriggerCallback('weapons:server:GetAmmo', currentWeaponData)
    amount = amount + Config.Ammo[pItemData.name].amount
    if amount > 250 then amount = 250 end
    SetPedAmmo(ped, weapon, amount)
    TriggerServerEvent('weapons:server:SetAmmo', currentWeaponData, amount)
end)

RegisterNetEvent('weapons:client:ForceSetAmmo', function(pAmount)
    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)
    if not currentWeaponData or not weapon then 
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
        return
    end

    if pAmount > 250 then pAmount = 250 end
    SetPedAmmo(ped, weapon, pAmount)
    TriggerServerEvent('weapons:server:SetAmmo', currentWeaponData, pAmount)
end)

RegisterNetEvent('weapons:client:ForceSetQuality', function(pQuality)
    if not currentWeaponData then
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
        return
    end
    TriggerServerEvent('weapons:server:ForceSetQuality', currentWeaponData, pQuality)
end)

RegisterNetEvent('weapons:client:UseAttachment', function(pAttachmentName)
    if not currentWeaponData then 
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
        return
    end
    TriggerServerEvent('weapons:server:AddAttachment', currentWeaponData, pAttachmentName)
end)

RegisterNetEvent('weapons:client:UpdateAttachments', function(pAllAttachmentsForWeapon, pComponentsOnWeapon)
    if not currentWeaponData then
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
        return
    end

    local ped = PlayerPedId()
    for _, component in pairs(pAllAttachmentsForWeapon) do
        if HasPedGotWeaponComponent(ped, currentWeaponData.hash, component) then
            RemoveWeaponComponentFromPed(ped, currentWeaponData.hash, component)
        end
    end
    for _, component in pairs(pComponentsOnWeapon) do
        GiveWeaponComponentToPed(ped, currentWeaponData.hash, component)
    end
end)

RegisterNetEvent('weapons:client:OpenAttachmentMenu', function()
    if not currentWeaponData then
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
        return
    end

    local entries = DGCore.Functions.TriggerCallback('weapons:server:GetAttachmentsMenuEntries', currentWeaponData)
    openApplication('contextmenu', entries)
end)

RegisterUICallback('weapons:client:RemoveAttachment', function(data, cb)
    if currentWeaponData then
        TriggerServerEvent('weapons:server:RemoveAttachment', currentWeaponData, data.name)
    else
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
    end

    closeApplication('contextmenu')
    cb({data = {}, meta = {ok = true, message = 'done'}})
end)

RegisterUICallback('weapons:client:SetTint', function(data, cb)
    if currentWeaponData then
        SetPedWeaponTintIndex(PlayerPedId(), currentWeaponData.hash, data.tint)
        TriggerServerEvent('weapons:server:SetTint', currentWeaponData, data.tint)
    else
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
    end
    
    closeApplication('contextmenu')
    cb({data = {}, meta = {ok = true, message = 'done'}})
end)