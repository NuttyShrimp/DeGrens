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
		if (item.isEnabled == nil) then
			print(('[RADIAL] [ERROR] %s(%s) has no isEnabled function'):format(item.id, item.title))
			goto skip_to_next
		end
		if (not item.isEnabled(context.plyData, context.vehicle)) then
			goto skip_to_next
		end
		item.isEnabled = nil
		if (item.subMenu and entries[item.subMenu] == nil) then
			print(('[RADIAL] [ERROR] %s(%s) has no submenu entries but a submenu(%s) is defined function'):format(item.id, item.title, item.subMenu))
			goto skip_to_next
		end
		if (item.subMenu) then
			item.items = getEnabledItems(DGCore.Shared.copyTbl(entries[item.subMenu]), context)
		end
		-- TODO: If the items array has more elements than 8, we should splits it in extra submenus
		_items[#_items+1] = item
		::skip_to_next::
	end
	return _items
end

function generateItems()
	local plyData = DGCore.Functions.GetPlayerData()
	local vehicle = GetVehiclePedIsIn(PlayerPedId())
	-- Start at entries.main and let the recursion do it's thing
	local items = getEnabledItems(DGCore.Shared.copyTbl(entries.main), { plyData = plyData, vehicle = vehicle })
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

function getNearestVeh()
	local pos = GetEntityCoords(PlayerPedId())
	local entityWorld = GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0.0, 20.0, 0.0)

	local rayHandle = CastRayPointToPoint(pos.x, pos.y, pos.z, entityWorld.x, entityWorld.y, entityWorld.z, 10, PlayerPedId(), 0)
	local _, _, _, _, vehicleHandle = GetRaycastResult(rayHandle)
	return vehicleHandle
end

RegisterNUICallback('closeRadial', function()
	closeRadial(false)
end)

RegisterNUICallback('selectItem', function(data)
	local itemData = data.itemData

  if (itemData.event) then
    if itemData.type == 'server' then
      TriggerServerEvent(itemData.event, itemData)
    else
      TriggerEvent(itemData.event, itemData)
    end
  end
end)

RegisterNetEvent('qb-radialmenu:client:noPlayers')
AddEventHandler('qb-radialmenu:client:noPlayers', function(data)
	DGCore.Functions.Notify('There arent any people close', 'error', 2500)
end)

RegisterNetEvent('qb-radialmenu:client:giveidkaart')
AddEventHandler('qb-radialmenu:client:giveidkaart', function(data)
	-- ??
end)

RegisterNetEvent('qb-radialmenu:client:openDoor')
AddEventHandler('qb-radialmenu:client:openDoor', function(data)
	local string = data.id
	local replace = string:gsub("door", "")
	local door = tonumber(replace)
	local ped = PlayerPedId()
	local closestVehicle = nil

	if IsPedInAnyVehicle(ped, false) then
		closestVehicle = GetVehiclePedIsIn(ped)
	else
		closestVehicle = getNearestVeh()
	end

	if closestVehicle ~= 0 then
		if closestVehicle ~= GetVehiclePedIsIn(ped) then
			local plate = GetVehicleNumberPlateText(closestVehicle)
			if GetVehicleDoorAngleRatio(closestVehicle, door) > 0.0 then
				if not IsVehicleSeatFree(closestVehicle, -1) then
					TriggerServerEvent('qb-radialmenu:trunk:server:Door', false, plate, door)
				else
					SetVehicleDoorShut(closestVehicle, door, false)
				end
			else
				if not IsVehicleSeatFree(closestVehicle, -1) then
					TriggerServerEvent('qb-radialmenu:trunk:server:Door', true, plate, door)
				else
					SetVehicleDoorOpen(closestVehicle, door, false, false)
				end
			end
		else
			if GetVehicleDoorAngleRatio(closestVehicle, door) > 0.0 then
				SetVehicleDoorShut(closestVehicle, door, false)
			else
				SetVehicleDoorOpen(closestVehicle, door, false, false)
			end
		end
	else
		DGCore.Functions.Notify('There is no vehicle in sight...', 'error', 2500)
	end
end)

RegisterNetEvent('qb-radialmenu:client:setExtra')
AddEventHandler('qb-radialmenu:client:setExtra', function(data)
	local string = data.id
	local replace = string:gsub("extra", "")
	local extra = tonumber(replace)
	local ped = PlayerPedId()
	local veh = GetVehiclePedIsIn(ped)
	if veh ~= nil then
		local plate = GetVehicleNumberPlateText(closestVehicle)
		if GetPedInVehicleSeat(veh, -1) == PlayerPedId() then
			SetVehicleAutoRepairDisabled(veh, true) -- Forces Auto Repair off when Toggling Extra [GTA 5 Niche Issue]
			if DoesExtraExist(veh, extra) then
				if IsVehicleExtraTurnedOn(veh, extra) then
					SetVehicleExtra(veh, extra, 1)
					DGCore.Functions.Notify('Extra ' .. extra .. ' Deactivated', 'error', 2500)
				else
					SetVehicleExtra(veh, extra, 0)
					DGCore.Functions.Notify('Extra ' .. extra .. ' Activated', 'success', 2500)
				end
			else
				DGCore.Functions.Notify('Extra ' .. extra .. ' is not present on this vehicle ', 'error', 2500)
			end
		else
			DGCore.Functions.Notify('You\'re not a driver of a vehicle!', 'error', 2500)
		end
	end
end)

RegisterNetEvent('qb-radialmenu:trunk:client:Door')
AddEventHandler('qb-radialmenu:trunk:client:Door', function(plate, door, open)
	local veh = GetVehiclePedIsIn(PlayerPedId())

	if veh ~= 0 then
		local pl = GetVehicleNumberPlateText(veh)

		if pl == plate then
			if open then
				SetVehicleDoorOpen(veh, door, false, false)
			else
				SetVehicleDoorShut(veh, door, false)
			end
		end
	end
end)

local Seats = {
	["-1"] = "Driver's Seat",
	["0"] = "Passenger's Seat",
	["1"] = "Rear Left Seat",
	["2"] = "Rear Right Seat",
}

RegisterNetEvent('qb-radialmenu:client:ChangeSeat')
AddEventHandler('qb-radialmenu:client:ChangeSeat', function(data)
	local Veh = GetVehiclePedIsIn(PlayerPedId())
	local IsSeatFree = IsVehicleSeatFree(Veh, data.id)
	local speed = GetEntitySpeed(Veh)
	local HasHarnass = exports['qb-smallresources']:HasHarness()
	if not HasHarnass then
		local kmh = (speed * 3.6);

		if IsSeatFree then
			if kmh <= 100.0 then
				SetPedIntoVehicle(PlayerPedId(), Veh, data.id)
				DGCore.Functions.Notify('You are now on the  ' .. data.title .. '!')
			else
				DGCore.Functions.Notify('This vehicle is going too fast..')
			end
		else
			DGCore.Functions.Notify('This seat is occupied..')
		end
	else
		DGCore.Functions.Notify('You have a race harness on you cant switch..', 'error')
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
