-- Other stuff
RegisterNetEvent('DGCore:Player:SetPlayerData', function(val)
    DGCore.PlayerData = val
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