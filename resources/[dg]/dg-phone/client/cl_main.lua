DGCore = exports["dg-core"]:GetSharedObject()
canRetrieve = false

openPhone = function()
	if not canRetrieve or not canOpen() then
		return
	end
	SendNUIMessage({
		app = 'home-screen',
		action = 'setOpenState',
		data = true
	})
	SetNuiFocus(true, true)
	SetNuiFocusKeepInput(true)
	setState('state', 1)
end

closePhone = function(state)
	if getState('state') == '2' then
		closeCamera()
	end
	SendNUIMessage({
		app = 'home-screen',
		action = 'setOpenState',
		data = false
	})
	disablePauseMenu()
	SetNuiFocus(false, false)
	SetNuiFocusKeepInput(false)
	setState('state', state or 0)
end

initPhone = function()
	while (not canRetrieve) do
		Citizen.Wait(10)
	end
	setState('isDisabled', false)
	TriggerEvent('dg-phone:load')
	TriggerServerEvent('dg-phone:load')
	SendNUIMessage({
		app = 'home-screen',
		action = 'doInit',
		data = GetCurrentResourceName()
	})
end

RegisterNUICallback('phone:ready', function(data, cb)
	canRetrieve = true
	cb({data= {}, meta={ok=true, message="done"}})
end)

RegisterNUICallback('phone:close', function(data, cb)
	closePhone()
	cb({data= {}, meta={ok=true, message="done"}})
end)

RegisterNUICallback('phone/silence', function(data, cb)
	setState('isMuted', data.silenced)
	cb({data= {}, meta={ok=true, message="done"}})
end)

RegisterNetEvent('dg-phone:client:setCharacterData', function(data)
	SendNUIMessage({
		app = "home-screen",
		action = "setCharacterData",
		data = data
	})
end)

RegisterNetEvent('dg-phone:client:togglePhone', function(toggle)
	if toggle then
		openPhone()
	else
		closePhone()
	end
end)

RegisterNetEvent('DGCore:Client:OnPlayerLoaded', function()
	while(not canRetrieve) do Wait(10) end
	initPhone()
	setState('characterLoaded', true)
end)

RegisterNetEvent('DGCore:Client:OnPlayerUnload', function()
	closePhone()
	setState('isDisabled', true)
	setState('characterLoaded', false)
end)

RegisterNetEvent('onResourceStart', function(res)
	if res == GetCurrentResourceName() then
		while (not DGCore) do Wait(10) end
		if DGCore.Functions.GetPlayerData() ~= nil then
			setState('characterLoaded', true)
		end
	end
end)

RegisterNetEvent('onResourceStop', function(res)
	if res == GetCurrentResourceName() then
		closePhone()
		stopSounds()
	end
end)

RegisterCommand('phone:restart', function()
	if not getState('characterLoaded') then return	end
	closePhone()
	StopAllAnimation()
	SendNUIMessage({
		app = 'home-screen',
		action = 'doReload'
	})
	canRetrieve = false
	stopSounds()
	while(not canRetrieve) do Wait(10) end
	initPhone()
end)

--region Keybindings
RegisterNetEvent('dg-lib:keyEvent')
AddEventHandler('dg-lib:keyEvent', function(name, isDown)
	if not isDown or not canOpen() then return end
	if name == "openPhone" then
		openPhone()
	end
	if name == 'acceptNotification' then
		SendNUIMessage({
			app = 'home-screen',
			action = 'acceptNotification'
		})
	end
	if name == "declineNotification" then
		SendNUIMessage({
			app = 'home-screen',
			action = 'declineNotification'
		})
	end
end)

exports["dg-lib"]:registerKeyMapping("openPhone", "(phone) Open jouw telefoon", '+openPhone', '-openPhone', "M", true)
exports["dg-lib"]:registerKeyMapping("acceptNotification", "(phone) Accepteer melding", '+acceptNotification', '-acceptNotification', "", true)
exports["dg-lib"]:registerKeyMapping("declineNotification", "(phone) Weiger melding", '+declineNotification', '-declineNotification', "", true)

--endregion