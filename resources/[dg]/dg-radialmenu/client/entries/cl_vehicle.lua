entries.vehicle = {
	{
		id = 'vehicledoors',
		title = 'Vehicle Doors',
		icon = 'car-side',
		subMenu = 'vehicledoors',
		isEnabled = function()
			-- TODO: add check if in car
			return true
		end
	},
	{
		id = 'vehicleseats',
		title = 'Vehicle Seats',
		icon = 'chair',
		subMenu = 'vehicleseats',
		isEnabled = function()
			-- TODO: add check if in car
			return true
		end
	}
}
