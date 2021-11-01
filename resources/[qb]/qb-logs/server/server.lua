RegisterServerEvent('qb-log:server:CreateLog')
AddEventHandler('qb-log:server:CreateLog', function(name, title, color, message, tagEveryone)
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
    TriggerEvent("qb-log:server:CreateLog", "default", "TestWebhook", "default", "Triggered **a** test webhook :)")
end, "god")
