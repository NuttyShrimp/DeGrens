RegisterUICallback("phone/crypto/transfer", function(data, cb)
	local result = DGCore.Functions.TriggerCallback('financials:server:crypto:transfer', data)
	cb({ data = result, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/crypto/purchase', function(data, cb)
	local result = DGCore.Functions.TriggerCallback('financials:server:crypto:buy', data)
	cb({ data = result, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/crypto/get', function(data, cb)
	local result = DGCore.Functions.TriggerCallback('financials:server:crypto:getInfo', data)
	cb({ data = result, meta = { ok = true, message = "done" } })
end)