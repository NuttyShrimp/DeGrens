local inZone = false
local activeZones = {
	apartment = true,
	apartment_leave = false,
	apartment_stash = false,
	apartment_bed = false,
	apartment_outfit = false
}
local actionKeys = {
	"GeneralUse",
	"housingMain"
}

Citizen.CreateThread(function()
	for i,v in ipairs(Config.Locations) do
		local zone = v.enter
		zone.options.data = zone.options.data or {}
		zone.options.data.id = v.name
		exports["dg-lib"]:AddBoxZone("apartment", zone.center, zone.length, zone.width, zone.options)
	end
end)

local isActiveZone = function(name)
	return activeZones[name] or false
end

RegisterNetEvent('dg-polyzone:enter')
AddEventHandler('dg-polyzone:enter', function(name, data, center)
	if (not isActiveZone(name)) then return end
	inZone = name
	local generalUseKey = exports["dg-lib"]:GetCurrentKeyMap("+GeneralUse")
	local housingMainKey = exports["dg-lib"]:GetCurrentKeyMap("+housingMain")
	if (name == "apartment") then
		exports['dg-lib']:showInteraction(('%s - Apartment'):format(generalUseKey), 'info')
		return
	end
	local info = getInterActionByType(getInfoByType(currentApartmentName), name:gsub('apartment_', ''))
	if (not info) then return end
	local str = ''
	for i,v in ipairs(actionKeys) do
		if (info[v]) then
      str = str .. ('%s - %s, '):format(exports["dg-lib"]:GetCurrentKeyMap('+'..v), info[v].label)
    end
	end
	str = str:gsub(', $', '')
	exports['dg-lib']:showInteraction(str)
end)

RegisterNetEvent('dg-polyzone:exit')
AddEventHandler('dg-polyzone:exit', function(name)
	if (not isActiveZone(name)) then return end
	inZone = false
	local info = (currentApartmentName ~= nil and getInterActionByType(getInfoByType(currentApartmentName), name:gsub('apartment_', ''))) or nil
	if (name == "apartment" or (info ~= nil and info.zone)) then
		exports['dg-lib']:hideInteraction()
		exports["dg-contextmenu"]:closeMenu()
  end
end)

RegisterNetEvent('dg-lib:keyEvent')
AddEventHandler('dg-lib:keyEvent', function(name, isDown)
	if (not inZone or not isDown) then return end
	local info = (currentApartmentName ~= nil and getInterActionByType(getInfoByType(currentApartmentName), inZone:gsub('apartment_', ''))) or nil
	if name == "GeneralUse" then
		if (inZone == "apartment") then
			DGCore.Functions.TriggerCallback('dg-apartments:server:getApartmentMenu', function(menu)
				exports["dg-contextmenu"]:openMenu(menu);
			end)
		end
		if (info ~= nil and info.GeneralUse) then
			emitter = TriggerEvent
			if (info.GeneralUse.isServer) then
				emitter = TriggerServerEvent
			end
			emitter(info.GeneralUse.event)
		end
	end
	if name == "housingMain" then
		if (info ~= nil and info.housingMain) then
			emitter = TriggerEvent
			if (info.housingMain.isServer) then
				emitter = TriggerServerEvent
			end
			emitter(info.housingMain.event)
		end
	end
end)

-- Interactions

getInfoByType = function(type)
	for i,v in ipairs(Config.Locations) do
		if (v.name == type) then
			return v
		end
	end
end

getInterActionByType = function(info, type)
	for k, v in pairs(info.interactions) do
		if (v.type == type) then
			return v
		end
	end
end

getInterActionZone = function(info, type)
	for k, v in pairs(info.interactions) do
		if (v.zone == type) then
      return v
    end
	end
end

getInteractionPeekLabels = function(info, type)
	local labels = {}
  for k, v in pairs(info.interactions) do
    if (v.zone == "peek" and v.type == type) then
      for i,j in ipairs(v.options) do
        labels[#labels+1] = j.label
      end
    end
  end
  return labels
end

enableInteractionZones = function(type)
	currentApartmentName = type
	local info = getInfoByType(type)
	if (not info) then return end
	for k,v in ipairs(info.interactions) do
		name = "apartment_"..v.type
		activeZones[name] = true
		if (v.zone == "poly") then
			exports["dg-lib"]:AddBoxZone(name, BASE_SHELL_COORDS+v.offset, v.dist, v.dist, {
				data = {
					info = v,
					id = 1 -- So we know only 1 can be created
				},
				minZ = (BASE_SHELL_COORDS+v.offset).z - 2,
				maxZ = (BASE_SHELL_COORDS+v.offset).z + 2,
			})
		end
		if ( v.zone == "peek" ) then
			exports['dg-peek']:AddTargetModel(v.model, {
				options = v.options,
				distance = v.dist
			})
		end
	end
end

remomveInteractionZones = function(type)
	currentApartmentName = nil
	local info = getInfoByType(type)
	if (not info) then return end
	for k,v in pairs(activeZones) do
		-- remove apartment_ from string
		if (k == 'apartment') then ::skip_to_next:: end
		local name = k:gsub("apartment_", "")
    if (v) then
	    zoneType = getInterActionZone(info, name)
	    if (zoneType == "poly") then
	      exports["dg-lib"]:RemoveZone("apartment_"..k.."_1")
	    elseif (zoneType == "peek") then
      	local labels = getInteractionPeekLabels(info, k)
		    exports['dg-peek']:RemoveTargetModel(v.model, labels)
	    end
    end
  end
  activeZones = {
    apartment = true,
    apartment_leave = false,
    apartment_stash = false,
    apartment_bed = false,
    apartment_outfit = false
  }
end