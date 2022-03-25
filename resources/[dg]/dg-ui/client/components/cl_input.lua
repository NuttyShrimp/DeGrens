local inputAmountId = 1

openInput = function(data)
	local cbURLCache = data.callbackURL
	local newCbURL = ('__input:%d'):format(inputAmountId)
	data.callbackURL = newCbURL
	inputAmountId = inputAmountId + 1
	local InputProm = promise:new()

	RegisterNetEvent(('__dg_ui:%s'):format(newCbURL), function(data, cb)
		InputProm:resolve(data)
		cb({data={}, meta={ok=true, message='done'}})
	end)
	RegisterUIEvent(newCbURL)
	openApplication('input', data)

	local res = Citizen.Await(InputProm)

	if cbURLCache then
		TriggerEvent(('__dg_ui:%s'):format(cbURLCache), res)
	end

	return res.values
end
exports('openInput', openInput)