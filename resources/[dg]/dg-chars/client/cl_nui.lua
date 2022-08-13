local entCid=0
--region Functions
openCharUI = function()
	local _chars = stripChars(plyChars)
	SendNUIMessage({
		action = 'openCharUI',
		data = _chars,
	})
	SetNuiFocus(true, true)
end
closeCharUI = function()
	SendNUIMessage({
		action = 'closeCharUI',
	})
	SetNuiFocus(false, false)
end
openSpawnUI = function()
	SendNUIMessage({
		action = 'openSpawnUI',
	})
	SetNuiFocus(true, true)
end
--endregion
--region CBs
--region Char
RegisterNUICallback('nui_mounted', function(_, cb)
	nuiMounted = true
	cb({ data={}, meta={ok=true, message='done'} })
end)

RegisterNUICallback('cursorMove', function(data, cb)
	local mouseCoords = vector2(data.x, data.y)
	local wrldCoords = ScreenToWorld(mouseCoords, GetCamCoord(currentCam), GetCamRot(currentCam))
	local isHit, trgcoords, ent = CapturePed(GetCamCoord(currentCam), wrldCoords)
	-- print(isHit, tostring(trgcoords), ent)
	entCid = Entity(ent).state.citizenid
	cb({ data=entCid, meta={ok=true, message='done'} })
end)

RegisterNUICallback('selectChar', function(_, cb)
	if entCid == 0 or entCid == nil then return end
  debug('Selected char: %s', entCid)
  local plyCid = tonumber(entCid) -- Coypy of value if player moves mouse between unfreeze and losing nui focus
	DoScreenFadeOut(250)
	Wait(250)
	closeCharMenu()
	DGCore.Functions.TriggerCallback('dg-chars:server:loadPly', plyCid)
	Spawn.setupSpawnMenu()
	cb({ data={}, meta={ok=true, message='done'} })
end)

RegisterNUICallback('deleteChar', function(_, cb)
	if entCid == 0 then return end
	DGCore.Functions.TriggerCallback('dg-chars:server:deleteCharacter', entCid)
	removeEntities(true)
	plyChars = DGCore.Functions.TriggerCallback('dg-chars:server:getChars')
	spawnCharPeds()
	cb({ data= {}, meta={ok=true, message='done'} })
end)

RegisterNUICallback('createChar', function(data, cb)
	if entCid == 0 then return end
  
	local model = nil
	if tonumber(data.gender) == 0 then
		model = `mp_m_freemode_01`
	else
		model = `mp_f_freemode_01`
	end

	RequestModel(model)
	while not HasModelLoaded(model) do
		Wait(0)
	end

	SetPlayerModel(PlayerId(), model)
	local ped = PlayerPedId()
	SetPedComponentVariation(ped, 0, 0, 0, 2)
	SetEntityRotation(ped, 0, 0, Config.charCreationLoc.w)
	SetEntityCoords(ped, Config.charCreationLoc)
	closeCharMenu()
	DGCore.Functions.TriggerCallback('dg-chars:server:createCharacter', data)
	cb({ data={}, meta={ok=true, message='done'} })
end)
--endregion
--region Spawn
RegisterNUICallback('spawn/move', function(data, cb)
	Spawn.setCam(data.id)
	cb({ data={}, meta={ok=true, message='done'} })
end)
RegisterNUICallback('spawn/choose', function(data, cb)
	Spawn.choose(data.id)
	SetNuiFocus(false, false)
	cb({ data={}, meta={ok=true, message='done'} })
end)
--endregion
--endregion
