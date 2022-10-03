local onDutyCops = 0

DGX.Chat.registerCommand('setCopAmount', 'Set the amount of cops on duty (DEV ENV)', {{
  name = "amount",
  description = "Amount of cops",
  required = true
}}, 'developer', function (src, _, params)
  if tonumber(params[1]) == nil then
    DGX.Notifications.add(src, "Not a number", 'error')
  end
  onDutyCops = tonumber(params[1])
  print("Changed online cop amount to "..onDutyCops)
end)

exports('getAmountOfCops', function()
    return onDutyCops()
end)
