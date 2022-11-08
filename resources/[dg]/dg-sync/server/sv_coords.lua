function syncCoords()
  local coords = {}
  local playerIndices = GetNumPlayerIndices()
  for i = 1, playerIndices do
    local plyId = GetPlayerFromIndex(i)
    if plyId then
      coords[plyId] = DGX.Util.getPlyCoords(plyId)
    end
  end
  TriggerClientEvent('dg-sync:coords:sync', -1, coords)
end

Citizen.CreateThread(function()
  while true do
    syncCoords()
    Wait(5000)
  end
end)