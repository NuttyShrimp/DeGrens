local Bail = {}

DGCore.Functions.CreateCallback('qb-garbagejob:server:HasMoney', function(source, cb)
    local Player = DGCore.Functions.GetPlayer(source)
    local CitizenId = Player.PlayerData.citizenid

    -- if Player.PlayerData.money.cash >= Config.BailPrice then
    --     Bail[CitizenId] = "cash"
    --     Player.Functions.RemoveMoney('cash', Config.BailPrice)
    --     cb(true)
    -- else
        if Player.PlayerData.money.bank >= Config.BailPrice then
        Bail[CitizenId] = "bank"
        Player.Functions.RemoveMoney('bank', Config.BailPrice)
        cb(true)
    else
        cb(false)
    end
end)

DGCore.Functions.CreateCallback('qb-garbagejob:server:CheckBail', function(source, cb)
    local Player = DGCore.Functions.GetPlayer(source)
    local CitizenId = Player.PlayerData.citizenid

    if Bail[CitizenId] ~= nil then
        Player.Functions.AddMoney(Bail[CitizenId], Config.BailPrice)
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

	xPlayer.Functions.AddItem("cryptostick", 1, false)
	TriggerClientEvent('inventory:client:ItemBox', source, "cryptostick", "add")
end)

RegisterServerEvent('qb-garbagejob:server:PayShit')
AddEventHandler('qb-garbagejob:server:PayShit', function(amount, location)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)

    if amount > 0 then
        Player.Functions.AddMoney('bank', amount)

        if location == #Config.Locations["trashcan"] then
            for i = 1, math.random(3, 5), 1 do
                local item = Materials[math.random(1, #Materials)]
                Player.Functions.AddItem(item, math.random(4, 7))
                TriggerClientEvent('inventory:client:ItemBox', src, item, 'add')
                Citizen.Wait(500)
            end
        end

        TriggerClientEvent('DGCore:Notify', src, "You have $"..amount..",- got paid to your bank account!", "success")
    else
        TriggerClientEvent('DGCore:Notify', src, "You have earned nothing..", "error")
    end
end)