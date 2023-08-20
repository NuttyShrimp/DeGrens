-- This is an almost straight copy of polyzone but is specific for dg-peek targets
local DEBUG_ENABLED = false
local DEBUG_MAX_DISTANCE = 300.0
local targetZone = nil
local createdZones = {}

-- When zone is polyzone, the center property of zone is a vec2, we calculate z coord using min and max z
local getZoneCenter = function(zone)
  local zCoord = 0
  if type(zone.center) == 'vector3' then
    zCoord = zone.center.z
  else
    local minZ = zone.minZ or 0
    local maxZ = zone.maxZ or 0
    zCoord = ((maxZ - minZ) / 2) + minZ
  end
  return {
    x = zone.center.x, 
    y = zone.center.y, 
    z = zCoord
  }
end

local function addToTargetZone(zone)
  if targetZone ~= nil then
    targetZone:AddZone(zone)
  else
    targetZone = ComboZone:Create({ zone }, { name = "dg-polytarget" })
    targetZone:onPointInOutExhaustive(function()
      local coords = DGX.RayCast.getLastHitResult().coords;
      if not coords then
        return vector3(0, 0, 0)
      end
      return vector3(coords.x, coords.y, coords.z)
    end, function(isPointInside, point, insideZones, enteredZones, leftZones)
      if leftZones ~= nil then
        for i = 1, #leftZones do
          TriggerEvent("dg-polytarget:exit", leftZones[i].name, leftZones[i].data, getZoneCenter(leftZones[i]))
          if DEBUG_ENABLED then
						debugPrint('[dg-polytarget] Left zone | name: %s | data: %s | center: %s', leftZones[i].name, leftZones[i].data, leftZones[i].center)
          end
        end
      end
      if enteredZones ~= nil then
        for i = 1, #enteredZones do
          TriggerEvent("dg-polytarget:enter", enteredZones[i].name, enteredZones[i].data, getZoneCenter(enteredZones[i]))
          if DEBUG_ENABLED then
            debugPrint('[dg-polytarget] Entered zone | name: %s | data: %s | center: %s', enteredZones[i].name, enteredZones[i].data, enteredZones[i].center)
          end
        end
      end
    end, 250)
  end
end

local function doCreateZone(options)
  local key = options.name
  if options.data and options.data.id then
    key = ('%s_%s'):format(options.name, tostring(options.data.id))
  end

  if createdZones[key] then
    print('polytarget with name/id already added, skipping: ', key)
    return false
  end

  createdZones[key] = true
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

exports('removeZone', function(name, id)
  if not targetZone then return end

  -- Copy zones table
  local zones = {}
  for i, zone in pairs(targetZone.zones) do
    zones[#zones + 1] = zone
  end

  local isCorrectZone = function(zone)
    return zone.name == name and (id == nil or zone.data.id == id)
  end

  for i, zone in pairs(zones) do
    if isCorrectZone(zone) then
      targetZone:RemoveZone(isCorrectZone)
      local id = zone.data and zone.data.id and ('%s_%s'):format(name, zone.data.id) or name
      createdZones[id] = nil
      zone:destroy()
    end
  end
end)

local function toggleDebug(toggle)
  DEBUG_ENABLED = toggle
  print('polytarget debug: ' .. tostring(DEBUG_ENABLED))
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
end

DGX.Events.onNet('polytarget:debug:toggle', function(toggle)
  if DEBUG_ENABLED == toggle then return end
  toggleDebug(toggle)
end)

debugPrint = function(msg, ...)
  local params = {}

	for _, param in ipairs({ ... }) do
		if type(param) == "table" then
			param = json.encode(param, { indent = true })
		end

		params[#params + 1] = param
	end

	print((msg):format(table.unpack(params)))
end