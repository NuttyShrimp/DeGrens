local soundbanks = {
  'dlc_nutty/sounds',
  'dlc_nutty/sirens'
}

Citizen.CreateThread(function()
  while not NetworkIsSessionStarted() do
    Citizen.Wait(100)
  end

  for _, soundbank in ipairs(soundbanks) do
    local timeout = false
    Citizen.SetTimeout(10000, function()
      timeout = true
    end)
    while not RequestScriptAudioBank(soundbank, 0) and not timeout do
      Citizen.Wait(0)
    end
    print(('[NUTTY-SOUNDS] Loaded %s timeout: %s'):format(soundbank, timeout))
  end
end)

RegisterNetEvent('onResourceStop', function(res)
  if res == GetCurrentResourceName() then
    for _, soundbank in ipairs(soundbanks) do
      ReleaseScriptAudioBank(soundbank)
    end
  end
end)