plyChars = {}
nuiMounted = false

setupCharMenu = function()
  Citizen.CreateThread(function()
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
    ShutdownLoadingScreen()
    ShutdownLoadingScreenNui()
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

RegisterNetEvent('dg-chars:client:startSession', function()
  setupCharMenu()
end)


RegisterNetEvent('onResourceStop', function(res)
	if res ~= GetCurrentResourceName() then return end
	removeEntities()
	Cam.destroyCamera()
	plyChars = {}
	local ped = PlayerPedId()
	FreezeEntityPosition(ped, false)
	if Spawn.faded or Cam.faded then
		DoScreenFadeIn(1)
	end
end)

RegisterCommand("char", function()
  exports['dg-ui']:addNotification("Hang tight, we're logging you out...", "info")
  TriggerServerEvent('qb-houses:server:LogoutLocation')
  setupCharMenu()
end)