local KEYS = {
  ARROW_UP = 172,
  ARROW_DOWN = 173,
  ARROW_LEFT = 174,
  ARROW_RIGHT = 175,
  F = 23,
  S = 33,
  ESCAPE = 200,
  SHIFT = 21,
  E = 38,
  R = 45,
  CTRL = 36,
  C = 26,
}

local selection = {
  index = 1,
  flag = 0
}

local animations = json.decode(LoadResourceFile(GetCurrentResourceName(), "data/animations.json"))

local isOpen = false
local movementEnabled = false

local searchedStrings = {}

local function DrawText2D(x, y, text, size, font)
  size = size or 0.25
  font = font or 0
  SetTextFont(font);
  SetTextProportional(false);
  SetTextScale(size, size);
  SetTextColour(255, 255, 255, 255);
  SetTextDropshadow(0, 0, 0, 0, 100);
  SetTextDropShadow();
  SetTextOutline();
  SetTextCentre(true);
  SetTextEntry('STRING');
  AddTextComponentString(text);
  DrawText(x, y);
end

function getAnimDataFromIndex(idx)
  local s = animations[idx]
  local split = {}
  for w in s:gmatch("%S+") do split[#split+1] = w end
  local dict = split[1]
  local anim = split[2]
  return {
    dict = dict,
    anim = anim
  }
end

function changeIndex(val)
  selection.index = val
  selection.anim = getAnimDataFromIndex(selection.index)
  playSelectedAnimation()
end

function playSelectedAnimation()
  local anim = selection.anim
  if not anim then return end

  if not HasAnimDictLoaded(anim.dict) then
    RequestAnimDict(anim.dict)
    while not HasAnimDictLoaded(anim.dict) do
      Wait(10)
    end
  end

  TaskPlayAnim(PlayerPedId(), anim.dict, anim.anim, 8.0, 8.0, -1, selection.flag, 1, false, false, false)
end

function search()
  AddTextEntry('FMMC_MPM_NA', 'Search animation by name.')
  DisplayOnscreenKeyboard(1, 'FMMC_MPM_NA', 'Search animation by name.', '', '', '', '', 60)

  while UpdateOnscreenKeyboard() == 0 do
    DisableAllControlActions(0)
    Wait(1)
  end
  if UpdateOnscreenKeyboard() ~= 1 then return end

  local result = GetOnscreenKeyboardResult()
  if not type(result) == 'string' then return end

  local newAnimations = {}
  for _, v in pairs(animations) do
    if string.match(v, result) then
      newAnimations[#newAnimations+1] = v
    end
  end
  animations = newAnimations

  searchedStrings[#searchedStrings+1] = result

  changeIndex(1)
end

function open()
  if isOpen then return end

  isOpen = true
  movementEnabled = false
  selection.anim = getAnimDataFromIndex(selection.index)
  playSelectedAnimation()
  
  exports['dg-lib']:shouldExecuteKeyMaps(false)

  Citizen.CreateThread(function()
    while isOpen do
      DisableAllControlActions(0)
      EnableControlAction(0, 1, true)
      EnableControlAction(0, 2, true)

      if movementEnabled then
        EnableControlAction(0, 30, true)
        EnableControlAction(0, 31, true)
        EnableControlAction(0, 32, true)
        EnableControlAction(0, 33, true)
        EnableControlAction(0, 34, true)
        EnableControlAction(0, 35, true)
      end

      -- arrow keys
      if IsDisabledControlJustPressed(0, KEYS['ARROW_LEFT']) then 
        if selection.index > 1 then
          changeIndex(selection.index - 1)
        end
      end
      if IsDisabledControlJustPressed(0, KEYS['ARROW_RIGHT']) then 
        changeIndex(selection.index + 1)
      end
      if IsDisabledControlJustPressed(0, KEYS['ARROW_DOWN']) then 
        if selection.flag > 0 then
          selection.flag = selection.flag - 1
          playSelectedAnimation()
        end
      end
      if IsDisabledControlJustPressed(0, KEYS['ARROW_UP']) then
        selection.flag = selection.flag + 1
        playSelectedAnimation()
      end

      -- control keys
      if IsDisabledControlPressed(0, KEYS['CTRL']) then
        if IsDisabledControlJustPressed(0, KEYS['F']) then
          search()
        end
        if IsDisabledControlJustPressed(0, KEYS['C']) then
          ClearPedTasksImmediately(PlayerPedId())
        end
        if IsDisabledControlJustPressed(0, KEYS['E']) then
          movementEnabled = not movementEnabled
        end
        if IsDisabledControlJustPressed(0, KEYS['R']) then
          searchedStrings = {}
          animations = json.decode(LoadResourceFile(GetCurrentResourceName(), "data/animations.json"))
        end
        if IsDisabledControlJustPressed(0, KEYS['S']) then
          print(selection.anim.dict, selection.anim.anim)
        end
      end

      -- exiting
      if IsDisabledControlPressed(0, KEYS['SHIFT']) and IsDisabledControlJustReleased(0, KEYS['ESCAPE']) then
        ClearPedTasksImmediately(PlayerPedId())
        isOpen = false
        exports['dg-lib']:shouldExecuteKeyMaps(true)
      end

      if selection.anim then
        local text = ('%s / %s\n'):format(selection.index, #animations);
        text = text .. ('Anim: %s\n'):format(selection.anim.anim);
        text = text .. ('Dict: %s\n'):format(selection.anim.dict);
        text = text .. ('Flag: %s'):format(selection.flag);
        DrawText2D(0.5, 0.75, text, 0.35, 0);
      end

      if #searchedStrings > 0 then
        local text = 'Searched for: '
        for _, v in pairs(searchedStrings) do
          text = text .. ('%s '):format(v)
        end
        DrawText2D(0.5, 0.92, text, 0.3);
      end

      DrawText2D(0.5, 0.95, 'Close: Shift+Escape | Enable/Disable movement: CTRL+E | Save: CTRL+S');
      DrawText2D(0.5, 0.97, 'Search: CTRL+F | Reset search: CTRL+R | Next: Arrow Right | Previous: Arrow Left | Stop: CTRL+C');

      Wait(0)
    end
  end)
end

RegisterCommand('animviewer', function()
  open()
end, false)
