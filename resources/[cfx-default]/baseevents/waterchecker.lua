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
      else
        TriggerEvent('baseevents:leftWater')
        TriggerServerEvent('baseevents:net:leftWater')
      end
    end

    local underWater = IsPedSwimmingUnderWater(cachedPed)
    if wasUnderwater ~= underWater then
      wasUnderwater = underWater

      if underWater then
        TriggerEvent('baseevents:startedDiving')
        TriggerServerEvent('baseevents:net:startedDiving')
      else
        TriggerEvent('baseevents:stoppedDiving')
        TriggerServerEvent('baseevents:net:stoppedDiving')
      end
    end

    Wait(50)
  end
end)