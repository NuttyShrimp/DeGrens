local soundInfo = {
  dial = {
    name = "phone_dial",
    ids = {}
  },
  ring = {
    name = "phone_ringtone",
    ids = {}
  },
}

playSound = function(type, id)
  if getState('isMuted') then return end
  exports["nutty-sounds"]:playSoundOnEntity(('phone_call_%s_%s'):format(type, id), soundInfo[type].name,
    'DLC_NUTTY_SOUNDS', PlayerPedId())
  soundInfo[type].ids[id] = true
end

stopSounds = function(id)
  for k, v in pairs(soundInfo) do
    if v.ids[id] then
      exports["nutty-sounds"]:stopSound(('phone_call_%s_%s'):format(k, id))
      v.ids[id] = nil
    end
  end
end

RegisterUICallback('phone/startCall', function(data, cb)
  local soundId = DGCore.Functions.TriggerCallback('dg-phone:server:startCall', nil, data)
  if soundId then
    playSound('dial', soundId)
  end
  setState("inCall", true)
  cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/dispatchEndCall', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:endCall', nil, data)
  setState("inCall", false)
  cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/acceptCall', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:initiateCall', nil, data)
  cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/declineCall', function(data, cb)
  DGCore.Functions.TriggerCallback('dg-phone:server:endCall', nil, data)
  cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterUICallback('phone/endcall', function(data, cb)
  cb({ data = {}, meta = { ok = true, message = "done" } })
end)

RegisterNetEvent('dg-phone:client:incomingCall')
AddEventHandler('dg-phone:client:incomingCall', function(data)
  playSound('ring', data.soundId)
  SendAppEvent('phone', {
    appName = "phone",
    action = 'incomingCall',
    data = data
  })
end)

RegisterNetEvent('dg-phone:client:endCurrentCall', function(soundId)
  stopSounds(soundId)
  setState("inCall", false)
  SendAppEvent('phone', {
    appName = "phone",
    action = 'endCurrentCall',
    data = {}
  })
end)

RegisterNetEvent('dg-phone:client:initiateCall', function(soundId)
  stopSounds(soundId)
  SendAppEvent('phone', {
    appName = "phone",
    action = "setCallActive",
    data = {}
  })
end)

-- Anon calls
Citizen.CreateThread(function()
  exports['dg-peek']:addModelEntry({
    'p_phonebox_02_s',
    'prop_phonebox_03',
    'prop_phonebox_02',
    'prop_phonebox_04',
    'prop_phonebox_01c',
    'prop_phonebox_01a',
    'prop_phonebox_01b',
    'p_phonebox_01b_s',
  }, {
    options = {
      {
        icon = 'fas fa-phone',
        label = 'Use Payphone',
        item = 'phone',
        action = function(entity)
          local result = exports['dg-ui']:openInput({
            header = "Make a call",
            inputs = {
              {
                label = "Phone Number",
                name = "phoneNumber",
                type = "number",
              },
            },
          })
          if not result.accepted then return end

          if (result.values.phoneNumber) then
            SendAppEvent('phone', {
              appName = "phone",
              action = 'startAnonCall',
              data = result.values.phoneNumber
            })
          end
        end,
        canInteract = function(entity, distance, data)
					return not DGX.Police.isInPrison()
        end,
      }
    },
    distance = 1.5,
  })
end)

exports('prisonCall', function()
  local contacts = DGCore.Functions.TriggerCallback('dg-phone:server:getContacts')
  local options = {}
  for _, v in pairs(contacts) do
    table.insert(options, {label = v.label, value = v.phone})
  end

  local result = DGX.UI.openInput({
    header = "Selecteer een contactpersoon",
    inputs = {
      {
        type = 'select',
        label = 'Contact',
        name = 'phone',
        options = options,
      },
    },
  })
  if not result.accepted then return end

  SendAppEvent('phone', {
    appName = "phone",
    action = 'startAnonCall',
    data = result.values.phone
  })
end)