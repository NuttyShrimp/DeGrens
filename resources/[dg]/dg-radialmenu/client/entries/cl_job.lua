entries.job = {
	{
		id = 'emergencybutton2',
		title = 'Emergency button',
		icon = 'bell',
		event = 'police:client:SendPoliceEmergencyAlert',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'ambulance' or playerData.job.name == 'police'
		end
	},
	{
		id = 'escort',
		title = 'Escort',
		icon = 'user-friends',
		event = 'police:client:EscortPlayer',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'ambulance' or playerData.job.name == 'police'
		end
	},
	--region Ambulance
	{
		id = 'statuscheck',
		title = 'Check Health Status',
		icon = 'heartbeat',
		event = 'hospital:client:CheckStatus',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'ambulance'
		end
	},
	{
		id = 'revivep',
		title = 'Revive',
		icon = 'user-md',
		event = 'hospital:client:RevivePlayer',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'ambulance'
		end
	},
	{
		id = 'treatwounds',
		title = 'Heal wounds',
		icon = 'band-aid',
		event = 'hospital:client:TreatWounds',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'ambulance'
		end
	},
	-- TODO: Add check if near stretcher
	{
		id = 'spawnstretcher',
		title = 'Spawn Stretcher',
		icon = 'plus',
		event = 'qb-radialmenu:client:TakeStretcher',
		shouldClose = false,
		isEnabled = function(playerData)
			return playerData.job.name == 'ambulance'
		end
	},
	{
		id = 'despawnstretcher',
		title = 'Remove Stretcher',
		icon = 'minus',
		event = 'qb-radialmenu:client:RemoveStretcher',
		shouldClose = false,
		isEnabled = function(playerData)
			return playerData.job.name == 'ambulance'
		end
	},
	--endregion
	--region Taxi
	{
		id = 'togglemeter',
		title = 'Show/Hide Meter',
		icon = 'eye-slash',
		event = 'qb-taxi:client:toggleMeter',
		shouldClose = false,
		isEnabled = function(playerData)
			return playerData.job.name == 'taxi'
		end
	},
	{
		id = 'togglemouse',
		title = 'Start/Stop Meter',
		icon = 'hourglass-start',
		event = 'qb-taxi:client:enableMeter',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'taxi'
		end
	},
	{
		id = 'npc_mission',
		title = 'NPC Mission',
		icon = 'taxi',
		event = 'qb-taxi:client:DoTaxiNpc',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'taxi'
		end
	},
	--endregion
	--region Tow
	{
		id = 'togglenpc',
		title = 'Toggle NPC',
		icon = 'toggle-on',
		event = 'jobs:client:ToggleNpc',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'tow'
		end
	},
	{
		id = 'towvehicle',
		title = 'Tow vehicle',
		icon = 'truck-pickup',
		event = 'qb-tow:client:TowVehicle',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'tow'
		end
	},
	--endregion
	--region Mechanic
	{
		id = 'towvehicle',
		title = 'Tow vehicle',
		icon = 'truck-pickup',
		event = 'qb-tow:client:TowVehicle',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'mechanic'
		end
	},
	--endregion
	--region Police
	{
		id = 'checkvehstatus',
		title = 'Check Tune Status',
		icon = 'info-circle',
		event = 'qb-tunerchip:client:TuneStatus',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'resethouse',
		title = 'Reset house lock',
		icon = 'key',
		event = 'qb-houses:client:ResetHouse',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'takedriverlicense',
		title = 'Revoke Drivers License',
		icon = 'id-card',
		event = 'police:client:SeizeDriverLicense',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'policeinteraction',
		title = 'Police Actions',
		icon = 'tasks',
		subMenu = 'policeActions',
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	{
		id = 'policeobjects',
		title = 'Objects',
		icon = 'road',
		subMenu = 'policeObject',
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
	--endregion
	--region Hotdog
	{
		id = 'togglesell',
		title = 'Toggle sell',
		icon = 'hotdog',
		event = 'qb-hotdogjob:client:ToggleSell',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'hotdog'
		end
	}
	--endregion
}