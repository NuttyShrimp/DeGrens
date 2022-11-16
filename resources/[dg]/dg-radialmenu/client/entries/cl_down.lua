-- Entries visible when player is down
entries.down = {
  {
		id = 'emergencyButton',
		title = 'Noodknop',
		icon = 'light-emergency',
		event = 'police:emergencyButton',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
}
