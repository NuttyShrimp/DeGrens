DGConfig = {}

DGConfig.MaxPlayers = GetConvarInt('sv_maxclients', 64) -- Gets max players from config file, default 64
DGConfig.DefaultSpawn = vector4(-1035.71, -2731.87, 12.86, 0.0)
DGConfig.UpdateInterval = 5 -- how often to update player data in minutes
DGConfig.StatusInterval = 5000 -- how often to check hunger/thirst status in ms

DGConfig.Money = {}
DGConfig.Money.defaultCash = 500 -- default cash on player join

DGConfig.Player = {}
DGConfig.Player.HungerRate = 5.5 -- Rate at which hunger goes down.
DGConfig.Player.ThirstRate = 5.5 -- Rate at which thirst goes down.
DGConfig.Player.JSONData = {
	'job',
	'position',
	'metadata',
}

DGConfig.Server = {} -- General server config
DGConfig.Server.discord = "" -- Discord invite link

