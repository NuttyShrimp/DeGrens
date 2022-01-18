local DGCore = exports['dg-core']:GetCoreObject()
local _cache = {
	elevatorIds = {},
}
-- to edit config and while ingame
AddEventHandler("onResourceStop", function(resourceName) 
    if GetCurrentResourceName() == resourceName then
	    if #_cache.elevatorIds > 0 then
		    exports['dg-peek']:removeZoneEntry(_cache.elevatorIds)
	    end
    end
end)

Citizen.CreateThread(function()
	for name, elevator in pairs(Config.Elevators) do
		for levelId, level in pairs(elevator.levels) do
			exports['dg-polytarget']:AddCircleZone('elevator', level.interact, 0.3, {
				data = {
					id = name .. "_" .. levelId,
					elevator = name,
					level = levelId
				},
				useZ = true,
			})
		end
	end
	_cache.elevatorIds = exports['dg-peek']:addZoneEntry("elevator", {
		options = {
			{
				type = "client",
				event = "dg-elevator:UseElevator",
				icon = "fas fa-chevron-circle-up",
				label = "Gebruik Lift",
			},
		},
		distance = 2.0,
	})
end)

AddEventHandler("dg-elevator:UseElevator", function(entry)
	data = entry.data
	local currentElevator = data.elevator
	local currentLevel = data.level
	local playerJob = DGCore.Functions.GetPlayerData().job.name

	local menu = {
		{
			title = Config.Elevators[currentElevator].name,
			description = "Selecteer een verdieping.",
		},
	}

    for levelId, level in pairs(Config.Elevators[currentElevator].levels) do
        if levelId ~= currentLevel then
            if not level.job or level.job == playerJob then
                menu[#menu + 1] = {
	                title = level.name,
	                action = "dg-elevator:GoToLevel",
	                data = entry.data
                }
            end
        end
    end

    exports["dg-contextmenu"]:openMenu(menu)
end)

AddEventHandler("dg-elevator:GoToLevel", function(data)
    local ped = PlayerPedId()
    local spawn = Config.Elevators[data.elevator].levels[data.level].spawn

    DGCore.Functions.Progressbar("use_elevator", "Lift roepen...", 3000, false, true, {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true,
    }, {}, {}, {}, function() -- Done
        SetEntityCoords(ped, spawn.x, spawn.y, spawn.z)
        SetEntityHeading(ped, spawn.w)
    end, function() -- Cancel
        DGCore.Functions.Notify("Geannuleerd...", "error")
    end)
end)