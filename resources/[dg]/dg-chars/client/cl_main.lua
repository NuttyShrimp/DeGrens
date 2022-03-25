plyChars = {}
nuiMounted = false

Citizen.CreateThread(function()
	while true do
		Citizen.Wait(0)
		if NetworkIsSessionStarted() then
			setupCharMenu()
			return
		end
	end
end)

setupCharMenu = function()
	local ped = PlayerPedId()
	setPlayerToWaitLoc()
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
	openCharUI()
end

closeCharMenu = function()
	closeCharUI()
	removeEntities()
	Cam.destroyCamera()
	plyChars = {}
	local ped = PlayerPedId()
	FreezeEntityPosition(ped, false)
end

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
