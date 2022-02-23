local lastStore = nil

function EnteredSafeZone()
	local store = Config.Stores[currentStore]
	if not store then
		return
	end
	exports['dg-polytarget']:AddCircleZone("store_safe", store.safe.coords, 0.5, {
		data = {
			id = store.name
		},
	})
	lastStore = currentStore
end

function LeftSafeZone()
	exports['dg-polytarget']:removeZone("store_safe")
	if Config.Stores[lastStore].safe.state == "decoding" then
		TriggerServerEvent("dg-storerobbery:server:LeftSafe", lastStore)
		DGCore.Functions.Notify("Verbinding verbroken", "error")
	end
end

local function CanHackSafe()
	if not currentStore then
		return false
	end
	return Config.Stores[currentStore].safe.state == "closed"
end

local function CanLootSafe()
	if not currentStore then
		return false
	end
	return Config.Stores[currentStore].safe.state == "opened"
end

AddEventHandler("dg-storerobbery:client:HackSafe", function()
	if currentStore then
		if CanHackSafe() then
			DGCore.Functions.TriggerCallback('DGCore:HasItem', function(hasItem)
				CallCops(currentStore)

				if hasItem then
					exports["dg-numbergame"]:OpenGame(function(success)
						TriggerServerEvent("DGCore:Server:RemoveItem", Config.Safe.Item, 1)
						TriggerEvent('inventory:client:ItemBox', Config.Safe.Item, "remove")

						GainStress()
						CreateEvidence()

						if success then
							TriggerServerEvent("dg-storerobbery:server:HackSafe", currentStore)

							Citizen.Wait(1000)
							exports["dg-phone"]:sendMail(
								"Decodering Kluis",
								"Hackerman",
								("Het decoderen van de kluis zal even duren... <br><br> Geef me %s minuten. <br><br> Ga niet te ver of de verbinding zal verbreken!"):format(math.floor(Config.Safe.LootDelay / (60 * 1000)))
							)
						else
							DGCore.Functions.Notify('Mislukt...', 'error')
						end
					end, Config.Hack.GridSize, Config.Hack.Time)
				else
					DGCore.Functions.Notify("Hoe ga je dit openen?", "error")
				end
			end, Config.Safe.Item)
		end
	end
end)

AddEventHandler("dg-storerobbery:client:LootSafe", function()
	if currentStore then
		if CanLootSafe() then
			TriggerServerEvent("dg-storerobbery:server:LootSafe", currentStore)

			local ped = PlayerPedId()
			LoadAnimDict('amb@prop_human_bum_bin@idle_b')
			TaskPlayAnim(ped, "amb@prop_human_bum_bin@idle_b", "idle_d", 8.0, 8.0, -1, 50, 0, false, false, false)
			Citizen.Wait(700)
			TaskPlayAnim(ped, "amb@prop_human_bum_bin@idle_b", "exit", 8.0, 8.0, -1, 50, 0, false, false, false)
		end
	end
end)

RegisterNetEvent("dg-storerobbery:client:UpdateSafe", function(store, state)
	Config.Stores[store].safe.state = state
end)

-- exports for peek
exports('CanHackSafe', CanHackSafe)
exports('CanLootSafe', CanLootSafe)