plyChars = {}
nuiMounted = false

setupCharMenu = function()
  Citizen.CreateThread(function()
    while (not NetworkIsSessionStarted()) do
      Wait(100)
      print('Awaiting Network sessiosn')
    end
    DGX.Events.awaitSession()

    print('DGX session started')
    local ped = PlayerPedId()
    setPlayerToWaitLoc()
    DGCore.Functions.TriggerCallback('dg-chars:server:setupClient')
    while not HasCollisionLoadedAroundEntity(ped) do
      Wait(10)
      ped = PlayerPedId()
      debug("Waiting for collision to load around ped...")
    end
    createPlayerSeats()
    plyChars = DGCore.Functions.TriggerCallback('dg-chars:server:getChars')
    spawnCharPeds()
    Cam.createCam(Config.Cam.coords, Config.Cam.rot, 60.0)
    while not nuiMounted do
      debug("Waiting for NUI to mount...")
      Wait(10)
    end
    TriggerEvent("loadscreen:disableScree")
    DoScreenFadeIn(1)
    openCharUI()
  end)
end

closeCharMenu = function()
  closeCharUI()
  removeEntities()
  Cam.destroyCamera()
  plyChars = {}
  local ped = PlayerPedId()
  FreezeEntityPosition(ped, false)
end

RegisterNetEvent('chars:client:logOut', function()
  DoScreenFadeOut(250)
  while not IsScreenFadedOut() do
    Wait(10)
  end
  setupCharMenu()
end)

RegisterNetEvent('onResourceStart', function(res)
  if res ~= GetCurrentResourceName() then
    return
  end
  if LocalPlayer.state.isLoggedIn then
    return
  end
  setupCharMenu()
end)

RegisterNetEvent('onResourceStop', function(res)
  if res ~= GetCurrentResourceName() then
    return
  end
  removeEntities()
  Cam.destroyCamera()
  plyChars = {}
  local ped = PlayerPedId()
  FreezeEntityPosition(ped, false)
  if Spawn.faded or Cam.faded then
    DoScreenFadeIn(1)
  end
end)

setupCharMenu()