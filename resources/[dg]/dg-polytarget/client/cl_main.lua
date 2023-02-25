-- This is very lookalike to polyzone but is specific for dg-peek targets
local DEBUG_ENABLED = false
local DEBUG_MAX_DISTANCE = 300.0

IsInVehicle = false
targetZone = nil
local createdTargetZones = {}

local function addToTargetZone(zone)
  if targetZone ~= nil then
    targetZone:AddZone(zone)
  else
    targetZone = ComboZone:Create({ zone }, { name = "dg-polytarget" })
    targetZone:onPointInOutExhaustive(function()
      local coords = DGX.RayCast.getLastHitCoord()
      if not coords then
        return vector3(0, 0, 0)
      end
      return vector3(coords.x, coords.y, coords.z)
    end, function(isPointInside, point, insideZones, enteredZones, leftZones)
      if leftZones ~= nil then
        for i = 1, #leftZones do
          TriggerEvent("dg-polytarget:exit", leftZones[i].name, leftZones[i].data, exports['dg-lib']:vectorToTable(leftZones[i].center))
          if DEBUG_ENABLED then
						print('[dg-polytarget] Left zone | name: %s | data: %s | center: %s', leftZones[i].name, leftZones[i].data, leftZones[i].center)
          end
        end
      end
      if enteredZones ~= nil then
        for i = 1, #enteredZones do
          TriggerEvent("dg-polytarget:enter", enteredZones[i].name, enteredZones[i].data, exports['dg-lib']:vectorToTable(enteredZones[i].center))
          if DEBUG_ENABLED then
            print('[dg-polytarget] Entered zone | name: %s | data: %s | center: %s', enteredZones[i].name, enteredZones[i].data, enteredZones[i].center)
          end
        end
      end
    end, 250)
  end
end

local function doCreateZone(options)
  if options.data and options.data.id then
    local key = options.name .. "_" .. tostring(options.data.id)
    if not createdTargetZones[key] then
      createdTargetZones[key] = true
      return true
    else
      print('polytarget with name/id already added, skipping: ', key)
      return false
    end
  end
  return true
end

exports("AddBoxZone", function(name, vectors, length, width, options)
  if not options then
    options = {}
  end
  options.name = name
  options.debugPoly = options.debugPoly
  if not doCreateZone(options) then
    return
  end
  local boxCenter = type(vectors) ~= 'vector3' and vector3(vectors.x, vectors.y, vectors.z) or vectors
  local zone = BoxZone:Create(boxCenter, length, width, options)
  addToTargetZone(zone)
end)

exports("AddCircleZone", function(name, center, radius, options)
  if not options then
    options = {}
  end
  options.name = name
  options.debugPoly = options.debugPoly
  if not doCreateZone(options) then
    return
  end
  local circleCenter = type(center) ~= 'vector3' and vector3(center.x, center.y, center.z) or center
  local zone = CircleZone:Create(circleCenter, radius, options)
  addToTargetZone(zone)
end)

exports("AddPolyZone", function(name, pVectors, options)
  local vectors = {}
  if (type(pVectors) == "table") then
    for i, v in ipairs(pVectors) do
      table.insert(vectors, vector2(v.x, v.y))
    end
  end
  if not options then
    options = {}
  end
  options.name = name
  options.debugPoly = options.debugPoly
  if not doCreateZone(options) then
    return
  end
  local zone = PolyZone:Create(vectors ~= nil and vectors or pVectors, options)
  addToTargetZone(zone)
end)

exports('getTargetZones', function()
  if (targetZone == nil) then
    return {}
  end
  local zones = {}
  for i, zone in ipairs(targetZone.zones) do
    table.insert(zones, {
      centerstr = json.encode(zone.center),
      length = zone.length,
      width = zone.width,
      name = zone.name,
      data = zone.data
    })
  end
  return zones
end)

-- IMPORTANT: This removes all zones under this name
exports('removeZone', function(name, id)
  local zones = {}
  if not targetZone then return end
  for i, zone in pairs(targetZone.zones) do
    zones[#zones + 1] = zone
  end
  for i, zone in pairs(zones) do
    if zone.name == name and (id == nil or zone.data.id == id) then
      targetZone:RemoveZone(name)
      local id = ('%s_%s'):format(name, zone.data.id)
      createdTargetZones[id] = nil
      zone:destroy()
    end
  end
end)

DGX.BaseEvents.onEnteredVehicle(function()
  IsInVehicle = true
end)

DGX.BaseEvents.onLeftVehicle(function()
  IsInVehicle = false
end)

function toggleTargetDebug(toggle)
  DEBUG_ENABLED = toggle
  if (DEBUG_ENABLED and targetZone ~= nil) then
    Citizen.CreateThread(function()
      while DEBUG_ENABLED do
        local plyPos = GetEntityCoords(PlayerPedId()).xy
        for i, zone in ipairs(targetZone.zones) do
          if zone and not zone.destroyed and #(plyPos - zone.center.xy) < DEBUG_MAX_DISTANCE then
            zone:draw()
          end
        end
        Wait(0)
      end
    end)
  end
  print('polytarget debug: ' .. tostring(DEBUG_ENABLED))
end

DGX.Events.onNet('polytarget:debug:toggle', function(toggle)
  if DEBUG_ENABLED == toggle then return end
  toggleTargetDebug(toggle)
end)