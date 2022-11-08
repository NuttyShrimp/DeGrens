local doors = {}
local registeredTokens = {}
local initializing = true
local currentLinkedId = 1

DGX.Inventory.registerUseable('lockpick', function(src, item)
  TriggerEvent('dg-doorlock:server:usedLockpick', src, item.id)
  TriggerClientEvent("lockpick:UseLockpick", src)
end)

DGX.Inventory.registerUseable('thermite', function(src)
  TriggerClientEvent('thermite:UseThermite', src)
end)

Citizen.CreateThread(function()
  local data = LoadResourceFile(GetCurrentResourceName(), "doors.json")
  data = json.decode(data)

  for k, _ in pairs(data) do
    registeredTokens[tonumber(k)] = true
  end

  for k, door in pairs(data) do
    local token = tonumber(k)

    if DGCore.Shared.tableLen(door.doors) == 1 then
      doors[token] = {
        locked = door.locked,
        authorized = door.authorized or {},
        lockpickable = door.lockpickable or false,
        thermiteable = door.thermiteable or false,
        distance = tonumber(door.distance),
        object = GetHashKey(door.doors[1].object),
        coords = vector3(door.doors[1].coords.x, door.doors[1].coords.y, door.doors[1].coords.z),
        noInteraction = door.noInteraction,
        noAnimation = door.noAnimation,
        playSound = door.playSound,
        polyzone = door.polyzone or false,
      }
    else
      for i, object in pairs(door.doors) do
        if i ~= 1 then token = generateToken() end -- we give first one the original id and rest a generated id
        doors[token] = {
          locked = door.locked,
          authorized = door.authorized or {},
          lockpickable = door.lockpickable or false,
          thermiteable = door.thermiteable or false,
          distance = tonumber(door.distance) or 2.0,
          object = GetHashKey(object.object),
          coords = vector3(object.coords.x, object.coords.y, object.coords.z),
          noInteraction = door.noInteraction or false,
          noAnimation = door.noAnimation or false,
          playSound = door.playSound or false,
          polyzone = door.polyzone or false,
          linkedDoor = currentLinkedId,
        }
      end
      currentLinkedId = currentLinkedId + 1
    end
  end

  initializing = false
  print("DOORS LOADED")
end)

DGCore.Functions.CreateCallback("dg-doorlock:server:FetchDoors", function(source, cb)
  while initializing do Citizen.Wait(100) end
  cb(doors)
end)

generateToken = function()
  local token = math.random(999999)
  if registeredTokens[token] then
    return generateToken()
  end
  return token
end

setDoorState = function(id, state)
  doors[id].locked = state
  TriggerClientEvent("dg-doorlock:client:changeDoorLockState", -1, id, state)
end

changeDoorLockState = function(doorId, doorState)
  while initializing do Citizen.Wait(100) end
  setDoorState(doorId, doorState)

  -- if it has linked doors also change those
  if not doors[doorId].linkedDoor then return end
  for id, door in pairs(doors) do
    if door.linkedDoor == doors[doorId].linkedDoor and doorId ~= id then
      setDoorState(id, doorState)
    end
  end
end

RegisterNetEvent("dg-doorlock:server:changeDoorLockState", changeDoorLockState)
exports('changeDoorLockState', changeDoorLockState)

DGX.Events.onNet('dg-doorlock:server:triedLockpickingDoor', function(src, id)
  while initializing do Citizen.Wait(100) end
  local door = doors[id]
  if not door then return end
  local rng = math.random(100)
  if rng < DGX.Config.getConfigValue('dispatch.callChance.doorlockpick') then
    DGX.Police.createDispatchCall({
      tag = "10-31",
      title = 'Poging to inbraak',
      description = "Er was een verdacht persoon aan een deur aan het prutsen",
      coords = DGX.Util.ArrayToVector3(exports['dg-lib']:vectorToTable(door.coords)),
      criminal = src,
      blip = {
        sprite = 102,
        color = 0
      }
    })
  end
end)