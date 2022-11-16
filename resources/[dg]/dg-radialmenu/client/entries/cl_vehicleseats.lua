entries.vehicleseats = {
	{
		id = 0,
		title = 'Bijrijder',
		icon = '2',
		event = 'vehicles:radial:seat',
		isEnabled = function(_, vehicle)
      if not vehicle then return false end
			return GetVehicleModelNumberOfSeats(GetEntityModel(vehicle)) > 1
		end
	},
  {
		id = 2,
		title = 'Rechts Achter',
		icon = '4',
		event = 'vehicles:radial:seat',
		isEnabled = function(_, vehicle)
      if not vehicle then return false end
			return GetVehicleModelNumberOfSeats(GetEntityModel(vehicle)) > 3
		end
	},
  {
		id = 1,
		title = 'Links Achter',
		icon = '3',
		event = 'vehicles:radial:seat',
		isEnabled = function(_, vehicle)
      if not vehicle then return false end
			return GetVehicleModelNumberOfSeats(GetEntityModel(vehicle)) > 2
		end
	},
  {
		id = -1,
		title = 'Bestuurder',
		icon = '1',
		event = 'vehicles:radial:seat',
		isEnabled = function(_, vehicle)
      if not vehicle then return false end
			return GetVehicleModelNumberOfSeats(GetEntityModel(vehicle)) > 0
		end
	},
}