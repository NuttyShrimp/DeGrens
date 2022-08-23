Cam = {
	currentCam = nil,
	isMoving = false,
}

Cam.createCam = function(coords, rot, fov)
	currentCam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
	SetCamCoord(currentCam, coords.x, coords.y, coords.z)
	StopCamShaking(currentCam, true)
	SetCamRot(currentCam, rot.x, rot.y, rot.z, 2)
	SetCamFov(currentCam, fov or 90.0)
  SetCamActive(currentCam, true)
	RenderScriptCams(true, false, 1, true, true)
end

Cam.updateCam = function(coords, rot, fov)
	if coords then
		rot = rot or GetCamRot(currentCam, 2)
		Cam.moveCam(coords, rot)
	end
	if rot and not coords then
		coords = coords or GetCamCoord(currentCam)
		Cam.moveCam(coords, rot)
	end
	if fov then
		SetCamFov(currentCam, fov)
	end
end

Cam.updateNoLoop = function(coords, rot, fov)
	if coords then
		SetCamCoord(currentCam, coords)
	end
	if rot then
		SetCamRot(currentCam, rot, 2)
	end
	if fov then
		SetCamFov(currentCam, fov)
	end
end

Cam.focusCoord = function(coord)
	PointCamAtCoord(currentCam, coord)
end

Cam.moveCam = function(coords, rot)
	local oldCoords = GetCamCoord(currentCam)
	local oldRot = GetCamRot(currentCam, 2)
	if (oldCoords == coords) and (oldRot == rot) then
		return
	end
	while (Cam.isMoving) do
		Wait(10)
		debug('[DG-CHARS] [Cam] Waiting for cam to stop moving')
	end
	Cam.isMoving = true
	diffCoords = coords-oldCoords
	diffRot = rot-oldRot
	if diffRot.z > 180 then
		diffRot = diffRot - vector3(0,0,360)
	end
	if diffRot.z < -180 then
		diffRot = diffRot + vector3(0,0,360)
	end
	local moveCoords = true
	distDiff = #(coords.xy-oldCoords.xy)
	-- Otherwise, the camera will move too fast
	if (distDiff > 500) then
		debug('[DG-CHARS] [Cam] Distance between coords is too big, not moving')
		DoScreenFadeOut(200)
		Cam.faded = true
		Wait(200)
		SetCamCoord(currentCam, coords.x, coords.y, coords.z)
		DoScreenFadeIn(200)
		Wait(200)
		Cam.faded = false
		moveCoords = false
	end
	for i = 1, 75 do
		if moveCoords then
			SetCamCoord(currentCam, oldCoords + diffCoords*(i/75))
		end
		SetCamRot(currentCam, oldRot + diffRot*(i/75), 2)
		Wait(i/8)
	end
	Cam.isMoving = false
end

Cam.destroyCamera = function()
	if currentCam ~= nil then
		SetCamActive(currentCam, false)
		DestroyCam(currentCam)
		RenderScriptCams(false, false, 1, true, true)
		currentCam = nil
	end
end

