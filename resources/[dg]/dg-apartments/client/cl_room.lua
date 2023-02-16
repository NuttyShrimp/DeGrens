DGX.RPC.register('dg-apartments:client:enterRoom', function(name, appId)
  currentApartment = getInfoByType(name)
  local retval = exports['dg-build']:createRoom(currentApartment.mlo, appId)

  local success = true
  if not retval then 
    success = false
  end

  return success
end)

RegisterNetEvent('dg-apartments:client:removeRoom', function()
  if not currentApartment then return end
  exports['dg-build']:exitRoom(currentApartment.exit)
end)