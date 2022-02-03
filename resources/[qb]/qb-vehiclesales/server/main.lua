DGCore.Functions.CreateCallback('qb-occasions:server:getVehicles', function(source, cb)
	local result = exports.oxmysql:executeSync('SELECT * FROM occasion_vehicles', {})
	if result[1] ~= nil then
		cb(result)
	else
		cb(nil)
	end
end)

DGCore.Functions.CreateCallback("qb-occasions:server:getSellerInformation", function(source, cb, citizenid)
	local src = source

	exports.oxmysql:execute('SELECT * FROM players WHERE citizenid = ?', { citizenid }, function(result)
		if result[1] ~= nil then
			cb(result[1])
		else
			cb(nil)
		end
	end)
end)

RegisterServerEvent('qb-occasions:server:ReturnVehicle')
AddEventHandler('qb-occasions:server:ReturnVehicle', function(vehicleData)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local result = exports.oxmysql:executeSync('SELECT * FROM occasion_vehicles WHERE plate = ? AND occasionid = ?',
		{ vehicleData['plate'], vehicleData["oid"] })
	if result[1] ~= nil then
		if result[1].seller == Player.PlayerData.citizenid then
			exports.oxmysql:insert(
				'INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state) VALUES (?, ?, ?, ?, ?, ?, ?)',
				{ Player.PlayerData.license, Player.PlayerData.citizenid, vehicleData["model"],
					GetHashKey(vehicleData["model"]), vehicleData["mods"], vehicleData["plate"], 0 })
			exports.oxmysql:execute('DELETE FROM occasion_vehicles WHERE occasionid = ? AND plate = ?',
				{ vehicleData["oid"], vehicleData['plate'] })
			TriggerClientEvent("qb-occasions:client:ReturnOwnedVehicle", src, result[1])
			TriggerClientEvent('qb-occasion:client:refreshVehicles', -1)
		else
			TriggerClientEvent('DGCore:Notify', src, 'This is not your vehicle', 'error', 3500)
		end
	else
		TriggerClientEvent('DGCore:Notify', src, 'Vehicle does not exist', 'error', 3500)
	end
end)

RegisterServerEvent('qb-occasions:server:sellVehicle')
AddEventHandler('qb-occasions:server:sellVehicle', function(vehiclePrice, vehicleData)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	exports.oxmysql:execute('DELETE FROM player_vehicles WHERE plate = ? AND vehicle = ?',
		{ vehicleData.plate, vehicleData.model })
	exports.oxmysql:insert(
		'INSERT INTO occasion_vehicles (seller, price, description, plate, model, mods, occasionid) VALUES (?, ?, ?, ?, ?, ?, ?)',
		{ Player.PlayerData.citizenid, vehiclePrice, escapeSqli(vehicleData.desc), vehicleData.plate, vehicleData.model,
			json.encode(vehicleData.mods), generateOID() })
	TriggerEvent("qb-log:server:sendLog", Player.PlayerData.citizenid, "vehiclesold", {
		model = vehicleData.model,
		vehiclePrice = vehiclePrice
	})
	TriggerEvent("qb-log:server:CreateLog", "vehicleshop", "Vehicle for Sale", "red",
		"**" .. GetPlayerName(src) .. "** has a " .. vehicleData.model .. " priced at " .. vehiclePrice)

	TriggerClientEvent('qb-occasion:client:refreshVehicles', -1)
end)

RegisterServerEvent('qb-occasions:server:sellVehicleBack')
AddEventHandler('qb-occasions:server:sellVehicleBack', function(vData)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local cid = Player.PlayerData.citizenid
	local price = math.floor(vData.price / 2)
	local plate = vData.plate
	local bankAccId = exports['dg-financials']:getDefaultAccountId(src)

	exports['dg-financials']:transfer(bankAccId, 'BE1', cid, cid, price, "Voertuig verkoop aan staat")

	TriggerClientEvent('DGCore:Notify', src, 'You have sold your car for $' .. price, 'success', 5500)
	exports.oxmysql:execute('DELETE FROM player_vehicles WHERE plate = ?', { plate })
end)

RegisterServerEvent('qb-occasions:server:buyVehicle')
AddEventHandler('qb-occasions:server:buyVehicle', function(vehicleData)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local bankAccId = exports['dg-financials']:getDefaultAccountId(Player.PlayerData.citizenid)
	local bankBalance = exports['dg-financials']:getAccountBalance(bankAccId)
	local result = exports.oxmysql:executeSync('SELECT * FROM occasion_vehicles WHERE plate = ? AND occasionid = ?',
		{ vehicleData['plate'], vehicleData["oid"] })
	if result[1] ~= nil and next(result[1]) ~= nil then
		if bankBalance >= result[1].price then
			local SellerCitizenId = result[1].seller
			local SellerBankAccId = exports['dg-financials']:getDefaultAccountId(SellerCitizenId)
			-- New price calculation minus tax
			local NewPrice = math.ceil((result[1].price / 100) * 77)
			-- Insert vehicle for buyer
			exports.oxmysql:insert(
				'INSERT INTO player_vehicles (license, citizenid, vehicle, hash, mods, plate, state) VALUES (?, ?, ?, ?, ?, ?, ?)', {
					Player.PlayerData.license,
					Player.PlayerData.citizenid, result[1]["model"],
					GetHashKey(result[1]["model"]),
					result[1]["mods"],
					result[1]["plate"],
					0
				})
			exports['dg-financials']:transfer(bankAccId, SellerBankAccId, Player.PlayerData.citizenid, SellerCitizenId, NewPrice, ('2dehands voertuig aankoop: %s van %s'):format(DGCore.Shared.Vehicles[result[1].model].name, SellerCitizenId))
			TriggerEvent("qb-log:server:CreateLog", "vehicleshop", "bought", "green", "**" .. GetPlayerName(src) .. "** has bought for " .. result[1].price .. " (" .. result[1].plate .. ") from **" .. SellerCitizenId .. "**")
			TriggerClientEvent("qb-occasions:client:BuyFinished", src, result[1])
			TriggerClientEvent('qb-occasion:client:refreshVehicles', -1)
			-- Delete vehicle from Occasion
			exports.oxmysql:execute('DELETE FROM occasion_vehicles WHERE plate = ? AND occasionid = ?',
				{ result[1].plate, result[1].occasionid })
			-- Send selling mail to seller
			exports["dg-phone"]:addOfflineMail(SellerCitizenId, "You have sold a vehicle!", 'Larrys RV Sales', ('You made $%d from the sale of your %s'):format(NewPrice, DGCore.Shared.Vehicles[result[1].model].name))
		else
			TriggerClientEvent('DGCore:Notify', src, 'You dont have enough money', 'error', 3500)
		end
	end
end)

DGCore.Functions.CreateCallback("qb-vehiclesales:server:CheckModelName", function(source, cb, plate)
	if plate then
		local ReturnData = exports.oxmysql:scalarSync("SELECT vehicle FROM player_vehicles WHERE plate = ?", { plate })
		cb(ReturnData)
	end
end)

function generateOID()
	local num = math.random(1, 10) .. math.random(111, 999)

	return "OC" .. num
end

function round(number)
	return number - (number % 1)
end

function escapeSqli(str)
	local replacements = {
		['"'] = '\\"',
		["'"] = "\\'"
	}
	return str:gsub("['\"]", replacements) -- or string.gsub( source, "['\"]", replacements )
end
