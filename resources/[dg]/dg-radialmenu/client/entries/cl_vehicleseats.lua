entries.vehicleseats = {
	{
		id = -1,
		title = 'Driver',
		icon = 'caret-up',
		event = 'qb-radialmenu:client:ChangeSeat',
		shouldClose = false,
		isEnabled = function()
			return GetVehicleModelNumberOfSeats(GetEntityModel(Vehicle)) > 0
		end
	},
	{
		id = 0,
		title = 'Passenger',
		icon = 'caret-up',
		event = 'qb-radialmenu:client:ChangeSeat',
		shouldClose = false,
		isEnabled = function()
			return GetVehicleModelNumberOfSeats(GetEntityModel(Vehicle)) > 1
		end
	},
	{
		id = 1,
		title = 'Rear Left',
		icon = 'caret-down',
		event = 'qb-radialmenu:client:ChangeSeat',
		shouldClose = false,
		isEnabled = function()
			return GetVehicleModelNumberOfSeats(GetEntityModel(Vehicle)) > 2
		end
	},
	{
		id = 2,
		title = 'Rear Right',
		icon = 'caret-down',
		event = 'qb-radialmenu:client:ChangeSeat',
		shouldClose = false,
		isEnabled = function()
			return GetVehicleModelNumberOfSeats(GetEntityModel(Vehicle)) > 3
		end
	},
}