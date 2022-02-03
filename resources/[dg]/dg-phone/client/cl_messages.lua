RegisterNUICallback('messages/get', function(data, cb)
	local messages = DGCore.Functions.TriggerCallback('dg-phone:server:getMessages', nil ,data)
	cb({data = messages, meta = {ok = true, message = "done"}})
end)

RegisterNUICallback('messages/send', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:message:send', nil,data)
	cb({data = result, meta = {ok = true, message = "done"}})
end)

RegisterNetEvent('dg-phone:client:message:receive', function(message, otherPhone)
	SendNUIMessage({
		app = 'messages',
		action = 'addNew',
		data = {
			message = message,
			otherPhone = otherPhone
		}
	})
end)