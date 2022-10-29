local isInVehicle = false
local debugEnabled = false

-- {entity?: number, coords?: Vec3}
local lastHit = {}

function getForwardVector(rotation)
	local rot = (math.pi / 180) * rotation
	return vector3(-math.sin(rot.z) * math.abs(math.cos(rot.x)), math.cos(rot.z) * math.abs(math.cos(rot.x)), math.sin(rot.x))
end

function doRaycast(pDistance, pFlag, pIgnore)
	local distance = pDistance or 25.0
  local flag = pFlag or -1
  local ignore = pIgnore or PlayerPedId()

	local originCoords = GetGameplayCamCoord()
	local forwardVector = getForwardVector(GetGameplayCamRot())
	local forwardCoords = originCoords + forwardVector * (isInVehicle and distance + 1.5 or distance)

	if not forwardCoords then 
    print('[Raycast] Could not calculate forward')
    return {}
  end

  local handle = StartShapeTestRay(originCoords, forwardCoords, flag, ignore, 0)
	local _, hit, coords, _, entity = GetShapeTestResult(handle)

  if hit == 0 then 
    return {}
  end

  local hitData = {
    coords = {
      x = coords.x, 
      y = coords.y, 
      z = coords.z
    }
  }
  if GetEntityType(entity) ~= 0 and DoesEntityExist(entity) then
    hitData.entity = entity
  end
  return hitData
end
exports('doRaycast', doRaycast)

DGX.RPC.register('lib:doRaycast', function(pDistance, pFlag, pIgnore)
  local hit = doRaycast(pDistance, pFlag, pIgnore)
  local retval = {
    coords = hit.coords
  }
  if DoesEntityExist(hit.entity) and NetworkGetEntityIsNetworked(hit.entity) then
    hitData.netId = NetworkGetNetworkIdFromEntity(hit.entity)
  end
  return retval
end)

exports('getLastRaycastHitCoord', function()
  return lastHit.coords
end)

Citizen.CreateThread(function()
	while true do
		local hit = doRaycast()
    lastHit.coords = hit.coords

		if hit.entity and hit.entityType ~= 0 then
			if hit.entity ~= lastHit.entity then
				lastHit.entity = hit.entity
				TriggerEvent('lib:raycast:entityChanged', hit.entity, hit.coords)
				if debugEnabled then 
					debug('[RayCast] Target changed to ' .. tostring(hit.entity))
				end
			end
		elseif lastHit.entity then
			lastHit.entity = nil
			TriggerEvent('lib:raycast:entityChanged')
			if debugEnabled then
				debug('[RayCast] Target changed to nothing')
			end
		end

		Citizen.Wait(250)
	end
end)

AddEventHandler('baseevents:enteredVehicle', function()
	isInVehicle = true
end)

AddEventHandler('baseevents:leftVehicle', function()
	isInVehicle = false
end)

AddEventHandler('onResourceStop', function(res)
	if res ~= GetCurrentResourceName() then return end
	if currentEntity and GetEntityType(currentEntity) ~= 1 then
		SetEntityDrawOutline(currentEntity, false)
	end
end)

if GetConvar('is_production', 'true') == 'false' then
	RegisterCommand('raycast:debug:toggle', function()
    if debugEnabled then 
      debugEnabled = false
      if GetEntityType(lastHit.entity) ~= 1 then
        SetEntityDrawOutline(lastHit.entity, false)
      end
    else
      debugEnabled = true
      CreateThread(function()
        local prevTarget = nil
        while debugEnabled do
          if prevTarget and prevTarget ~= lastHit.entity and GetEntityType(lastHit.entity) ~= 1 then
            SetEntityDrawOutline(prevTarget, false)
          end
          prevTarget = lastHit.entity

          if lastHit.coords then
            local plyCoords = GetEntityCoords(PlayerPedId())
            DrawLine(plyCoords.x, plyCoords.y, plyCoords.z, lastHit.coords.x, lastHit.coords.y, lastHit.coords.z, 255, 0, 0, 255)
            DrawMarker(28, lastHit.coords.x, lastHit.coords.y, lastHit.coords.z, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.03, 0.03, 0.03, 255, 0, 0, 255, false, false, 2, nil, nil, false)
          end

          if GetEntityType(lastHit.entity) ~= 1 then
            SetEntityDrawOutline(lastHit.entity, true)
          end

          Wait(0)
        end
      end)
    end
	end)
end