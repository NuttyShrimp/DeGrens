openedRegisters = {}
inRegisterZone = false
local lockpickAnimTime = 0

local function LockpickAnimation()
	Citizen.CreateThread(function()
		lockpickAnimTime = Config.Registers.RobTime - 1000 -- account for exit anim
		local ped = PlayerPedId()
		LoadAnimDict('oddjobs@shop_robbery@rob_till')

		while lockpickAnimTime > 0 do
			TaskPlayAnim(ped, "oddjobs@shop_robbery@rob_till", "loop", 2.0, 2.0, -1, 16, 0, false, false, false)
			Citizen.Wait(1650)
			lockpickAnimTime = lockpickAnimTime - 1650
		end

		TaskPlayAnim(ped, "oddjobs@shop_robbery@rob_till", "exit", 2.0, 2.0, -1, 16, 0, false, false, false)
	end)
end

local function LootRegister(register)
	local ped = PlayerPedId()
	GainStress()
	CreateEvidence()

	LockpickAnimation()
	local wasCancelled, _ = exports['dg-misc']: Taskbar("cash-register", 'Kassa leeghalen...', Config.Registers.RobTime, {
	  canCancel = true,
	  cancelOnDeath = true,
	  disarm = true,
	  disableInventory = true,
	  controlDisables = {
      movement = true,
      carMovement = true,
      combat = true,
    },
	})
  ClearPedTasks(ped)
  lockpickAnimTime = 0
  if wasCancelled then
		DGCore.Functions.Notify("Geannuleerd...", "error")
		return
  end
  TriggerServerEvent("dg-storerobbery:server:OpenRegister", GetEntityCoords(register))
end

function buildRegisterZone()
	if not currentStore or not Config.Stores[currentStore] then
		return
	end
	local store = Config.Stores[currentStore].registerzone
	store.options.data = store.options.data or {}
	store.options.data.id = store.name
	exports["dg-polyzone"]:AddBoxZone("registers", store.center, store.length, store.width, store.options)
end

function removeRegisterZone()
	if not currentStore or not Config.Stores[currentStore] then
		return
	end
	exports["dg-polyzone"]:removeZone("registers")
end

AddEventHandler("dg-storerobbery:client:LockpickRegister", function(register)
	if currentStore then
		DGCore.Functions.TriggerCallback('DGCore:HasItem', function(hasItem)
			CallCops(currentStore)

			if HasObjectBeenBroken(register) then
				LootRegister(register)
			elseif hasItem then
				exports["dg-keygame"]:OpenGame(function(success)
					if success then
						LootRegister(register)
					else
						local rng = math.random(1, 100)
						if rng <= Config.Lockpick.BreakChance then
							TriggerServerEvent("DGCore:Server:RemoveItem", 'lockpick', 1)
							TriggerEvent('inventory:client:ItemBox', "lockpick", "remove")
							DGCore.Functions.Notify('Je lockpick is gebroken...', 'error')
						else
							DGCore.Functions.Notify('Mislukt...', 'error')
						end
					end
				end, Config.Lockpick.Amount, Config.Lockpick.Difficulty)
			else
				DGCore.Functions.Notify("Hoe ga je dit openen?", "error")
			end
		end, 'lockpick')
	end
end)

RegisterNetEvent("dg-storerobbery:client:UpdateOpenedRegisters", function(registers)
	openedRegisters = registers
end)

-- export for peek
exports('CanRobRegister', function(register)
	local retval = true
	local pos = GetEntityCoords(register)

	if not currentStore or not inRegisterZone then
		return false
	end

	if currentCops >= Config.RequiredCops then
		for _, v in pairs(openedRegisters) do
			if #(pos - v) < 0.1 then
				retval = false
				break
			end
		end
	else
		retval = false
	end

	return retval
end)