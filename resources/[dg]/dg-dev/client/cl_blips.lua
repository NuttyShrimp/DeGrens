local blips = {}
local blipIdx = 1

RegisterCommand("dev:blip:create", function(_, args)
  local plyCoords = GetEntityCoords(PlayerPedId())
  local width = tonumber(args[1])
  local height = tonumber(args[2])
  print(plyCoords, width, height)
  local blip = AddBlipForArea(
    plyCoords.x + 0.001,
    plyCoords.y + 0.001,
    plyCoords.z + 0.001,
    width + 0.001,
    height + 0.001
  )
  print(blip)
  SetBlipAlpha(blip, 100);
  SetBlipColour(blip, blipIdx);
  blips[blipIdx] = {
    blip = blip,
    coords = plyCoords,
    width = width,
    height = height
  }
end)

RegisterCommand('dev:blip:update', function(_, args)
  local blipInfo = blips[blipIdx]
  if not blipInfo then return end
  local coords = GetBlipCoords(blipInfo.blip)
  local width = tonumber(args[1])
  local height = tonumber(args[2])
  RemoveBlip(blipInfo.blip)
  local blip = AddBlipForArea(
    coords.x + 0.001,
    coords.y + 0.001,
    coords.z + 0.001,
    width + 0.001,
    height + 0.001
  )
  SetBlipAlpha(blip, 100);
  SetBlipColour(blip, blipIdx);
  blips[blipIdx] = {
    blip = blip,
    coords = coords,
    width = width,
    height = height
  }
end)

RegisterCommand("dev:blip:finish", function()
  blipIdx = blipIdx + 1
end)

RegisterCommand("dev:blip:dump", function()
  print(json.encode(blips));
end)