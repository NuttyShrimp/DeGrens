local registered = {}

CreateThread(function()
  for _, job in ipairs(Config.justice.whitelistedJobs) do
    registered[job] = {}
    seedJob(job)
  end
end)

seedJob = function(job)
  for plySrvId, player in pairs(charModule.getAllPlayers()) do
    local plyJob = DGX.Jobs.getCurrentJob(plySrvId)
    if plyJob == job then
      table.insert(registered[job], {
        srvId = plySrvId,
        name = player.charinfo.firstname .. " " .. player.charinfo.lastname,
        phone = player.charinfo.phone,
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
  local Player = charModule.getPlayer(src)
  table.insert(registered[job], {
    srvId = src,
    name = Player.charinfo.firstname .. " " .. Player.charinfo.lastname,
    phone = Player.charinfo.phone,
    available = Config.justice.availableOnLogin
  })
end)

DGX.RPC.register('dg-phone:server:justice:get', function(src)
  return registered
end)

DGX.Events.onNet('dg-phone:server:justice:setAvailable', function(src, data)
  setPlyAvailable(src, data.available)
end)