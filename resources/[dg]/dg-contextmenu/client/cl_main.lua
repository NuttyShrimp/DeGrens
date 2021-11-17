generateKeys = function(options)
	setKeys = function(data)
		for k,v in pairs(data) do
			if (v.key == nil) then
				v.key = currentKey
				currentKey = currentKey + 1
			end
			if (v.submenus) then
				setKeys(v.submenus)
			end
		end
	end
	currentKey = 1
	setKeys(options)
	return options
end

openMenu = function(options)
	options = generateKeys(options)
	SendNUIMessage({
		action = "OPEN_MENU",
		data = options
	})
	SetNuiFocus(true, true)
end

closeMenu = function()
	SetNuiFocus(false, false)
	SendNUIMessage({
    action = "CLOSE_MENU"
  })
end

exports('openMenu', openMenu)
exports('closeMenu', closeMenu)

RegisterNUICallback('triggerCMAction', function(data, cb)
	TriggerEvent(data.action, data.data)
	cb('ok')
end)

RegisterNUICallback('close', function(data, cb)
	closeMenu()
	cb('ok')
end)