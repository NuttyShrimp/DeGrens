exports('showInteraction', function(message, type)
	if not type then type = 'info' end
	SendNUIMessage({
		app = "interaction",
		action = "open",
		data = {
			msg = message,
			type = type
		}
	})
end)

exports('hideInteraction', function()
	SendNUIMessage({
		app = "interaction",
		action = "close",
		data = {}
	})
end)

RegisterCommand('testInter', function()
	exports["dg-lib"]:showInteraction('E - Test', "error")
end)

RegisterCommand('testInter2', function()
	exports["dg-lib"]:hideInteraction()
end)