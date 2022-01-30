BASE_SHELL_COORDS = vector3(-334.32, -953.21, -98.9)
local SPAWN_OFFSET = vector3(-3.88, -2.97, -0.28)
local SPAWN_HEADING = 342.65
local SHELL_NAME = "gabz_pinkcage_ymap_shell"

local apartmentObj = nil
local cachedObj = {}

local floatTillSafe = function()
	local ped = PlayerPedId()
	local objModel = GetHashKey(SHELL_NAME)
	SetEntityInvincible(ped, true)
	local timeout = 500
	while (timeout > 0) do
		Citizen.Wait(250)
		if (HasCollisionLoadedAroundEntity(ped) and HasCollisionForModelLoaded(objModel) and HasModelLoaded(objModel)) then
			timeout = -2
		end
		timeout = timeout - 1
	end
	return timeout <= -2
end

RegisterNetEvent('dg-apartments:client:generateRoom', function(type)
	local ped = PlayerPedId()
	local objects = exports["dg-lib"]:parse('gabz_apartments_room', true)
	-- Preload model
	FreezeEntityPosition(ped, true)
	SetEntityCoords(ped, 0,0,0, true, false, false, false)

	local mainPos = vector3(0,0,0) -- vector the refrences the "offset" of our shell

	for k,v in pairs(objects) do
		if (v.name == SHELL_NAME) then
			mainPos = vector3(v.x, v.y, v.z);
		end
	end

	Citizen.Wait(500) -- Wait for shell to load
	local _spawnOffset = BASE_SHELL_COORDS + SPAWN_OFFSET
	SetEntityCoords(ped, _spawnOffset.x, _spawnOffset.y, _spawnOffset.z, true, false, false, false)
	SetEntityHeading(ped, SPAWN_HEADING)

	local buildingPos = BASE_SHELL_COORDS + mainPos
	apartmentObj = CreateObject(
		GetHashKey(SHELL_NAME),
		buildingPos.x,
		buildingPos.y,
		buildingPos.z,
		false,
		false,
		false
	)
	FreezeEntityPosition(apartmentObj, true)

	for k,v in pairs(objects) do
		if (v.name == SHELL_NAME) then
			SetEntityQuaternion(apartmentObj, v.rx, v.ry, v.rz, v.rw * -1);
			::skip_to_next::
		end
		local worldCoords = BASE_SHELL_COORDS + vector3(v.x, v.y, 0)
		local intObj = CreateObject(GetHashKey(v.name), worldCoords.x, worldCoords.y, worldCoords.z, false, false, false);
		SetEntityQuaternion(intObj, v.rx, v.ry, v.rz, v.rw * -1);
		FreezeEntityPosition(intObj, true);
		cachedObj[#cachedObj+1] = intObj
	end

	floatTillSafe()
	FreezeEntityPosition(ped, false);

	enableInteractionZones(type)
	exports['dg-weathersync']:FreezeTime(true, 700)
end)

RegisterNetEvent('dg-apartments:client:removeRoom', function()
	if apartmentObj ~= nil then
    for k,v in pairs(cachedObj) do
      DeleteEntity(v)
    end
    DeleteEntity(apartmentObj)
		cachedObj = {}
    apartmentObj = nil
  end
	exports['dg-weathersync']:FreezeTime(false)
end)