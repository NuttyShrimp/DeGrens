DGCore = exports["dg-core"]:GetCoreObject()
playerJobName = nil
currentWeaponData = {} 
canShoot = true
holstering = false

local durabilityDecrease = 0

-- stops swapping to different weapon when ran out of ammo
Citizen.CreateThread(function()
    SetWeaponsNoAutoswap(true)
end)

-- saves ammo and affects durability when stopped attacking
Citizen.CreateThread(function()
    while true do
        if LocalPlayer.state["isLoggedIn"] then
            if (IsControlJustReleased(0, 24) or IsDisabledControlJustReleased(0, 24)) and currentWeaponData and next(currentWeaponData) then
                local weapon = GetSelectedPedWeapon(PlayerPedId())

                local removed = false
                for _, itemName in pairs(Config.OneTimeWeapons) do
                    if exports["dg-inventory"]:GetItemData()[weapon].name == itemName then
                        TriggerServerEvent("DGCore:Server:RemoveItem", itemName, 1)
                        removed = true
                        break
                    end
                end
                
                if not removed then
                    local ammo = GetAmmoInPedWeapon(PlayerPedId(), weapon)
                    TriggerServerEvent("weapons:server:SaveWeaponAmmo", currentWeaponData, tonumber(ammo))
        
                    if durabilityDecrease > 0 then
                        TriggerServerEvent("weapons:server:UpdateWeaponQuality", currentWeaponData, durabilityDecrease)
                        durabilityDecrease = 0
                    end
                end
            end
        end

        Citizen.Wait(1)
    end
end)

--handles weapon durability decrease
Citizen.CreateThread(function()
    Citizen.Wait(500)

    while true do
        if LocalPlayer.state["isLoggedIn"] then
            local ped = PlayerPedId()

            if currentWeaponData and next(currentWeaponData) then
                if IsPedShooting(ped) or IsControlJustPressed(0, 24) then
                    local weapon = GetSelectedPedWeapon(ped)
    
                    if canShoot then
                        if GetAmmoInPedWeapon(ped, weapon) > 0 then
                            durabilityDecrease = durabilityDecrease + 1
                        end
                    else
                        if weapon ~= GetHashKey("WEAPON_UNARMED") then
                            TriggerEvent("weapons:client:CheckWeapon", exports["dg-inventory"]:GetItemData()[weapon].name)
                            DGCore.Functions.Notify("Dit wapen is kapot.", "error")
                            durabilityDecrease = 0
                        end
                    end
                end
            end
        end

        Citizen.Wait(1)
    end
end)

-- removes drops from ground
Citizen.CreateThread(function()
	while true do    
		RemoveWeaponDrops()
		Citizen.Wait(1000)
	end
end)

-- stops shooting during holstering
Citizen.CreateThread(function()
	while true do
		if holstering then
			DisableControlAction(0, 25, true)
			DisablePlayerFiring(PlayerPedId(), true)
		else
			Citizen.Wait(250)
		end

		Citizen.Wait(3)
	end
end)

--shows reticle when aiming
Citizen.CreateThread(function()
    while true do
        if IsPlayerFreeAiming(PlayerId()) then
            SendNUIMessage({
                action = "toggle",
                show = true,
            })
        else
            SendNUIMessage({
                action = "toggle",
                show = false,
            })
            Citizen.Wait(250)
        end

        Citizen.Wait(4)
    end
end)

-- applies recoil to weapons
Citizen.CreateThread(function()
	while true do
		local ped = PlayerPedId()

		if IsPedShooting(ped) and not IsPedDoingDriveby(ped) then
			local weapon = GetSelectedPedWeapon(ped)

			if Config.Recoils[weapon] and Config.Recoils[weapon] ~= 0 then
				tv = 0

				if GetFollowPedCamViewMode() ~= 4 then
					repeat 
						Citizen.Wait(0)
						pitch = GetGameplayCamRelativePitch()
                        
						SetGameplayCamRelativePitch(pitch + 0.1, 0.2)
						tv = tv + 0.1
					until tv >= Config.Recoils[weapon]
				else
					repeat 
						Citizen.Wait(0)
						pitch = GetGameplayCamRelativePitch()

						if Config.Recoils[weapon] > 0.1 then
							SetGameplayCamRelativePitch(pitch + 0.6, 1.2)
							tv = tv + 0.6
						else
							SetGameplayCamRelativePitch(pitch + 0.016, 0.333)
							tv = tv + 0.1
						end
					until tv >= Config.Recoils[weapon]
				end
			end
		end

		Citizen.Wait(0)
	end
end)
