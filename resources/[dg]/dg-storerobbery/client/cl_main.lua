DGCore = exports['dg-core']:GetCoreObject()
currentCops = 0
currentStore = nil
_cache = {
	registerIds = {},
	safeIds = {},
}

RegisterNetEvent('police:SetCopCount', function(amount)
	currentCops = amount
end)

Citizen.CreateThread(function()
	DGCore.Functions.TriggerCallback("dg-storerobbery:server:GetConfig", function(data)
		openedRegisters = data.openedRegisters

		for k, _ in pairs(Config.Stores) do
			Config.Stores[k].safe.state = data.safes[k]
		end
	end)
end)

Citizen.CreateThread(function()
	for _, store in pairs(Config.Stores) do
		local storezone = store.storezone
		storezone.options.data = storezone.options.data or {}
		storezone.options.data.id = store.name
		exports["dg-polyzone"]:AddBoxZone("store", storezone.center, storezone.length, storezone.width, storezone.options)
	end

	_cache.registerIds = exports["dg-peek"]:addModelEntry(Config.Registers.Model, {
		options = {
			{
				icon = "fas fa-cash-register",
				label = "Beroof",
				action = function(_, register)
					TriggerEvent("dg-storerobbery:client:LockpickRegister", register)
				end,
				canInteract = function(register)
					return exports['dg-storerobbery']:CanRobRegister(register)
				end,
			}
		},
		distance = 0.8,
	})
	_cache.safeIds = exports['dg-peek']:addZoneEntry("store_safe", {
		options = {
			{
				type = "client",
				event = "dg-storerobbery:client:HackSafe",
				icon = "fas fa-hdd",
				label = "Hack",
				canInteract = function()
					return exports['dg-storerobbery']:CanHackSafe()
				end,
			},
			{
				type = "client",
				event = "dg-storerobbery:client:LootSafe",
				icon = "fas fa-hand-holding-usd",
				label = "Neem",
				canInteract = function()
					return exports['dg-storerobbery']:CanLootSafe()
				end,
			}
		},
		distance = 1.2,
	})
end)

function GainStress()
	local rng = math.random(1, 100)
	if rng <= Config.GainStressChance then
		TriggerServerEvent('hud:server:GainStress', math.random(2, 5))
	end
end

function CreateEvidence()
	local rng = math.random(1, 100)
	if rng <= Config.FingerdropChance and not true then
		-- HANDSHOES
		local ped = PlayerPedId()
		local pos = GetEntityCoords(ped)
		TriggerServerEvent("evidence:server:CreateFingerDrop", pos)
	end
end

function LoadAnimDict(dict)
	while not HasAnimDictLoaded(dict) do
		RequestAnimDict(dict)
		Citizen.Wait(10)
	end
end

function CallCops(store)
	local ped = PlayerPedId()
	local pos = GetEntityCoords(ped)
	local s1, s2 = GetStreetNameAtCoord(pos.x, pos.y, pos.z)
	local streetLabel = s2 and GetStreetNameFromHashKey(s1) .. ' ' .. GetStreetNameFromHashKey(s2) or GetStreetNameFromHashKey(s1)
	TriggerServerEvent("dg-storerobbery:server:CallCops", store, streetLabel, pos)
end

RegisterNetEvent("dg-polyzone:enter", function(name, data, center)
	if name == "registers" then
		inRegisterZone = true
	elseif name == "store" then
		currentStore = data.id
		buildRegisterZone()
		EnteredSafeZone()
	end
end)

RegisterNetEvent("dg-polyzone:exit", function(name)
	if name == "registers" then
		inRegisterZone = false
	elseif name == "store" then
		LeftSafeZone()
		removeRegisterZone()
		currentStore = nil
	end
end)

RegisterNetEvent("dg-storerobbery:client:PoliceAlert", function(store, streetLabel, coords)
	PlaySound(-1, "Lose_1st", "GTAO_FM_Events_Soundset", 0, 0, 1)
	TriggerEvent('dg-policealerts:client:AddPoliceAlert', {
		timeOut = 5000,
		alertTitle = "Poging Winkeloverval",
		coords = { x = coords.x, y = coords.y, z = coords.z },
		details = {
			[1] = { icon = '<i class="fas fa-video"></i>', detail = Config.Stores[store].cam },
			[2] = { icon = '<i class="fas fa-globe-europe"></i>', detail = streetLabel }
		},
		callSign = DGCore.Functions.GetPlayerData().metadata["callsign"]
	})

	local transG = 250
	local blip = AddBlipForCoord(coords.x, coords.y, coords.z)
	SetBlipSprite(blip, 458)
	SetBlipColour(blip, 1)
	SetBlipDisplay(blip, 4)
	SetBlipAlpha(blip, transG)
	SetBlipScale(blip, 1.0)
	BeginTextCommandSetBlipName('STRING')
	AddTextComponentString("Poging Winkeloverval")
	EndTextCommandSetBlipName(blip)

	while transG ~= 0 do
		Wait(180 * 4)
		transG = transG - 1
		SetBlipAlpha(blip, transG)
		if transG == 0 then
			SetBlipSprite(blip, 2)
			RemoveBlip(blip)
			return
		end
	end
end)

RegisterNetEvent('onResourceStop', function(res)
	if res ~= GetCurrentResourceName() then
		return
	end
	if #_cache.registerIds > 0 then
		exports["dg-peek"]:removeModelEntry(_cache.registerIds)
	end
	if #_cache.safeIds > 0 then
		exports['dg-peek']:removeZoneEntry(_cache.safeIds)
	end
end)