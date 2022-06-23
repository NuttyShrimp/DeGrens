DGX.RPC.register('dg-apartments:client:enterRoom', function(name, appId)
  currentApartment = getInfoByType(name)
  exports['dg-build']:createRoom(currentApartment.mlo, appId)
end)

RegisterNetEvent('dg-apartments:client:removeRoom', function()
  if not currentApartment then return end
  exports['dg-build']:exitRoom(currentApartment.exit)
end)