createDiscordLog = function(name, title, color, message, tagEveryone)
	if GetConvar('is_production', 'true') == 'false' then
		return
	end
	local tag = tagEveryone ~= nil and tagEveryone or false
	local webHook = Config.Webhooks[name] ~= nil and Config.Webhooks[name] or Config.Webhooks["default"]
	local embedData = {
		{
			["title"] = title,
			["color"] = Config.Colors[color] ~= nil and Config.Colors[color] or Config.Colors["default"],
			["footer"] = {
				["text"] = os.date("%c"),
			},
			["description"] = message,
			["author"] = {
				["name"] = 'DGCore Logs',
				["icon_url"] = "https://cdn.discordapp.com/attachments/870094209783308299/870104723338973224/Logotype_-_Display_Picture_-_Stylized_-_Red.png",
			},
		}
	}
	PerformHttpRequest(webHook, function(err, text, headers)
	end, 'POST', json.encode({ username = "QB Logs", embeds = embedData }), { ['Content-Type'] = 'application/json' })
	Citizen.Wait(100)
	if tag then
		PerformHttpRequest(webHook, function(err, text, headers)
		end, 'POST', json.encode({ username = "QB Logs", content = "@everyone" }), { ['Content-Type'] = 'application/json' })
	end
end

createGraylogEntry = function(logtype, data, message)
	if GetConvar('is_production', 'true') == 'false' and GetConvar("overwrite_logs", false) == false then
		return
	end
	Citizen.CreateThread(function()
		data = data ~= nil and data or {}
		data = json.encode(data, { indent = true })

		PerformHttpRequest(Config.GrayLog, function(err, text, header)
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
