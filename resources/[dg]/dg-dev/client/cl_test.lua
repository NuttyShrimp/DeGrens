RegisterCommand('res', function()
  local pos = GetEntityCoords(PlayerPedId())
  NetworkResurrectLocalPlayer(pos, true, true, false)
end)