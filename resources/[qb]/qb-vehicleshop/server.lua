-- Variables
local DGCore = exports['dg-core']:GetCoreObject()
local financetimer = {}
local paymentDue = false

-- Handlers

-- Store game time for player when they load
RegisterNetEvent('qb-vehicleshop:server:addPlayer', function(citizenid, gameTime)
    financetimer[citizenid] = gameTime
end)

-- Deduct stored game time from player on logout
RegisterNetEvent('qb-vehicleshop:server:removePlayer', function(citizenid)
    if financetimer[citizenid] then
        local playTime = financetimer[citizenid]
        local financetime = exports.oxmysql:executeSync('SELECT * FROM player_vehicles WHERE citizenid = ?', {citizenid})
        for k,v in pairs(financetime) do
            if v.balance >= 1 then
                exports.oxmysql:update('UPDATE player_vehicles SET financetime = ? WHERE plate = ?', {math.floor(v.financetime - (((GetGameTimer() - playTime) / 1000) / 60)), v.plate})
            end
        end
    end
    financetimer[citizenid] = {}
end)

-- Deduct stored game time from player on quit because we can't get citizenid
AddEventHandler('playerDropped', function()
    local src = source
    for k,v in pairs(GetPlayerIdentifiers(src)) do
        if string.sub(v, 1, string.len("license:")) == "license:" then
            license = v
        end
    end
    if license then
        local vehicles = exports.oxmysql:executeSync('SELECT * FROM player_vehicles WHERE license = ?', {license})
        if vehicles then
            for k,v in pairs(vehicles) do
                if financetimer[v.citizenid] then
                    local playTime = financetimer[v.citizenid]
                    if v.balance >= 1 then
                        exports.oxmysql:update('UPDATE player_vehicles SET financetime = ? WHERE plate = ?', {math.floor(v.financetime - (((GetGameTimer() - playTime) / 1000) / 60)), v.plate})
                        financetimer[v.citizenid] = {}
                    end
                end
            end
        end
    end
end)

-- Functions

local function round(x)
    return x>=0 and math.floor(x+0.5) or math.ceil(x-0.5)
end

local function calculateFinance(vehiclePrice, downPayment, paymentamount)
    local balance = vehiclePrice - downPayment
    local vehPaymentAmount = balance / paymentamount
    return round(balance), round(vehPaymentAmount)
end

local function calculateNewFinance(paymentAmount, vehData)
    local newBalance = tonumber(vehData.balance - paymentAmount)
    local minusPayment = vehData.paymentsLeft - 1
    local newPaymentsLeft = newBalance / minusPayment
    local newPayment = newBalance / newPaymentsLeft
    return round(newBalance), round(newPayment), newPaymentsLeft
end

local function GeneratePlate()
    local plate = DGCore.Shared.RandomInt(1) .. DGCore.Shared.RandomStr(2) .. DGCore.Shared.RandomInt(3) .. DGCore.Shared.RandomStr(2)
    local result = exports.oxmysql:scalarSync('SELECT plate FROM player_vehicles WHERE plate = ?', {plate})
    if result then
        return GeneratePlate()
    else
        return plate:upper()
    end
end

local function comma_value(amount)
    local formatted = amount
    while true do
      formatted, k = string.gsub(formatted, '^(-?%d+)(%d%d%d)', '%1,%2')
      if (k==0) then
        break
      end
    end
    return formatted
end

-- Callbacks

DGCore.Functions.CreateCallback('qb-vehicleshop:server:getVehicles', function(source, cb)
    local src = source
    local player = DGCore.Functions.GetPlayer(src)
    if player then
        local vehicles = exports.oxmysql:executeSync('SELECT * FROM player_vehicles WHERE citizenid = ?', {player.PlayerData.citizenid})
        if vehicles[1] then
            cb(vehicles)
        end
    end
end)

-- Events

-- Sync vehicle for other players
RegisterNetEvent('qb-vehicleshop:server:swapVehicle', function(data)
    Config.Shops[data.ClosestShop]['ShowroomVehicles'][data.ClosestVehicle].chosenVehicle = data.toVehicle
    TriggerClientEvent('qb-vehicleshop:client:swapVehicle', -1, data)
end)

-- Send customer for test drive
RegisterNetEvent('qb-vehicleshop:server:customTestDrive', function(data)
    local src = source
    local PlayerPed = GetPlayerPed(src)
    local pCoords = GetEntityCoords(PlayerPed)
    for k, v in pairs(DGCore.Functions.GetPlayers()) do
        local TargetPed = GetPlayerPed(v)
        local tCoords = GetEntityCoords(TargetPed)
        local dist = #(pCoords - tCoords)
        if PlayerPed ~= TargetPed and dist < 3.0 then
            testDrivePlayer = DGCore.Functions.GetPlayer(v)
        end
    end
    if not testDrivePlayer then return TriggerClientEvent('DGCore:Notify', src, 'No one nearby', 'error') end
    TriggerClientEvent('qb-vehicleshop:client:customTestDrive', testDrivePlayer.PlayerData.source, data)
end)

-- Make a finance payment
RegisterNetEvent('qb-vehicleshop:server:financePayment', function(paymentAmount, vehData)
    local src = source
    local player = DGCore.Functions.GetPlayer(src)
    local cash = exports['dg-financials']:getCash(src)
    local plyAccId = exports['dg-financials']:getDefaultAccountId(Player.PlayerData.citizenid)
		local bank = exports['dg-financials']:GetAccountBalance(plyAccId)
    local plate = vehData.vehiclePlate
    local paymentAmount = tonumber(paymentAmount)
    local minPayment = tonumber(vehData.paymentAmount)
    local timer = (Config.PaymentInterval * 60)
    local newBalance, newPaymentsLeft, newPayment = calculateNewFinance(paymentAmount, vehData)
    if newBalance > 0 then
        if player and paymentAmount >= minPayment then
            if cash >= paymentAmount then
								exports['dg-financials']:removeCash(src, paymentAmount, "Finance payment")
                exports.oxmysql:execute('UPDATE player_vehicles SET balance = ?, paymentamount = ?, paymentsleft = ?, financetime = ? WHERE plate = ?', {newBalance, newPayment, newPaymentsLeft, timer, plate})
            elseif bank >= paymentAmount then
								exports['dg-financials']:purchase(plyAccId, Player.PlayerData.citizenid, paymentAmount, "Finance payment for " .. plate, 2)
	            exports.oxmysql:execute('UPDATE player_vehicles SET balance = ?, paymentamount = ?, paymentsleft = ?, financetime = ? WHERE plate = ?', { newBalance, newPayment, newPaymentsLeft, timer, plate })
            else
                TriggerClientEvent('DGCore:Notify', src, 'Not enough money', 'error')
            end
        else
            TriggerClientEvent('DGCore:Notify', src, 'Minimum payment allowed is $' ..comma_value(minPayment), 'error')
        end
    else
        TriggerClientEvent('DGCore:Notify', src, 'You overpaid', 'error')
    end
end)


-- Pay off vehice in full
RegisterNetEvent('qb-vehicleshop:server:financePaymentFull', function(data)
    local src = source
    local player = DGCore.Functions.GetPlayer(src)
		local cash = exports['dg-financials']:getCash(src)
		local plyAccId = exports['dg-financials']:getDefaultAccountId(Player.PlayerData.citizenid)
		local bank = exports['dg-financials']:GetAccountBalance(plyAccId)
    local vehBalance = data.vehBalance
    local vehPlate = data.vehPlate
    if player and vehBalance ~= 0 then
        if cash >= vehBalance then
						exports['dg-financials']:removeCash(src, vehBalance, "Finance payment(last) for " .. vehPlate)
            exports.oxmysql:update('UPDATE player_vehicles SET balance = ?, paymentamount = ?, paymentsleft = ?, financetime = ? WHERE plate = ?', {0, 0, 0, 0, vehPlate})
        elseif bank >= vehBalance then
	        exports['dg-financials']:purchase(plyAccId, Player.PlayerData.citizenid, vehBalance, "Finance payment(last) for " .. vehPlate, 2)
	        exports.oxmysql:update('UPDATE player_vehicles SET balance = ?, paymentamount = ?, paymentsleft = ?, financetime = ? WHERE plate = ?', { 0, 0, 0, 0, vehPlate })
        else
            TriggerClientEvent('DGCore:Notify', src, 'Not enough money', 'error')
        end
    else
        TriggerClientEvent('DGCore:Notify', src, 'Vehicle is already paid off', 'error')
    end
end)

-- Buy public vehicle outright
RegisterNetEvent('qb-vehicleshop:server:buyShowroomVehicle', function(vehicle)
    local src = source
    local vehicle = vehicle.buyVehicle
    local pData = DGCore.Functions.GetPlayer(src)
    local cid = pData.PlayerData.citizenid
		local cash = exports['dg-financials']:getCash(src)
		local plyAccId = exports['dg-financials']:getDefaultAccountId(Player.PlayerData.citizenid)
		local bank = exports['dg-financials']:GetAccountBalance(plyAccId)
    local vehiclePrice = DGCore.Shared.Vehicles[vehicle]['price']
    local plate = GeneratePlate()
    if cash > vehiclePrice then
        exports.oxmysql:insert('INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state) VALUES (?, ?, ?, ?, ?, ?, ?)', {
            pData.PlayerData.license,
            cid,
            vehicle,
            GetHashKey(vehicle),
            '{}',
            plate,
            0
        })
        TriggerClientEvent('DGCore:Notify', src, 'Congratulations on your purchase!', 'success')
        TriggerClientEvent('qb-vehicleshop:client:buyShowroomVehicle', src, vehicle, plate)
				exports['dg-financials']:removeCash(src, vehiclePrice, "Showroom vehicle purchase for " .. plate)
    elseif bank > vehiclePrice then
        exports.oxmysql:insert('INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state) VALUES (?, ?, ?, ?, ?, ?, ?)', {
            pData.PlayerData.license,
            cid,
            vehicle,
            GetHashKey(vehicle),
            '{}',
            plate,
            0
        })
        TriggerClientEvent('DGCore:Notify', src, 'Congratulations on your purchase!', 'success')
	    TriggerClientEvent('qb-vehicleshop:client:buyShowroomVehicle', src, vehicle, plate)
	    exports['dg-financials']:purchase(plyAccId, Player.PlayerData.citizenid, vehiclePrice, "Showroom vehicle purchase for " .. plate, 2)
    else
        TriggerClientEvent('DGCore:Notify', src, 'Not enough money', 'error')
    end
end)

-- Finance public vehicle
RegisterNetEvent('qb-vehicleshop:server:financeVehicle', function(downPayment, paymentAmount, vehicle)
    local src = source
    local downPayment = tonumber(downPayment)
    local paymentAmount = tonumber(paymentAmount)
    local pData = DGCore.Functions.GetPlayer(src)
    local cid = pData.PlayerData.citizenid
		local cash = exports['dg-financials']:getCash(src)
		local plyAccId = exports['dg-financials']:getDefaultAccountId(Player.PlayerData.citizenid)
		local bank = exports['dg-financials']:GetAccountBalance(plyAccId)
    local vehiclePrice = DGCore.Shared.Vehicles[vehicle]['price']
    local timer = (Config.PaymentInterval * 60)
    local minDown = tonumber(round(vehiclePrice / Config.MinimumDown))
    if downPayment > vehiclePrice then return TriggerClientEvent('DGCore:Notify', src, 'Vehicle is not worth that much', 'error') end
    if downPayment < minDown then return TriggerClientEvent('DGCore:Notify', src, 'Down payment too small', 'error') end
    if paymentAmount > Config.MaximumPayments then return TriggerClientEvent('DGCore:Notify', src, 'Exceeded maximum payment amount', 'error') end
    local plate = GeneratePlate()
    local balance, vehPaymentAmount = calculateFinance(vehiclePrice, downPayment, paymentAmount)
    if cash > downPayment then
        exports.oxmysql:insert('INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state, balance, paymentamount, paymentsleft, financetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', {
            pData.PlayerData.license,
            cid,
            vehicle,
            GetHashKey(vehicle),
            '{}',
            plate,
            0,
            balance,
            vehPaymentAmount,
            paymentAmount,
            timer
        })
        TriggerClientEvent('DGCore:Notify', src, 'Congratulations on your purchase!', 'success')
        TriggerClientEvent('qb-vehicleshop:client:buyShowroomVehicle', src, vehicle, plate)
				exports['dg-financials']:removeCash(src, downPayment, "Showroom Vehicle finance for " .. plate)
    elseif bank > downPayment then
        exports.oxmysql:insert('INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state, balance, paymentamount, paymentsleft, financetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', {
            pData.PlayerData.license,
            cid,
            vehicle,
            GetHashKey(vehicle),
            '{}',
            plate,
            0,
            balance,
            vehPaymentAmount,
            paymentAmount,
            timer
        })
        TriggerClientEvent('DGCore:Notify', src, 'Congratulations on your purchase!', 'success')
	    TriggerClientEvent('qb-vehicleshop:client:buyShowroomVehicle', src, vehicle, plate)
	    exports['dg-financials']:purchase(plyAccId, Player.PlayerData.citizenid, downPayment, "Showroom Vehicle finance for " .. plate, 2)
    else
        TriggerClientEvent('DGCore:Notify', src, 'Not enough money', 'error')
    end
end)

-- Sell vehicle to customer
RegisterNetEvent('qb-vehicleshop:server:sellShowroomVehicle', function(data)
    local src = source
    local PlayerPed = GetPlayerPed(src)
    local pCoords = GetEntityCoords(PlayerPed)
    local player = DGCore.Functions.GetPlayer(src)
    for k, v in pairs(DGCore.Functions.GetPlayers()) do
        local TargetPed = GetPlayerPed(v)
        local tCoords = GetEntityCoords(TargetPed)
        local dist = #(pCoords - tCoords)
        if PlayerPed ~= TargetPed and dist < 1.0 then
            targetPlayer = DGCore.Functions.GetPlayer(v)
        end
    end
    if not targetPlayer then return TriggerClientEvent('DGCore:Notify', src, 'No one nearby', 'error') end
    local cid = targetPlayer.PlayerData.citizenid
    local cash = targetPlayer.PlayerData.money['cash']
    local bank = targetPlayer.PlayerData.money['bank']
    local vehicle = data.buyVehicle
    local vehiclePrice = DGCore.Shared.Vehicles[vehicle]['price']
    local plate = GeneratePlate()
    local commission = round(vehiclePrice * Config.Commission)
    if cash > vehiclePrice then
        exports.oxmysql:insert('INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state) VALUES (?, ?, ?, ?, ?, ?, ?)', {
            targetPlayer.PlayerData.license,
            cid,
            vehicle,
            GetHashKey(vehicle),
            '{}',
            plate,
            0
        })
        TriggerClientEvent('qb-vehicleshop:client:buyShowroomVehicle', targetPlayer.PlayerData.source, vehicle, plate)
        targetPlayer.Functions.RemoveMoney('cash', vehiclePrice, 'vehicle-bought-in-showroom')
        player.Functions.AddMoney('bank', commission)
        TriggerEvent('qb-bossmenu:server:addAccountMoney', player.PlayerData.job.name, vehiclePrice)
        TriggerClientEvent('DGCore:Notify', targetPlayer.PlayerData.source, 'Congratulations on your purchase!', 'success')
        TriggerClientEvent('DGCore:Notify', src, 'You earned $'..comma_value(commission)..' in commission', 'success')
    elseif bank > vehiclePrice then
        exports.oxmysql:insert('INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state) VALUES (?, ?, ?, ?, ?, ?, ?)', {
            targetPlayer.PlayerData.license,
            cid,
            vehicle,
            GetHashKey(vehicle),
            '{}',
            plate,
            0
        })
        TriggerClientEvent('qb-vehicleshop:client:buyShowroomVehicle', targetPlayer.PlayerData.source, vehicle, plate)
        targetPlayer.Functions.RemoveMoney('bank', vehiclePrice, 'vehicle-bought-in-showroom')
        player.Functions.AddMoney('bank', commission)
        TriggerEvent('qb-bossmenu:server:addAccountMoney', player.PlayerData.job.name, vehiclePrice)
        TriggerClientEvent('DGCore:Notify', targetPlayer.PlayerData.source, 'Congratulations on your purchase!', 'success')
        TriggerClientEvent('DGCore:Notify', src, 'You earned $'..comma_value(commission)..' in commission', 'success')
    else
        TriggerClientEvent('DGCore:Notify', src, 'Not enough money', 'error')
    end
end)

-- Finance vehicle to customer
RegisterNetEvent('qb-vehicleshop:server:sellfinanceVehicle', function(downPayment, paymentAmount, vehicle)
    local src = source
    local PlayerPed = GetPlayerPed(src)
    local pCoords = GetEntityCoords(PlayerPed)
    local player = DGCore.Functions.GetPlayer(src)
    for k, v in pairs(DGCore.Functions.GetPlayers()) do
        local TargetPed = GetPlayerPed(v)
        local tCoords = GetEntityCoords(TargetPed)
        local dist = #(pCoords - tCoords)
        if PlayerPed ~= TargetPed and dist < 1.0 then
            targetplayer = DGCore.Functions.GetPlayer(v)
        end
    end
    if not targetplayer then return TriggerClientEvent('DGCore:Notify', src, 'No one nearby', 'error') end
    local downPayment = tonumber(downPayment)
    local paymentAmount = tonumber(paymentAmount)
    local cid = targetplayer.PlayerData.citizenid
    local cash = targetplayer.PlayerData.money['cash']
    local bank = targetplayer.PlayerData.money['bank']
    local vehiclePrice = DGCore.Shared.Vehicles[vehicle]['price']
    local commission = round(vehiclePrice * Config.FinanceCommission)
    local timer = (Config.PaymentInterval * 60)
    local minDown = tonumber(round(vehiclePrice / Config.MinimumDown))
    if downPayment > vehiclePrice then return TriggerClientEvent('DGCore:Notify', src, 'Vehicle is not worth that much', 'error') end
    if downPayment < minDown then return TriggerClientEvent('DGCore:Notify', src, 'Down payment too small', 'error') end
    if paymentAmount > Config.MaximumPayments then return TriggerClientEvent('DGCore:Notify', src, 'Exceeded maximum payment amount', 'error') end
    local plate = GeneratePlate()
    local balance, vehPaymentAmount = calculateFinance(vehiclePrice, downPayment, paymentAmount)
    if cash > downPayment then
        exports.oxmysql:insert('INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state, balance, paymentamount, paymentsleft, financetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', {
            targetplayer.PlayerData.license,
            cid,
            vehicle,
            GetHashKey(vehicle),
            '{}',
            plate,
            0,
            balance,
            vehPaymentAmount,
            paymentAmount,
            timer
        })
        TriggerClientEvent('qb-vehicleshop:client:buyShowroomVehicle', targetplayer.PlayerData.source, vehicle, plate)
        targetplayer.Functions.RemoveMoney('cash', downPayment, 'vehicle-bought-in-showroom')
        player.Functions.AddMoney('bank', commission)
        TriggerEvent('qb-bossmenu:server:addAccountMoney', player.PlayerData.job.name, vehiclePrice)
        TriggerClientEvent('DGCore:Notify', targetplayer.PlayerData.source, 'Congratulations on your purchase!', 'success')
        TriggerClientEvent('DGCore:Notify', src, 'You earned $'..comma_value(commission)..' in commission', 'success')
    elseif bank > downPayment then
        exports.oxmysql:insert('INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state, balance, paymentamount, paymentsleft, financetime) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', {
            targetplayer.PlayerData.license,
            cid,
            vehicle,
            GetHashKey(vehicle),
            '{}',
            plate,
            0,
            balance,
            vehPaymentAmount,
            paymentAmount,
            timer
        })
        TriggerClientEvent('qb-vehicleshop:client:buyShowroomVehicle', targetplayer.PlayerData.source, vehicle, plate)
        targetplayer.Functions.RemoveMoney('bank', downPayment, 'vehicle-bought-in-showroom')
        player.Functions.AddMoney('bank', commission)
        TriggerEvent('qb-bossmenu:server:addAccountMoney', player.PlayerData.job.name, vehiclePrice)
        TriggerClientEvent('DGCore:Notify', targetplayer.PlayerData.source, 'Congratulations on your purchase!', 'success')
        TriggerClientEvent('DGCore:Notify', src, 'You earned $'..comma_value(commission)..' in commission', 'success')
    else
        TriggerClientEvent('DGCore:Notify', src, 'Not enough money', 'error')
    end
end)

-- Check if payment is due
RegisterNetEvent('qb-vehicleshop:server:checkFinance', function()
    local src = source
    local player = DGCore.Functions.GetPlayer(src)
    local result = exports.oxmysql:executeSync('SELECT * FROM player_vehicles WHERE citizenid = ?', {player.PlayerData.citizenid})
    for k,v in pairs(result) do
        if v.balance >= 1 and v.financetime < 1 then
            paymentDue = true
        end
    end
    if paymentDue then
        TriggerClientEvent('DGCore:Notify', src, 'Your vehicle payment is due within '..Config.PaymentWarning..' minutes')
        Wait(Config.PaymentWarning * 60000)
        exports.oxmysql:execute('SELECT * FROM player_vehicles WHERE citizenid = ?', {player.PlayerData.citizenid}, function(vehicles)
            for k,v in pairs(vehicles) do
                if v.balance >= 1 and v.financetime < 1 then
                    local plate = v.plate
                    exports.oxmysql:execute('DELETE FROM player_vehicles WHERE plate = @plate', {['@plate'] = plate})
                    TriggerClientEvent('DGCore:Notify', src, 'Your vehicle with plate '..plate..' has been repossessed', 'error')
                end
            end
        end)
    end
end)

-- Transfer vehicle to player in passenger seat
DGCore.Commands.Add('transferVehicle', 'Gift or sell your vehicle', {{ name = 'amount', help = 'Sell amount' }}, false, function(source, args)
    local src = source
    local ped = GetPlayerPed(src)
    local player = DGCore.Functions.GetPlayer(src)
    local citizenid = player.PlayerData.citizenid
    local sellAmount = tonumber(args[1])
    local vehicle = GetVehiclePedIsIn(ped, false)
    if vehicle == 0 then return TriggerClientEvent('DGCore:Notify', src, 'Must be in a vehicle', 'error') end
    local driver = GetPedInVehicleSeat(vehicle, -1)
    local passenger = GetPedInVehicleSeat(vehicle, 0)
    local plate = GetVehicleNumberPlateText(vehicle)
    local isOwned = exports.oxmysql:scalarSync('SELECT citizenid FROM player_vehicles WHERE plate = ?', {plate})
    if isOwned ~= citizenid then return TriggerClientEvent('DGCore:Notify', src, 'You dont own this vehicle', 'error') end
    if ped ~= driver then return TriggerClientEvent('DGCore:Notify', src, 'Must be driver', 'error') end
    if passenger == 0 then return TriggerClientEvent('DGCore:Notify', src, 'No passenger', 'error') end
    local targetid = NetworkGetEntityOwner(passenger)
    local target = DGCore.Functions.GetPlayer(targetid)
    if not target then return TriggerClientEvent('DGCore:Notify', src, 'Couldnt get passenger info', 'error') end
    if sellAmount then
        if exports['dg-financials']:getCash(target.Functions.source) > sellAmount then
            local targetcid = target.PlayerData.citizenid
            exports.oxmysql:update('UPDATE player_vehicles SET citizenid = ? WHERE plate = ?', {targetcid, plate})
            player.Functions.AddMoney('cash', sellAmount)
            TriggerClientEvent('DGCore:Notify', src, 'You sold your vehicle for $'..comma_value(sellAmount), 'success')
            target.Functions.RemoveMoney('cash', sellAmount)
            TriggerClientEvent('vehiclekeys:client:SetOwner', target.PlayerData.source, plate)
            TriggerClientEvent('DGCore:Notify', target.PlayerData.source, 'You bought a vehicle for $'..comma_value(sellAmount), 'success')
        else
            TriggerClientEvent('DGCore:Notify', src, 'Not enough money', 'error')
        end
    else
        local targetcid = target.PlayerData.citizenid
        exports.oxmysql:update('UPDATE player_vehicles SET citizenid = ? WHERE plate = ?', {targetcid, plate})
        TriggerClientEvent('DGCore:Notify', src, 'You gifted your vehicle', 'success')
        TriggerClientEvent('vehiclekeys:client:SetOwner', target.PlayerData.source, plate)
        TriggerClientEvent('DGCore:Notify', target.PlayerData.source, 'You were gifted a vehicle', 'success')
    end
end, 'user')
