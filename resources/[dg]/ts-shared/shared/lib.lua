--- Use this lib file to use the DGX library in lua scripts.
DGX = nil

Citizen.CreateThread(function()
  DGX = exports[GetCurrentResourceName()]:_getLibrary()
end)