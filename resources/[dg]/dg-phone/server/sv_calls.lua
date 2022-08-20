local callId = 1
local calls = {}

startCall = function(source, targetPhone, isAnon)
	local Player = DGCore.Functions.GetPlayer(source)
	if (not targetPhone) then return end
	if (not DGX.Inventory.doesPlayerHaveItems(source, 'phone')) then
		-- TODO add baninjection :)
		print('[DG-Phone] ' .. Player.Name .. ' tried to call without a phone')
		return
	end
	-- Check if the player is calling himself
	if (targetPhone == Player.PlayerData.charinfo.phone) then
		TriggerClientEvent("DGCore:Notify", source, "You can't call yourself", "error")
		TriggerClientEvent('dg-phone:client:endCurrentCall', source, 0)
		return
	end
	-- Target identification
	local Target = DGCore.Functions.GetPlayerByPhone(targetPhone)
	if (Target) then
		-- If in call send a cancel event to the starter
		Target = Target.PlayerData.source
		if (getPlayerCallId(Target)) then
			TriggerClientEvent('dg-phone:client:endCurrentCall', source, 0)
			return
		end
	end
	local call = {
		id = callId,
		caller = source,
		target = Target,
		state = "outgoing", -- outgoing | established | ended
		isAnon = isAnon,
	}
	callId = callId + 1
	calls[call.id] = call
	-- Send call to target
	if (Target) then
		local label = Player.PlayerData.charinfo.phone
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
		if (calls[call.id] and calls[call.id].state == "outgoing" ) then
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
DGCore.Functions.CreateCallback('dg-phone:server:startCall', function(source, cb, data)
	local soundId = startCall(source, data.phone, data.isAnon)
	cb(soundId)
end)

DGCore.Functions.CreateCallback('dg-phone:server:endCall', function(source, cb)
	local Player = DGCore.Functions.GetPlayer(source)
	local _callId = getPlayerCallId(source)
	if (_callId) then
		endCall(_callId)
	end
	cb()
end)

DGCore.Functions.CreateCallback('dg-phone:server:initiateCall', function(source, cb, data)
	local Player = DGCore.Functions.GetPlayer(source)
	local _callId = getPlayerCallId(source)
	if (not _callId) then
		return
	end
	initiateCall(_callId, data.target)
	cb()
end)