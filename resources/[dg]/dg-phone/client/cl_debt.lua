RegisterUICallback('phone/debts/get', function(_, cb)
  local debts = DGX.RPC.execute('financials:server:debts:get')
  cb({ data = debts, meta = { ok = true, message = "done" } })
end)

-- TODO: Use success in UI Modal
RegisterUICallback('phone/debts/pay', function(data, cb)
  local success = DGX.RPC.execute('financials:server:debts:pay', data.id, data.percentage or 100)
  cb({ data = success, meta = { ok = true, message = "done" } })
end)