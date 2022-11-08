local called = false

RegisterNetEvent('loadscreen:disableScreen')
AddEventHandler('loadscreen:disableScreen', function()
	if not called then
		SendLoadingScreenMessage(json.encode({
			shutDown = true
		}))
		called = true
		ShutdownLoadingScreenNui()
	end
end)

RegisterNetEvent("dgx:isProduction", function(isProd)
  SendLoadingScreenMessage(json.encode({
    setEnv = isProd
  }))
end)

Citizen.CreateThread( function()
	ShutdownLoadingScreen()
end)