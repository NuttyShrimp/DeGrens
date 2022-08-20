RegisterServerEvent('qb-taxi:server:NpcPay')
AddEventHandler('qb-taxi:server:NpcPay', function(Payment)
    local fooikansasah = math.random(1, 5)
    local r1, r2 = math.random(1, 5), math.random(1, 5)

    if fooikansasah == r1 or fooikansasah == r2 then
        Payment = Payment + math.random(10, 20)
    end

    local src = source
    local Player = DGCore.Functions.GetPlayer(src)

		exports['dg-financials']:addCash(srcm , Payment, "Taxi: NPC payout")

    local chance = math.random(1, 100)
    if chance < 26 then
        -- Player.Functions.AddItem("cryptostick", 1, false)
    end
end)

