-- You probably shouldnt touch these.
local AnimationDuration = -1
local ChosenAnimation = ""
local ChosenDict = ""
local IsInAnimation = false
local MostRecentChosenAnimation = ""
local MostRecentChosenDict = ""
local MovementType = 0
local PlayerGender = "male"
local PlayerHasProp = false
local PlayerProps = {}
local PlayerParticles = {}
local SecondPropEmote = false
local lang = Config.MenuLanguage
local PtfxNotif = false
local PtfxPrompt = false
local PtfxWait = 500
local PtfxNoProp = false
local charModule = exports['dg-core']:getModule('characters')

DGX.Keys.register('cancelEmote', '(emotes) cancel emote', 'X');
DGX.Keys.onPressDown('cancelEmote', function()
  EmoteCancel()
end);

Citizen.CreateThread(function()
  while true do
    if (IsPedShooting(PlayerPedId()) and IsInAnimation) or
        (isLoggedIn and charModule.getMetadata().downState ~= "alive" and IsInAnimation) then
      EmoteCancel()
    end

    if PtfxPrompt then
      if not PtfxNotif then
        SimpleNotify(PtfxInfo)
        PtfxNotif = true
      end
      if IsControlPressed(0, 47) then
        PtfxStart()
        Wait(PtfxWait)
        PtfxStop()
      end
    end

    if Config.MenuKeybindEnabled then if IsControlPressed(0, Config.MenuKeybind) then OpenEmoteMenu() end end
    Citizen.Wait(1)
  end
end)

-----------------------------------------------------------------------------------------------------
-- Commands / Events --------------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------

Citizen.CreateThread(function()
  TriggerEvent('chat:addSuggestion', '/e', 'Play an emote',
    { { name = "emotename", help = "dance, camera, sit or any valid emote." } })
  TriggerEvent('chat:addSuggestion', '/e', 'Play an emote',
    { { name = "emotename", help = "dance, camera, sit or any valid emote." } })
  TriggerEvent('chat:addSuggestion', '/emote', 'Play an emote',
    { { name = "emotename", help = "dance, camera, sit or any valid emote." } })
  if Config.SqlKeybinding then
    TriggerEvent('chat:addSuggestion', '/emotebind', 'Bind an emote',
      { { name = "key",     help = "num4, num5, num6, num7. num8, num9. Numpad 4-9!" },
        { name = "emotename", help = "dance, camera, sit or any valid emote." } })
    TriggerEvent('chat:addSuggestion', '/emotebinds', 'Check your currently bound emotes.')
  end
  TriggerEvent('chat:addSuggestion', '/emotemenu', 'Open dpemotes menu.')
  TriggerEvent('chat:addSuggestion', '/emotes', 'List available emotes.')
end)

RegisterCommand('e', function(source, args, raw)
  if not DGX.Police.isCuffed() and not DGX.Hospital.isDown() then
    EmoteCommandStart(source, args, raw)
  end
end)

RegisterCommand('emote', function(source, args, raw)
  if not DGX.Police.isCuffed() and not DGX.Hospital.isDown() then
    EmoteCommandStart(source, args, raw)
  end
end)

if Config.SqlKeybinding then
  RegisterCommand('emotebind', function(source, args, raw)
    if not DGX.Police.isCuffed() and not DGX.Hospital.isDown() then
      EmoteBindStart(source, args, raw)
    end
  end)

  RegisterCommand('emotebinds', function(source, args, raw)
    if not DGX.Police.isCuffed() and not DGX.Hospital.isDown() then
      EmoteBindsStart(source, args, raw)
    end
  end)
end

RegisterCommand('emotemenu', function(source, args, raw)
  if not DGX.Police.isCuffed() and not DGX.Hospital.isDown() then
    OpenEmoteMenu()
  end
end)

RegisterCommand('em', function(source, args, raw)
  if not DGX.Police.isCuffed() and not DGX.Hospital.isDown() then
    OpenEmoteMenu()
  end
end)

RegisterCommand('emotes', function(source, args, raw)
  if not DGX.Police.isCuffed() and not DGX.Hospital.isDown() then
    EmotesOnCommand()
  end
end)

-- Added

CanDoEmote = true
RelieveCount = 0

RegisterNetEvent('animations:ToggleCanDoAnims')
AddEventHandler('animations:ToggleCanDoAnims', function(bool)
  CanDoEmote = bool
end)

RegisterNetEvent('animations:client:EmoteCommandStart')
AddEventHandler('animations:client:EmoteCommandStart', function(args)
  if CanDoEmote then
    EmoteCommandStart(source, args)
  else
    DGX.Notifications.add("Cannot Be Done Right Now", "error")
  end
end)

AddEventHandler('onResourceStop', function(resource)
  if resource == GetCurrentResourceName() then
    DestroyAllProps()
    ClearPedTasksImmediately(PlayerPedId())
    ResetPedMovementClipset(PlayerPedId())
  end
end)

-----------------------------------------------------------------------------------------------------
------ Functions and stuff --------------------------------------------------------------------------
-----------------------------------------------------------------------------------------------------

function EmoteCancel()
  if ChosenDict == "MaleScenario" and IsInAnimation then
    ClearPedTasksImmediately(PlayerPedId())
    IsInAnimation = false
    DebugPrint("Forced scenario exit")
  elseif ChosenDict == "Scenario" and IsInAnimation then
    ClearPedTasksImmediately(PlayerPedId())
    IsInAnimation = false
    DebugPrint("Forced scenario exit")
  end

  PtfxNotif = false
  PtfxPrompt = false

  if IsInAnimation then
    PtfxStop()
    ClearPedTasks(PlayerPedId())
    DestroyAllProps()
    IsInAnimation = false
  end
  TriggerEvent('dpemotes:emoteCancelled')
end

function EmoteChatMessage(args)
  if args == display then return end
  TriggerEvent('chat:addMessage', {
    color = { 255, 0, 0 },
    multiline = true,
    args = {
      args
    }
  })
end

function DebugPrint(args)
  if Config.DebugDisplay then
    print(args)
  end
end

function PtfxStart()
  if PtfxNoProp then
    PtfxAt = PlayerPedId()
  else
    PtfxAt = prop
  end
  UseParticleFxAssetNextCall(PtfxAsset)
  Ptfx = StartNetworkedParticleFxLoopedOnEntityBone(PtfxName, PtfxAt, Ptfx1, Ptfx2, Ptfx3, Ptfx4, Ptfx5, Ptfx6,
    GetEntityBoneIndexByName(PtfxName, "VFX"), 1065353216, 0, 0, 0, 1065353216, 1065353216, 1065353216, 0)
  SetParticleFxLoopedColour(Ptfx, 1.0, 1.0, 1.0)
  table.insert(PlayerParticles, Ptfx)
end

function PtfxStop()
  for a, b in pairs(PlayerParticles) do
    DebugPrint("Stopped PTFX: " .. b)
    StopParticleFxLooped(b, false)
    table.remove(PlayerParticles, a)
  end
end

function EmotesOnCommand(source, args, raw)
  local EmotesCommand = ""
  for a in pairsByKeys(DP.Emotes) do
    EmotesCommand = EmotesCommand .. "" .. a .. ", "
  end
  EmoteChatMessage(EmotesCommand)
  EmoteChatMessage(Config.Languages[lang]['emotemenucmd'])
end

function pairsByKeys(t, f)
  local a = {}
  for n in pairs(t) do
    table.insert(a, n)
  end
  table.sort(a, f)
  local i = 0             -- iterator variable
  local iter = function() -- iterator function
    i = i + 1
    if a[i] == nil then
      return nil
    else
      return a[i], t[a[i]]
    end
  end
  return iter
end

function EmoteMenuStart(args, hard)
  local name = args
  local etype = hard

  if etype == "dances" then
    if DP.Dances[name] ~= nil then
      if OnEmotePlay(DP.Dances[name]) then
      end
    end
  elseif etype == "props" then
    if DP.PropEmotes[name] ~= nil then
      if OnEmotePlay(DP.PropEmotes[name]) then
      end
    end
  elseif etype == "emotes" then
    if DP.Emotes[name] ~= nil then
      if OnEmotePlay(DP.Emotes[name]) then
      end
    else
      if name ~= "🕺 Dance Emotes" then
      end
    end
  end
end

function EmoteCommandStart(source, args, raw)
  if #args > 0 then
    local name = string.lower(args[1])
    if name == "c" then
      if IsInAnimation then
        EmoteCancel()
      else
        DGX.Notifications.add('No Emote To Cancel', 'error')
      end
      return
    elseif name == "help" then
      EmotesOnCommand()
      return
    end

    if DP.Emotes[name] ~= nil then
      if OnEmotePlay(DP.Emotes[name]) then
      end
      return
    elseif DP.Dances[name] ~= nil then
      if OnEmotePlay(DP.Dances[name]) then
      end
      return
    elseif DP.PropEmotes[name] ~= nil then
      if OnEmotePlay(DP.PropEmotes[name]) then
      end
      return
    else
      DGX.Notifications.add('That Is Not A Valid Command', 'error')
    end
  end
end

function LoadAnim(dict)
  while not HasAnimDictLoaded(dict) do
    RequestAnimDict(dict)
    Wait(10)
  end
end

function LoadPropDict(model)
  while not HasModelLoaded(GetHashKey(model)) do
    RequestModel(GetHashKey(model))
    Wait(10)
  end
end

function PtfxThis(asset)
  while not HasNamedPtfxAssetLoaded(asset) do
    RequestNamedPtfxAsset(asset)
    Wait(10)
  end
  UseParticleFxAssetNextCall(asset)
end

function DestroyAllProps()
  for _, v in pairs(PlayerProps) do
    DeleteEntity(v)
  end
  PlayerHasProp = false
  DebugPrint("Destroyed Props")
end

function AddPropToPlayer(prop1, bone, off1, off2, off3, rot1, rot2, rot3)
  local Player = PlayerPedId()
  local x, y, z = table.unpack(GetEntityCoords(Player))

  if not HasModelLoaded(prop1) then
    LoadPropDict(prop1)
  end

  prop = CreateObject(GetHashKey(prop1), x, y, z + 0.2, true, true, true)
  AttachEntityToEntity(prop, Player, GetPedBoneIndex(Player, bone), off1, off2, off3, rot1, rot2, rot3, true, true, false
  , true, 1, true)
  table.insert(PlayerProps, prop)
  PlayerHasProp = true
  SetModelAsNoLongerNeeded(prop1)
end

-----------------------------------------------------------------------------------------------------
-- V -- This could be a whole lot better, i tried messing around with "IsPedMale(ped)"
-- V -- But i never really figured it out, if anyone has a better way of gender checking let me know.
-- V -- Since this way doesnt work for ped models.
-- V -- in most cases its better to replace the scenario with an animation bundled with prop instead.
-----------------------------------------------------------------------------------------------------

function CheckGender()
  local hashSkinMale = GetHashKey("mp_m_freemode_01")
  local hashSkinFemale = GetHashKey("mp_f_freemode_01")

  if GetEntityModel(PlayerPedId()) == hashSkinMale then
    PlayerGender = "male"
  elseif GetEntityModel(PlayerPedId()) == hashSkinFemale then
    PlayerGender = "female"
  end
  DebugPrint("Set gender as = (" .. PlayerGender .. ")")
end

-----------------------------------------------------------------------------------------------------
------ This is the major function for playing emotes! -----------------------------------------------
-----------------------------------------------------------------------------------------------------

function OnEmotePlay(EmoteName)
  InVehicle = IsPedInAnyVehicle(PlayerPedId(), true)
  if not Config.AllowedInCars and InVehicle == 1 then
    return
  end

  if not DoesEntityExist(PlayerPedId()) then
    return false
  end

  if Config.DisarmPlayer then
    if IsPedArmed(PlayerPedId(), 7) then
      exports['dg-weapons']:removeWeapon(nil, true)
    end
  end

  ChosenDict, ChosenAnimation, ename = table.unpack(EmoteName)
  AnimationDuration = -1

  if PlayerHasProp then
    DestroyAllProps()
  end

  if ChosenDict == "MaleScenario" or "Scenario" then
    CheckGender()
    if ChosenDict == "MaleScenario" then
      if InVehicle then return end
      if PlayerGender == "male" then
        ClearPedTasks(PlayerPedId())
        DGX.Util.startScenarioInPlace(ChosenAnimation)
        DebugPrint("Playing scenario = (" .. ChosenAnimation .. ")")
        IsInAnimation = true
      else
        EmoteChatMessage(Config.Languages[lang]['maleonly'])
      end
      return
    elseif ChosenDict == "ScenarioObject" then
      if InVehicle then return end
      BehindPlayer = GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0.0, 0 - 0.5, -0.5);
      ClearPedTasks(PlayerPedId())
      TaskStartScenarioAtPosition(PlayerPedId(), ChosenAnimation, BehindPlayer['x'], BehindPlayer['y'],
        BehindPlayer['z'
        ], GetEntityHeading(PlayerPedId()), 0, 1, false)
      DebugPrint("Playing scenario = (" .. ChosenAnimation .. ")")
      IsInAnimation = true
      return
    elseif ChosenDict == "Scenario" then
      if InVehicle then return end
      ClearPedTasks(PlayerPedId())
      DGX.Util.startScenarioInPlace(ChosenAnimation)
      DebugPrint("Playing scenario = (" .. ChosenAnimation .. ")")
      IsInAnimation = true
      return
    end
  end

  LoadAnim(ChosenDict)

  if EmoteName.AnimationOptions then
    if EmoteName.AnimationOptions.EmoteLoop then
      MovementType = 1
      if EmoteName.AnimationOptions.EmoteMoving then
        MovementType = 51
      end
    elseif EmoteName.AnimationOptions.EmoteMoving then
      MovementType = 51
    elseif EmoteName.AnimationOptions.EmoteMoving == false then
      MovementType = 0
    elseif EmoteName.AnimationOptions.EmoteStuck then
      MovementType = 50
    end
  else
    MovementType = 0
  end

  if InVehicle == 1 then
    MovementType = 51
  end

  if EmoteName.AnimationOptions then
    if EmoteName.AnimationOptions.EmoteDuration == nil then
      EmoteName.AnimationOptions.EmoteDuration = -1
      AttachWait = 0
    else
      AnimationDuration = EmoteName.AnimationOptions.EmoteDuration
      AttachWait = EmoteName.AnimationOptions.EmoteDuration
    end

    if EmoteName.AnimationOptions.PtfxAsset then
      PtfxAsset = EmoteName.AnimationOptions.PtfxAsset
      PtfxName = EmoteName.AnimationOptions.PtfxName
      if EmoteName.AnimationOptions.PtfxNoProp then
        PtfxNoProp = EmoteName.AnimationOptions.PtfxNoProp
      else
        PtfxNoProp = false
      end
      Ptfx1, Ptfx2, Ptfx3, Ptfx4, Ptfx5, Ptfx6, PtfxScale = table.unpack(EmoteName.AnimationOptions.PtfxPlacement)
      PtfxInfo = EmoteName.AnimationOptions.PtfxInfo
      PtfxWait = EmoteName.AnimationOptions.PtfxWait
      PtfxNotif = false
      PtfxPrompt = true
      PtfxThis(PtfxAsset)
    else
      DebugPrint("Ptfx = none")
      PtfxPrompt = false
    end
  end

  TaskPlayAnim(PlayerPedId(), ChosenDict, ChosenAnimation, 2.0, 2.0, AnimationDuration, MovementType, 0, false, false,
    false)
  RemoveAnimDict(ChosenDict)
  IsInAnimation = true
  MostRecentDict = ChosenDict
  MostRecentAnimation = ChosenAnimation

  if EmoteName.AnimationOptions then
    if EmoteName.AnimationOptions.Prop then
      PropName = EmoteName.AnimationOptions.Prop
      PropBone = EmoteName.AnimationOptions.PropBone
      PropPl1, PropPl2, PropPl3, PropPl4, PropPl5, PropPl6 = table.unpack(EmoteName.AnimationOptions.PropPlacement)
      if EmoteName.AnimationOptions.SecondProp then
        SecondPropName = EmoteName.AnimationOptions.SecondProp
        SecondPropBone = EmoteName.AnimationOptions.SecondPropBone
        SecondPropPl1, SecondPropPl2, SecondPropPl3, SecondPropPl4, SecondPropPl5, SecondPropPl6 = table.unpack(
          EmoteName
          .AnimationOptions.SecondPropPlacement)
        SecondPropEmote = true
      else
        SecondPropEmote = false
      end
      Wait(AttachWait)
      AddPropToPlayer(PropName, PropBone, PropPl1, PropPl2, PropPl3, PropPl4, PropPl5, PropPl6)
      if SecondPropEmote then
        AddPropToPlayer(SecondPropName, SecondPropBone, SecondPropPl1, SecondPropPl2, SecondPropPl3, SecondPropPl4,
          SecondPropPl5, SecondPropPl6)
      end
    end
  end
  return true
end