BASE_SHELL_COORDS = vector3(-334.32, -953.21, -98.9)
local SPAWN_OFFSET = vector3(-3.88, -2.97, -0.28)
local SPAWN_HEADING = 342.65
local SHELL_NAME = "gabz_pinkcage_ymap_shell"
local SHELL_HASH = GetHashKey('gabz_pinkcage_ymap_shell')

local apartmentObj = nil
local cachedObj = {}

local floatTillSafe = function()
	local ped = PlayerPedId()
	SetEntityInvincible(ped, true)
	local timeout = 500
	RequestModel(SHELL_HASH)
	while (timeout > 0) do
		ped = PlayerPedId()
		Citizen.Wait(250)
		local pedCol = HasCollisionLoadedAroundEntity(ped)
		local modelCol = HasCollisionForModelLoaded(SHELL_HASH)
		local modelLoaded = HasModelLoaded(SHELL_HASH)
		if (pedCol and modelCol and modelLoaded) then
			timeout = -2
		end
		debug(('Waiting for collision to load... %d | PedCol: %s | ModelCol: %s | ModelLoaded: %s'):format(timeout, pedCol, modelCol, modelLoaded))
		timeout = timeout - 1
	end
	return timeout <= -2
end

DGX.RPC.register('dg-apartments:client:generateRoom', function(type)
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

	RequestModel(SHELL_HASH)
	while not HasModelLoaded(SHELL_HASH) do
		Citizen.Wait(0)
	end

	local buildingPos = BASE_SHELL_COORDS + mainPos
	apartmentObj = CreateObject(
		SHELL_HASH,
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
	-- Reset ped because change of it being changed duration previous process
	ped = PlayerPedId()
	FreezeEntityPosition(ped, false)
  SetEntityInvincible(ped, false)

  local _spawnOffset = BASE_SHELL_COORDS + SPAWN_OFFSET
	SetEntityCoords(ped, _spawnOffset.x, _spawnOffset.y, _spawnOffset.z, true, false, false, false)
	SetEntityHeading(ped, SPAWN_HEADING)

	enableInteractionZones(type)
	exports['dg-weathersync']:FreezeTime(true, 700)
  return;
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