entries.vehicle = {
  {
    id = 'toggle-engine',
		title = 'Motor',
		icon = 'engine',
    event = 'vehicles:radial:engine',
		shouldClose = true,
		isEnabled = function(_, vehicle)
      if not vehicle then return false end
      if GetPedInVehicleSeat(vehicle, -1) ~= PlayerPedId() then return false end
			return exports['dg-vehicles']:hasVehicleKeys()
		end
  },
	{
		id = 'vehicledoors',
		title = 'Vehicle Doors',
		icon = 'car-side',
		subMenu = 'vehicledoors',
	},
	{
		id = 'vehicleseats',
		title = 'Vehicle Seats',
		icon = 'chair',
		subMenu = 'vehicleseats',
	}
}
