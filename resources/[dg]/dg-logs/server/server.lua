RegisterServerEvent('dg-log:server:CreateLog')
AddEventHandler('dg-log:server:CreateLog', function(name, title, color, message, tagEveryone)
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
    PerformHttpRequest(webHook, function(err, text, headers) end, 'POST', json.encode({ username = "QB Logs",embeds = embedData}), { ['Content-Type'] = 'application/json' })
    Citizen.Wait(100)
    if tag then
        PerformHttpRequest(webHook, function(err, text, headers) end, 'POST', json.encode({ username = "QB Logs", content = "@everyone"}), { ['Content-Type'] = 'application/json' })
    end
end)

DGCore.Commands.Add("testwebhook", "Test Your Discord Webhook For Logs (God Only)", {}, false, function(source, args)
    TriggerEvent("dg-log:server:CreateLog", "default", "TestWebhook", "default", "Triggered **a** test webhook :)")
end, "god")


-- TriggerEvent(GetCurrentResourceName(), "command-ooc", {citizenID = PlayerData.citizenID, ...} )
RegisterServerEvent('dg-log:server:PostGrayLog')
AddEventHandler('dg-log:server:PostGrayLog', function(resource, logtype, data)
	Citizen.CreateThread(function()
		local dataString = ""
		data = data ~= nil and data or {}
		data = json.encode(data, { ident = true })

		PerformHttpRequest(Config.GrayLog, function(err, text, header) end, 'POST', json.encode({
			version = "2.1",
			host = "dg2.degrensrp.be",
			short_message = logtype,
			_resource = resource,
			_logtype = logtype,
			full_message = data
		}), {['Content-Type'] = 'application/json'})
	end)
end)