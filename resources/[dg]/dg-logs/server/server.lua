local config

Citizen.CreateThread(function() 
  while not exports['dg-config']:areConfigsReady() do
    Wait(100)
  end
  config = exports['dg-config']:getModuleConfig('main')
  setCorrectServer()
end)

RegisterNetEvent('dg-config:moduleLoaded', function (modId, modConfig)
  if modId ~= 'main' then
    return
  end
  config = modConfig
  setCorrectServer()
end)

setCorrectServer = function()
  if not config then return end
  if not config.production then
    config.logServer = config.devLogServer
  end
end

createDiscordLog = function(name, title, color, message, tagEveryone)
	return
end

createGraylogEntry = function(logtype, data, message, isImportant)
	Citizen.CreateThread(function()
    while not exports['dg-config']:areConfigsReady() do
      Wait(100)
    end
		data = data ~= nil and data or {}
		if isImportant then
			data.important = true
		end
		data = json.encode(data, { indent = true })

		PerformHttpRequest(config.logServer, function(err, text, header)
		end, 'POST', json.encode({
			version = "2.1",
			host = "dg2.degrensrp.be",
			short_message = message or logtype,
			_resource = GetInvokingResource(),
			_logtype = logtype,
			full_message = data
		}), { ['Content-Type'] = 'application/json' })
	end)
end

exports('createDiscordLog', createDiscordLog)
exports('createGraylogEntry', createGraylogEntry)

RegisterServerEvent('dg-log:server:CreateLog', createDiscordLog)

-- TriggerEvent(GetCurrentResourceName(), "command-ooc", {citizenID = PlayerData.citizenID, ...} )
RegisterServerEvent('dg-log:server:PostGrayLog', createGraylogEntry)
