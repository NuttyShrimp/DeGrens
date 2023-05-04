local entityCache = {
  objects = {},
  peds = {},
}

createPlayerSeats = function()
  local chairHash = `vw_prop_casino_chair_01a`

  RequestModel(chairHash)
  while not HasModelLoaded(chairHash) do
    Citizen.Wait(0)
  end
  for k, v in ipairs(Config.SeatLoc) do
    if (v.spawn == false) then
      goto continue
    end
    local _chair = CreateObject(chairHash, v.coords.x, v.coords.y, v.coords.z, false, true, false)
    SetEntityRotation(_chair, v.rot.x, v.rot.y, v.rot.z, 2, true)
    entityCache.objects[#entityCache + 1] = _chair
    :: continue ::
  end
end

setPedOnChair = function(ped, chairIdx)
  local chairInfo = Config.SeatLoc[chairIdx]

  offsets = {
    x = 0.4 * (-math.sin((math.pi / 180) * chairInfo.rot.z)),
    y = 0.4 * (math.cos((math.pi / 180) * chairInfo.rot.z)),
    z = 0.3
  }

  local newCoords = {
    x = chairInfo.coords.x + offsets.x,
    y = chairInfo.coords.y + offsets.y,
    z = chairInfo.coords.z + offsets.z,
  }

  SetEntityCoords(ped, newCoords.x, newCoords.y, newCoords.z, true, false, false, false)
  SetEntityHeading(ped, chairInfo.rot.z)
  -- From DPEmotes
  behindPed = GetOffsetFromEntityInWorldCoords(ped, 0.0, -0.5, -0.5);
  ClearPedTasksImmediately(ped)
  TaskStartScenarioAtPosition(ped, "PROP_HUMAN_SEAT_CHAIR_UPRIGHT", behindPed, GetEntityHeading(ped), 0, true, true)
  while not IsPedActiveInScenario(ped) do
    Wait(10)
  end
end

spawnCharPeds = function()
  local chars = copyTbl(plyChars)
  if #chars ~= 5 then
    chars[#chars + 1] = {
      model = `mp_m_freemode_01`,
      skin = {},
      citizenid = 1,
      extra = true,
    }
  end
  local promises = {}
  for k, v in pairs(chars) do
    local p = promise:new()
    promises[#promises + 1] = p
    Citizen.CreateThread(function()
      RequestModel(v.model)
      while not HasModelLoaded(v.model) do
        Citizen.Wait(0)
      end
      local pedChairs = Config.SeatLoc[k]
      local _ped = CreatePed(2, v.model, pedChairs.coords.x, pedChairs.coords.y, pedChairs.coords.z, 0.0, false, true)
      SetEntityInvincible(_ped, true)
      SetPedCanPlayAmbientAnims(_ped, true)
      setPedOnChair(_ped, k)
      SetBlockingOfNonTemporaryEvents(_ped, true)
      if v.extra then
        SetEntityAlpha(_ped, 51)
        SetEntityInvincible(_ped, true)
      else
        TriggerEvent('qb-clothing:client:loadPlayerClothing', json.decode(tostring(v.skin)), _ped)
      end
      Entity(_ped).state.citizenid = v.citizenid
      entityCache.peds[v.citizenid] = _ped
      p:resolve()
    end)
  end
  -- Wait for all promises to resolve
  Citizen.Await(promise.all(promises))
end

setPlayerToWaitLoc = function()
  local ped = PlayerPedId()
  FreezeEntityPosition(ped, true)
  SetEntityCoords(ped, Config.WaitLoc)
end

pedLookAtCan = function(cam)
  local camCoords = GetCamCoord(cam)
  for _, ped in pairs(entityCache.peds) do
    if (DoesEntityExist(ped)) then
      TaskLookAtCoord(ped, camCoords, -1, 0, 2)
    end
  end
end

removeEntities = function(skipObjects)
  for k, v in pairs(entityCache.peds) do
    DeleteEntity(v)
  end
  if skipObjects then
    return
  end
  for k, v in pairs(entityCache.objects) do
    DeleteEntity(v)
  end
end

stripChars = function(chars)
  local _chars = {
    {
      citizenid = 1,
      name = 'Nieuw char'
    }
  }
  for _, v in pairs(chars) do
    _chars[#_chars + 1] = {
      citizenid = v.citizenid,
      name = v.firstname .. ' ' .. v.lastname,
    }
  end
  return _chars
end


--region Ped under cursor
DirectionVector = function(rotation)
  local z = math.rad(rotation.z)
  local x = math.rad(rotation.x)
  local abscos = math.abs(math.cos(x))

  local vec3dir = vector3(-math.sin(z) * abscos, math.cos(z) * abscos, math.sin(x))
  return vec3dir
end

-- https://github.com/metalralf/openrp-altv-obsolocale/blob/27813d3e713ef9636c2f06170cb8f2858c5aceff/resources/orp/client/utility/screen2world.js <- Fcking hero
ScreenToWorld = function(coords, camCoords, camRot)
  local distance = 100
  local camForward = DirectionVector(camRot);
  local rotUp = camRot + vector3(distance, 0, 0)
  local rotDown = camRot + vector3(-distance, 0, 0)
  local rotLeft = camRot + vector3(0, 0, -distance)
  local rotRight = camRot + vector3(0, 0, distance)

  local camRight = DirectionVector(rotRight) - DirectionVector(rotLeft)
  local camUp = DirectionVector(rotUp) - DirectionVector(rotDown)

  local rollRad = -math.rad(camRot.y);

  local camRightRoll = (camRight * math.cos(rollRad)) - (camUp * math.sin(rollRad))
  local camUpRoll = (camRight * math.sin(rollRad)) + (camUp * math.cos(rollRad))

  local point3D = camCoords + camForward * distance + camRightRoll + camUpRoll
  local isScreen, screenx, screeny = GetScreenCoordFromWorldCoord(point3D.x, point3D.y, point3D.z);
  local point2D = {
    x = screenx,
    y = screeny
  }
  if not point2D or not screenx or not screeny then
    return camCoords + camForward * distance
  end

  local point3DZero = camCoords + camForward * distance
  local isScreen, screenx, screeny = GetScreenCoordFromWorldCoord(point3DZero.x, point3DZero.y, point3DZero.z);
  local point2DZero = {
    x = screenx,
    y = screeny
  }
  if not point2DZero or not screenx or not screeny then
    return camCoords + camForward * distance
  end

  local eps = 0.001;

  if math.abs(point2D.x - point2DZero.x) < eps or math.abs(point2D.y - point2DZero.y) < eps then
    return camCoords + camForward * distance
  end

  local scaleX = (coords.x - point2DZero.x) / (point2D.x - point2DZero.x);
  local scaleY = (coords.y - point2DZero.y) / (point2D.y - point2DZero.y);
  local point3Dret = camCoords + camForward * distance + camRightRoll * scaleX + camUpRoll * scaleY
  return point3Dret;
end

CapturePed = function(plycoords, trgcoords)
  local ped = PlayerPedId()
  local raycast = StartExpensiveSynchronousShapeTestLosProbe(plycoords.x, plycoords.y, plycoords.z, trgcoords.x,
  trgcoords.y, trgcoords.z, 8, ped, 0)
  local retval, hit, endCoords, surfaceNormal, entity = GetShapeTestResult(raycast)
  return hit, endCoords, entity
end


--endregion
