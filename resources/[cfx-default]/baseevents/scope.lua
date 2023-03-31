Citizen.CreateThread(function()
  local previousPlayers = {}
  
  while true do
    local players = getPlayers(previousPlayers)

    -- if ply in previous but not current, they left scope
    for localId, serverId in pairs(previousPlayers) do
      if players[localId] == nil then
        TriggerEvent('baseevents:playerLeftScope', serverId, localId)
        debugPrint('Player %s left scope | Local ID:  %s', serverId, localId)
      end
    end

    -- if ply in current but not previous, they entered scope
    for localId, serverId in pairs(players) do
      if previousPlayers[localId] == nil then
        TriggerEvent('baseevents:playerEnteredScope', serverId, localId)
        debugPrint('Player %s entered scope | Local ID: %s', serverId, localId)
      end
    end

    previousPlayers = players
    Wait(250)
  end
end)
 
-- Get all players known by client, if they were known previously skip the ped check
-- We check if ped exists because when ply just entered scope, ped does not exist yet
function getPlayers(previousPlayers)
  local players = {}
  for _, id in pairs(GetActivePlayers()) do
    local oldServerId = previousPlayers[id]
    if oldServerId ~= nil or DoesEntityExist(GetPlayerPed(id)) then
      players[id] = oldServerId ~= nil and oldServerId or GetPlayerServerId(id)
    end
  end
  return players
end