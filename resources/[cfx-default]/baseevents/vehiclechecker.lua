local isInVehicle = false
local isEnteringVehicle = false

local currentVehicle = 0
local currentVehNetId = 0
local currentSeat = 0

local isEngineOn = false

local debugEnabled

Citizen.CreateThread(function()
  while true do
    if not isInVehicle then
      local vehiclePedIsTryingToEnter = GetVehiclePedIsTryingToEnter(cachedPed)
      if not isEnteringVehicle and DoesEntityExist(vehiclePedIsTryingToEnter) then
        isEnteringVehicle = true
        currentVehicle = vehiclePedIsTryingToEnter
        currentSeat = GetSeatPedIsTryingToEnter(cachedPed)
        currentVehNetId = VehToNet(currentVehicle)
        TriggerServerEvent('baseevents:net:enteringVehicle', currentVehNetId, currentSeat, GetVehicleClass(currentVehicle))
        TriggerEvent('baseevents:enteringVehicle', currentVehicle, currentSeat)
        debugPrint('Entering vehicle %s | seat %s', currentVehicle, currentSeat)
      elseif IsPedInAnyVehicle(cachedPed, false) then
        isEnteringVehicle = false
        isInVehicle = true
        if currentVehicle == 0 then
          currentVehicle = GetVehiclePedIsIn(cachedPed, false)
          currentSeat = GetPedVehicleSeat(cachedPed)
          currentVehNetId = VehToNet(currentVehicle)
        end
        TriggerServerEvent('baseevents:net:enteredVehicle', currentVehNetId, currentSeat, GetVehicleClass(currentVehicle))
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
      if not IsPedInAnyVehicle(cachedPed, false) then
        TriggerServerEvent('baseevents:net:leftVehicle', currentVehNetId, currentSeat, GetVehicleClass(currentVehicle))
        TriggerEvent('baseevents:leftVehicle', currentVehicle, currentSeat)
        debugPrint('Left vehicle %s | seat %s', currentVehicle, currentSeat)

        isInVehicle = false
        currentVehicle = 0
        currentSeat = 0
        currentVehNetId = 0

        if isEngineOn then
          isEngineOn = false
          TriggerServerEvent('baseevents:net:engineStateChanged', currentVehNetId, isEngineOn)
          TriggerEvent('baseevents:engineStateChanged', currentVehicle, isEngineOn)
          debugPrint('Vehicle %s engine state changed to %s', currentVehicle, isEngineOn)
        end
      elseif GetPedInVehicleSeat(currentVehicle, currentSeat) ~= cachedPed then
        newSeat = GetPedVehicleSeat(cachedPed)
        if newSeat ~= currentSeat then
          TriggerServerEvent('baseevents:net:vehicleChangedSeat', currentVehNetId, newSeat, currentSeat)
          TriggerEvent('baseevents:vehicleChangedSeat', currentVehicle, newSeat, currentSeat)
          debugPrint('Changed from seat %s to %s in vehicle %s', currentSeat, newSeat, currentVehicle)
          currentSeat = newSeat
        end
      end

      local currentEngineState = getEngineState(currentVehicle)
      if currentEngineState ~= isEngineOn then
        isEngineOn = currentEngineState
        TriggerServerEvent('baseevents:net:engineStateChanged', currentVehNetId, isEngineOn)
        TriggerEvent('baseevents:engineStateChanged', currentVehicle, isEngineOn)
        debugPrint('Vehicle %s engine state changed to %s', currentVehicle, isEngineOn)
      end
    end

    Citizen.Wait(0)
  end
end)

function GetPedVehicleSeat(ped)
  local vehicle = GetVehiclePedIsIn(ped, false)
  local modelHash = GetEntityModel(vehicle);
  local numSeats = GetVehicleModelNumberOfSeats(modelHash);
  for i = -1, numSeats do
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
