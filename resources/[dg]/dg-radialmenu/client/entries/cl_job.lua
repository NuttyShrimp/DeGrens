entries.job = {
  {
		id = 'whitelistCheck',
		title = 'Job Allowlist',
		icon = 'users-gear',
		event = 'jobs:client:openJobAllowlist',
		shouldClose = true,
		isEnabled = function()
			return DGX.RPC.execute('jobs:whitelist:hasWhitelistAccess')
		end
	},
  {
		id = 'showBadge',
		title = 'Toon Badge',
		icon = 'id-badge',
    dgx = true,
    type = 'server',
		event = 'police:badges:showPoliceBadge',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'police'
		end
	},
  {
		id = 'openLocker',
		title = 'Open Locker',
		icon = 'box-archive',
		event = 'police:openLocker',
		shouldClose = true,
		isEnabled = function(playerData)
			return playerData.job.name == 'police' and DGX.Police.isAtLocker()
		end
	},
  {
		id = 'seizeCash',
		title = 'Cash Afnemen',
		icon = 'money-bill',
    dgx = true,
    type = 'server',
		event = 'police:interactions:seizeCash',
		shouldClose = true,
		isEnabled = function(playerData, vehicle)
      if vehicle ~= 0 then return false end
			return playerData.job.name == 'police' and DGX.Util.isAnyPlayerCloseAndOutsideVehicle()
		end
	},
  {
		id = 'searchPlayer',
		title = 'Fouilleren',
		icon = 'magnifying-glass',
    dgx = true,
    type = 'server',
		event = 'police:interactions:search',
		shouldClose = true,
		isEnabled = function(playerData, vehicle)
      if vehicle ~= 0 then return false end
			return playerData.job.name == 'police' and DGX.Util.isAnyPlayerCloseAndOutsideVehicle()
		end
	},
  {
		id = 'patDownPlayer',
		title = 'Aftasten',
		icon = 'hand',
    dgx = true,
    type = 'server',
		event = 'police:interactions:patDown',
		shouldClose = true,
		isEnabled = function(playerData, vehicle)
      if vehicle ~= 0 then return false end
			return playerData.job.name == 'police' and DGX.Util.isAnyPlayerCloseAndOutsideVehicle()
		end
	},
  {
		id = 'checkCuffLogs',
		title = 'Cuff Logs',
		icon = 'calendar-lines',
    dgx = true,
    type = 'server',
		event = 'police:interactions:showCuffLogs',
		shouldClose = true,
		isEnabled = function(playerData, vehicle)
      if vehicle ~= 0 then return false end
			return playerData.job.name == 'police' and DGX.Util.isAnyPlayerCloseAndOutsideVehicle()
		end
	},
  {
		id = 'openPoliceCarStorage',
		title = 'Open Storage',
		icon = 'treasure-chest',
		event = 'police:carStorage',
		shouldClose = true,
		isEnabled = function(playerData, vehicle)
			return vehicle ~= 0 and playerData.job.name == 'police'
		end
	},
  {
		id = 'confiscateItems',
		title = 'Confisqueren',
		icon = 'box-circle-check',
    dgx = true,
    type = 'server',
		event = 'police:prison:confiscate',
		shouldClose = true,
		isEnabled = function(playerData, vehicle)
      if vehicle ~= 0 then return false end
			return playerData.job.name == 'police' and DGX.Util.isAnyPlayerCloseAndOutsideVehicle()
		end
	},






  


  -- REPLACEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE
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
}