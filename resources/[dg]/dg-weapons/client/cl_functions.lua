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
        SetCurrentPedWeapon(ped, `WEAPON_UNARMED`, true)
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

    if DGCore.Functions.GetPlayerData().job.name == 'police' then
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

    SetCurrentPedWeapon(ped, `WEAPON_UNARMED`, true)
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

    if DGCore.Functions.GetPlayerData().job.name == 'police' then
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
    local ped = PlayerPedId()
    SetCurrentPedWeapon(ped, pWeaponData.hash, true)

    if pWeaponData.info.components then
        for _, component in pairs(pWeaponData.info.components) do
            GiveWeaponComponentToPed(ped, pWeaponData.hash, component)
        end
    end

    if pWeaponData.info.tint then
        SetPedWeaponTintIndex(ped, pWeaponData.hash, pWeaponData.info.tint)
    end
end

startWeaponLoop = function(isBrokenWeapon)
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
            -- quality decrease when shooting and brokenweapon check
            if IsPedShooting(ped) then
                if isBrokenWeapon then
                    forceRemoveWeapon()
                    break
                end

                if GetAmmoInPedWeapon(ped, currentWeaponData.hash) > 0 then
                    qualityDecrease = qualityDecrease + 1
                end
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
    openApplication('contextmenu', {
        {
            title = 'Wapen tinten',
            description = 'Selecteer een kleur voor je wapen.',
            disabled = true,
        },
        {
            title = 'Origineel',
            callbackURL = 'weapons:client:SetTint',
            data = {tint = 0},
        },
        {
            title = 'Groen',
            callbackURL = 'weapons:client:SetTint',
            data = {tint = 1},
        },
        {
            title = 'Goud',
            callbackURL = 'weapons:client:SetTint',
            data = {tint = 2},
        },
        {
            title = 'Roos',
            callbackURL = 'weapons:client:SetTint',
            data = {tint = 3},
        },
        {
            title = 'Leger',
            callbackURL = 'weapons:client:SetTint',
            data = {tint = 4},
        },
        {
            title = 'Politie',
            callbackURL = 'weapons:client:SetTint',
            data = {tint = 5},
        },
        {
            title = 'Oranje',
            callbackURL = 'weapons:client:SetTint',
            data = {tint = 6},
        },
        {
            title = 'Platinum',
            callbackURL = 'weapons:client:SetTint',
            data = {tint = 7},
        },
    })
end)

forceRemoveWeapon = function(pWeaponName)
    if not currentWeaponData then return end
    if not pWeaponName or currentWeaponData.name == pWeaponName then
        holsterWeapon(currentWeaponData)
        currentWeaponData = nil
    end
end
exports('removeWeapon', forceRemoveWeapon)