local loopRunning = false
local phoneProp = nil

setPhoneState = function(state)
  if state == 1 and not loopRunning then
    Citizen.CreateThread(function()
      loopRunning = true
      while getState('state') ~= 0 or getState('inCall') do
        if getState('state') == 2 then
          openCamera()
        end

        local ped = PlayerPedId()
        if getState('inCall') then
          handleCallAnimation(ped)
        elseif getState('state') == 1 then
          handleOpenAnimation(ped)
        end
        if not phoneProp then
          phoneProp = DGX.PropAttach.add("phone")
        end
        DGX.Weapons.removeWeapon(nil, true)
        Wait(250)
      end
      loopRunning = false
    end)
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
    ClearPedTasksImmediately(ped)
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