DGCore = exports["dg-core"]:GetCoreObject()
isLoggedIn = false
playerJobName = nil
currentWeaponData = {}
canShoot = true
holstering = false
local reticleEnabled = false

local durabilityDecrease = 0

local previousViewMode = 1
local freeaimReset = false

-- stops swapping to different weapon when ran out of ammo and add peekoption for repairnpc
Citizen.CreateThread(function()
	SetWeaponsNoAutoswap(true)
	exports["dg-peek"]:addFlagEntry("isWeaponRepair", {
		options = {
			{
				type = "client",
				event = "weapons:client:GiveWeaponToRepair",
				icon = "fas fa-hammer",
				label = "Repareer Wapen",
				canInteract = function()
                    local ped = PlayerPedId()
					if GetSelectedPedWeapon(ped) and GetSelectedPedWeapon(ped) ~= `WEAPON_UNARMED` then
						if exports["dg-weapons"]:IsRepairAvailable() and not exports["dg-weapons"]:IsRepairFinished() then
							return true
						end
					end
					return false
				end,
			},
			{
				type = "client",
				event = "weapons:client:TakeWeaponFromRepair",
				icon = "fas fa-hammer",
				label = "Neem Wapen",
				canInteract = function()
					return exports["dg-weapons"]:IsRepairFinished()
				end,
			},
			{
				type = "client",
				event = "weapons:client:SelectTint",
				icon = "fas fa-spray-can",
				label = "Tint Wapen",
				canInteract = function()
                    local ped = PlayerPedId()
					if GetSelectedPedWeapon(ped) and GetSelectedPedWeapon(ped) ~= `WEAPON_UNARMED` then
						return true
					end
					return false
				end,
			},
		},
		distance = 1
	})
end)

-- all logic to be applied every frame
Citizen.CreateThread(function()
	Citizen.Wait(500)
	while true do
		if isLoggedIn then
			if currentWeaponData and next(currentWeaponData) then
				local ped = PlayerPedId()
				local weapon = GetSelectedPedWeapon(ped)

				-- handles durability decrease while shooting
				if IsPedShooting(ped) or IsControlJustPressed(0, 24) then
					if canShoot then
						if GetAmmoInPedWeapon(ped, weapon) > 0 then
							durabilityDecrease = durabilityDecrease + 1
						end
					else
						if weapon ~= GetHashKey("WEAPON_UNARMED") then
							TriggerEvent("weapons:client:CheckWeapon", exports["dg-inventory"]:GetItemData(weapon).name)
							DGCore.Functions.Notify("Dit wapen is kapot.", "error")
							durabilityDecrease = 0
						end
					end
				end

				-- saves ammo, durability and removes item when stopped shooting
				if IsControlJustReleased(0, 24) or IsDisabledControlJustReleased(0, 24) then
					local removed = false
					for _, itemName in pairs(Config.OneTimeWeapons) do
						if exports["dg-inventory"]:GetItemData(weapon).name == itemName then
							TriggerServerEvent("DGCore:Server:RemoveItem", itemName, 1)
							removed = true
							break
						end
					end

					if not removed then
						local ammo = GetAmmoInPedWeapon(ped, weapon)
						TriggerServerEvent("weapons:server:SaveWeaponAmmo", currentWeaponData, tonumber(ammo))

						if durabilityDecrease > 0 then
							TriggerServerEvent("weapons:server:UpdateWeaponQuality", currentWeaponData, durabilityDecrease)
							durabilityDecrease = 0
						end
					end
				end

				-- enables reticle while aiming
				if IsPlayerFreeAiming(PlayerId()) then
					if not reticleEnabled then
						reticleEnabled = true
						SendNUIMessage({
							action = "toggle",
							show = true,
						})
					end
				else
					if reticleEnabled then
						reticleEnabled = false
						SendNUIMessage({
							action = "toggle",
							show = false,
						})
					end
				end

				-- applies recoil while shooting
				if IsPedShooting(ped) and Config.Recoil[weapon] then
                    local recoil = Config.Recoil[weapon]

                    -- vertical recoil
                    if recoil.vertical ~= 0 then
                        if GetFollowPedCamViewMode() ~= 4 then
                            local tv = 0
                            repeat
                                Citizen.Wait(0)
                                pitch = GetGameplayCamRelativePitch()
    
                                SetGameplayCamRelativePitch(pitch + 0.1, 0.2)
                                tv = tv + 0.1
                            until tv >= recoil.vertical
                        else
                            local tv = 0
                            repeat
                                Citizen.Wait(0)
                                pitch = GetGameplayCamRelativePitch()
    
                                if recoil.vertical > 0.1 then
                                    SetGameplayCamRelativePitch(pitch + 0.6, 1.2)
                                    tv = tv + 0.6
                                else
                                    SetGameplayCamRelativePitch(pitch + 0.016, 0.333)
                                    tv = tv + 0.1
                                end
                            until tv >= recoil.vertical
                        end
                    end

                    -- explosion effect
                    if recoil.explosion ~= 0 then
                        ShakeGameplayCam('SMALL_EXPLOSION_SHAKE', recoil.explosion)
                    end
				end

                -- force first person in vehicle while aiming weapon
                if IsPedInAnyVehicle(ped) then
                    if IsPlayerFreeAiming(PlayerId()) then
                        local currentViewMode = GetFollowVehicleCamViewMode()
                        if currentViewMode ~= 4 and not freeaimReset then
                            previousViewMode = currentViewMode
                            SetFollowVehicleCamViewMode(4)
                            freeaimReset = true
                        end
                    elseif freeaimReset then
                        SetFollowVehicleCamViewMode(previousViewMode)
                        freeaimReset = false
                    end
                end

                DisableAttack()
			else
                if IsPlayerFreeAiming(PlayerId()) then
                    DisableAttack()
                end

				if reticleEnabled then
					reticleEnabled = false
					SendNUIMessage({
						action = "toggle",
						show = false,
					})
				end
			end
		end

		Citizen.Wait(0)
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

