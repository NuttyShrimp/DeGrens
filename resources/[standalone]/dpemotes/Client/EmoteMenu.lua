rightPosition = {x = 1450, y = 100}
leftPosition = {x = 0, y = 100}
menuPosition = {x = 0, y = 200}
PlayerData = {}
isLoggedIn = false

RegisterNetEvent('DGCore:client:playerLoaded', function(playerData)
  PlayerData = playerData
  isLoggedIn = true
end)

RegisterNetEvent('DGCore:client:playerUnloaded', function()
  PlayerData = {}
  isLoggedIn = false
end)

RegisterNetEvent('DGCore:Player:SetPlayerData')
AddEventHandler('DGCore:Player:SetPlayerData', function(val)
    PlayerData = val
end)

if Config.MenuPosition then
  if Config.MenuPosition == "left" then
    menuPosition = leftPosition
  elseif Config.MenuPosition == "right" then
    menuPosition = rightPosition
  end
end

if Config.CustomMenuEnabled then
  local RuntimeTXD = CreateRuntimeTxd('Custom_Menu_Head')
  local Object = CreateDui(Config.MenuImage, 512, 128)
  _G.Object = Object
  local TextureThing = GetDuiHandle(Object)
  local Texture = CreateRuntimeTextureFromDuiHandle(RuntimeTXD, 'Custom_Menu_Head', TextureThing)
  Menuthing = "Custom_Menu_Head"
else
  Menuthing = "shopui_title_sm_hangar"
end

_menuPool = NativeUI.CreatePool()
mainMenu = NativeUI.CreateMenu("dp Emotes", "", menuPosition["x"], menuPosition["y"], Menuthing, Menuthing)
_menuPool:Add(mainMenu)

function ShowNotification(text)
    SetNotificationTextEntry("STRING")
    AddTextComponentString(text)
    DrawNotification(false, false)
end

local EmoteTable = {}
local FavEmoteTable = {}
local KeyEmoteTable = {}
local DanceTable = {}
local PropETable = {}
local ShareTable = {}
local FavoriteEmote = ""

Citizen.CreateThread(function()
  while true do
    if Config.FavKeybindEnabled and not DGX.Hospital.isDown() then
      if IsControlPressed(0, Config.FavKeybind) then
        if not IsPedSittingInAnyVehicle(PlayerPedId()) then
          if FavoriteEmote ~= "" then
            EmoteCommandStart(nil,{FavoriteEmote, 0})
            Wait(3000)
          end
        end
      end
    end
    Citizen.Wait(1)
  end
end)

lang = Config.MenuLanguage

function AddEmoteMenu(menu)
    local submenu = _menuPool:AddSubMenu(menu, Config.Languages[lang]['emotes'], "", "", Menuthing, Menuthing)
    local dancemenu = _menuPool:AddSubMenu(submenu, Config.Languages[lang]['danceemotes'], "", "", Menuthing, Menuthing)
    local propmenu = _menuPool:AddSubMenu(submenu, Config.Languages[lang]['propemotes'], "", "", Menuthing, Menuthing)
    table.insert(EmoteTable, Config.Languages[lang]['danceemotes'])
    table.insert(EmoteTable, Config.Languages[lang]['danceemotes'])

    if Config.SharedEmotesEnabled then
      sharemenu = _menuPool:AddSubMenu(submenu, Config.Languages[lang]['shareemotes'], Config.Languages[lang]['shareemotesinfo'], "", Menuthing, Menuthing)
      shareddancemenu = _menuPool:AddSubMenu(sharemenu, Config.Languages[lang]['sharedanceemotes'], "", "", Menuthing, Menuthing)
      table.insert(ShareTable, 'none')
      table.insert(EmoteTable, Config.Languages[lang]['shareemotes'])
    end

    if not Config.SqlKeybinding then
      unbind2item = NativeUI.CreateItem(Config.Languages[lang]['rfavorite'], Config.Languages[lang]['rfavorite'])
      unbinditem = NativeUI.CreateItem(Config.Languages[lang]['prop2info'], "")
      favmenu = _menuPool:AddSubMenu(submenu, Config.Languages[lang]['favoriteemotes'], Config.Languages[lang]['favoriteinfo'], "", Menuthing, Menuthing)
      favmenu:AddItem(unbinditem)
      favmenu:AddItem(unbind2item)
      table.insert(FavEmoteTable, Config.Languages[lang]['rfavorite'])
      table.insert(FavEmoteTable, Config.Languages[lang]['rfavorite'])
      table.insert(EmoteTable, Config.Languages[lang]['favoriteemotes'])
    else
      table.insert(EmoteTable, "keybinds")
      keyinfo =  NativeUI.CreateItem(Config.Languages[lang]['keybinds'], Config.Languages[lang]['keybindsinfo'].." /emotebind [~y~num4-9~w~] [~g~emotename~w~]")
      submenu:AddItem(keyinfo)
    end

    for a,b in pairsByKeys(DP.Emotes) do
      x,y,z = table.unpack(b)
      emoteitem = NativeUI.CreateItem(z, "/e ("..a..")")
      submenu:AddItem(emoteitem)
      table.insert(EmoteTable, a)
      if not Config.SqlKeybinding then
        favemoteitem = NativeUI.CreateItem(z, Config.Languages[lang]['set']..z..Config.Languages[lang]['setboundemote'])
        favmenu:AddItem(favemoteitem)
        table.insert(FavEmoteTable, a)
      end
    end

    for a,b in pairsByKeys(DP.Dances) do
      x,y,z = table.unpack(b)
      danceitem = NativeUI.CreateItem(z, "/e ("..a..")")
      sharedanceitem = NativeUI.CreateItem(z, "")
      dancemenu:AddItem(danceitem)
      if Config.SharedEmotesEnabled then
        shareddancemenu:AddItem(sharedanceitem)
      end
      table.insert(DanceTable, a)
    end

    if Config.SharedEmotesEnabled then
      for a,b in pairsByKeys(DP.Shared) do
        x,y,z,otheremotename = table.unpack(b)
        if otheremotename == nil then
          shareitem = NativeUI.CreateItem(z, "/nearby (~g~"..a.."~w~)")
        else 
          shareitem = NativeUI.CreateItem(z, "/nearby (~g~"..a.."~w~) "..Config.Languages[lang]['makenearby'].." (~y~"..otheremotename.."~w~)")
        end
        sharemenu:AddItem(shareitem)
        table.insert(ShareTable, a)
      end
    end

    for a,b in pairsByKeys(DP.PropEmotes) do
      x,y,z = table.unpack(b)
      propitem = NativeUI.CreateItem(z, "/e ("..a..")")
      propmenu:AddItem(propitem)
      table.insert(PropETable, a)
      if not Config.SqlKeybinding then
        propfavitem = NativeUI.CreateItem(z, Config.Languages[lang]['set']..z..Config.Languages[lang]['setboundemote'])
        favmenu:AddItem(propfavitem)
        table.insert(FavEmoteTable, a)
      end
    end

    if not Config.SqlKeybinding then
      favmenu.OnItemSelect = function(sender, item, index)
        if FavEmoteTable[index] == Config.Languages[lang]['rfavorite'] then
          FavoriteEmote = ""
          ShowNotification(Config.Languages[lang]['rfavorite'], 2000)
        return end 
        if Config.FavKeybindEnabled then
          FavoriteEmote = FavEmoteTable[index]
          ShowNotification("~o~"..firstToUpper(FavoriteEmote)..Config.Languages[lang]['newsetemote']) 
        end
      end
    end

    dancemenu.OnItemSelect = function(sender, item, index)
      EmoteMenuStart(DanceTable[index], "dances")
    end

    if Config.SharedEmotesEnabled then
      sharemenu.OnItemSelect = function(sender, item, index)
        if ShareTable[index] ~= 'none' then
          target, distance = GetClosestPlayer()
          if(distance ~= -1 and distance < 3) then
            _,_,rename = table.unpack(DP.Shared[ShareTable[index]])
            TriggerServerEvent("ServerEmoteRequest", GetPlayerServerId(target), ShareTable[index])
            SimpleNotify(Config.Languages[lang]['sentrequestto']..GetPlayerName(target))
          else
            SimpleNotify(Config.Languages[lang]['nobodyclose'])
          end
        end
      end

      shareddancemenu.OnItemSelect = function(sender, item, index)
        target, distance = GetClosestPlayer()
        if(distance ~= -1 and distance < 3) then
          _,_,rename = table.unpack(DP.Dances[DanceTable[index]])
          TriggerServerEvent("ServerEmoteRequest", GetPlayerServerId(target), DanceTable[index], 'Dances')
          SimpleNotify(Config.Languages[lang]['sentrequestto']..GetPlayerName(target)) 
        else
          SimpleNotify(Config.Languages[lang]['nobodyclose'])
        end
      end
    end

    propmenu.OnItemSelect = function(sender, item, index)
      EmoteMenuStart(PropETable[index], "props")
    end

    submenu.OnItemSelect = function(sender, item, index)
     if EmoteTable[index] ~= Config.Languages[lang]['favoriteemotes'] then
      EmoteMenuStart(EmoteTable[index], "emotes")
    end
  end
end

function AddCancelEmote(menu)
    local newitem = NativeUI.CreateItem(Config.Languages[lang]['cancelemote'], Config.Languages[lang]['cancelemoteinfo'])
    menu:AddItem(newitem)
    menu.OnItemSelect = function(sender, item, checked_)
        if item == newitem then
          EmoteCancel()
          DestroyAllProps()
        end
    end
end

function OpenEmoteMenu()
    mainMenu:Visible(not mainMenu:Visible())
end

function firstToUpper(str)
    return (str:gsub("^%l", string.upper))
end

AddEmoteMenu(mainMenu)
AddCancelEmote(mainMenu)

_menuPool:RefreshIndex()

Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        _menuPool:ProcessMenus()
    end
end)

RegisterNetEvent("dp:RecieveMenu") -- For opening the emote menu from another resource.
AddEventHandler("dp:RecieveMenu", function()
    OpenEmoteMenu() 
end)

-- This is here to get the player data when the resource is restarted instead of having to log out and back in each time
-- This won't set the player data too early as this only triggers when the server side is started and not the client side
AddEventHandler('onResourceStart', function(resource)
  if resource == GetCurrentResourceName() then
      Wait(200)
      PlayerData = DGCore.Functions.GetPlayerData()
      isLoggedIn = true
  end
end)
