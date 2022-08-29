local originalWalk = nil
local crouching = false

-- 5M Provides no getter for movement set, so we gotta keep track whenever we change it
AddEventHandler('walkChanged', function(name) 
  originalWalk = name
end)


CreateThread(function()
  while true do 
    Wait(1)
    DisableControlAction(0, 36, true) -- disable default action

    -- Handles first person weapon clipsets
    if crouching then
      doCrouching()
    end

    if not IsDisabledControlJustPressed(0, 36) then 
      goto continue
    end

    local ped = PlayerPedId()
    if IsPedSittingInAnyVehicle(ped) or IsPedFalling(ped) then 
      goto continue
    end
    
    crouching = not crouching
    if crouching then
      ClearPedTasks(ped)
      requestAnimSet('move_ped_crouched')
      SetPedMovementClipset(ped, "move_ped_crouched", 1.0)    
      SetPedWeaponMovementClipset(ped, "move_ped_crouched", 1.0)
      SetPedStrafeClipset(ped, "move_ped_crouched_strafing", 1.0)
    else
      ClearPedTasks(ped)
      resetToOriginal()
    end

    ::continue::
  end
end)

doCrouching = function()
  local ped = PlayerPedId()
  local speed = GetEntitySpeed(ped)
  if speed >= 1.0 then
    SetPedWeaponMovementClipset(ped, "move_ped_crouched", 1.0)
    SetPedStrafeClipset(ped, "move_ped_crouched_strafing",  1.0)
  elseif speed < 1.0 and GetFollowPedCamViewMode() == 4 then
    ResetPedWeaponMovementClipset(ped)
    ResetPedStrafeClipset(ped)
  end
end

resetToOriginal = function()
  local ped = PlayerPedId()
  ResetPedMovementClipset(ped)
  ResetPedWeaponMovementClipset(ped)
  ResetPedStrafeClipset(ped)
  if not originalWalk then return end
  requestAnimSet(originalWalk)
  SetPedMovementClipset(ped, originalWalk, 1)
  RemoveAnimSet(originalWalk)
end

requestAnimSet = function(animSet)
  RequestAnimSet(animSet)
  while not HasAnimSetLoaded(animSet) do
    Wait(10)
  end 
end