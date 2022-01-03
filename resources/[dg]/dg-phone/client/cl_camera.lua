RegisterNUICallback('camera/open', function(data, cb)
	closePhone(2)
	cb({data={}, meta={ok=true, message="done"}})
end)

RegisterNUICallback('images/get', function(data, cb)
	local images = DGCore.Functions.TriggerCallback('dg-phone:server:photo:get', nil)
	cb({data=images, meta={ok=true, message="done"}})
end)

RegisterNUICallback('photo/delete', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:photo:delete', nil, data)
	cb({data={}, meta={ok=true, message="done"}})
end)