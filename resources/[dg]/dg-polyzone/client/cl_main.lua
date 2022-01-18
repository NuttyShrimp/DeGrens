local DEBUG_ENABLED = false
local DEBUG_MAX_DISTANCE = 300.0
targetZone = nil
local createdZones = {}

local function addToComboZone(zone)
	if targetZone ~= nil then
		targetZone:AddZone(zone)
	else
		targetZone = ComboZone:Create({ zone }, { name = "dg-polyzone" })
		targetZone:onPlayerInOutExhaustive(function(isPointInside, point, insideZones, enteredZones, leftZones)
			if leftZones ~= nil then
				for i = 1, #leftZones do
					TriggerEvent("dg-polyzone:exit", leftZones[i].name)
					if DEBUG_ENABLED then
						debug('[dg-polyzone] left zone: %s', leftZones[i].name)
					end
				end
			end
			if enteredZones ~= nil then
				for i = 1, #enteredZones do
					TriggerEvent("dg-polyzone:enter", enteredZones[i].name, enteredZones[i].data, enteredZones[i].center)
					if DEBUG_ENABLED then
						debug('[dg-polyzone] Entered zone | name: %s | data: %s | center: %s', enteredZones[i].name, enteredZones[i].data, enteredZones[i].center)
					end
				end
			end
		end, 500)
	end
end

local function doCreateZone(options)
	if options.data and options.data.id then
		local key = options.name .. "_" .. tostring(options.data.id)
		if not createdZones[key] then
			createdZones[key] = true
			return true
		else
			print('polyzone with name/id already added, skipping: ', key)
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
	options.debugPoly = DEBUG_ENABLED or options.debugPoly
	if not doCreateZone(options) then
		return
	end
	local boxCenter = type(vectors) ~= 'vector3' and vector3(vectors.x, vectors.y, vectors.z) or vectors
	local zone = BoxZone:Create(boxCenter, length, width, options)
	addToComboZone(zone)
end)

exports("AddCircleZone", function(name, center, radius, options)
	if not options then
		options = {}
	end
	options.name = name
	options.debugPoly = DEBUG_ENABLED or options.debugPoly
	if not doCreateZone(options) then
		return
	end
	local circleCenter = type(center) ~= 'vector3' and vector3(center.x, center.y, center.z) or center
	local zone = CircleZone:Create(circleCenter, radius, options)
	addToComboZone(zone)
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
	options.debugPoly = DEBUG_ENABLED or options.debugPoly
	if not doCreateZone(options) then
		return
	end
	local zone = PolyZone:Create(vectors ~= nil and vectors or pVectors, options)
	addToComboZone(zone)
end)

exports('getComboZones', function()
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
exports('removeZone', function(name)
	local removedZone = targetZone:RemoveZone(name)
	local id = ('%s_%s'):format(name, removedZone.data.id)
	createdZones[id] = nil
	removedZone:destroy()
end)

local function toggleDebug()
	DEBUG_ENABLED = not DEBUG_ENABLED
	print('polyzone debug: ' .. tostring(DEBUG_ENABLED))
	if (DEBUG_ENABLED and targetZone ~= nil) then
		while DEBUG_ENABLED do
			local plyPos = GetEntityCoords(PlayerPedId()).xy
			for i, zone in ipairs(targetZone.zones) do
				if zone and not zone.destroyed and #(plyPos - zone.center.xy) < DEBUG_MAX_DISTANCE then
					zone:draw()
				end
			end
			Wait(0)
		end
	end
end

if (GetConvar('is_production', "true") == "false") then
	RegisterCommand('polyzone:debug:toggle', function()
		toggleDebug()
	end)
end