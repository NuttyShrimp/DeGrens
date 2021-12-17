local DGCore = exports['dg-core']:GetCoreObject()
local openedRegisters = {}

DGCore.Functions.CreateCallback("dg-storerobbery:server:GetConfig", function(source, cb) 
    local callback = {}
    callback.openedRegisters = openedRegisters
    cb(callback)
end)

RegisterNetEvent("dg-storerobbery:server:OpenRegister", function(register)
    local src = source
    openedRegisters[#openedRegisters + 1] = register
    TriggerClientEvent("dg-storerobbery:client:UpdateOpenedRegister", -1, openedRegisters)

    Citizen.SetTimeout(Config.RegisterTimeout, function()
        -- we always remove the first one because the timeout is same for every registr so the one at index 2 will always be removed later than the one at index 1
        table.remove(openedRegisters, 1)
        TriggerClientEvent("dg-storerobbery:client:UpdateOpenedRegister", -1, openedRegisters)
    end)
end)

RegisterNetEvent("dg-storerobbery:server:CallCops", function(store, streetLabel, coords)
    local cops = {}
    for _, playerId in pairs(DGCore.Functions.GetPlayers()) do
        local Player = DGCore.Functions.GetPlayer(playerId)
        if Player then 
            if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
                cops[#cops + 1] = playerId
            end
        end
    end

    local alertData = {
        title = "Poging Winkeloverval",
        coords = {x = coords.x, y = coords.y, z = coords.z},
        description = "Poging winkeloverbij bij"..streetLabel.." (CAMERA ID: "..Config.Stores[store].cam..")"
    }

    for _, id in pairs(cops) do
        TriggerClientEvent("qb-phone:client:addPoliceAlert", id, alertData)
        TriggerClientEvent("dg-storerobbery:client:PoliceAlert", id, store, streetLabel, coords)
    end
end)




























-- local cashA = 250 				--<<how much minimum you can get from a robbery
-- local cashB = 450				--<< how much maximum you can get from a robbery

-- RegisterServerEvent('qb-storerobbery:server:takeMoney')
-- AddEventHandler('qb-storerobbery:server:takeMoney', function(register, isDone)
--     local src = source
-- 	local Player = DGCore.Functions.GetPlayer(src)
-- 	-- Add some stuff if you want, this here above the if statement will trigger every 2 seconds of the animation when robbing a cash register.
--     if isDone then
-- 	    local bags = math.random(1,3)
-- 	    local info = {
-- 		    worth = math.random(cashA, cashB)
-- 	    }
-- 	    Player.Functions.AddItem('markedbills', bags, false, info)
-- 	    TriggerClientEvent('inventory:client:ItemBox', src, exports["dg-inventory"]:GetItemData()['markedbills'], "add")
--     end
-- end)

-- RegisterServerEvent('qb-storerobbery:server:setRegisterStatus')
-- AddEventHandler('qb-storerobbery:server:setRegisterStatus', function(register)
--     Config.Registers[register].robbed   = true
--     Config.Registers[register].time     = Config.resetTime
--     TriggerClientEvent('qb-storerobbery:client:setRegisterStatus', -1, register, Config.Registers[register])
-- end)

-- RegisterServerEvent('qb-storerobbery:server:setSafeStatus')
-- AddEventHandler('qb-storerobbery:server:setSafeStatus', function(safe)
--     TriggerClientEvent('qb-storerobbery:client:setSafeStatus', -1, safe, true)
--     Config.Safes[safe].robbed = true

--     SetTimeout(math.random(40, 80) * (60 * 1000), function()
--         TriggerClientEvent('qb-storerobbery:client:setSafeStatus', -1, safe, false)
--         Config.Safes[safe].robbed = false
--     end)
-- end)

-- RegisterServerEvent('qb-storerobbery:server:SafeReward')
-- AddEventHandler('qb-storerobbery:server:SafeReward', function(safe)
--     local src = source
-- 	local Player = DGCore.Functions.GetPlayer(src)
-- 	local bags = math.random(1,3)
-- 	local info = {
-- 		worth = math.random(cashA, cashB)
-- 	}
-- 	Player.Functions.AddItem('markedbills', bags, false, info)
-- 	TriggerClientEvent('inventory:client:ItemBox', src, exports["dg-inventory"]:GetItemData()['markedbills'], "add")
--     local luck = math.random(1, 100)
--     local odd = math.random(1, 100)
--     if luck <= 10 then
--         Player.Functions.AddItem("rolex", math.random(3, 7))
--         TriggerClientEvent('inventory:client:ItemBox', src, exports["dg-inventory"]:GetItemData()["rolex"], "add")
--         if luck == odd then
--             Citizen.Wait(500)
--             Player.Functions.AddItem("goldbar", 1)
--             TriggerClientEvent('inventory:client:ItemBox', src, exports["dg-inventory"]:GetItemData()["goldbar"], "add")
--         end
--     end
-- end)

-- RegisterServerEvent('qb-storerobbery:server:callCops')
-- AddEventHandler('qb-storerobbery:server:callCops', function(type, safe, streetLabel, coords)
--     local cameraId = 4
--     if type == "safe" then
--         cameraId = Config.Safes[safe].camId
--     else
--         cameraId = Config.Registers[safe].camId
--     end
--     local alertData = {
--         title = "10-33 | Shop Robbery",
--         coords = {x = coords.x, y = coords.y, z = coords.z},
--         description = "Someone Is Trying To Rob A Store At "..streetLabel.." (CAMERA ID: "..cameraId..")"
--     }
--     TriggerClientEvent("qb-storerobbery:client:robberyCall", -1, type, safe, streetLabel, coords)
--     TriggerClientEvent("qb-phone:client:addPoliceAlert", -1, alertData)
-- end)

-- Citizen.CreateThread(function()
--     while true do
--         local toSend = {}
--         for k, v in ipairs(Config.Registers) do

--             if Config.Registers[k].time > 0 and (Config.Registers[k].time - Config.tickInterval) >= 0 then
--                 Config.Registers[k].time = Config.Registers[k].time - Config.tickInterval
--             else
--                 if Config.Registers[k].robbed then
--                     Config.Registers[k].time = 0
--                     Config.Registers[k].robbed = false

--                     table.insert(toSend, Config.Registers[k])
--                 end
--             end
--         end

--         if #toSend > 0 then
--             --The false on the end of this is redundant
--             TriggerClientEvent('qb-storerobbery:client:setRegisterStatus', -1, toSend, false)
--         end

--         Citizen.Wait(Config.tickInterval)
--     end
-- end)

-- DGCore.Functions.CreateCallback('qb-storerobbery:server:getRegisterStatus', function(source, cb)
--     cb(Config.Registers)
-- end)

-- DGCore.Functions.CreateCallback('qb-storerobbery:server:getSafeStatus', function(source, cb)
--     cb(Config.Safes)
-- end)
