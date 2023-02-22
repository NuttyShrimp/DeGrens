local registered = {}

CreateThread(function()
  for _, job in ipairs(Config.justice.whitelistedJobs) do
    registered[job] = {}
    seedJob(job)
  end
end)

seedJob = function(job)
  for plySrvId, player in pairs(DGCore.Functions.GetQBPlayers()) do
    local plyJob = DGX.Jobs.getCurrentJob(plySrvId)
    if plyJob == job then
      table.insert(registered[job], {
        srvId = plySrvId,
        name = player.PlayerData.charinfo.firstname .. " " .. player.PlayerData.charinfo.lastname,
        phone = player.PlayerData.charinfo.phone,
        available = Config.justice.availableOnLogin
      })
    end
  end
end

removeFromRegistered = function(src)
  for job, players in pairs(registered) do
    for i, player in ipairs(players) do
      if player.srvId == src then
        table.remove(players, i)
      end
    end
  end
end

setPlyAvailable = function(src, isAvailable)
  for job, players in pairs(registered) do
    for i, player in ipairs(players) do
      if player.srvId == src then
        player.available = isAvailable
        break
      end
    end
  end
end

RegisterNetEvent('jobs:server:signin:update', function(src, job)
  removeFromRegistered(src)
  if not registered[job] then return end
  -- If somehow the player is already registered for this job update the available
  for _, player in ipairs(registered[job]) do
    if player.srvId == src then
      player.available = Config.justice.availableOnLogin or false
      return
    end
  end
  local Player = DGCore.Functions.GetPlayer(src)
  table.insert(registered[job], {
    srvId = src,
    name = Player.PlayerData.charinfo.firstname .. " " .. Player.PlayerData.charinfo.lastname,
    phone = Player.PlayerData.charinfo.phone,
    available = Config.justice.availableOnLogin
  })
end)

DGCore.Functions.CreateCallback('dg-phone:server:justice:get', function(src, cb)
  cb(registered)
end)

DGCore.Functions.CreateCallback('dg-phone:server:justice:setAvailable', function(src, cb, data)
  setPlyAvailable(src, data.available)
  cb('ok')
end)