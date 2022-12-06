local isLoopRunning = false
local phoneProp = nil

setPhoneState = function(state)
  isLoopRunning = state ~= 0
  if (isLoopRunning) then
    while getState('state') ~= 0 or getState('inCall') do
      local ped = PlayerPedId()
      if getState('state') == 2 then
        openCamera()
      elseif getState('inCall') then
        handleCallAnimation(ped)
      elseif getState('state') == 1 then
        handleOpenAnimation(ped)
      end
      if not phoneProp then
        phoneProp = DGX.PropAttach.add("phone")
      end
      Wait(250)
    end
  end
  if state == 0 and state ~= oldContext.state then
    if not getState('inCall') then
      handleCloseAnimation(PlayerPedId())
    end
  end
end

setPhoneCallAnim = function(toggle)
  if toggle then
    handleCallAnimation(PlayerPedId())
  else
    handleCallEndAnimation(PlayerPedId())
  end
end

StopAllAnimation = function()
  local ped = PlayerPedId()
  isLoopRunning = false
  closeCamera()
  handleCallEndAnimation(ped)
  handleCloseAnimation(ped)
  if phoneProp then
    DGX.PropAttach.remove(phoneProp);
    phoneProp = nil
  end
end

-- Local animation functions

LoadAnimDict = function(dict)
  while not HasAnimDictLoaded(dict) do
    RequestAnimDict(dict)
    Citizen.Wait(5)
  end
end

doAnimation = function(ped, dict, anim, speed, speedOut, flag)
  if speedOut == nil then speedOut = -1 end
  if flag == nil then flag = 50 end
  LoadAnimDict(dict)
  if (not IsEntityPlayingAnim(ped, dict, anim, 3)) then
    DGX.Weapons.removeWeapon(nil, true)
    TaskPlayAnim(ped, dict, anim, speed, speedOut, -1, flag, 0, false, false, false);
  end
end

handleCallAnimation = function(ped)
  if (IsPedInAnyVehicle(ped, false)) then
    handleOnCallVehicleAnim(ped)
  else
    handleOnCallNormalAnim(ped)
  end
end

handleCallEndAnimation = function(ped)
  if (IsPedInAnyVehicle(ped, false)) then
    handleCallEndVehicleAnim(ped)
  else
    handleCallEndNormalAnim(ped)
  end
end

handleOpenAnimation = function(ped)
  if (IsPedInAnyVehicle(ped, false)) then
    handleOpenVehicleAnim(ped)
  else
    handleOpenNormalAnim(ped)
  end
end

handleCloseAnimation = function(ped)
  if (IsPedInAnyVehicle(ped, false)) then
    handleCloseVehicleAnim(ped)
  else
    handleCloseNormalAnim(ped)
  end
end

--region functions

handleOpenVehicleAnim = function(ped)
  local dict = 'cellphone@in_car@ps'
  local anim = 'cellphone_text_in';
  doAnimation(ped, dict, anim, 7.0)
end

handleOpenNormalAnim = function(ped)
  local dict = 'cellphone@';
  local anim = 'cellphone_text_in';
  doAnimation(ped, dict, anim, 8.0)
end

handleCloseVehicleAnim = function(ped)
  local dict = 'cellphone@in_car@ps';
  StopAnimTask(ped, dict, 'cellphone_text_in', 1.0);
  StopAnimTask(ped, dict, 'cellphone_call_to_text', 1.0);
  DGX.PropAttach.remove(phoneProp);
  phoneProp = nil
end

handleCloseNormalAnim = function(ped)
  local dict = 'cellphone@';
  local anim = 'cellphone_text_out';
  StopAnimTask(playerPed, dict, 'cellphone_text_in', 1.0);
  Citizen.Wait(100)
  doAnimation(ped, dict, anim, 7.0)
  Citizen.Wait(200)
  StopAnimTask(ped, dict, anim, 1.0);
  DGX.PropAttach.remove(phoneProp);
  phoneProp = nil
end

handleOnCallVehicleAnim = function(ped)
  local dict = 'cellphone@in_car@ps';
  local anim = 'cellphone_call_listen_base';
  doAnimation(ped, dict, anim, 3.0, 3.0, 49)
end

handleOnCallNormalAnim = function(ped)
  local dict = 'cellphone@';
  local anim = 'cellphone_call_listen_base';
  doAnimation(ped, dict, anim, 3.0, 3.0, 49)
end

handleCallEndVehicleAnim = function(ped)
  local dict = 'cellphone@in_car@ps';
  local anim = 'cellphone_call_to_text';
  StopAnimTask(ped, dict, 'cellphone_call_listen_base', 1.0);
  doAnimation(ped, dict, anim, 1.3, 5.0)
  Wait(500)
  if getState('state') ~= 1 then
    handleCloseVehicleAnim(ped)
  end
end

handleCallEndNormalAnim = function(ped)
  local dict = 'cellphone@';
  local anim = 'cellphone_call_to_text';
  doAnimation(ped, dict, anim, 2.5, 8.0)
  Wait(500)
  if getState('state') ~= 1 then
    handleCloseNormalAnim(ped)
  end
end

--endregion

--region Camera
local isFrontCam = false

CellFrontCamActivate = function(activate)
  return Citizen.InvokeNative(0x2491A93618B7D838, activate)
end

exports["dg-lib"]:registerKeyMapping('switchPhoneCamera', 'Verander phone camera', '+switchPhoneCamera',
  '-switchPhoneCamera', 'UP', true)

exports["dg-lib"]:registerKeyMapping('takePhoneCameraPicture', 'Neem photo (phone)', '+takePhoneCameraPicture',
  '-takePhoneCameraPicture', 'RETURN', true)

AddEventHandler('dg-lib:keyEvent', function(name, isDown)
  if getState('state') ~= 2 or not isDown then return end
  if name == "takePhoneCameraPicture" then
    setState('state', 1)
    local event = DGCore.Functions.TriggerCallback('dg-phone:server:photo:take', nil)
  elseif name == "switchPhoneCamera" then
    isFrontCam = not isFrontCam
    CellFrontCamActivate(isFrontCam)
  end
end)

openCamera = function()
  isFrontCam = false
  CreateMobilePhone(phoneId)
  CellCamActivate(true, true)
  while getState('state') == 2 do
    if IsControlJustPressed(0, 177) then
      break
    end
    Wait(0)
  end
  closeCamera()
  openPhone()
end

closeCamera = function()
  DestroyMobilePhone()
  CellCamActivate(false, false)
  CellFrontCamActivate(false)
end

--endregion