local gameDirty = true
local gameValues = {}
local characterInfo = {}
local whitelistedJobs = {}

setGameValue = function(k, v)
  if gameValues[k] == nil or gameValues[k] ~= v then
    gameDirty = true
  end
  gameValues[k] = v
end

-- Only use when restarting resource or player joins
-- Fucks up every open ui app
seedCharData = function()
  CreateThread(function()
    local PlyData = DGCore.Functions.GetPlayerData()
    local newCharacterInfo = {
      cid = PlyData.citizenid,
      firstname = PlyData.charinfo.firstname,
      lastname = PlyData.charinfo.lastname,
      job = DGX.RPC.execute('jobs:server:getCurrentJob'),
      phone = PlyData.charinfo.phone,
      server_id = GetPlayerServerId(PlayerId()),
      hasVPN = DGX.Inventory.doesPlayerHaveItems('vpn'),
      cash = PlyData.charinfo.cash,
    }
    characterInfo = newCharacterInfo
    SendAppEvent('character', characterInfo)
    Wait(1000)
    toggleHud()
    TriggerEvent('dg-ui:loadData')
  end)
end

CreateThread(function()
  while true do
    Wait(250)
    if gameDirty then
      gameDirty = false
      SendAppEvent("game", gameValues)
    end
  end
end)

RegisterNetEvent('DGCore:Client:OnPlayerLoaded')
AddEventHandler('DGCore:Client:OnPlayerLoaded', function()
  seedCharData()
end)

RegisterNetEvent('dg-jobs:signin:update', function(job)
  characterInfo.job = job
  SendAppEvent('character', characterInfo)
end)

DGX.Events.onNet('financials:client:cashChange', function(cash)
  characterInfo.cash = cash
  SendAppEvent('character', characterInfo)
end)

RegisterNetEvent('onResourceStart', function(resource)
  if resource ~= GetCurrentResourceName() then
    return
  end
  if not LocalPlayer.state.isLoggedIn then
    return
  end
  seedCharData()
end)

RegisterNetEvent('dg-weathersync:client:SyncTime', function(hour, minute)
  setGameValue("time", ("%s:%s"):format(hour > 9 and hour or "0" .. hour, minute > 9 and minute or "0" .. minute))
end)

RegisterNetEvent('dg-weathersync:client:weather', function(weatherProg)
  setGameValue("weather", weatherProg.weather)
end)

DGX.Events.onNet('jobs:client:whitelistedJobs', function(pWhitelistedJobs)
  whitelistedJobs = pWhitelistedJobs
  SendAppEvent('jobs', whitelistedJobs)
end)

DGX.Events.onNet('jobs:whitelist:add', function(jobName)
  whitelistedJobs[#whitelistedJobs + 1] = jobName
  SendAppEvent('jobs', whitelistedJobs)
end)

DGX.Events.onNet('jobs:whitelist:remove', function(jobName)
  for i, job in ipairs(whitelistedJobs) do
    if job == jobName then
      table.remove(whitelistedJobs, i)
    end
  end
  SendAppEvent('jobs', whitelistedJobs)
end)