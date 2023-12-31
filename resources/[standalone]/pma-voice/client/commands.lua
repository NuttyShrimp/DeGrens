local wasProximityDisabledFromOverride = false
disableProximityCycle = false
-- RegisterCommand('setvoiceintent', function(source, args)
-- 	if GetConvarInt('voice_allowSetIntent', 1) == 1 then
-- 		local intent = args[1]
-- 		if intent == 'speech' then
-- 			MumbleSetAudioInputIntent(`speech`)
-- 		elseif intent == 'music' then
-- 			MumbleSetAudioInputIntent(`music`)
-- 		end
-- 		LocalPlayer.state:set('voiceIntent', intent, true)
-- 	end
-- end)

exports('setAllowProximityCycleState', function(state)
	type_check({state, "boolean"})
	disableProximityCycle = state
end)

function setProximityState(proximityRange, isCustom)
	local voiceModeData = Cfg.voiceModes[mode]
	MumbleSetTalkerProximity(proximityRange + 0.0)
	LocalPlayer.state:set('proximity', {
		index = mode,
		distance = proximityRange,
		mode = isCustom and "Custom" or voiceModeData[2],
	}, true)
	sendUIMessage({
		-- JS expects this value to be - 1, "custom" voice is on the last index
		voiceMode = isCustom and #Cfg.voiceModes or mode - 1
	})
end

exports("overrideProximityRange", function(range, disableCycle)
	type_check({range, "number"})
	setProximityState(range, true)
	if disableCycle then
		disableProximityCycle = true
		wasProximityDisabledFromOverride = true
	end
end)

exports("clearProximityOverride", function()
	local voiceModeData = Cfg.voiceModes[mode]
	setProximityState(voiceModeData[1], false)
	if wasProximityDisabledFromOverride then
		disableProximityCycle = false
	end
end)

RegisterCommand('cycleproximity', function()
	-- Proximity is either disabled, or manually overwritten.
	if GetConvarInt('voice_enableProximityCycle', 1) ~= 1 or disableProximityCycle then return end
	local newMode = mode + 1

	-- If we're within the range of our voice modes, allow the increase, otherwise reset to the first state
	if newMode <= #Cfg.voiceModes then
		mode = newMode
	else
		mode = 1
	end

	setProximityState(Cfg.voiceModes[mode][1], false)
	TriggerEvent('pma-voice:setTalkingMode', mode)
end, false)
if gameVersion == 'fivem' then
	RegisterKeyMapping('cycleproximity', 'Cycle Proximity', 'keyboard', GetConvar('voice_defaultCycle', 'F11'))
end

PrintDebugInfo = function(msg)
  local str = [[
  --------------------
  %s
  Active: %s | Connected: %s | Channel: %s
  --------------------]]
  --
  local isActive = MumbleIsActive()
  local isConnected = MumbleIsConnected()
  local channel = MumbleGetVoiceChannelFromServerId(GetPlayerServerId(PlayerId()))

  print((str):format(msg, isActive, isConnected, channel))
end

RegisterCommand("voice-r", function()
  PrintDebugInfo("Reconnecting Mumble")

  local endpoint = GetCurrentServerEndpoint()
  local info = {}

  for match in string.gmatch(endpoint, "[^:]+") do
    info[#info + 1] = match
  end

  MumbleSetServerAddress(info[1], tonumber(info[2]))

  PrintDebugInfo("Reconnected Mumble")
end)
