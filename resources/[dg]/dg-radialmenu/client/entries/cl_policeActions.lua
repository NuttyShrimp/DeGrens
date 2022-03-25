entries.policeActions = {
	{
		id = 'statuscheck',
		title = 'Check Health Status',
		icon = 'heartbeat',
		event = 'hospital:client:CheckStatus',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'checkstatus',
		title = 'Check status',
		icon = 'question',
		event = 'police:client:CheckStatus',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'searchplayer',
		title = 'Search',
		icon = 'search',
		event = 'police:client:SearchPlayer',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'jailplayer',
		title = 'Jail',
		icon = 'user-lock',
		event = 'police:client:JailPlayer',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	}
}