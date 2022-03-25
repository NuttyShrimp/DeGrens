-- If new value is added, also add here
values = {
  health = {
    value = 100,
    enabled = true
  },
  armor = {
    value = 100,
    enabled = true
  },
  hunger = {
    value = 0,
    enabled = true
  },
  thirst = {
    value = 0,
    enabled = true
  },
  air = {
    value = 0,
    enabled = false
  },
}
voice = {
  active = false,
  onRadio = false,
}
isDirty = false
isLoggedIn = false

--- region Hooks
--- These hooks are for values that don't need to be pulled from another resource
RegisterNetEvent('hud:client:UpdateNeeds', function(newHunger, newThirst)
  values.hunger= newHunger
  values.thirst = newThirst
  isDirty = true
end)
RegisterNetEvent('pma-voice:radioActive', function(active)
  if(voice.onRadio == active) then return end
  voice.onRadio = active
  isDirty = true
end)
--- endregion
--- region Loops
CreateThread(function()
  while true do
    if isDirty then
      SendAppEvent('hud', {
        action = 'setHudValues',
        values = values,
        voice = voice
      })
    end
    isDirty = false
    Wait(250)
  end
end)
startValueLoop = function()
	CreateThread(function()
		while isLoggedIn do
			local ped = PlayerPedId()
			if IsPedSwimmingUnderWater(ped) then
				isDirty = true
				values.air = {
					enabled = true,
					value = GetPlayerUnderwaterTimeRemaining(ped)
				}
			-- Above handles if value is disabled and gets is water, this handles when ply leaves water
			elseif values.air.enabled ~= IsPedSwimmingUnderWater(ped) then
				isDirty = true
				values.air = {
					enabled = false,
					value = 0
				}
			end
			health = GetEntityHealth(ped)
			if values.health.value ~= health then
				isDirty = true
				values.health = {
					enabled = true,
					value = health
				}
			end
			armor = GetPedArmour(ped)
			if values.armor.value ~= armor then
				isDirty = true
				values.armor = {
					enabled = true,
					value = armor
				}
			end
			local isTalking = (MumbleIsPlayerTalking(PlayerId()) == 1)
			if voice.active ~= isTalking then
				isDirty = true
				voice.active = isTalking
			end
			Wait(100)
		end
	end)
end
--- endregion

--- region Keys and Commands
AddStateBagChangeHandler('isLoggedIn', LocalPlayer, function(bag, key, value)
	isLoggedIn = value
	if value then
		openApplication('hud')
		startValueLoop()
	else
		closeApplication('hud')
	end
end)

RegisterNetEvent('dg-lib:keyEvent', function(name, isDown)
  if name == 'nextIconPage' and isDown then
    SendAppEvent('hud', {
      action = 'toggleIcons'
    })
  end
end)

RegisterNetEvent('dg-ui:loadData', function()
	isDirty = true
end)

exports['dg-lib']:registerKeyMapping('nextIconPage', 'Switch icon page', '+nextIconPage', '-nextIconPage', '', true)
--- endregion