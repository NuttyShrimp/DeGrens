local isMenuOpen = false

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

openMenu = function(options, noFocus)
	options = generateKeys(options)
	SendNUIMessage({
		action = "OPEN_MENU",
		data = options
	})
	isMenuOpen = true
	if (noFocus) then return end
	SetNuiFocus(true, true)
end

closeMenu = function()
	SetNuiFocus(false, false)
	SendNUIMessage({
    action = "CLOSE_MENU"
  })
	isMenuOpen = false
end

exports('openMenu', openMenu)
exports('closeMenu', closeMenu)

RegisterNUICallback('triggerCMAction', function(data, cb)
	local emitter = TriggerEvent
	if (data.isServer) then emitter = TriggerServerEvent end
	emitter(data.action, data.data)
	cb('ok')
end)

RegisterNUICallback('close', function(data, cb)
	closeMenu()
	cb('ok')
end)

RegisterNetEvent('dg-lib:keyEvent', function(name, isDown)
	if (name ~= "menuFocus" or not isDown or not isMenuOpen) then return end
	if (IsNuiFocused()) then return end
	SetNuiFocus(true, true)
end)

exports['dg-lib']:registerKeyMapping('menuFocus', 'Give Contextmenu focus', '+menuFocus', '-menuFocus', 'LMENU', true)