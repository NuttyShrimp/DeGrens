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
		title = 'Corner Selling',
		icon = 'cannabis',
        type = 'client',
		event = 'dg-cornerselling:client:ToggleSelling',
		shouldClose = true,
		isEnabled = function()
			return true
		end
	}
}