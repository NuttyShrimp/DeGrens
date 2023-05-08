local callId = 1
local calls = {}

startCall = function(src, targetPhone, isAnon)
  local Player = charModule.getPlayer(src)
  if (not targetPhone) then return end
  if not isAnon and not DGX.Inventory.doesPlayerHaveItems(src, 'phone') then
    -- TODO add baninjection :)
    print('[DG-Phone] ' .. Player.name .. ' tried to call without a phone')
    return
  end
  -- Check if the player is calling himself
  if (targetPhone == Player.charinfo.phone) then
    DGX.Notifications.add(src, "You can't call yourself", "error")
    TriggerClientEvent('dg-phone:client:endCurrentCall', src, 0)
    return
  end
  -- Target identification
  local Target = charModule.getPlayerByPhone(targetPhone)
  if (Target) then
    -- If in call send a cancel event to the starter
    Target = Target.serverId
    if (getPlayerCallId(Target)) then
      TriggerClientEvent('dg-phone:client:endCurrentCall', src, 0)
      return
    end
  end
  local call = {
    id = callId,
    caller = src,
    target = Target,
    state = "outgoing", -- outgoing | established | ended
    isAnon = isAnon,
  }
  callId = callId + 1
  calls[call.id] = call
  -- Send call to target
  if (Target) then
    local label = Player.charinfo.phone
    if (isAnon) then
      label = 'UNKNOWN NUMBER'
    end
    TriggerClientEvent('dg-phone:client:incomingCall', Target, {
      label = label,
      isAnon = isAnon,
      soundId = call.id
    })
  end
  Citizen.SetTimeout(10000, function()
    if (calls[call.id] and calls[call.id].state == "outgoing") then
      endCall(call.id)
    end
  end)
  return call.id
end

endCall = function(callId)
  if (not calls[callId]) then
    return
  end
  calls[callId].state = "ended"
  TriggerClientEvent('dg-phone:client:endCurrentCall', calls[callId].caller, callId)
  exports['pma-voice']:setPlayerCall(calls[callId].caller, 0)
  if (calls[callId].target) then
    exports['pma-voice']:setPlayerCall(calls[callId].target, 0)
    TriggerClientEvent('dg-phone:client:endCurrentCall', calls[callId].target, callId)
  end
  calls[callId] = nil
end

getPlayerCallId = function(src)
  for k, v in pairs(calls) do
    if (v.caller == src or v.target == src) then
      return k
    end
  end
  return false
end

initiateCall = function(callId)
  if (not calls[callId]) then
    return
  end
  calls[callId].state = "established"
  TriggerClientEvent('dg-phone:client:initiateCall', calls[callId].caller, callId)
  TriggerClientEvent('dg-phone:client:initiateCall', calls[callId].target, callId)
  exports['pma-voice']:setPlayerCall(calls[callId].caller, callId)
  exports['pma-voice']:setPlayerCall(calls[callId].target, callId)
end

-- Data is an table with the following fields:
-- 		phone: The phone number
--		isAnon: Whether the call is anonymous
DGX.RPC.register('dg-phone:server:startCall', function(source, data)
  local soundId = startCall(source, data.phone, data.isAnon)
  return soundId
end)

DGX.RPC.register('dg-phone:server:endCall', function(source)
  local _callId = getPlayerCallId(source)
  if (_callId) then
    endCall(_callId)
  end
end)

DGX.RPC.register('dg-phone:server:initiateCall', function(source, data)
  local _callId = getPlayerCallId(source)
  if (not _callId) then
    return
  end
  initiateCall(_callId, data.target)
end)