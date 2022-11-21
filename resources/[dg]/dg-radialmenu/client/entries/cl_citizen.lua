entries.citizen = {
	{
		id = 'givenum',
		title = 'Geef telefoonnummer',
		icon = 'address-book',
		type = 'server',
		event = 'dg-phone:server:contacts:shareNumber',
		shouldClose = true,
		isEnabled = function()
			return DGX.Util.isAnyPlayerCloseAndOutsideVehicle() and DGX.Inventory.doesPlayerHaveItems('phone')
		end
	},
	{
		id = 'cornerselling',
		title = 'Cornerselling',
		icon = 'cannabis',
		event = 'criminal:cornersell:toggle',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name ~= 'police'
		end
	}
}