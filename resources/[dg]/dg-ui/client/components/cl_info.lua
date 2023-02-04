local gameValues = {}
local characterInfo = {}
local whitelistedJobs = {}

-- Only use when restarting resource or player joins
-- Fucks up every open ui app
seedCharData = function()
  -- I suspect this can sometimes not correctly get items or job as those also get loaded from playerLoaded evt
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
      hasPhone = DGX.Inventory.doesPlayerHaveItems("phone"),
      cash = PlyData.charinfo.cash,
      isAdmin = DGX.RPC.execute('admin:permissions:hasPermission', 'staff')
    }

    characterInfo = newCharacterInfo
    SendAppEvent('character', characterInfo)
    Wait(1000)
    toggleHud()
    TriggerEvent('dg-ui:loadData')
  end)
end

DGX.Util.onPlayerLoaded(function()
  seedCharData()
end)

RegisterNetEvent('jobs:client:signin:update', function(job)
  characterInfo.job = job
  SendAppEvent('character', characterInfo)
end)

DGX.Events.onNet('financials:client:cashChange', function(total)
  characterInfo.cash = total
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

AddEventHandler('weathersync:timeUpdated', function(hour, minute)
  gameValues['time'] = ("%s:%s"):format(hour > 9 and hour or "0" .. hour, minute > 9 and minute or "0" .. minute)
  SendAppEvent("game", gameValues)
end)

AddEventHandler('weathersync:weatherUpdated', function(weatherType)
  gameValues['weather'] = weatherType
  SendAppEvent("game", gameValues)
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