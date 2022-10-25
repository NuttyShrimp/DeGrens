local isInVehicle = false
local isEnteringVehicle = false

local currentVehicle = 0
local currentVehNetId = 0
local currentSeat = 0

local isEngineOn = false

Citizen.CreateThread(function()
  while true do
    local ped = PlayerPedId()

    if not isInVehicle and not IsPlayerDead(PlayerId()) then
      local vehiclePedIsTryingToEnter = GetVehiclePedIsTryingToEnter(ped)
      if not isEnteringVehicle and DoesEntityExist(vehiclePedIsTryingToEnter) then
        -- trying to enter a vehicle!
        isEnteringVehicle = true
        currentVehicle = vehiclePedIsTryingToEnter
        currentSeat = GetSeatPedIsTryingToEnter(ped)
        currentVehNetId = VehToNet(currentVehicle)
        TriggerServerEvent('baseevents:enteringVehicle', currentVehNetId, currentSeat, GetVehicleClass(currentVehicle))
        TriggerEvent('baseevents:enteringVehicle', currentVehicle, currentSeat)
      elseif isEnteringVehicle and vehiclePedIsTryingToEnter == 0 then
        -- vehicle entering aborted
        isEnteringVehicle = false
        TriggerServerEvent('baseevents:enteringAborted')
        TriggerEvent('baseevents:enteringAborted')
      elseif IsPedInAnyVehicle(ped, false) then
        -- suddenly appeared in a vehicle, possible teleport
        isEnteringVehicle = false
        isInVehicle = true
        if currentVehicle == 0 then
          currentVehicle = GetVehiclePedIsIn(ped, false)
          currentSeat = GetPedVehicleSeat(ped)
          currentVehNetId = VehToNet(currentVehicle)
        end
        TriggerServerEvent('baseevents:enteredVehicle', currentVehNetId, currentSeat, GetVehicleClass(currentVehicle))
        TriggerEvent('baseevents:enteredVehicle', currentVehicle, currentSeat)

        local currentEngineState = getEngineState(currentVehicle)
        if not isEngineOn and currentEngineState then
          isEngineOn = currentEngineState
          TriggerServerEvent('baseevents:engineStateChanged', currentVehNetId, isEngineOn)
          TriggerEvent('baseevents:engineStateChanged', currentVehicle, isEngineOn)
        end
      end
    elseif isInVehicle then
      if not IsPedInAnyVehicle(ped, false) or IsPlayerDead(PlayerId()) then
        -- bye, vehicle
        TriggerServerEvent('baseevents:leftVehicle', currentVehNetId, currentSeat, GetVehicleClass(currentVehicle))
        TriggerEvent('baseevents:leftVehicle', currentVehicle, currentSeat)
        isInVehicle = false
        currentVehicle = 0
        currentSeat = 0
        currentVehNetId = 0

        if isEngineOn then
          isEngineOn = false
          TriggerServerEvent('baseevents:engineStateChanged', currentVehNetId, isEngineOn)
          TriggerEvent('baseevents:engineStateChanged', currentVehicle, isEngineOn)
        end
      elseif GetPedInVehicleSeat(currentVehicle, currentSeat) ~= ped then
        -- changed seat
        newSeat = GetPedVehicleSeat(ped)
        if newSeat ~= currentSeat then
          TriggerServerEvent('baseevents:vehicleChangedSeat', currentVehNetId, newSeat, currentSeat)
          TriggerEvent('baseevents:vehicleChangedSeat', currentVehicle, newSeat, currentSeat)
          currentSeat = newSeat
        end
      end

      local currentEngineState = getEngineState(currentVehicle)
      if currentEngineState ~= isEngineOn then
        isEngineOn = currentEngineState
        TriggerServerEvent('baseevents:engineStateChanged', currentVehNetId, isEngineOn)
        TriggerEvent('baseevents:engineStateChanged', currentVehicle, isEngineOn)
      end
    end

    Citizen.Wait(50)
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
