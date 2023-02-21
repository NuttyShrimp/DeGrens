local notCrashReasons = {
  "Exiting",
  "Disconnected",
}

AddEventHandler('playerJoining', function()
  DGX.Util.Log('core:joined', {}, ("%s has joined the server"):format(DGX.Util.getName(source)), source)
end)

AddEventHandler('playerDropped', function(reason)
  local hasCrashed = true
  for _, r in ipairs(notCrashReasons) do
    if r == reason then
      hasCrashed = false
      break
    end
  end
  if hasCrashed then
    DGX.Util.Log('core:crashed', { reason = reason }, ("%s has crashed due: %s"):format(DGX.Util.getName(source), reason), source)
  else
    DGX.Util.Log('core:left', {}, ("%s has left the server"):format(DGX.Util.getName(source)), source)
  end
end)
