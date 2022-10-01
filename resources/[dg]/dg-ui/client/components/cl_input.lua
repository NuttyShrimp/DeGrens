local currentInputId = 1

openInput = function(openingData)
	local callbackURL = ('__input:%d'):format(currentInputId)
  currentInputId = currentInputId + 1
	openingData.callbackURL = callbackURL
	local inputPromise = promise:new()

	AddEventHandler(('__dg_ui:%s'):format(callbackURL), function(data, cb)
		inputPromise:resolve(data)
		cb({data={}, meta={ok=true, message='done'}})
	end)
	RegisterUIEvent(callbackURL)
	openApplication('input', openingData)

	return Citizen.Await(inputPromise)
end
exports('openInput', openInput)