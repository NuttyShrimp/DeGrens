QBConfig = {}

QBConfig.MaxPlayers = GetConvarInt('sv_maxclients', 64) -- Gets max players from config file, default 64
QBConfig.DefaultSpawn = vector4(-1035.71, -2731.87, 12.86, 0.0)
QBConfig.UpdateInterval = 5 -- how often to update player data in minutes
QBConfig.StatusInterval = 5000 -- how often to check hunger/thirst status in ms

QBConfig.Money = {}
QBConfig.Money.defaultCash = 500 -- default cash on player join
QBConfig.Money.PayCheckTimeOut = 10 -- The time in minutes that it will give the paycheck

QBConfig.Player = {}
QBConfig.Player.HungerRate = 5.5 -- Rate at which hunger goes down.
QBConfig.Player.ThirstRate = 5.5 -- Rate at which thirst goes down.
QBConfig.Player.Bloodtypes = {
	"A+",
	"A-",
	"B+",
	"B-",
	"AB+",
	"AB-",
	"O+",
	"O-",
}
QBConfig.Player.JSONData = {
	'job',
	'position',
	'metadata',
}

QBConfig.Server = {} -- General server config
QBConfig.Server.closed = false -- Set server closed (no one can join except people with ace permission 'qbadmin.join')
QBConfig.Server.closedReason = "Server Closed" -- Reason message to display when people can't join the server
QBConfig.Server.uptime = 0 -- Time the server has been up.
QBConfig.Server.discord = "" -- Discord invite link
QBConfig.Server.PermissionList = {} -- permission list
