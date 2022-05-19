loadAnimDict = function(dict)
	RequestAnimDict(dict)
	while not HasAnimDictLoaded(dict) do
		Citizen.Wait(5)
	end
end

loadModel = function(hash)
	RequestModel(hash)
	while not HasModelLoaded(hash) do
		Citizen.Wait(5)
	end
end

drawText3Ds = function(x, y, z, text)
	SetTextScale(0.35, 0.35)
    SetTextFont(4)
    SetTextProportional(1)
    SetTextColour(255, 255, 255, 215)
    SetTextEntry("STRING")
    SetTextCentre(true)
    AddTextComponentString(text)
    SetDrawOrigin(x,y,z, 0)
    DrawText(0.0, 0.0)
    local factor = (string.len(text)) / 370
    DrawRect(0.0, 0.0+0.0125, 0.017+ factor, 0.03, 0, 0, 0, 75)
    ClearDrawOrigin()
end

isAcceptedLocation = function(coords)
	local handle = StartShapeTestCapsule(coords.x, coords.y, coords.z + 4, coords.x, coords.y, coords.z - 2, 2, 1, PlayerPedId(), 7)
	local _, _, _, _, materialHash, _ = GetShapeTestResultIncludingMaterial(handle)
	if materialHash then
		return Config.GroundMaterials[materialHash] ~= nil and not IsEntityInWater(PlayerPedId())
	end
	return false
end

spawnPlantObject = function(index)
	local plant = activePlants[index]
	local model = Config.Stages[plant.data.stage]
	loadModel(model)

	local object = CreateObject(model, plant.coords.x, plant.coords.y, plant.coords.z, false, false, false)
	while not DoesEntityExist(object) do Citizen.Wait(5) end
	PlaceObjectOnGroundProperly(object)

	local coords = GetEntityCoords(object)
	SetEntityCoords(object, coords.x, coords.y, coords.z - 0.6) -- move down to remove pot
	FreezeEntityPosition(object, true)
	SetEntityAsMissionEntity(object)

	activePlants[index].object = object
end	

despawnPlantObject = function(index)
	local plant = activePlants[index]

	if DoesEntityExist(plant.object) then
		SetEntityAsMissionEntity(plant.object, true, true)
		DeleteObject(plant.object)
	end

	activePlants[index].object = nil
end

respawnPlantObject = function(index)
	despawnPlantObject(index)
	spawnPlantObject(index)
end

getPlantIdFromEntity = function(entity)
	for k, v in pairs(activePlants) do
		if v.object == entity then
			return k
		end
	end
	return nil
end

exports("isValidPlant", function(entity)
	for k, v in pairs(activePlants) do
		if v.object == entity then
			return true
		end
	end
	return false
end)

exports("checkStatus", function(entity)
	local id = getPlantIdFromEntity(entity)
	openApplication('contextmenu', {
		{
			title = ("Gender: %s"):format(activePlants[id].gender == "F" and "Vrouwelijk" or "Mannelijk")
		},
		{
			title = ("Voedsel: %s percent"):format(activePlants[id].data.food)
		}
	})
end)

exports("feedPlant", function(entity)
	lookAtPlant(entity)
	local id = getPlantIdFromEntity(entity)

	if activePlants[id].data.food >= 100 then 
		DGCore.Functions.Notify("Deze plant is al gevoed.", "error")
	else
    local wasCancelled, _ = exports['dg-misc']:Taskbar("hand-holding-seedling", 'Voederen...', 7500, {
      canCancel = true,
      cancelOnDeath = true,
      controlDisables = {
        movement = true,
        carMovement = true,
        combat = true,
      },
      animation = {
        animDict = "timetable@gardener@filling_can",
        anim = "gar_ig_5_filling_can",
        flags = 16,
      }
    })
    ClearPedTasks(PlayerPedId())
    if wasCancelled then return end
    TriggerServerEvent("dg-weed:server:FeedPlant", id)
	end
end)

exports("cutPlant", function(entity)
	lookAtPlant(entity)
	local id = getPlantIdFromEntity(entity)

	local canCut = DGCore.Functions.TriggerCallback("dg-weed:server:CanCut", nil, id)
	if not canCut then 
		DGCore.Functions.Notify("Deze plant is nog niet volgroeid", "error")
		return
	end

  local wasCancelled, _ = exports['dg-misc']:Taskbar("scissors", 'Knippen...', 7500, {
    canCancel = true,
    cancelOnDeath = true,
    controlDisables = {
      movement = true,
      carMovement = true,
      combat = true,
    },
    animation = {
      animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
      anim = "machinic_loop_mechandplayer",
      flags = 0,
    }
  })
  ClearPedTasks(PlayerPedId())
  if wasCancelled then return end
  TriggerServerEvent("dg-weed:server:CutPlant", id)
end)

exports("destroyPlant", function(entity)
	lookAtPlant(entity)
	local id = getPlantIdFromEntity(entity)

  local wasCancelled, _ = exports['dg-misc']:Taskbar("hammer-crash", 'Kapot maken...', 7500, {
    canCancel = true,
    cancelOnDeath = true,
    controlDisables = {
      movement = true,
      carMovement = true,
      combat = true,
    },
    animation = {
      animDict = "anim@amb@clubhouse@tutorial@bkr_tut_ig3@",
      anim = "machinic_loop_mechandplayer",
      flags = 0,
    }
  })
  ClearPedTasks(PlayerPedId())
  if wasCancelled then return end
  TriggerServerEvent("dg-weed:server:DestroyPlant", id)
end)

lookAtPlant = function(entity)
	local ped = PlayerPedId()
	local pedCoords = GetEntityCoords(ped)
	local entityCoords = GetEntityCoords(entity)
	local vector = vector2(pedCoords.x - entityCoords.x, pedCoords.y - entityCoords.y) -- calc difference vector
	local heading = math.atan(vector.y/vector.x) -- get radians
	heading = (heading * 180) / 3.14 -- rad to deg
	heading = heading + 90 -- offset because gta coords
	if vector.x < 0 then heading = math.abs(heading) + 180 end -- tan only spans 180 degrees so account for that
	SetEntityHeading(ped, heading)
end