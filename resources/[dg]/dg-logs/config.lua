Config = {}

-- TODO: Add webhooks... 
Config.Webhooks = {
	["default"] = "",
	["playermoney"] = "",
	["playerinventory"] = "",
	["robbing"] = "",
	["cuffing"] = "",
	["drop"] = "",
	["trunk"] = "",
	["stash"] = "",
	["glovebox"] = "",
	["banking"] = "",
	["vehicleshop"] = "",
	["vehicleupgrades"] = "",
	["shops"] = "",
	["dealers"] = "",
	["storerobbery"] = "",
	["bankrobbery"] = "",
	["powerplants"] = "",
	["death"] = "",
	["joinleave"] = "",
	["ooc"] = "",
	["report"] = "",
	["me"] = "",
	["pmelding"] = "",
	["112"] = "",
	["bans"] = "",
	["anticheat"] = "",
	["weather"] = "",
	["moneysafes"] = "",
	["bennys"] = "",
	["bossmenu"] = "",
	["robbery"] = "",
	["casino"] = "",
	["traphouse"] = "",
	["911"] = "",
	["palert"] = "",
	-- DG Custom
	financials = 'https://discord.com/api/webhooks/931226841321197619/Sv8RfDCPb_maUk4sW8H4MWdsK3jBXs5SBR5iVcc_loL6aKfnqnWgLPWSbbeEaiyidstY',
}

Config.Colors = {
    ["default"] = 16711680,
    ["blue"] = 25087,
    ["green"] = 762640,
    ["white"] = 16777215,
    ["black"] = 0,
    ["orange"] = 16743168,
    ["lightgreen"] = 65309,
    ["yellow"] = 15335168,
    ["turqois"] = 62207,
    ["pink"] = 16711900,
    ["red"] = 16711680,
}

Config.GrayLog = GetConvar('graylog_url', 'http://127.0.0.1:10011/gelf')