-- TODO: move most of things to the real estate app on the phone (besides entering of house, that should be moved to main entries with proper check)
entries.housing = {
	{
		id = 'givehousekey',
		title = 'Geef huis sleutels',
		icon = 'key',
		event = 'qb-houses:client:giveHouseKey',
		shouldClose = true,
		isEnabled = function()
			return true
		end
	},
	{
		id = 'removehousekey',
		title = 'Remove House Keys',
		icon = 'key',
		event = 'qb-houses:client:removeHouseKey',
		shouldClose = true,
		isEnabled = function()
			return true
		end
	},
	{
		id = 'togglelock',
		title = 'Toggle slot',
		icon = 'door-closed',
		event = 'qb-houses:client:toggleDoorlock',
		shouldClose = true,
		isEnabled = function()
			return true
		end
	},
	{
		id = 'decoratehouse',
		title = 'Decoreer huis',
		icon = 'boxes',
		event = 'qb-houses:client:decorate',
		shouldClose = true,
		isEnabled = function()
			return true
		end
	},
	{
		id = 'setstash',
		title = 'Set Stash',
		icon = 'box-open',
		event = 'qb-houses:client:setLocation',
		shouldClose = true,
		isEnabled = function()
			return true
		end
	},
	{
		id = 'setoutift',
		title = 'Set Wardrobe',
		icon = 'tshirt',
		event = 'qb-houses:client:setLocation',
		shouldClose = true,
		isEnabled = function()
			return true
		end
	},
	{
		id = 'setlogout',
		title = 'Set Logout',
		icon = 'door-open',
		event = 'qb-houses:client:setLocation',
		shouldClose = true,
		isEnabled = function()
			return true
		end
	}
}