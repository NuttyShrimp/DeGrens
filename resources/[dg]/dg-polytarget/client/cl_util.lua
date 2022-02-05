function GetForwardVector(rotation)
	local rot = (math.pi / 180.0) * rotation
	return vector3(-math.sin(rot.z) * math.abs(math.cos(rot.x)), math.cos(rot.z) * math.abs(math.cos(rot.x)), math.sin(rot.x))
end

function RayCast(origin, target, options, ignoreEntity, radius)
	local handle = StartShapeTestRay(origin.x, origin.y, origin.z, target.x, target.y, target.z, options, ignoreEntity, 4)
	return GetShapeTestResult(handle)
end

function GetTargetCoords()
	local CameraCoords = GetGameplayCamCoord()
	local ForwardVectors = GetForwardVector(GetGameplayCamRot(2))
	local ForwardCoords = CameraCoords + (ForwardVectors * (IsInVehicle and 11.5 or 10.0))
	local TargetCoords = vector3(0.0, 0.0, 0.0)

	if ForwardVectors then
		local _, hit, targetCoords, _, _ = RayCast(CameraCoords, ForwardCoords, 17, nil, 0.1)

		TargetCoords = targetCoords
		if DEBUG_ENABLED then
			DrawMarker(28, targetCoords.x, targetCoords.y, targetCoords.z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.01, 0.01, 0.01, 255, 0, 0, 255, false, false, 2, nil, nil, false)
		end
	end
	return TargetCoords
end