RegisterUICallback('phone/justice/get', function(data, cb)
	data = DGX.RPC.execute('dg-phone:server:justice:get')
	cb({data=data, meta={ok=true, message='done'}})
end)

RegisterUICallback('phone/justice/setAvailable', function(data, cb)
	DGX.Events.emitNet('dg-phone:server:justice:setAvailable', nil, data)
	cb({data={}, meta={ok=true, message='done'}})
end)