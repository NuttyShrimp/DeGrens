entries.policeObject = {
	{
		id = 'spawnpion',
		title = 'Cone',
		icon = 'exclamation-triangle',
		event = 'police:client:spawnCone',
		shouldClose = false,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'spawnhek',
		title = 'Gate',
		icon = 'torii-gate',
		event = 'police:client:spawnBarier',
		shouldClose = false,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'spawnschotten',
		title = 'Speed Limit Sign',
		icon = 'sign',
		event = 'police:client:spawnSchotten',
		shouldClose = false,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'spawntent',
		title = 'Tent',
		icon = 'campground',
		event = 'police:client:spawnTent',
		shouldClose = false,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'spawnverlichting',
		title = 'Lighting',
		icon = 'lightbulb',
		event = 'police:client:spawnLight',
		shouldClose = false,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'spikestrip',
		title = 'Spike Strips',
		icon = 'caret-up',
		event = 'police:client:SpawnSpikeStrip',
		shouldClose = false,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'deleteobject',
		title = 'Remove object',
		icon = 'trash',
		event = 'police:client:deleteObject',
		shouldClose = false,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	}
}