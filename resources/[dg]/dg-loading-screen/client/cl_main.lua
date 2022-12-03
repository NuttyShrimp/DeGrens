local called = false

local stopLoadingScreen = function()
  SendLoadingScreenMessage(json.encode({
    shutDown = true
  }))
  ShutdownLoadingScreen()
  ShutdownLoadingScreenNui()
end
  
RegisterNetEvent('loadscreen:disableScreen')
AddEventHandler('loadscreen:disableScreen', function()
  if called then return end

  called = true

  -- Debugging shit and seeing if this works to prevent double loadingscreen
  while true do
    stopLoadingScreen()
    Wait(1000)
    if not GetIsLoadingScreenActive() then break end
    print('Failed to shutdown loading screen. Trying again...')
  end
end)

RegisterNetEvent("dgx:isProduction", function(isProd)
  if not GetIsLoadingScreenActive() then return end
  SendLoadingScreenMessage(json.encode({
    setEnv = isProd
  }))
end)