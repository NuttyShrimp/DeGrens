function RotationToDirection(rotation)
	local adjustedRotation = {
		x = (math.pi / 180) * rotation.x,
		y = (math.pi / 180) * rotation.y,
		z = (math.pi / 180) * rotation.z
	}
	local direction = {
		x = -math.sin(adjustedRotation.z) * math.abs(math.cos(adjustedRotation.x)),
		y = math.cos(adjustedRotation.z) * math.abs(math.cos(adjustedRotation.x)),
		z = math.sin(adjustedRotation.x)
	}
	return direction
end

function RayCastGamePlayCamera(distance)
	local cameraRotation = GetGameplayCamRot()
	local cameraCoord = GetGameplayCamCoord()
	local direction = RotationToDirection(cameraRotation)
	local destination = {
		x = cameraCoord.x + direction.x * distance,
		y = cameraCoord.y + direction.y * distance,
		z = cameraCoord.z + direction.z * distance
	}
	local retval, hit, endCoords, surfaceNormal, entity = GetShapeTestResult(StartShapeTestSweptSphere(cameraCoord.x, cameraCoord.y, cameraCoord.z, destination.x, destination.y, destination.z, 0.3, 286, PlayerPedId(), 0))
	return hit, endCoords, entity
end

Citizen.CreateThread(function()
	while true do
		local sleep = 250

		local hit, targetCoords, targetEntity = RayCastGamePlayCamera(100.0)

		local entityType = GetEntityType(targetEntity)
		if hit and targetEntity ~= 0 and entityType ~= 0 then
			if targetEntity ~= CurrentTarget then
				CurrentTarget = targetEntity
				TriggerEvent('dg-lib:targetinfo:changed', CurrentTarget, entityType, targetCoords)
			end
		elseif CurrentTarget then
			CurrentTarget = nil
			TriggerEvent('dg-lib:targetinfo:changed', CurrentTarget)
		end

		Citizen.Wait(sleep)
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

exports('GetEntityInFrontOfPlayer', function()
	local hit, _, targetEntity = RayCastGamePlayCamera(100.0)
	return targetEntity
end)
