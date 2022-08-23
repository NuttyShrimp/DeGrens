local isInVehicle = false
debugEnabled = false
originCoords = nil
forwardCoords = nil

function getForwardVector(rotation)
	local rot = (math.pi / 180) * rotation
	return vector3(-math.sin(rot.z) * math.abs(math.cos(rot.x)), math.cos(rot.z) * math.abs(math.cos(rot.x)), math.sin(rot.x))
end

function rayCast(origin, target, radius, flags, ignore)
	local handle = StartShapeTestRay(origin, target, flags, ignore, 0)
	--local handle = StartShapeTestCapsule(origin.x, origin.y, origin.z, target.x, target.y, target.z, radius, flags, ignore, 0)
	return GetShapeTestResult(handle)
end

function getEntityPlayerLookingAt(pDistance, pRadius, pFlag, pIgnore)
	pDistance = pDistance or 25.0
	originCoords = GetGameplayCamCoord()
	local forwardVector = getForwardVector(GetGameplayCamRot())
	forwardCoords = originCoords + forwardVector * (isInVehicle and pDistance + 1.5 or pDistance)

	if not forwardVector then
		return
	end

	local _, hit, coords, _, entity = rayCast(originCoords, forwardCoords, pRadius, pFlag, pIgnore)

	if not hit and entity == 0 then
		return
	end

	local entityType = GetEntityType(entity)

	return entity, entityType, exports['dg-lib']:vectorToTable(coords)
end
exports('getEntityPlayerLookingAt', getEntityPlayerLookingAt)

Citizen.CreateThread(function()
	while true do
		local ped = PlayerPedId()
		local entity, entityType, entityCoords = getEntityPlayerLookingAt(25.0, 0.1, -1, ped)

		if entity and entityType ~= 0 then
			if entity ~= CurrentTarget then
				CurrentTarget = entity
				TriggerEvent('dg-lib:targetinfo:changed', CurrentTarget, entityType, entityCoords)
				if debugEnabled then 
					debug('[raycastinfo] Target changed to ' .. tostring(entity) .. ' (' .. tostring(entityType) .. ')')
				end
			end
		elseif CurrentTarget then
			CurrentTarget = nil
			TriggerEvent('dg-lib:targetinfo:changed', CurrentTarget)
			if debugEnabled then
				debug('[raycastinfo] Target changed to nothing')
			end
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

AddEventHandler('onResourceStop', function(res)
	if res ~= GetCurrentResourceName() then
		return
	end
	if CurrentTarget then
		SetEntityDrawOutline(CurrentTarget, false)
	end
end)

if GetConvar('is_production', 'true') == 'false' then
	RegisterCommand('lib:raycast', function()
        if debugEnabled then 
            debugEnabled = false
            SetEntityDrawOutline(CurrentTarget, false)
        else
            debugEnabled = true
            CreateThread(function()
                while debugEnabled do
                    if prevTarget and prevTarget ~= CurrentTarget then
                        SetEntityDrawOutline(prevTarget, false)
                    end
                    prevTarget = CurrentTarget
                    DrawLine(originCoords, forwardCoords, 255, 0, 0, 255)
                    SetEntityDrawOutline(CurrentTarget, true)
                    Wait(0)
                end
            end)
        end
	end)
end