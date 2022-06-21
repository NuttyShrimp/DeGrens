local _cache = {
	elevatorIds = {},
}

local elevators = {}

AddEventHandler("onResourceStart", function(resourceName)
    if GetCurrentResourceName() ~= resourceName then return end

    elevators = DGCore.Functions.TriggerCallback('elevator:server:getElevators')

    for name, elevator in pairs(elevators) do
		for levelId, level in pairs(elevator.levels) do
			exports['dg-polytarget']:AddCircleZone('elevator', level.interact, 0.4, {
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
				icon = "fas fa-chevron-circle-up",
				label = "Gebruik Lift",
                action = function(entry)
                    local data = entry.data

                    local menu = {
                        {
                          id = 'title',
                            title = elevators[data.elevator].name,
                            description = "Selecteer een verdieping.",
                        },
                    }

                    local playerJob = DGCore.Functions.GetPlayerData().job.name
                    for levelId, level in pairs(elevators[data.elevator].levels) do
                        if levelId ~= data.level then
                            if not level.job or level.job == playerJob then
                                menu[#menu + 1] = {
                                    title = level.name,
                                    icon = {
                                        name = 'chevron-right',
                                        position = 'right',
                                    },
                                    callbackURL = "dg-elevator:GoToLevel",
                                    data = data,
                                }
                            end
                        end
                    end

                    openApplication('contextmenu', menu)
                end,
			},
		},
		distance = 2.0,
	})
end)

AddEventHandler("onResourceStop", function(resourceName) 
    if GetCurrentResourceName() ~= resourceName then return end
    if #_cache.elevatorIds > 0 then
        exports['dg-peek']:removeZoneEntry(_cache.elevatorIds)
    end
end)

RegisterUICallback("dg-elevator:GoToLevel", function(data, cb)
    cb({data={}, meta={ok=true}})

    wasCanceled = exports['dg-misc']:Taskbar("elevator", "Lift roepen...", 5000, {
        canCancel = true,
        cancelOnDeath = true,
        disarm = true,
        controlDisables = {
            movement = true;
            carMovement = true;
            combat = true;
        }
    })
    if wasCanceled then return end

    local ped = PlayerPedId()
    local spawn = elevators[data.elevator].levels[data.level].spawn
    SetEntityCoords(ped, spawn.x, spawn.y, spawn.z)
    SetEntityHeading(ped, spawn.w)
end)