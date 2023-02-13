local notCrashReasons = {
  "Exiting",
  "Disconnected",
}

AddEventHandler('playerJoining', function()
  createGraylogEntry('core:joined', {
      source = source,
    }, ("%s has joined the server"):format(GetPlayerName(source)))
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
    createGraylogEntry('core:crashed', {
      source = source,
      reason = reason,
    }, ("%s has crashed due: %s"):format(GetPlayerName(source), reason))
  else
    createGraylogEntry('core:left', {
      source = source,
    }, ("%s has left the server"):format(GetPlayerName(source)))
  end
end)
