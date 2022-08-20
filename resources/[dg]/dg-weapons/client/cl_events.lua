AddEventHandler('onClientResourceStart', function(resourceName)
  if resourceName ~= GetCurrentResourceName() then return end

  -- TODO: test this if needed in loop
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
    if currentWeaponData then
      DGX.Inventory.toggleObject(currentWeaponData.id, true)
    end
    RemoveAllPedWeapons(PlayerPedId(), true)
    exports['dg-peek']:removeFlagEntry(cachedIds)
end)

RegisterNetEvent('weapons:client:UseWeapon', function(pWeaponData)
    local ped = PlayerPedId()
    RemoveAllPedWeapons(ped, true)

    if currentWeaponData then
      local lastWeaponId = currentWeaponData.id
      holsterWeapon(currentWeaponData)
      currentWeaponData = nil
      if lastWeaponId == pWeaponData.id then return end -- No need to go any further when holstering current weapon
    end

    currentWeaponData = pWeaponData
    local ammoCount = DGCore.Functions.TriggerCallback('weapons:server:GetAmmo', currentWeaponData)
    
    GiveWeaponToPed(ped, currentWeaponData.hash, ammoCount, false, false)
    unholsterWeapon(currentWeaponData)
    startWeaponLoop()
end)

RegisterNetEvent('weapons:client:UseAmmo', function(pItemName)
    local ped = PlayerPedId()
    local weapon = GetSelectedPedWeapon(ped)
    if not currentWeaponData or not weapon then 
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
        return
    end

    local ammoType = GetPedAmmoTypeFromWeapon_2(ped, weapon) -- _2 always gives basetype even in the rare case of using for example explosive ammo for some reason
    if ammoType ~= GetHashKey(ammoConfig[pItemName].ammoType) then 
        exports['dg-ui']:addNotification('Dit past niet in je wapen...', 'error')
        return
    end

    local ammoInWeapon = tonumber(GetAmmoInPedWeapon(ped, weapon))
    if ammoInWeapon >= 250 then
        exports['dg-ui']:addNotification('Je wapen zit al vol...', 'error')
        return
    end

    local wasCancelled, _ = exports['dg-misc']:Taskbar("gun",'Wapen laden...',  7000, {
        canCancel = true,
        cancelOnDeath = true,
        controlDisables = {
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

    local removedAmmoItem = DGX.Inventory.removeItemFromPlayer(pItemName)
    if not removedAmmoItem then
        exports['dg-ui']:addNotification('Je hebt geen ammo bij...', 'error') -- prevent bugabuse by moving item during taskbar
        return
    end

    local amount = DGCore.Functions.TriggerCallback('weapons:server:GetAmmo', currentWeaponData)
    amount = amount + ammoConfig[pItemName].amount
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

RegisterNetEvent('weapons:client:UseAttachment', function(pAttachmentId)
    if not currentWeaponData then 
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
        return
    end
    TriggerServerEvent('weapons:server:AddAttachment', currentWeaponData, pAttachmentId)
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
        TriggerServerEvent('weapons:server:SetTint', currentWeaponData, tintColorNames[data.tint])
    else
        exports['dg-ui']:addNotification('Je hebt geen wapen vast...', 'error')
    end
    
    closeApplication('contextmenu')
    cb({data = {}, meta = {ok = true, message = 'done'}})
end)

RegisterNetEvent('weapons:client:removedWeaponItem', function(weaponId)
  forceRemoveWeapon(weaponId, true)
end)