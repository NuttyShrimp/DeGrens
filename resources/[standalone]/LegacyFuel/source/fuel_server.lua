RegisterServerEvent('fuel:pay')
AddEventHandler('fuel:pay', function(price, source)
	local xPlayer = DGCore.Functions.GetPlayer(source)
	local amount = math.floor(price + 0.5)

	if price > 0 then
		xPlayer.Functions.RemoveMoney('cash', amount)
	end
end)
