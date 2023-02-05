DGCore.Functions = {}
DGCore.RequestId = 0 -- IDX of promises
DGCore.NotiId = 1 -- Ids of persistent notifications
DGCore.Promises = {} -- Promises

-- Player
function DGCore.Functions.GetPlayerData(cb)
  return DGCore.PlayerData
end

function DGCore.Functions.TriggerCallback(name, cb, ...)
	if (cb == nil or not DGCore.Shared.isFunction(cb)) then
		-- Promised based return
		local callId, solved = DGCore.RequestId, false
		DGCore.RequestId = DGCore.RequestId + 1

		DGCore.Promises[callId] = promise:new()

		if cb then
			TriggerServerEvent('DGCore:server:TriggerPromiseCallback', name, callId, cb, ...)
		else
			TriggerServerEvent('DGCore:server:TriggerPromiseCallback', name, callId, ...)
		end
		-- Check if solved otherwise throw timeout
		Citizen.SetTimeout(20000, function()
			if not solved then
				DGCore.Promises[callId]:resolve(nil)
			end
		end)

		local response = Citizen.Await(DGCore.Promises[callId])
		solved = true

		-- Remove with timeout so data is not lost
		Citizen.SetTimeout(5000, function()
			DGCore.Promises[callId] = nil
		end)

		return response
	else
		DGCore.ServerCallbacks[name] = cb
		TriggerServerEvent('DGCore:Server:TriggerCallback', name, ...)
	end
end