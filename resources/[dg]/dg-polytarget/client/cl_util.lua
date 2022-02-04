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

function GetTargetCoords()
	local originCoords = GetGameplayCamCoord()
	local forwardVector = getForwardVector(GetGameplayCamRot())
	local forwardCoords = originCoords + forwardVector * 30
	local TargetCoords = vector3(0.0, 0.0, 0.0)

    if not forwardVector then
		return
	end

    local hit, coords, entity = rayCast(originCoords, forwardCoords)

    if not hit and entity == 0 then
        return
    end

    if DEBUG_ENABLED then
        DrawMarker(28, coords.x, coords.y, coords.z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01, 255, 0, 0, 255, false, false, 2, nil, nil, false)
    end

	return coords
end