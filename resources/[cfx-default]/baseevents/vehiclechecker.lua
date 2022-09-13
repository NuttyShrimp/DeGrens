local isInVehicle = false
local isEnteringVehicle = false
local currentVehicle = 0
local currentVehNetId = 0
local currentSeat = 0

Citizen.CreateThread(function()
  while true do
    Citizen.Wait(0)

    local ped = PlayerPedId()

    if not isInVehicle and not IsPlayerDead(PlayerId()) then
      if DoesEntityExist(GetVehiclePedIsTryingToEnter(ped)) and not isEnteringVehicle then
        -- trying to enter a vehicle!
        currentVehicle = GetVehiclePedIsTryingToEnter(ped)
        currentSeat = GetSeatPedIsTryingToEnter(ped)
        currentVehNetId = VehToNet(currentVehicle)
        isEnteringVehicle = true
        TriggerServerEvent('baseevents:enteringVehicle', currentVehicle, currentSeat, GetVehicleClass(currentVehicle), currentVehNetId)
        TriggerEvent('baseevents:enteringVehicle', vehicle, seat)
      elseif not DoesEntityExist(currentVehicle) and not IsPedInAnyVehicle(ped, true) and isEnteringVehicle then
        -- vehicle entering aborted
        TriggerServerEvent('baseevents:enteringAborted')
        TriggerEvent('baseevents:enteringAborted')
        isEnteringVehicle = false
      elseif IsPedInAnyVehicle(ped, false) then
        -- suddenly appeared in a vehicle, possible teleport
        isEnteringVehicle = false
        isInVehicle = true
        if currentVehicle == 0 then
          currentVehicle = GetVehiclePedIsIn(ped, false)
          currentSeat = GetPedVehicleSeat(ped)
          currentVehNetId = VehToNet(currentVehicle)
        end
        TriggerServerEvent('baseevents:enteredVehicle', currentVehicle, currentSeat, GetVehicleClass(currentVehicle), currentVehNetId)
        TriggerEvent('baseevents:enteredVehicle', currentVehicle, currentSeat)
      end
    elseif isInVehicle then
      if not IsPedInAnyVehicle(ped, false) or IsPlayerDead(PlayerId()) then
        -- bye, vehicle
        TriggerServerEvent('baseevents:leftVehicle', currentVehicle, currentSeat, GetVehicleClass(currentVehicle), currentVehNetId)
        TriggerEvent('baseevents:leftVehicle', currentVehicle, currentSeat)
        isInVehicle = false
        currentVehicle = 0
        currentSeat = 0
        currentVehNetId = 0
      elseif GetPedInVehicleSeat(currentVehicle, currentSeat) ~= ped then
        -- changed seat
        local netId = VehToNet(currentVehicle)
        newSeat = GetPedVehicleSeat(ped)
        TriggerServerEvent('baseevents:vehicleChangedSeat', currentVehicle, newSeat, currentSeat, netId)
        TriggerEvent('baseevents:vehicleChangedSeat', currentVehicle, newSeat, currentSeat)
        currentSeat = newSeat
      end
    end
    Citizen.Wait(50)
  end
end)

function GetPedVehicleSeat(ped)
  local vehicle = GetVehiclePedIsIn(ped, false)
  for i = -2, GetVehicleMaxNumberOfPassengers(vehicle) do
    if (GetPedInVehicleSeat(vehicle, i) == ped) then
      return i
    end
  end
  return -2
end
