entries = {}
local plyJob = {
  name = nil,
  rank = nil 
}

-- TODO: Write tool to generate list/path of submenus

RegisterCommand('radialmenu', function()
	DGCore.Functions.GetPlayerData(function(PlayerData)
		if not PlayerData.metadata["ishandcuffed"] and not IsPauseMenuActive() then
			openRadial()
			SetCursorLocation(0.5, 0.5)
		end
	end)
end)

RegisterKeyMapping('radialmenu', 'Open Radial Menu', 'keyboard', 'F1')

function getEnabledItems(items, context)
	local _items = {}
	context.plyData.job = plyJob
	for _, item in pairs(items) do
    if item.isEnabled ~= nil then
      if not item.isEnabled(context.plyData, context.vehicle, context.entity) then
        goto skip_to_next
      end
    end
		item.isEnabled = nil
		if item.subMenu then
      if entries[item.subMenu] == nil then
        print(('[RADIAL] [ERROR] %s(%s) has no submenu entries but a submenu(%s) is defined function'):format(item.id, item.title, item.subMenu))
          goto skip_to_next
      end
			item.items = getEnabledItems(DGCore.Shared.copyTbl(entries[item.subMenu]), context)
		end
		-- TODO: If the items array has more elements than 8, we should splits it in extra submenus
		_items[#_items+1] = item
		::skip_to_next::
	end
	return _items
end

function generateItems()
  local ped = PlayerPedId()
	local plyData = DGCore.Functions.GetPlayerData()
	local vehicle = GetVehiclePedIsIn(ped)
  local hit = DGX.RayCast.doRaycast()
  local entity = hit.entity
  local coords = hit.coords and vector3(hit.coords.x, hit.coords.y, hit.coords.z)
  if not entity or not coords or #(coords - GetEntityCoords(ped)) > 5.0 then
    entity = nil
  end
	-- Start at entries.main and let the recursion do it's thing
	local items = getEnabledItems(DGCore.Shared.copyTbl(entries.main), { plyData = plyData, vehicle = vehicle, entity = entity })
	return items
end

function openRadial()
	local items = generateItems()

	SetNuiFocus(true, true)
	SendNUIMessage({
		action = "ui",
		radial = true,
		items = items
	})
end

function closeRadial(bool)
	SetNuiFocus(false, false)
end

RegisterNUICallback('closeRadial', function()
	closeRadial(false)
end)

RegisterNUICallback('selectItem', function(data)
	local itemData = data.itemData

  if (itemData.event) then
    if itemData.dgx then
      if itemData.type == 'server' then
        DGX.Events.emitNet(itemData.event, itemData)
      else
        DGX.Events.emit(itemData.event, itemData)
      end
    else
      if itemData.type == 'server' then
        TriggerServerEvent(itemData.event, itemData)
      else
        TriggerEvent(itemData.event, itemData)
      end
    end
  end
end)

RegisterNetEvent('dg-jobs:signin:update', function(job, rank)
  plyJob = {
    name = job,
    rank = rank
  }
end)

function DrawText3Ds(x, y, z, text)
	SetTextScale(0.35, 0.35)
	SetTextFont(4)
	SetTextProportional(1)
	SetTextColour(255, 255, 255, 215)
	SetTextEntry("STRING")
	SetTextCentre(true)
	AddTextComponentString(text)
	SetDrawOrigin(x, y, z, 0)
	DrawText(0.0, 0.0)
	local factor = (string.len(text)) / 370
	DrawRect(0.0, 0.0 + 0.0125, 0.017 + factor, 0.03, 0, 0, 0, 75)
	ClearDrawOrigin()
end
