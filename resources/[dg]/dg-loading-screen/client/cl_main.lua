local called = false

RegisterNetEvent('loadscreen:disableScreen')
AddEventHandler('loadscreen:disableScreen', function()
  if not called then
    SendLoadingScreenMessage(json.encode({
      shutDown = true
    }))
    called = true
    ShutdownLoadingScreenNui()
    ShutdownLoadingScreen()
  end
end)

RegisterNetEvent("dgx:isProduction", function(isProd)
  if not GetIsLoadingScreenActive() then return end
  SendLoadingScreenMessage(json.encode({
    setEnv = isProd
  }))
end)