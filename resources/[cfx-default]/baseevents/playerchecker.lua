cachedPed = nil
cachedId = nil

CreateThread(function()
  while true do
    local newPed = PlayerPedId()
    if cachedPed ~= newPed then
      cachedPed = newPed
      TriggerEvent('baseevents:playerPedChanged')
    end

    local newId = PlayerId()
    if cachedId ~= newId then
      cachedId = newId
      TriggerEvent('baseevents:playerIdChanged')
    end

    Wait(2)
  end
end)