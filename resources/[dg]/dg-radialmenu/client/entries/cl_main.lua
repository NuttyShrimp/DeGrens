-- Entries visible in the main circle of radialmenu
entries.main = {
	{
		id = 'citizen',
		title = 'Burger',
		icon = 'user',
		subMenu = 'citizen',
		isEnabled = function()
			return true
		end
	},
	{
		id = 'general',
		title = 'Acties',
		icon = 'list-alt',
		subMenu = 'general',
		isEnabled = function()
			return true
		end
	},
	{
		id = 'vehicle',
		title = 'Voertuig',
		icon = 'car',
		subMenu = 'vehicle',
		isEnabled = function()
			return true
		end
	},
	{
		id = 'jobinteractions',
		title = 'Werk',
		icon = 'briefcase',
		subMenu = 'job',
		isEnabled = function()
			return true
		end
	}
}
