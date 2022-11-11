function tD(n)
  n = math.ceil(n * 100) / 100
  return n
end

RegisterCommand('coords', function(source, args)
  local textString = ""
  for i = 1, #args do
    textString = textString .. " " .. args[i]
  end
  x, y, z = table.unpack(GetEntityCoords(PlayerPedId(), true))
  local PlayerName = GetPlayerName(PlayerId())
  TriggerServerEvent("SaveCoords", PlayerName, tD(x), tD(y), tD(z), tD(GetEntityHeading(PlayerPedId())), textString)
end)

RegisterCommand('offsetcoords', function(source, args)
  local textString = ""
  for i = 2, #args do
    textString = textString .. " " .. args[i]
  end

  local buildingVector = exports["dg-build"]:currentBuildingVector()

  if buildingVector ~= false then
    local v = (GetEntityCoords(PlayerPedId()) - vector3(buildingVector.x, buildingVector.y, buildingVector.z))

    local PlayerName = GetPlayerName(PlayerId())

    Citizen.Trace("" .. tD(v.x) .. "," .. tD(v.y) .. "," .. tD(v.z) .. "," .. tD(GetEntityHeading(PlayerPedId())) .. "")

    TriggerServerEvent("SaveCoordsOffset", PlayerName, tD(v.x), tD(v.y), tD(v.z), tD(GetEntityHeading(PlayerPedId())), textString)
  end
end)
