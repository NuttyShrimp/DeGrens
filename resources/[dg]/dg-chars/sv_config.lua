Config = Config or {}
Config.Server = Config.Server or {}

Config.Server.spawns = {
	base = {
		{
			label = 'Apartment',
			spawnType = 'apartment',
			position = vector4(-271.21, -958.01, 31.22, 27.0),
			isEnabled = function()
				return not exports['dg-apartments']:isInLockdown()
			end
		},
		{
			label = 'Paleto Bay',
			spawnType = 'world',
			position = vector4(-104.5433, 6316.094, 30.9496, 135.0),
		},
	},
	job = {
		police = {},
		ambulance = {},
	},
  prison = {
    label = 'Gevangenis',
    spawnType = 'world',
    position = vector4(1767.6893, 2501.2747, 49.693, 210.6193)
  }
}