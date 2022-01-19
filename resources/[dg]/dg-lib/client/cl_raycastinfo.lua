local isInVehicle = false
local debugEnabled = false
originCoords = nil
forwardCoords = nil

function getForwardVector(rotation)
	local rot = (math.pi / 180) * rotation
	return vector3(-math.sin(rot.z) * math.abs(math.cos(rot.x)), math.cos(rot.z) * math.abs(math.cos(rot.x)), math.sin(rot.x))
end

function rayCast(origin, target, radius, flags, ignore)
	local handle = StartShapeTestSweptSphere(origin.x, origin.y, origin.z, target.x, target.y, target.z, radius, flags, ignore, 0)
	return GetShapeTestResult(handle)
end

function getEntityPlayerLookingAt(pDistance, pRadius, pFlag, pIgnore)
	pDistance = pDistance or 3.0
	originCoords = GetPedBoneCoords(PlayerPedId(), 31086)
	local forwardVector = getForwardVector(GetGameplayCamRot(2))
	forwardCoords = originCoords + forwardVector * (isInVehicle and pDistance + 1.5 or pDistance)

	if not forwardVector then
		return
	end

	local _, hit, coords, _, entity = rayCast(originCoords, forwardCoords, pRadius, pFlag, pIgnore)

	if not hit and entity == 0 then
		return
	end

	local entityType = GetEntityType(entity)

	return entity, entityType, coords
end

Citizen.CreateThread(function()
	while true do
		local ped = PlayerPedId()
		local entity, entityType, entityCoords = getEntityPlayerLookingAt(3.0, 0.2, 286, ped)

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
				DrawLine(originCoords.x, originCoords.y, originCoords.z, forwardCoords.x, forwardCoords.y, forwardCoords.z, 255, 0, 0, 255)
				Wait(0)
			end
		end)
	end)
end