RegisterUICallback('phone/camera/open', function(data, cb)
	closePhone(2)
	cb({data={}, meta={ok=true, message="done"}})
end)

RegisterUICallback('phone/gallery/get', function(data, cb)
	local images = DGCore.Functions.TriggerCallback('dg-phone:server:photo:get', nil)
	cb({data=images, meta={ok=true, message="done"}})
end)

RegisterUICallback('phone/gallery/delete', function(data, cb)
	DGCore.Functions.TriggerCallback('dg-phone:server:photo:delete', nil, data)
	cb({data={}, meta={ok=true, message="done"}})
end)