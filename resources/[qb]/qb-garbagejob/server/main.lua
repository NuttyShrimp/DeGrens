local Bail = {}

DGCore.Functions.CreateCallback('qb-garbagejob:server:HasMoney', function(source, cb)
    local Player = DGCore.Functions.GetPlayer(source)
    local CitizenId = Player.PlayerData.citizenid
		local bankAccId = exports[ 'dg-financials']:getDefaultAccountId(source)
		local bankBalance = exports[ 'dg-financials']:getAccountBalance(bankAccId)

		if bankBalance >= Config.BailPrice then
        Bail[CitizenId] = "bank"
				-- TODO Remove bail BS and replace with damage based percentage
        cb(true)
    else
        cb(false)
    end
end)

DGCore.Functions.CreateCallback('qb-garbagejob:server:CheckBail', function(source, cb)
    local Player = DGCore.Functions.GetPlayer(source)
    local CitizenId = Player.PlayerData.citizenid

    if Bail[CitizenId] ~= nil then
        Bail[CitizenId] = nil
        cb(true)
    else
        cb(false)
    end
end)

local Materials = {
    "metalscrap",
    "plastic",
    "copper",
    "iron",
    "aluminum",
    "steel",
    "glass",
}

RegisterNetEvent('qb-garbagejob:server:nano')
AddEventHandler('qb-garbagejob:server:nano', function()
    local xPlayer = DGCore.Functions.GetPlayer(tonumber(source))

	-- xPlayer.Functions.AddItem("cryptostick", 1, false)
end)

RegisterServerEvent('qb-garbagejob:server:PayShit')
AddEventHandler('qb-garbagejob:server:PayShit', function(amount, location)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)

    if amount > 0 then
				-- TODO add trigger to add 'amount' to players paycheck

        if location == #Config.Locations["trashcan"] then
            for i = 1, math.random(3, 5), 1 do
                local item = Materials[math.random(1, #Materials)]
                -- Player.Functions.AddItem(item, math.random(4, 7))
                Citizen.Wait(500)
            end
        end

        TriggerClientEvent('DGCore:Notify', src, "You have $"..amount..",- got paid to your bank account!", "success")
    else
        TriggerClientEvent('DGCore:Notify', src, "You have earned nothing..", "error")
    end
end)