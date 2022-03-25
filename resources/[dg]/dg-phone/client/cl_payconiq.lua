-- TODO: move to financials resources
RegisterUICallback('phone/payconiq/get', function(_, cb)
  local account = DGCore.Functions.TriggerCallback('financials:getDefaultAccount')
  local transactions = DGCore.Functions.TriggerCallback('financials:server:transactions:get', {
    accountId = account.account_id,
    type = 'mobile_transaction'
  })
  cb({ data = transactions, meta = { ok = true, message = 'done' } })
end)
RegisterUICallback('phone/payconiq/makeTransaction', function(data, cb)
  local account = DGCore.Functions.TriggerCallback('financials:getDefaultAccount')
  data.accountId = account.account_id
  DGCore.Functions.TriggerCallback("financials:server:action:mobileTransaction", data)
  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)