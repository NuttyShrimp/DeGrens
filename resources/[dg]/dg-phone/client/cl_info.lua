local entries = {}

registerInfoEntry = function(name, getter, icon, color, prefix)
  local entry = {
      name = name,
			value = getter(),
      icon = icon,
      color = color,
      prefix = prefix
  }
	SendAppEvent('phone',{
		appName="info",
		action="registerInfoEntry",
		data = {
			entry = entry
		}
  })
	entry.getter = getter
  entries[#entries+1] = entry
end

exports('registerInfoEntry', registerInfoEntry)

RegisterNetEvent('dg-phone:load',function()
  registerInfoEntry("id", function()
    return GetPlayerServerId(PlayerId())
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
		local account = DGCore.Functions.TriggerCallback('financials:getDefaultAccount')
    return account.balance or 0
  end, 'piggy-bank', "#64b5f6", '€')
end)

RegisterUICallback("phone/info/fetchInfo", function(data, cb)
	local info = {}
	for k,v in ipairs(entries) do
		local value = v.getter()
    if value ~= nil then
      info[v.name] = value
    end
	end
	cb({data=info, meta={ok=true, message="done"}})
end )
