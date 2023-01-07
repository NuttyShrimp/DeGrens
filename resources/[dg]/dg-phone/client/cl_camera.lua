
local isFrontCam = false

RegisterUICallback('phone/camera/open', function(data, cb)
	closePhone(2)
	cb({data={}, meta={ok=true, message="done"}})
end)

RegisterUICallback('phone/gallery/get', function(data, cb)
	local images = DGX.RPC.execute('dg-phone:server:photo:get')
	cb({data=images, meta={ok=true, message="done"}})
end)

RegisterUICallback('phone/gallery/delete', function(data, cb)
	DGX.RPC.execute('dg-phone:server:photo:delete', data.id)
	cb({data={}, meta={ok=true, message="done"}})
end)

CellFrontCamActivate = function(activate)
  Citizen.InvokeNative(0x2491A93618B7D838, activate)
end

openCamera = function()
  isFrontCam = false
  CreateMobilePhone(phoneId)
  CellCamActivate(true, true)

  while getState('state') == 2 do
    -- exit cam
    if IsControlJustPressed(0, 177) then
      break
    end

    -- take pic
    if IsControlJustPressed(0, 176) then
      DGX.Notifications.add('Foto nemen, niet bewegen!')
      local imageTaken = DGX.RPC.execute('dg-phone:server:photo:take')
      DGX.Notifications.add(imageTaken and 'Foto genomen!' or 'Foto nemen mislukt', imageTaken and 'success' or 'error')
      break
    end

    -- Switch cam
    if IsControlJustPressed(0, 179) then
      isFrontCam = not isFrontCam
      CellFrontCamActivate(isFrontCam)
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