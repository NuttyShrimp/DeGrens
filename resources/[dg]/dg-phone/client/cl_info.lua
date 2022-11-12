local entries = {}

registerInfoEntry = function(name, getter, icon, color, prefix)
  local entry = {
    name = name,
		value = getter(),
    icon = icon,
    color = color,
    prefix = prefix
  }
  if not entries[name] then
    print(('[Phone] Registering new info entry: "%s"'):format(name))
    SendAppEvent('phone',{
      appName="info",
      action="registerInfoEntry",
      data = {
        entry = entry
      }
    })
  end
	entry.getter = getter
  entries[name] = entry
end

exports('registerInfoEntry', registerInfoEntry)

RegisterNetEvent('dg-phone:load',function()
  registerInfoEntry("id", function()
    return DGCore.Functions.GetPlayerData().citizenid
  end, "id-card", nil, "#")
  registerInfoEntry("phone", function()
    local plyData = DGCore.Functions.GetPlayerData()
    return plyData.charinfo.phone
  end, "hashtag", nil, nil)
  registerInfoEntry('cash', function()
    local cash = exports['dg-financials']:getCash()
		return cash
  end, 'wallet', '#81c784', '€')
  registerInfoEntry('bank', function()
		local account = DGX.RPC.execute('financials:getDefaultAccount')
    if not account then return 0 end
    return account.balance or 0
  end, 'piggy-bank', "#64b5f6", '€')
end)

RegisterUICallback("phone/info/fetchInfo", function(data, cb)
	local info = {}
	for _, v in ipairs(entries) do
		local value = v.getter()
    if value ~= nil then
      info[v.name] = value
    end
	end
	cb({data=info, meta={ok=true, message="done"}})
end )
