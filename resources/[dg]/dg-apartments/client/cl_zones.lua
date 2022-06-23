Citizen.CreateThread(function()
	for i,v in ipairs(Config.Locations) do
		local zone = v.enter
		zone.options.data = zone.options.data or {}
		zone.options.data.id = v.name
		exports["dg-polyzone"]:AddBoxZone("apartment", zone.center, zone.length, zone.width, zone.options)

		locBlip = AddBlipForCoord(zone.center)

		SetBlipSprite (locBlip, 475)
		SetBlipDisplay(locBlip, 4)
		SetBlipScale  (locBlip, 0.7)
		SetBlipAsShortRange(locBlip, true)
		SetBlipColour(locBlip, 6)

		BeginTextCommandSetBlipName("STRING")
		AddTextComponentSubstringPlayerName(("Appartement (%s)"):format(v.label))
		EndTextCommandSetBlipName(locBlip)
	end
end)

RegisterNetEvent('dg-polyzone:enter')
AddEventHandler('dg-polyzone:enter', function(name)
  if (name == "apartment") then
    local generalUseKey = exports["dg-lib"]:GetCurrentKeyMap("+GeneralUse")
    exports['dg-ui']:showInteraction(('%s - Apartment'):format(generalUseKey), 'info')
    inZone = name
    return
  end
end)

RegisterNetEvent('dg-polyzone:exit')
AddEventHandler('dg-polyzone:exit', function(name)
	inZone = false
	if (name == "apartment" ) then
		exports['dg-ui']:hideInteraction()
		exports["dg-ui"]:closeApplication('contextmenu')
  end
end)

RegisterNetEvent('dg-lib:keyEvent')
AddEventHandler('dg-lib:keyEvent', function(name, isDown)
	if (not inZone or not isDown) then return end
	if name == "GeneralUse" then
		if (inZone == "apartment") then
			DGCore.Functions.TriggerCallback('dg-apartments:server:getApartmentMenu', function(menu)
				exports["dg-ui"]:openApplication('contextmenu',menu);
			end)
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
