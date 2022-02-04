local isInVehicle = false
local debugEnabled = false
originCoords = nil
forwardCoords = nil

function getForwardVector(rotation)
	local rot = (math.pi / 180) * rotation
	return vector3(-math.sin(rot.z) * math.abs(math.cos(rot.x)), math.cos(rot.z) * math.abs(math.cos(rot.x)), math.sin(rot.x))
end

function rayCast(origin, target)
    local rayHandle = StartShapeTestLosProbe(origin, target, -1, PlayerPedId(), 0)
	while true do
		Citizen.Wait(0)
		local _, hit, endCoords, _, entityHit = GetShapeTestResult(rayHandle)
		if result ~= 1 then
			return hit, endCoords, entityHit
		end
	end
end

function getEntityPlayerLookingAt()
	originCoords = GetGameplayCamCoord()
	local forwardVector = getForwardVector(GetGameplayCamRot())
	forwardCoords = originCoords + forwardVector * 30

	if not forwardVector then
		return
	end

	local hit, coords, entity = rayCast(originCoords, forwardCoords)

	if not hit and entity == 0 then
		return
	end

	local entityType = GetEntityType(entity)

	return entity, entityType, coords
end

Citizen.CreateThread(function()
	while true do
		local ped = PlayerPedId()
		local entity, entityType, entityCoords = getEntityPlayerLookingAt()

		if entity and entityType ~= 0 then
			if entity ~= CurrentTarget then
				CurrentTarget = entity
				TriggerEvent('dg-lib:targetinfo:changed', CurrentTarget, entityType, entityCoords)
				debug('[raycastinfo] Target changed to ' .. tostring(entity) .. ' (' .. tostring(entityType) .. ')')
			end
		elseif CurrentTarget then
			CurrentTarget = nil
			TriggerEvent('dg-lib:targetinfo:changed', CurrentTarget)
			debug('[raycastinfo] Target changed to nothing')
		end

		Citizen.Wait(250)
	end
end)

exports('GetCurrentEntity', function(distance)
	if distance == nil then
		return CurrentTarget
	end
	if (#(GetEntityCoords(PlayerPedId()) - GetEntityCoords(CurrentTarget)) <= distance) then
		return CurrentTarget
	end
	return 0
end)

AddEventHandler('baseevents:enteredVehicle', function()
	isInVehicle = true
end)

AddEventHandler('baseevents:leftVehicle', function()
	isInVehicle = false
end)

if GetConvar('is_production', 'true') == 'false' then
	RegisterCommand('lib:raycast', function()
		debugEnabled = true
		CreateThread(function()
			while debugEnabled do
				DrawLine(originCoords, forwardCoords, 255, 0, 0, 255)
				Wait(0)
			end
		end)
	end)
end