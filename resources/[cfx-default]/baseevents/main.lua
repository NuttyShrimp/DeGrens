local debugEnabled = false

RegisterNetEvent('baseevents:toggleDebug', function(toggle)
  debugEnabled = toggle
end)

debugPrint = function(msg, ...)
  if not debugEnabled then return end
  local fullMessage = msg
  if ... then
    fullMessage = msg:format(...)
  end
  print(('[BaseEvents] %s'):format(fullMessage))
end