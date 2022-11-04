-- Player load and unload handling
-- New method for checking if logged in across all scripts (optional)
-- if LocalPlayer.state['isLoggedIn'] then
RegisterNetEvent('DGCore:Client:OnPlayerLoaded', function()
    ShutdownLoadingScreenNui()
    LocalPlayer.state:set('isLoggedIn', true, false)
    SetCanAttackFriendly(PlayerPedId(), true, false)
    NetworkSetFriendlyFireOption(true)
end)

RegisterNetEvent('DGCore:Client:OnPlayerUnload', function()
    LocalPlayer.state:set('isLoggedIn', false, false)
end)

-- Other stuff
RegisterNetEvent('DGCore:Player:SetPlayerData', function(val)
    DGCore.PlayerData = val
end)

RegisterNetEvent('DGCore:Player:UpdatePlayerData', function()
    TriggerServerEvent('DGCore:UpdatePlayer')
end)

RegisterNetEvent('DGCore:Client:TriggerCallback', function(name, ...)
    if DGCore.ServerCallbacks[name] then
        DGCore.ServerCallbacks[name](...)
        DGCore.ServerCallbacks[name] = nil
    end
end)

RegisterNetEvent('DGCore:Client:TriggerPromiseCallback', function(callId, ...)
	if DGCore.Promises[callId] then
		DGCore.Promises[callId]:resolve(...)
	end
end)

DGX.RPC.register('core:functions:getClosestVehicle', function()
  local veh = DGCore.Functions.GetClosestVehicle()
  if not NetworkGetEntityIsNetworked(veh) then
    return -1
  end
  return NetworkGetNetworkIdFromEntity(veh)
end)