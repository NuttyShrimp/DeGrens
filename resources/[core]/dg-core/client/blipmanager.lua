DGCore.Blips = {};
DGCore.Blips.disabledCategory = {}
DGCore.Blips.blipStore = {}
DGCore.Blips.infoStore = {}

local isCatDisabled = function(cat)
  for k,_ in pairs(DGCore.Blips.disabledCategory) do
    if k == cat then
      return true
    end
  end
  return false
end

local createBlip = function(name, cat, info)
  local newBlip = AddBlipForCoord(info.coords.x, info.coords.y, info.coords.z)
  SetBlipSprite(newBlip, info.sprite)
  SetBlipScale(newBlip, info.scale)
  SetBlipAsShortRange(newBlip, info.isShortRange)
  -- Default to white
  SetBlipColour(newBlip, info.color)
  SetBlipDisplay(newBlip, info.display)

	BeginTextCommandSetBlipName("STRING")
	AddTextComponentString(info.text)
	EndTextCommandSetBlipName(newBlip)

  DGCore.Blips.blipStore[cat][name] = newBlip
end

local removeBlip = function(id, cat)
  if not DGCore.Blips.blipStore[cat] or not DGCore.Blips.blipStore[cat][id] then
    return
  end
  RemoveBlip(DGCore.Blips.blipStore[cat][id])
end

DGCore.Blips.Add = function(category, data)
  if (not DGCore.Blips.infoStore[category]) then
    DGCore.Blips.infoStore[category] = {}
  end
  if (not DGCore.Blips.blipStore[category]) then
    DGCore.Blips.blipStore[category] = {}
  end

  -- Remove blip if one already exists with id
  removeBlip(data.id, category)

  DGCore.Blips.infoStore[category][data.id] = {
    category = category,
    text = data.text,
    coords = data.coords,
    sprite = data.sprite,
    isShortRange = (data.range ~= nil and data.range) or true,
    scale = data.scale or 0.8,
    color = data.color or 4,
    display = data.display or 6,
  }

  if isCatDisabled(category) then
    return
  end
  createBlip(data.id, category, DGCore.Blips.infoStore[category][data.id])
end

DGCore.Blips.enableCategory = function(cat)
  if not isCatDisabled() then
    return
  end
  DGCore.Blips.disabledCategory[cat] = nil
  if not DGCore.Blips.infoStore[cat] then
    return
  end
  for id, info in pairs(DGCore.Blips.infoStore[cat]) do
    createBlip(id, cat, info)
  end
end

DGCore.Blips.disableCategory = function(cat)
  if isCatDisabled() then
    return
  end
  DGCore.Blips.disabledCategory[cat] = true
  if not DGCore.Blips.infoStore[cat] then
    return
  end
  for id, _ in pairs(DGCore.Blips.infoStore[cat]) do
    removeBlip(id, cat)
  end
end

DGCore.Blips.removeCategory = function(cat)
  for id, _ in pairs(DGCore.Blips.infoStore[cat]) do
    removeBlip(id, cat)
  end
  DGCore.Blips.infoStore[cat] = nil
  DGCore.Blips.blipStore[cat] = nil
end
