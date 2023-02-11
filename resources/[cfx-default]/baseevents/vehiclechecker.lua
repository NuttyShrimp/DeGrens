local isEnteringVehicle = false
local isInVehicle = false
local isEngineOn = false

local currentVehicle = nil
local currentVehNetId = nil
local currentSeat = nil
local currentClass = nil

-- GetSeatPedIsTryingToEnter native does NOT work, always returns -1 so sadly we cant use seat for enteringvehicle events
-- i tried alternatives like looping to find GetPedUsingVehicle door but that also does not work

Citizen.CreateThread(function()
  while true do
    if not isInVehicle then
      local vehiclePedIsTryingToEnter = GetVehiclePedIsTryingToEnter(cachedPed)

      if not isEnteringVehicle and DoesEntityExist(vehiclePedIsTryingToEnter) then
        isEnteringVehicle = true
        
        local enteringNetId = NetworkGetNetworkIdFromEntity(vehiclePedIsTryingToEnter)
        local enteringClass = GetVehicleClass(vehiclePedIsTryingToEnter)

        TriggerServerEvent('baseevents:net:enteringVehicle', enteringNetId, enteringClass)
        TriggerEvent('baseevents:enteringVehicle', vehiclePedIsTryingToEnter)
        debugPrint('Entering vehicle %s', vehiclePedIsTryingToEnter)
      elseif IsPedInAnyVehicle(cachedPed, false) then
        isEnteringVehicle = false
        isInVehicle = true

        currentVehicle = GetVehiclePedIsIn(cachedPed, false)
        currentVehNetId = NetworkGetNetworkIdFromEntity(currentVehicle)
        currentSeat = getSeatPedIsIn(cachedPed, currentVehicle)
        currentClass = GetVehicleClass(currentVehicle)

        TriggerServerEvent('baseevents:net:enteredVehicle', currentVehNetId, currentSeat, currentClass)
        TriggerEvent('baseevents:enteredVehicle', currentVehicle, currentSeat)
        debugPrint('Entered vehicle %s | seat %s', currentVehicle, currentSeat)

        local currentEngineState = getEngineState(currentVehicle)
        if not isEngineOn and currentEngineState then
          isEngineOn = currentEngineState

          TriggerServerEvent('baseevents:net:engineStateChanged', currentVehNetId, isEngineOn)
          TriggerEvent('baseevents:engineStateChanged', currentVehicle, isEngineOn)
          debugPrint('Vehicle %s engine state changed to %s', currentVehicle, isEngineOn)
        end
      elseif isEnteringVehicle and vehiclePedIsTryingToEnter == 0 then
        isEnteringVehicle = false

        TriggerServerEvent('baseevents:net:enteringAborted')
        TriggerEvent('baseevents:enteringAborted')
        debugPrint('Entering vehicle aborted')
      end
    elseif isInVehicle then
      local currentEngineState = getEngineState(currentVehicle)
      if currentEngineState ~= isEngineOn then
        isEngineOn = currentEngineState
        TriggerServerEvent('baseevents:net:engineStateChanged', currentVehNetId, isEngineOn)
        TriggerEvent('baseevents:engineStateChanged', currentVehicle, isEngineOn)
        debugPrint('Vehicle %s engine state changed to %s', currentVehicle, isEngineOn)
      end

      if not IsPedInAnyVehicle(cachedPed, false) then
        TriggerServerEvent('baseevents:net:leftVehicle', currentVehNetId, currentSeat, currentClass)
        TriggerEvent('baseevents:leftVehicle', currentVehicle, currentSeat)
        debugPrint('Left vehicle %s | seat %s', currentVehicle, currentSeat)

        if isEngineOn then
          isEngineOn = false
          TriggerServerEvent('baseevents:net:engineStateChanged', currentVehNetId, isEngineOn)
          TriggerEvent('baseevents:engineStateChanged', currentVehicle, isEngineOn)
          debugPrint('Vehicle %s engine state changed to %s', currentVehicle, isEngineOn)
        end

        isInVehicle = false
        currentVehicle = nil
        currentVehNetId = nil
        currentSeat = nil
        currentClass = nil
      elseif GetPedInVehicleSeat(currentVehicle, currentSeat) ~= cachedPed then
        local newSeat = getSeatPedIsIn(cachedPed, currentVehicle)
        if newSeat ~= currentSeat then
          TriggerServerEvent('baseevents:net:vehicleChangedSeat', currentVehNetId, newSeat, currentSeat)
          TriggerEvent('baseevents:vehicleChangedSeat', currentVehicle, newSeat, currentSeat)
          debugPrint('Changed seat from %s to %s in vehicle %s', currentSeat, newSeat, currentVehicle)
          currentSeat = newSeat
        end
      end
    end

    Citizen.Wait(0)
  end
end)

function getSeatPedIsIn(ped, vehicle)
  local modelHash = GetEntityModel(vehicle);
  local numSeats = GetVehicleModelNumberOfSeats(modelHash);
  for i = -1, numSeats - 1 do
    if GetPedInVehicleSeat(vehicle, i) == ped then
      return i
    end
  end
  return -1
end

-- GetIsVehicleEngineRunning returns false or 1 so just a lil middlware to make sure it actually returns a bool
function getEngineState(vehicle)
  local state = GetIsVehicleEngineRunning(vehicle) == 1
  return state
end
