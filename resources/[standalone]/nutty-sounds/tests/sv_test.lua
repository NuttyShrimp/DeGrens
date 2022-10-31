DGX.Chat.registerCommand('testsound', '', {{name =  'soundName', description = 'Sound name'}, {name =  'soundDict', description = 'Sound dict'}}, 'developer', function(src, _, args)
  local sound = args[1]
  local dict = args[2]
  print('Playing test sound | Dict: ' .. dict .. ' | Name: ' .. sound)
  local coords = GetEntityCoords(GetPlayerPed(src))
  DGX.Sounds.playFromCoord('test_sound', sound, dict, {x = coords.x, y = coords.y, z = coords.z}, 10);
  Wait(10000);
  DGX.Sounds.stop('test_sound')
end)