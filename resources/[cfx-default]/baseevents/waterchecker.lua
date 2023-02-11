CreateThread(function()
  local wasInWater = false
  local wasUnderwater = false

  while true do
    local inWater = IsEntityInWater(cachedPed)
    if wasInWater ~= inWater then
      wasInWater = inWater

      if inWater then
        TriggerEvent('baseevents:enteredWater')
        TriggerServerEvent('baseevents:net:enteredWater')
        debugPrint('Entered water')
      else
        TriggerEvent('baseevents:leftWater')
        TriggerServerEvent('baseevents:net:leftWater')
        debugPrint('Left water')
      end
    end

    local underWater = IsPedSwimmingUnderWater(cachedPed)
    if wasUnderwater ~= underWater then
      wasUnderwater = underWater

      if underWater then
        TriggerEvent('baseevents:startedDiving')
        TriggerServerEvent('baseevents:net:startedDiving')
        debugPrint('Started diving')
      else
        TriggerEvent('baseevents:stoppedDiving')
        TriggerServerEvent('baseevents:net:stoppedDiving')
        debugPrint('Stopped diving')
      end
    end

    Wait(50)
  end
end)