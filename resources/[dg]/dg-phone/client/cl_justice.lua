RegisterNUICallback('justice/get', function(data, cb)
	data = DGCore.Functions.TriggerCallback('dg-phone:server:justice:get')
	cb({data=data, meta={ok=true, message='done'}})
end)

RegisterNUICallback('justice/setAvailable', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:justice:setAvailable', nil, data)
	cb({data={}, meta={ok=true, message='done'}})
end)