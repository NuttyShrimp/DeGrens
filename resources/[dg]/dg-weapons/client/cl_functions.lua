exports('getCurrentWeaponData', function()
    return currentWeaponData
end)

loadAnimDict = function(dict)
    RequestAnimDict(dict)
	while not HasAnimDictLoaded(dict) do
		Citizen.Wait(5)
	end
end

holsterWeapon = function(pWeaponData)
    local ped = PlayerPedId()

    if not DGCore.Functions.TriggerCallback('weapons:server:shouldHolster', pWeaponData.hash) then 
        removeWeapon(pWeaponData)
        return 
    end

    local blockShootingWhileHolstering = true
    Citizen.CreateThread(function()
        while blockShootingWhileHolstering do
			      DisableControlAction(0, 25, true)
            DisableControlAction(0, 68, true)
            DisableControlAction(0, 91, true)
			      DisablePlayerFiring(PlayerPedId(), true)
            Citizen.Wait(0)
        end
    end)

    if exports['dg-jobs']:getCurrentJob().name == 'police' then
        loadAnimDict('reaction@intimidation@cop@unarmed')
        TaskPlayAnimAdvanced(ped, 'reaction@intimidation@cop@unarmed', 'intro', GetEntityCoords(ped, true), 0, 0, GetEntityHeading(ped), 3.0, 3.0, -1, 50, 0, 0, 0)
        Citizen.Wait(500)
        StopAnimTask(ped, 'reaction@intimidation@cop@unarmed',  'intro', 1.0)
    else
        loadAnimDict('reaction@intimidation@1h')
        TaskPlayAnimAdvanced(ped, 'reaction@intimidation@1h', 'outro', GetEntityCoords(ped, true), 0, 0, GetEntityHeading(ped), 8.0, 3.0, -1, 50, 0, 0, 0)
        Citizen.Wait(1400)
        StopAnimTask(ped, 'reaction@intimidation@1h',  'outro', 1.0)
    end

    removeWeapon(pWeaponData)
    blockShootingWhileHolstering = false
end

unholsterWeapon = function(pWeaponData)
    local ped = PlayerPedId()

    if not DGCore.Functions.TriggerCallback('weapons:server:shouldHolster', pWeaponData.hash) then 
        setWeapon(pWeaponData)
        return 
    end

    local blockShootingWhileHolstering = true
    Citizen.CreateThread(function()
        while blockShootingWhileHolstering do
			      DisableControlAction(0, 25, true)
            DisableControlAction(0, 68, true)
            DisableControlAction(0, 91, true)
			      DisablePlayerFiring(PlayerPedId(), true)
            Citizen.Wait(0)
        end
    end)

    if exports['dg-jobs']:getCurrentJob().name == 'police' then
        loadAnimDict('rcmjosh4')
        TaskPlayAnimAdvanced(ped, 'rcmjosh4', 'josh_leadout_cop2', GetEntityCoords(ped, true), 0, 0, GetEntityHeading(ped), 3.0, 3.0, -1, 50, 0, 0, 0)
        Citizen.Wait(300)
        setWeapon(pWeaponData)
        Citizen.Wait(300)
        StopAnimTask(ped, 'rcmjosh4',  'josh_leadout_cop2', 1.0)
    else
        loadAnimDict('reaction@intimidation@1h')
        TaskPlayAnimAdvanced(ped, 'reaction@intimidation@1h', 'intro', GetEntityCoords(ped, true), 0, 0, GetEntityHeading(ped), 8.0, 3.0, -1, 50, 0, 0, 0)
        Citizen.Wait(1000)
        setWeapon(pWeaponData)
        Citizen.Wait(1400)
        StopAnimTask(ped, 'reaction@intimidation@1h',  'intro', 1.0)
    end
    blockShootingWhileHolstering = false
end

setWeapon = function(pWeaponData)
    DGX.Inventory.toggleObject(pWeaponData.id, false)
    local ped = PlayerPedId()
    SetCurrentPedWeapon(ped, pWeaponData.hash, true)

    local components = DGCore.Functions.TriggerCallback('weapons:server:getAttachmentsOnWeapon', pWeaponData)
    for _, component in pairs(components) do
      GiveWeaponComponentToPed(ped, pWeaponData.hash, component)
  end

    if pWeaponData.metadata.tint then
        local tintId = getTintIdOfName(pWeaponData.metadata.tint)
        SetPedWeaponTintIndex(ped, pWeaponData.hash, tintId)
    end
end

removeWeapon = function(pWeaponData)
  DGX.Inventory.toggleObject(pWeaponData.id, true)
  local ped = PlayerPedId()
  SetCurrentPedWeapon(ped, `WEAPON_UNARMED`, true)
end

startWeaponLoop = function()
    Citizen.CreateThread(function()
        if not currentWeaponData then return end
        local playerId = PlayerId()
        local ped = PlayerPedId()
        local weapon = GetSelectedPedWeapon(ped)
        local qualityDecrease = 0
        local reticleEnabled = false
        local previousViewMode = 1
        local viewModeReset = false

        -- When equiping a different weapon while already having one, its possible for this loop to not exit
        -- because of setting currentweapondata to nil and instantly setting it to the new weapon
        -- thats why we also check if the weapon is the same as the weapon this loop started with
        -- this is to prevent this loop from running multiple instances
        while currentWeaponData and currentWeaponData.hash == weapon do
            -- quality decrease when shooting with ammo
            if IsPedShooting(ped) and GetAmmoInPedWeapon(ped, currentWeaponData.hash) > 0 then
              qualityDecrease = qualityDecrease + 1
            end

            -- save weapondata after shooting
            if IsControlJustReleased(0, 24) or IsDisabledControlJustReleased(0, 24) then
                local ammo = GetAmmoInPedWeapon(ped, currentWeaponData.hash)
                TriggerServerEvent('weapons:server:StoppedShooting', currentWeaponData, tonumber(ammo), qualityDecrease)
                qualityDecrease = 0
                SetPedUsingActionMode(ped, false, -1, 0)
            end

            -- reticle and forced fps in veh
            if IsPlayerFreeAiming(playerId) then
                if not viewModeReset and IsPedInAnyVehicle(ped, false) then
                    local currentViewMode = GetFollowVehicleCamViewMode()
                    if currentViewMode ~= 4 then
                        previousViewMode = currentViewMode
                        SetFollowVehicleCamViewMode(4)
                        viewModeReset = true
                    end
                end

                if not reticleEnabled then
                    reticleEnabled = true
                    SendNUIMessage({
                        action = 'showReticle',
                        show = true,
                    })
                end
            else
                if viewModeReset and IsPedInAnyVehicle(ped, false) then
                    SetFollowVehicleCamViewMode(previousViewMode)
                    viewModeReset = false
                end

                if reticleEnabled then
                    reticleEnabled = false
                    SendNUIMessage({
                        action = 'showReticle',
                        how = false,
                    })
                end
            end

            SetWeaponsNoAutoswap(true)
            SetWeaponsNoAutoreload(true)
            DisplayAmmoThisFrame(true)

            if GetAmmoInPedWeapon(ped, currentWeaponData.hash) == 1 and not currentWeaponData.isOneTimeUse then
                DisablePlayerFiring(ped, true)
            end

            Citizen.Wait(0)
        end

        SendNUIMessage({
            action = 'showReticle',
            show = false,
        })
    end)
end

exports("openTintMenu", function()
    if not currentWeaponData then return end
    local menu = {
      {
          title = 'Wapen tinten',
          description = 'Selecteer een kleur voor je wapen.',
          disabled = true,
      },
    }
    for id, name in pairs(tintColorNames) do
      menu[#menu+1] = {
        title = name,
        callbackURL = 'weapons:client:SetTint',
        data = {tint = id},
      }
    end

    openApplication('contextmenu', menu)
end)

tintColorNames = {
  [0] = 'Origineel',
  [1] = 'Groen',
  [2] = 'Goud',
  [3] = 'Roos',
  [4] = 'Leger',
  [5] = 'Politie',
  [6] = 'Oranje',
  [7] = 'Platinum',
}

getTintIdOfName = function(tintName)
  for id, name in pairs(tintColorNames) do
    if name == tintName then return id end
  end
end

forceRemoveWeapon = function(weaponId, noAnimation)
  if not currentWeaponData then return end
  if not weaponId or currentWeaponData.id == weaponId then
    local ped = PlayerPedId()
    RemoveAllPedWeapons(ped, true)
    if noAnimation then
      removeWeapon(currentWeaponData)
    else  
      holsterWeapon(currentWeaponData)
    end
    currentWeaponData = nil
  end
end
exports('removeWeapon', forceRemoveWeapon)