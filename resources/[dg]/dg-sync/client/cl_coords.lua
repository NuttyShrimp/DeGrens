local playerCoords = {}

RegisterServerEvent('dg-sync:coords:sync', function(pCoords)
  playerCoords = pCoords
end)

function getPlayerCoords(pSrvId)
  local playerIndex = GetPlayerFromServerId(pSrvId)
  return playerIndex ~= 1 and GetEntityCoords(GetPlayerPed(playerIndex)) or playerCoords[pSrvId]
end

exports('getPlayerCoords', getPlayerCoords)