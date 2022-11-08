shouldExecute = true
modifierPressed = false

exports('registerKeyMapping', function(name, description, onKeyDownCommand, onKeyUpCommand, default, event, type)
  if not default then default = "" end
  if not type then type = "keyboard" end
  if not description then
    print("no description provided for keymap, cancelling")
    return
  end
  if not name and event then
    print("no name provided for keymap when key is event, cancelling")
    return
  end

  -- Make special event so we are sure this isn't overwrited
  cmdStringDown = string.format("+keybind_wrapper__%s", onKeyDownCommand)
  cmdStringUp = string.format("-keybind_wrapper__%s", onKeyDownCommand)

  RegisterCommand(cmdStringDown, function()
    if not shouldExecute then
      return
    end
    if event then TriggerEvent("dg-lib:keyEvent", name, true) end
    ExecuteCommand(onKeyDownCommand)
  end, false)
  RegisterCommand(cmdStringUp, function()
    if not shouldExecute then
      return
    end
    if event then TriggerEvent("dg-lib:keyEvent", name, false) end
    ExecuteCommand(onKeyUpCommand)
  end, false)
  RegisterKeyMapping(cmdStringDown, description, type, default)
end)

exports('shouldExecuteKeyMaps', function(toggle)
  debug("shouldExecuteKeyMaps: " .. tostring(toggle))
  shouldExecute = toggle
end)

exports('GetCurrentKeyMap', function(keycommand, keycontroller)
  keycontroller = keycontroller or 2
  local key = GetControlInstructionalButton(keycontroller,
    GetHashKey(string.format("+keybind_wrapper__%s", keycommand)) | 0x80000000, 1):gsub('t_', ''):gsub('b_2000', '')
  return tostring(key)
end)

exports('modifierKeyPressed', function()
  return modifierPressed
end)

Citizen.CreateThread(function()
  RegisterCommand('+GeneralUse', function() end, false)
  RegisterCommand('-GeneralUse', function() end, false)
  exports["dg-lib"]:registerKeyMapping('GeneralUse', 'General interaction button', '+GeneralUse', '-GeneralUse', 'e',
    true)

  RegisterCommand('+housingMain', function() end, false)
  RegisterCommand('-housingMain', function() end, false)
  exports["dg-lib"]:registerKeyMapping("housingMain", "Housing interaction Main", "+housingMain", "-housingMain", "H",
    true)

  RegisterCommand('+housingSecondary', function() end, false)
  RegisterCommand('-housingSecondary', function() end, false)
  exports["dg-lib"]:registerKeyMapping("housingSecondary", "Housing interaction Secondary", "+housingSecondary",
    "-housingSecondary", "G", true)

  RegisterCommand('+ModifierKey', function()
    modifierPressed = true
  end, false)
  RegisterCommand('-ModifierKey', function()
    modifierPressed = false
  end, false)
  exports["dg-lib"]:registerKeyMapping('ModifierKey', '(a) Secondary key (shift,ctrl,alt)', '+ModifierKey',
    '-ModifierKey', 'LSHIFT', true)
end)