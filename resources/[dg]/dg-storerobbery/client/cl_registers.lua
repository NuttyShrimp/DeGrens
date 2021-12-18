openedRegisters = {}
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
    DGCore.Functions.Progressbar("search_register", "Kassa leeghalen...", Config.Registers.RobTime, false, true, {
        disableMovement = true,
        disableCarMovement = true,
        disableMouse = false,
        disableCombat = true,
    }, {}, {}, {}, function() -- Done
        ClearPedTasks(ped)
        lockpickAnimTime = 0
        TriggerServerEvent("dg-storerobbery:server:OpenRegister", GetEntityCoords(register))
    end, function() -- Cancel
        ClearPedTasks(ped)
        lockpickAnimTime = 0
        DGCore.Functions.Notify("Geannuleerd...", "error")
    end)
end

function EnteredRegistersZone() 
    exports["dg-peek"]:AddTargetModel(Config.Registers.Model, {
        options = {
            {
                icon = "fas fa-cash-register",
                label = "Beroof",
                action = function(register)
                    TriggerEvent("dg-storerobbery:client:LockpickRegister", register)
                end,
                canInteract = function(register)
                    return exports['dg-storerobbery']:CanRobRegister(register)
                end,
            }
        },
        distance = 0.8,
    })
end

function LeftRegistersZone()
    exports["dg-peek"]:RemoveTargetModel(Config.Registers.Model, "Lockpick")
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
                            TriggerEvent('inventory:client:ItemBox', exports["dg-inventory"]:GetItemData()["lockpick"], "remove")
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