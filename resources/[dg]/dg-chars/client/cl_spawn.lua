Spawn = {
    list = {},
    faded = false,
    spinner = {
        shouldSpin = false,
        currentDegree = -90,
    }
}

Spawn.setupSpawnMenu = function()
  CreateThread(function()
    DoScreenFadeOut(250)
    Spawn.faded = true
    Spawn.fetchSpawns()
    while IsScreenFadingOut() do
      Wait(0)
    end
    Spawn.setCam(1, true)
    DoScreenFadeIn(250)
    Wait(250)
    Spawn.faded = false
    openSpawnUI()
  end)
end

Spawn.instaSpawn = function()
  DoScreenFadeOut(250)
  Spawn.fetchSpawns()
  while IsScreenFadingOut() do
    Wait(0)
  end
  Spawn.choose(1)
end

Spawn.choose = function(idx)
  Spawn.spinner.shouldSpin = false
  local spawn = Spawn.list[idx]
  if not spawn then
    print(("[DG-Chars] Spawn for index: %d not found"):format(idx))
    return
  end

  DoScreenFadeOut(250)
  while IsScreenFadingOut() do
    Wait(0)
  end
  local ped = PlayerPedId()
  local result = DGCore.Functions.TriggerCallback('dg-chars:server:spawn', idx)
  if (type(result) == 'string') then
    DGX.Notifications.add(result, 'error', 10000)
    return
  end
  Cam.destroyCamera()

  if (result.resetPed) then
    FreezeEntityPosition(ped, false)
    SetEntityAlpha(ped, 255)
    DGX.Sync.setPlayerInvincible(false)
    DGX.Sync.setPlayerVisible(true)
    SetEntityCollision(ped, true) --client
    DestroyAllCams(true) --client
  end
  if (result.resetInside) then
    TriggerServerEvent('qb-houses:server:SetInsideMeta', 0, false)
    TriggerServerEvent('dg-apartments:server:setInsideMeta', 0)
  end
  if result.fade then
    DoScreenFadeIn(250)
  end
end


Spawn.setCam = function(idx, init)
  local spawn = Spawn.list[idx]
  if not spawn then
    print(("[DG-Chars] Spawn for index: %d not found"):format(idx))
    return
  end
  Spawn.spinner.shouldSpin = false
  debug('[DG-Chars] [Spawn] Setting camera to spawn: ' .. spawn.label)

  local ped = PlayerPedId()
  local vec3 = vector3(spawn.position.x, spawn.position.y, spawn.position.z)
  SetEntityCoords(ped, vec3 + vector3(0, 0, 100))
  FreezeEntityPosition(ped, true)
  DGX.Sync.setPlayerInvincible(true)
  DGX.Sync.setPlayerVisible(false)

  local camFunc = Cam.updateCam
  if init then
    camFunc = Cam.createCam
  end
  camFunc(vec3 + vector3(0, 0, 300), vector3( -85.0, 0, 0), 100.0)
  local coord = Spawn.getCamOffset()
  Cam.updateCam(vec3 + coord, vector3( -60.0, 0, 0))
  Spawn.spinner.shouldSpin = true
  Spawn.doCamSpinner(vec3)
end

Spawn.fetchSpawns = function()
  result = DGCore.Functions.TriggerCallback("dg-chars:server:getSpawns")
  if (type(result) == 'string') then
    DGX.Notifications.add(result, 'error', 10000)
  end
  Spawn.list = result
  SendNUIMessage({
      action = "seedSpawnsLocs",
      data = Spawn.strippedSpawns()
  })
end

--region Util
Spawn.strippedSpawns = function()
  local stripped = {}
  for _, v in pairs(Spawn.list) do
    table.insert(stripped, {
        label = v.label,
    })
  end
  return stripped
end
Spawn.doCamSpinner = function(baseCoord)
  CreateThread(function()
    while Spawn.spinner.shouldSpin do
      local coord = Spawn.getCamOffset()
      Spawn.spinner.currentDegree = Spawn.spinner.currentDegree + 1
      Cam.updateNoLoop(baseCoord + coord, vector3( -60.0, 0, Spawn.spinner.currentDegree + 90))
      Wait(15)
    end
    Spawn.spinner.currentDegree = -90
  end)
end
Spawn.getCamOffset = function()
  if not Spawn.triangle then
    Spawn.calcTriangle()
  end
  return vector3(
          math.cos(math.rad(Spawn.spinner.currentDegree)) * Spawn.triangle.a,
          math.sin(math.rad(Spawn.spinner.currentDegree)) * Spawn.triangle.a,
          Spawn.triangle.c
      )
end
Spawn.calcTriangle = function()
  Spawn.triangle = {
      a = 0, -- Will be used to calc x and y
      b = 35,
      c = 0, -- Z coord equiv
  }

  Spawn.triangle.a = (Spawn.triangle.b * math.sin(math.rad(60))) / math.sin(math.rad(90))
  Spawn.triangle.c = (Spawn.triangle.b * math.cos(math.rad(30))) / math.sin(math.rad(90))
end
--endregion

--region Events
RegisterNetEvent('dg-chars:client:finishSpawn', function(isNew)
  if isNew then
    TriggerServerEvent('dg-chars:server:newCharSpawn')
  end
end)
--endregion