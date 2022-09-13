local gameDirty = true
local gameValues = {}
local characterInfo = {}

setGameValue = function(k, v)
	if gameValues[k] == nil or gameValues[k] ~= v then
		gameDirty = true
	end
	gameValues[k] = v
end

seedCharData = function()
	CreateThread(function()
		local PlyData = DGCore.Functions.GetPlayerData()
		local newCharacterInfo = {
			cid = PlyData.citizenid,
			firstname = PlyData.charinfo.firstname,
			lastname = PlyData.charinfo.lastname,
			job = DGX.RPC.execute('jobs:server:getCurrentJob'),
			phone = PlyData.charinfo.phone,
			server_id = GetPlayerServerId(PlayerId()),
			hasVPN = DGX.Inventory.doesPlayerHaveItems('vpn')
		}
		characterInfo = newCharacterInfo
		SendAppEvent('character', characterInfo)
    Wait(1000)
    toggleHud()
    TriggerEvent('dg-ui:loadData')
	end)
end
RegisterNetEvent('dg-ui:sendCharacterData', seedCharData)

CreateThread(function()
	while true do
		Wait(250)
		if gameDirty then
			gameDirty = false
			SendAppEvent("game", gameValues)
		end
	end
end)

RegisterNetEvent('DGCore:Client:OnPlayerLoaded')
AddEventHandler('DGCore:Client:OnPlayerLoaded', function()
	seedCharData()
end)

RegisterNetEvent('DGCore:Player:SetPlayerData', function()
	-- Some fresh playerData
	seedCharData()
end)

RegisterNetEvent('dg-jobs:signin:update', function(job)
  characterInfo.job = job
  SendAppEvent('character', characterInfo)
end)

RegisterNetEvent('onResourceStart', function(resource)
	if resource ~= GetCurrentResourceName() then return end
	if not LocalPlayer.state.isLoggedIn then return end
	seedCharData()
end)

RegisterNetEvent('dg-weathersync:client:SyncTime', function(hour, minute)
	setGameValue("time", ("%s:%s"):format(hour > 9 and hour or "0" .. hour, minute > 9 and minute or "0" .. minute))
end)

RegisterNetEvent('dg-weathersync:client:weather', function(weatherProg)
	setGameValue("weather", weatherProg.weather)
end)