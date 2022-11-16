doors = {}

currentDoorId = nil
currentDoorCoords = vector3(0,0,0)
currentDoorLockState = nil

interactionVisible = false
inPolyZone = false

Citizen.CreateThread(function()
  doors = DGCore.Functions.TriggerCallback("dg-doorlock:server:FetchDoors")

	for id, door in pairs(doors) do
        if not IsDoorRegisteredWithSystem(id) then
            AddDoorToSystem(id, door.object, door.coords.x, door.coords.y, door.coords.z, false, false, false)
            DoorSystemSetDoorState(id, door.locked, false, true)
        end

		if door.polyzone then
			local zone = door.polyzone
			zone.options.data = {}
			zone.options.data.id = id
			exports["dg-polyzone"]:AddBoxZone("doorlock", vector3(zone.center.x, zone.center.y, zone.center.z), zone.length, zone.width, zone.options)
		end
	end

    print("DOORS LOADED")
end)

Citizen.CreateThread(function()
	while true do
		if currentDoorId and currentDoorCoords ~= vector3(0,0,0) then
			if #(GetEntityCoords(PlayerPedId()) - currentDoorCoords) <= doors[currentDoorId].distance then
				if not interactionVisible then
					showInteraction()
				end
			else
				if interactionVisible then
					interactionVisible = false
					exports["dg-ui"]:hideInteraction()
				end
			end
		end
		Citizen.Wait(200)
	end
end)

-- TODO: Change default keybind for doorlock, makes it easier
-- to keep cache of latest door, if no current door then check cache.
-- Allows locking door after opening it when moving aim away from the door.
-- Useful for gates which are annoying with their hitboxes
exports['dg-lib']:registerKeyMapping('toggleDoor', 'Deur slot togglen', '+toggleDoor', '-toggleDoor', Config.Key, true)

