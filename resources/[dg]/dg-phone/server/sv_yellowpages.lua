local ads = {}

getAdByPhone = function(phone)
	for k, v in pairs(ads) do
		if v.phone == phone then
			return v
		end
	end
	return nil
end

updateAd = function(ad)
	for k, v in pairs(ads) do
		if v.phone == ad.phone then
			ads[k] = ad
			return
		end
	end
	table.insert(ads, ad)
end

DGCore.Functions.CreateCallback('dg-phone:server:yp:get', function(src, cb)
	cb(ads)
end)

DGCore.Functions.CreateCallback('dg-phone:server:yp:add', function(src, cb, data)
	local Player = DGCore.Functions.GetPlayer(src)
	_ad = getAdByPhone(phone)
	if _ad == nil then
		_ad = {
			id = #ads + 1,
			name = Player.PlayerData.charinfo.firstname .. ' ' .. Player.PlayerData.charinfo.lastname,
			phone = Player.PlayerData.charinfo.phone,
		}
	end
	_ad.text = data.text
	updateAd(_ad)
	TriggerClientEvent('dg-phone:client:yp:setAd', src, _ad)
	cb('ok')
end)

DGCore.Functions.CreateCallback('dg-phone:server:yp:remove', function(src, cb)
	local Player = DGCore.Functions.GetPlayer(src)
	for i = 1, #ads do
		if ads[i].phone == Player.PlayerData.charinfo.phone then
			table.remove(ads, i)
			break
		end
	end
	TriggerClientEvent('dg-phone:client:yp:setAd', src, nil)
	cb('ok')
end)

DGCore.Functions.CreateCallback('dg-phone:server:yp:getCurrentAd', function(src, cb)
	local Player = DGCore.Functions.GetPlayer(src)
	local phone = Player.PlayerData.charinfo.phone
	cb(getAdByPhone(phone))
end)