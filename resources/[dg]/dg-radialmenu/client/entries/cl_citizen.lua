entries.citizen = {
	{
		id = 'givenum',
		title = 'Geef telefoonnummer',
		icon = 'address-book',
		type = 'server',
		event = 'dg-phone:server:contacts:shareNumber',
		shouldClose = true,
		isEnabled = function()
			return DGCore.Functions.TriggerCallback('DGCore:HasItem', 'phone')
		end
	},
	{
		id = 'getintrunk',
		title = 'Stap in koffer',
		icon = 'car',
		event = 'qb-trunk:client:GetIn',
		shouldClose = true,
		isEnabled = function()
			-- TODO: Check if near vehicle
			return true
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
	},
	{
		id = 'togglehotdogsell',
		title = 'Hotdog Selling',
		icon = 'hotdog',
		event = 'qb-hotdogjob:client:ToggleSell',
		shouldClose = true,
		isEnabled = function(playerData)
		  -- TODO: replace when job is updated/removed
			return false
		end
	},
	{
		id = 'interactions',
		title = 'Interacties',
		icon = 'exclamation-triangle',
		subMenu = 'interactions',
		isEnabled = function()
			return true
		end
	},
}