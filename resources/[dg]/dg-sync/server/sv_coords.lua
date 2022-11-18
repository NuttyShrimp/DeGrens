local playerCoords = {}

function syncCoords()
  local coords = {}
  local playerIndices = GetNumPlayerIndices()
  for i = 0, playerIndices - 1 do
    local plyId = tonumber(GetPlayerFromIndex(i))
    if plyId then
      coords[plyId] = DGX.Util.getPlyCoords(plyId)
    end
  end
  playerCoords = coords
  TriggerClientEvent('dg-sync:coords:sync', -1, coords)
end

Citizen.CreateThread(function()
  while true do
    syncCoords()
    Wait(5000)
  end
end)

exports('getPlayerCoords', function(plyId)
  return playerCoords[plyId]
end)