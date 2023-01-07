local context = {
	-- 0 = closed, 1 = open, 2 = camera
	state = 0,
	inCall = false,
	isMuted = false,
	isDisabled = true,
	characterLoaded = false,
	hasPhone = false,
}
oldContext = {
	state = 0,
	inCall = false,
	isMuted = false,
	isDisabled = true,
	characterLoaded = false,
	hasPhone = false
}

getState = function(key)
	if (context[key] == nil) then
		print('[DG-Phone] Error Getter: State key ' .. key .. ' does not exist.')
		return false
	end
	return context[key]
end

setState = function(key, value)
	if (context[key] == nil) then
		print('[DG-Phone] Error Setter: State key ' .. key .. ' does not exist.')
	end
	oldContext[key] = context[key]
	context[key] = value
	if key == 'state' then
		setPhoneState(value)
	end
	if key == 'inCall' and value ~= oldContext[key] then
		setPhoneCallAnim(value)
	end
	if key == 'hasPhone' and value == false and context.state ~= 0 then
		closePhone()
	end
end

canOpen = function()
	return not context.isDisabled and context.characterLoaded and context.hasPhone and not DGX.Hospital.isDown() and not DGX.Police.isCuffed()
end

RegisterNetEvent('dg-phone:client:setState', setState)

exports('isOpen', function()
  return context.state ~= 0
end)