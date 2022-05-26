-- Variables

local Plates = {}
local PlayerStatus = {}
local Casings = {}
local BloodDrops = {}
local FingerDrops = {}
local Objects = {}
local DGCore = exports['dg-core']:GetCoreObject()

-- Functions

local function UpdateBlips()
    local dutyPlayers = {}
    local players = DGCore.Functions.GetQBPlayers()
    for k, v in pairs(players) do
        if (v.PlayerData.job.name == "police" or v.PlayerData.job.name == "ambulance") and v.PlayerData.job.onduty then
            local coords = GetEntityCoords(GetPlayerPed(v.PlayerData.source))
            local heading = GetEntityHeading(GetPlayerPed(v.PlayerData.source))
            dutyPlayers[#dutyPlayers+1] = {
                source = v.PlayerData.source,
                label = v.PlayerData.metadata["callsign"],
                job = v.PlayerData.job.name,
                location = {
                    x = coords.x,
                    y = coords.y,
                    z = coords.z,
                    w = heading
                }
            }
        end
    end
    TriggerClientEvent("police:client:UpdateBlips", -1, dutyPlayers)
end

local function CreateBloodId()
    if BloodDrops then
        local bloodId = math.random(10000, 99999)
        while BloodDrops[caseId] do
            bloodId = math.random(10000, 99999)
        end
        return bloodId
    else
        local bloodId = math.random(10000, 99999)
        return bloodId
    end
end

local function CreateFingerId()
    if FingerDrops then
        local fingerId = math.random(10000, 99999)
        while FingerDrops[caseId] do
            fingerId = math.random(10000, 99999)
        end
        return fingerId
    else
        local fingerId = math.random(10000, 99999)
        return fingerId
    end
end

local function CreateCasingId()
    if Casings then
        local caseId = math.random(10000, 99999)
        while Casings[caseId] do
            caseId = math.random(10000, 99999)
        end
        return caseId
    else
        local caseId = math.random(10000, 99999)
        return caseId
    end
end

local function CreateObjectId()
    if Objects then
        local objectId = math.random(10000, 99999)
        while Objects[caseId] do
            objectId = math.random(10000, 99999)
        end
        return objectId
    else
        local objectId = math.random(10000, 99999)
        return objectId
    end
end

local function IsVehicleOwned(plate)
    local result = exports['dg-sql']:scalar('SELECT plate FROM player_vehicles WHERE plate = ?', {plate})
    return result
end

local function GetCurrentCops()
    local amount = 0
    local players = DGCore.Functions.GetQBPlayers()
    for k, v in pairs(players) do
        if v.PlayerData.job.name == "police" and v.PlayerData.job.onduty then
            amount = amount + 1
        end
    end
    return amount
end

local function DnaHash(s)
    local h = string.gsub(s, ".", function(c)
        return string.format("%02x", string.byte(c))
    end)
    return h
end

-- Commands

DGCore.Commands.Add("spikestrip", "Place Spike Strip (Police Only)", {}, false, function(source)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player then
        if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
            TriggerClientEvent('police:client:SpawnSpikeStrip', src)
        end
    end
end)

DGCore.Commands.Add("grantlicense", "Grant a license to someone", {{name = "id", help = "ID of a person"}, {name = "license", help = "License Type"}}, true, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.grade.level >= 2 then
        if args[2] == "driver" or args[2] == "weapon" then
            local SearchedPlayer = DGCore.Functions.GetPlayer(tonumber(args[1]))
            if SearchedPlayer then
                local licenseTable = SearchedPlayer.PlayerData.metadata["licences"]
                licenseTable[args[2]] = true
                SearchedPlayer.Functions.SetMetaData("licences", licenseTable)
                TriggerClientEvent('DGCore:Notify', SearchedPlayer.PlayerData.source, "You have been granted a license",
                    "success", 5000)
                TriggerClientEvent('DGCore:Notify', src, "You granted a license", "success", 5000)
            end
        else
            TriggerClientEvent('DGCore:Notify', src, "Invalid license type", "error")
        end
    else
        TriggerClientEvent('DGCore:Notify', src, "You must be a Sergeant to grant licenses!", "error")
    end
end)

DGCore.Commands.Add("revokelicense", "Revoke a license from someone", {{name = "id", help = "ID of a person"}, {name = "license", help = "License Type"}}, true, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.grade.level >= 2 then
        if args[2] == "driver" or args[2] == "weapon" then
            local SearchedPlayer = DGCore.Functions.GetPlayer(tonumber(args[1]))
            if SearchedPlayer then
                local licenseTable = SearchedPlayer.PlayerData.metadata["licences"]
                licenseTable[args[2]] = false
                SearchedPlayer.Functions.SetMetaData("licences", licenseTable)
                TriggerClientEvent('DGCore:Notify', SearchedPlayer.PlayerData.source, "You've had a license revoked",
                    "error", 5000)
                TriggerClientEvent('DGCore:Notify', src, "You revoked a license", "success", 5000)
            end
        else
            TriggerClientEvent('DGCore:Notify', src, "Invalid license type", "error")
        end
    else
        TriggerClientEvent('DGCore:Notify', src, "You must be a Sergeant to revoke licenses!", "error")
    end
end)

DGCore.Commands.Add("pobject", "Place/Delete An Object (Police Only)", {{name = "type",help = "Type object you want or 'delete' to delete"}}, true, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local type = args[1]:lower()
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        if type == "pion" then
            TriggerClientEvent("police:client:spawnCone", src)
        elseif type == "barier" then
            TriggerClientEvent("police:client:spawnBarier", src)
        elseif type == "schotten" then
            TriggerClientEvent("police:client:spawnSchotten", src)
        elseif type == "tent" then
            TriggerClientEvent("police:client:spawnTent", src)
        elseif type == "light" then
            TriggerClientEvent("police:client:spawnLight", src)
        elseif type == "delete" then
            TriggerClientEvent("police:client:deleteObject", src)
        end
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("cuff", "Cuff Player (Police Only)", {}, false, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        TriggerClientEvent("police:client:CuffPlayer", src)
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("escort", "Escort Player", {}, false, function(source, args)
    local src = source
    TriggerClientEvent("police:client:EscortPlayer", src)
end)

DGCore.Commands.Add("callsign", "Give Yourself A Callsign", {{name = "name", help = "Name of your callsign"}}, false, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    Player.Functions.SetMetaData("callsign", table.concat(args, " "))
end)

DGCore.Commands.Add("clearcasings", "Clear Area of Casings (Police Only)", {}, false, function(source)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        TriggerClientEvent("evidence:client:ClearCasingsInArea", src)
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("jail", "Jail Player (Police Only)", {{name = "id", help = "Player ID"}, {name = "time", help = "Time they have to be in jail"}}, true, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        local playerId = tonumber(args[1])
        local time = tonumber(args[2])
        if time > 0 then
            TriggerClientEvent("police:client:JailCommand", src, playerId, time)
        else
            TriggerClientEvent('DGCore:Notify', src, 'Cannot sentence for 0', 'error')
        end
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("unjail", "Unjail Player (Police Only)", {{name = "id", help = "Player ID"}}, true, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        local playerId = tonumber(args[1])
        TriggerClientEvent("prison:client:UnjailPerson", playerId)
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("clearblood", "Clear The Area of Blood (Police Only)", {}, false, function(source)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        TriggerClientEvent("evidence:client:ClearBlooddropsInArea", src)
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("seizecash", "Seize Cash (Police Only)", {}, false, function(source)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        TriggerClientEvent("police:client:SeizeCash", src)
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("sc", "Soft Cuff (Police Only)", {}, false, function(source)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        TriggerClientEvent("police:client:CuffPlayerSoft", src)
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("cam", "View Security Camera (Police Only)", {{name = "camid", help = "Camera ID"}}, false, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        TriggerClientEvent("police:client:ActiveCamera", src, tonumber(args[1]))
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("flagplate", "Flag A Plate (Police Only)", {{name = "plate", help = "License"}, {name = "reason", help = "Reason of flagging the vehicle"}}, true, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        local reason = {}
        for i = 2, #args, 1 do
            table.insert(reason, args[i])
        end
        Plates[args[1]:upper()] = {
            isflagged = true,
            reason = table.concat(reason, " ")
        }
        TriggerClientEvent('DGCore:Notify', src, "Vehicle (" .. args[1]:upper() .. ") is flagged for: " .. table.concat(reason, " "))
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("unflagplate", "Unflag A Plate (Police Only)", {{name = "plate", help = "License plate"}}, true, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        if Plates and Plates[args[1]:upper()] then
            if Plates[args[1]:upper()].isflagged then
                Plates[args[1]:upper()].isflagged = false
                TriggerClientEvent('DGCore:Notify', src, "Vehicle (" .. args[1]:upper() .. ") is unflagged")
            else
                TriggerClientEvent('DGCore:Notify', src, 'Vehicle not flagged', 'error')
            end
        else
            TriggerClientEvent('DGCore:Notify', src, 'Vehicle not flagged', 'error')
        end
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("plateinfo", "Run A Plate (Police Only)", {{name = "plate",help = "License plate"}}, true, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        if Plates and Plates[args[1]:upper()] then
            if Plates[args[1]:upper()].isflagged then
                TriggerClientEvent('DGCore:Notify', src, 'Vehicle ' .. args[1]:upper() .. ' has been flagged for: ' .. Plates[args[1]:upper()].reason)
            else
                TriggerClientEvent('DGCore:Notify', src, 'Vehicle not flagged', 'error')
            end
        else
            TriggerClientEvent('DGCore:Notify', src, 'Vehicle not flagged', 'error')
        end
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("depot", "Impound With Price (Police Only)", {{name = "price", help = "Price for how much the person has to pay (may be empty)"}}, false, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        TriggerClientEvent("police:client:ImpoundVehicle", src, false, tonumber(args[1]))
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("impound", "Impound A Vehicle (Police Only)", {}, false, function(source)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        TriggerClientEvent("police:client:ImpoundVehicle", src, true)
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("anklet", "Attach Tracking Anklet (Police Only)", {}, false, function(source)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        TriggerClientEvent("police:client:CheckDistance", src)
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("ankletlocation", "Get the location of a persons anklet", {{"cid", "Citizen ID of the person"}}, true, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        if args[1] then
            local citizenid = args[1]
            local Target = DGCore.Functions.GetPlayerByCitizenId(citizenid)
            if Target then
                if Target.PlayerData.metadata["tracker"] then
                    TriggerClientEvent("police:client:SendTrackerLocation", Target.PlayerData.source, src)
                else
                    TriggerClientEvent('DGCore:Notify', src, 'This person doesn\'t have an anklet on.', 'error')
                end
            end
        end
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("removeanklet", "Remove Tracking Anklet (Police Only)", {{"cid", "Citizen ID of person"}}, true,function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        if args[1] then
            local citizenid = args[1]
            local Target = DGCore.Functions.GetPlayerByCitizenId(citizenid)
            if Target then
                if Target.PlayerData.metadata["tracker"] then
                    TriggerClientEvent("police:client:SendTrackerLocation", Target.PlayerData.source, src)
                else
                    TriggerClientEvent('DGCore:Notify', src, 'This person does not have an anklet', 'error')
                end
            end
        end
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("takedrivinglicense", "Seize Drivers License (Police Only)", {}, false, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty then
        TriggerClientEvent("police:client:SeizeDriverLicense", source)
    else
        TriggerClientEvent('DGCore:Notify', src, 'For on-duty police only', 'error')
    end
end)

DGCore.Commands.Add("takedna", "Take a DNA sanple from a person (empty evidence bag needed) (Police Only)", {{"id", "ID of the person"}}, true, function(source, args)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local OtherPlayer = DGCore.Functions.GetPlayer(tonumber(args[1]))
    if ((Player.PlayerData.job.name == "police") and Player.PlayerData.job.onduty) and OtherPlayer then
        if Player.Functions.RemoveItem("empty_evidence_bag", 1) then
            local info = {
                label = "DNA Sample",
                type = "dna",
                dnalabel = DnaHash(OtherPlayer.PlayerData.citizenid)
            }
            if Player.Functions.AddItem("filled_evidence_bag", 1, false, info) then
                TriggerClientEvent("inventory:client:ItemBox", src, "filled_evidence_bag", "add")
            end
        else
            TriggerClientEvent('DGCore:Notify', src, "You must have an empty evidence bag with you", "error")
        end
    end
end)

RegisterNetEvent('police:server:SendTrackerLocation', function(coords, requestId)
    local Target = DGCore.Functions.GetPlayer(source)
    local msg = "The location of " .. Target.PlayerData.charinfo.firstname .. " " .. Target.PlayerData.charinfo.lastname .. " is marked on your map."
    local alertData = {
        title = "Anklet location",
        coords = {
            x = coords.x,
            y = coords.y,
            z = coords.z
        },
        description = msg
    }
    TriggerClientEvent("police:client:TrackerMessage", requestId, msg, coords)
		-- TODO add dispatch hook
end)

DGCore.Commands.Add('911p', 'Police Report', {{name='message', help='Message to be sent'}}, false, function(source, args)
	local src = source
	if args[1] then message = table.concat(args, " ") else message = 'Civilian Call' end
    local ped = GetPlayerPed(src)
    local coords = GetEntityCoords(ped)
    local players = DGCore.Functions.GetQBPlayers()
    for k,v in pairs(players) do
        if v.PlayerData.job.name == 'police' and v.PlayerData.job.onduty then
            local alertData = {title = 'New 911 Call', coords = {coords.x, coords.y, coords.z}, description = message}
					-- TODO add dispatch hook
            TriggerClientEvent('police:client:policeAlert', v.PlayerData.source, coords, message)
        end
    end
end)

-- Items

DGCore.Functions.CreateUseableItem("handcuffs", function(source, item)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.Functions.GetItemByName(item.name) then
        TriggerClientEvent("police:client:CuffPlayerSoft", src)
    end
end)

DGCore.Functions.CreateUseableItem("moneybag", function(source, item)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.Functions.GetItemByName(item.name) then
        if item.info and item.info ~= "" then
            if Player.PlayerData.job.name ~= "police" then
                if Player.Functions.RemoveItem("moneybag", 1, item.slot) then
										exports['dg-financials']:addCash(src, tonumber(item.info.cash), 'Money Bag')
                end
            end
        end
    end
end)

-- Callbacks

DGCore.Functions.CreateCallback('police:server:isPlayerDead', function(source, cb, playerId)
    local Player = DGCore.Functions.GetPlayer(playerId)
    cb(Player.PlayerData.metadata["isdead"])
end)

DGCore.Functions.CreateCallback('police:GetPlayerStatus', function(source, cb, playerId)
    local Player = DGCore.Functions.GetPlayer(playerId)
    local statList = {}
    if Player then
        if PlayerStatus[Player.PlayerData.source] and next(PlayerStatus[Player.PlayerData.source]) then
            for k, v in pairs(PlayerStatus[Player.PlayerData.source]) do
                table.insert(statList, PlayerStatus[Player.PlayerData.source][k].text)
            end
        end
    end
    cb(statList)
end)

DGCore.Functions.CreateCallback('police:IsSilencedWeapon', function(source, cb, weapon)
    local Player = DGCore.Functions.GetPlayer(source)
    local itemInfo = Player.Functions.GetItemByName(exports["dg-inventory"]:GetItemData(weapon)["name"])
    local retval = false
    if itemInfo then
        if itemInfo.info and itemInfo.info.attachments then
            for k, v in pairs(itemInfo.info.attachments) do
                if itemInfo.info.attachments[k].component == "COMPONENT_AT_AR_SUPP_02" or
                    itemInfo.info.attachments[k].component == "COMPONENT_AT_AR_SUPP" or
                    itemInfo.info.attachments[k].component == "COMPONENT_AT_PI_SUPP_02" or
                    itemInfo.info.attachments[k].component == "COMPONENT_AT_PI_SUPP" then
                    retval = true
                end
            end
        end
    end
    cb(retval)
end)

DGCore.Functions.CreateCallback('police:GetDutyPlayers', function(source, cb)
    local dutyPlayers = {}
    local players = DGCore.Functions.GetQBPlayers()
    for k, v in pairs(players) do
        if v.PlayerData.job.name == "police" and v.PlayerData.job.onduty then
            dutyPlayers[#dutyPlayers+1] = {
                source = Player.PlayerData.source,
                label = Player.PlayerData.metadata["callsign"],
                job = Player.PlayerData.job.name
            }
        end
    end
    cb(dutyPlayers)
end)

DGCore.Functions.CreateCallback('police:GetImpoundedVehicles', function(source, cb)
    local vehicles = {}
    exports['dg-sql']:query('SELECT * FROM player_vehicles WHERE state = ?', {2}, function(result)
        if result[1] then
            vehicles = result
        end
        cb(vehicles)
    end)
end)

DGCore.Functions.CreateCallback('police:IsPlateFlagged', function(source, cb, plate)
    local retval = false
    if Plates and Plates[plate] then
        if Plates[plate].isflagged then
            retval = true
        end
    end
    cb(retval)
end)

DGCore.Functions.CreateCallback('police:GetCops', function(source, cb)
    local amount = 0
    local players = DGCore.Functions.GetQBPlayers()
    for k, v in pairs(players) do
        if v.PlayerData.job.name == "police" and v.PlayerData.job.onduty then
            amount = amount + 1
        end
    end
    cb(amount)
end)

DGCore.Functions.CreateCallback('police:server:IsPoliceForcePresent', function(source, cb)
    local retval = false
    local players = DGCore.Functions.GetQBPlayers()
    for k, v in pairs(players) do
        if v.PlayerData.job.name == "police" and v.PlayerData.job.grade.level >= 2 then
            retval = true
            break
        end
    end
    cb(retval)
end)

-- Events

RegisterNetEvent('police:server:policeAlert', function(text)
    local src = source
    local ped = GetPlayerPed(src)
    local coords = GetEntityCoords(ped)
    local players = DGCore.Functions.GetQBPlayers()
    for k,v in pairs(players) do
        if v.PlayerData.job.name == 'police' and v.PlayerData.job.onduty then
            local alertData = {title = 'New Call', coords = {coords.x, coords.y, coords.z}, description = text}
					-- TODO add dispatch hook
            TriggerClientEvent('police:client:policeAlert', v.PlayerData.source, coords, text)
        end
    end
end)

RegisterNetEvent('police:server:TakeOutImpound', function(plate)
    local src = source
    exports['dg-sql']:query('UPDATE player_vehicles SET state = ? WHERE plate  = ?', {0, plate})
    TriggerClientEvent('DGCore:Notify', src, "Vehicle unimpounded!", 'success')
end)

RegisterNetEvent('police:server:CuffPlayer', function(playerId, isSoftcuff)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local CuffedPlayer = DGCore.Functions.GetPlayer(playerId)
    if CuffedPlayer then
        if Player.Functions.GetItemByName("handcuffs") or Player.PlayerData.job.name == "police" then
            TriggerClientEvent("police:client:GetCuffed", CuffedPlayer.PlayerData.source, Player.PlayerData.source, isSoftcuff)
        end
    end
end)

RegisterNetEvent('police:server:EscortPlayer', function(playerId)
    local src = source
    local Player = DGCore.Functions.GetPlayer(source)
    local EscortPlayer = DGCore.Functions.GetPlayer(playerId)
    if EscortPlayer then
        if (Player.PlayerData.job.name == "police" or Player.PlayerData.job.name == "ambulance") or (EscortPlayer.PlayerData.metadata["ishandcuffed"] or EscortPlayer.PlayerData.metadata["isdead"] or EscortPlayer.PlayerData.metadata["inlaststand"]) then
            TriggerClientEvent("police:client:GetEscorted", EscortPlayer.PlayerData.source, Player.PlayerData.source)
        else
            TriggerClientEvent('DGCore:Notify', src, "Civilian isn't cuffed or dead", 'error')
        end
    end
end)

RegisterNetEvent('police:server:KidnapPlayer', function(playerId)
    local src = source
    local Player = DGCore.Functions.GetPlayer(source)
    local EscortPlayer = DGCore.Functions.GetPlayer(playerId)
    if EscortPlayer then
        if EscortPlayer.PlayerData.metadata["ishandcuffed"] or EscortPlayer.PlayerData.metadata["isdead"] or
            EscortPlayer.PlayerData.metadata["inlaststand"] then
            TriggerClientEvent("police:client:GetKidnappedTarget", EscortPlayer.PlayerData.source, Player.PlayerData.source)
            TriggerClientEvent("police:client:GetKidnappedDragger", Player.PlayerData.source, EscortPlayer.PlayerData.source)
        else
            TriggerClientEvent('DGCore:Notify', src, "Civilian isn't cuffed or dead", 'error')
        end
    end
end)

RegisterNetEvent('police:server:SetPlayerOutVehicle', function(playerId)
    local src = source
    local Player = DGCore.Functions.GetPlayer(source)
    local EscortPlayer = DGCore.Functions.GetPlayer(playerId)
    if EscortPlayer then
        if EscortPlayer.PlayerData.metadata["ishandcuffed"] or EscortPlayer.PlayerData.metadata["isdead"] then
            TriggerClientEvent("police:client:SetOutVehicle", EscortPlayer.PlayerData.source)
        else
            TriggerClientEvent('DGCore:Notify', src, "Civilian isn't cuffed or dead", 'error')
        end
    end
end)

RegisterNetEvent('police:server:PutPlayerInVehicle', function(playerId)
    local src = source
    local EscortPlayer = DGCore.Functions.GetPlayer(playerId)
    if EscortPlayer then
        if EscortPlayer.PlayerData.metadata["ishandcuffed"] or EscortPlayer.PlayerData.metadata["isdead"] then
            TriggerClientEvent("police:client:PutInVehicle", EscortPlayer.PlayerData.source)
        else
           TriggerClientEvent('DGCore:Notify', src, "Civilian isn't cuffed or dead", 'error')
        end
    end
end)

RegisterNetEvent('police:server:JailPlayer', function(playerId, time)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local OtherPlayer = DGCore.Functions.GetPlayer(playerId)
    local currentDate = os.date("*t")
    if currentDate.day == 31 then
        currentDate.day = 30
    end

    if Player.PlayerData.job.name == "police" then
        if OtherPlayer then
            OtherPlayer.Functions.SetMetaData("injail", time)
            OtherPlayer.Functions.SetMetaData("criminalrecord", {
                ["hasRecord"] = true,
                ["date"] = currentDate
            })
            TriggerClientEvent("police:client:SendToJail", OtherPlayer.PlayerData.source, time)
            TriggerClientEvent('DGCore:Notify', src, "You sent the person to prison for " .. time .. " months")
        end
    end
end)

RegisterNetEvent('police:server:SetHandcuffStatus', function(isHandcuffed)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player then
        Player.Functions.SetMetaData("ishandcuffed", isHandcuffed)
    end
end)

RegisterNetEvent('heli:spotlight', function(state)
    local serverID = source
    TriggerClientEvent('heli:spotlight', -1, serverID, state)
end)

-- RegisterNetEvent('police:server:FlaggedPlateTriggered', function(camId, plate, street1, street2, blipSettings)
--     local src = source
--     for k, v in pairs(DGCore.Functions.GetPlayers()) do
--         local Player = DGCore.Functions.GetPlayer(v)
--         if Player then
--             if (Player.PlayerData.job.name == "police" and Player.PlayerData.job.onduty) then
--                 if street2 then
--                     TriggerClientEvent("112:client:SendPoliceAlert", v, "flagged", {
--                         camId = camId,
--                         plate = plate,
--                         streetLabel = street1 .. " " .. street2
--                     }, blipSettings)
--                 else
--                     TriggerClientEvent("112:client:SendPoliceAlert", v, "flagged", {
--                         camId = camId,
--                         plate = plate,
--                         streetLabel = street1
--                     }, blipSettings)
--                 end
--             end
--         end
--     end
-- end)

RegisterNetEvent('police:server:SearchPlayer', function(playerId)
    local src = source
    local SearchedPlayer = DGCore.Functions.GetPlayer(playerId)
    if SearchedPlayer then
				local cash = exports['dg-financials']:getCash(playerId)
        TriggerClientEvent('DGCore:Notify', src, ('Found $%d on the civilian'):format(cash))
        TriggerClientEvent('DGCore:Notify', SearchedPlayer.PlayerData.source, "You are being searched")
    end
end)

RegisterNetEvent('police:server:SeizeCash', function(playerId)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local SearchedPlayer = DGCore.Functions.GetPlayer(playerId)
    if SearchedPlayer then
        local moneyAmount = exports['dg-financials']:getCash(playerId)
        local info = { cash = moneyAmount }
				exports['dg-financials']:removeCash(playerId, moneyAmount, 'Police cash seized')
        Player.Functions.AddItem("moneybag", 1, false, info)
        TriggerClientEvent('inventory:client:ItemBox', src, "moneybag", "add")
        TriggerClientEvent('DGCore:Notify', SearchedPlayer.PlayerData.source, 'Your cash was confiscated')
    end
end)

RegisterNetEvent('police:server:SeizeDriverLicense', function(playerId)
    local src = source
    local SearchedPlayer = DGCore.Functions.GetPlayer(playerId)
    if SearchedPlayer then
        local driverLicense = SearchedPlayer.PlayerData.metadata["licences"]["driver"]
        if driverLicense then
            local licenses = {["driver"] = false, ["business"] = SearchedPlayer.PlayerData.metadata["licences"]["business"]}
            SearchedPlayer.Functions.SetMetaData("licences", licenses)
            TriggerClientEvent('DGCore:Notify', SearchedPlayer.PlayerData.source, 'Your driving license has been confiscated')
        else
            TriggerClientEvent('DGCore:Notify', src, 'No drivers license', 'error')
        end
    end
end)

RegisterNetEvent('police:server:RobPlayer', function(playerId)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local SearchedPlayer = DGCore.Functions.GetPlayer(playerId)
    if SearchedPlayer then
				local money = exports['dg-financials']:getCash(playerId)
				exprots['dg-financials']:addCash(src, money, ('Player %s robbed'):format(SearchedPlayer.PlayerData.name))
				exports['dg-financials']:removeCash(playerId, money, ('Player robbed by %s'):format(Player.PlayerData.name))
        TriggerClientEvent('DGCore:Notify', SearchedPlayer.PlayerData.source, "You have been robbed of $" .. money)
        TriggerClientEvent('DGCore:Notify', Player.PlayerData.source, "You have stolen $" .. money)
    end
end)

RegisterNetEvent('police:server:UpdateBlips', function()
    -- KEEP FOR REF BUT NOT NEEDED ANYMORE.
end)

RegisterNetEvent('police:server:spawnObject', function(type)
    local src = source
    local objectId = CreateObjectId()
    Objects[objectId] = type
    TriggerClientEvent("police:client:spawnObject", src, objectId, type, src)
end)

RegisterNetEvent('police:server:deleteObject', function(objectId)
    TriggerClientEvent('police:client:removeObject', -1, objectId)
end)

RegisterNetEvent('police:server:Impound', function(plate, fullImpound, price, body, engine, fuel)
    local src = source
    local price = price and price or 0
    if IsVehicleOwned(plate) then
        if not fullImpound then
            exports['dg-sql']:query(
                'UPDATE player_vehicles SET state = ?, depotprice = ?, body = ?, engine = ?, fuel = ? WHERE plate = ?',
                {0, price, body, engine, fuel, plate})
            TriggerClientEvent('DGCore:Notify', src, "Vehicle taken into depot for $" .. price .. "!")
        else
            exports['dg-sql']:query(
                'UPDATE player_vehicles SET state = ?, body = ?, engine = ?, fuel = ? WHERE plate = ?',
                {2, body, engine, fuel, plate})
            TriggerClientEvent('DGCore:Notify', src, "Vehicle seized")
        end
    end
end)

RegisterNetEvent('evidence:server:UpdateStatus', function(data)
    local src = source
    PlayerStatus[src] = data
end)

RegisterNetEvent('evidence:server:CreateBloodDrop', function(citizenid, bloodtype, coords)
    local bloodId = CreateBloodId()
    BloodDrops[bloodId] = {
        dna = citizenid,
        bloodtype = bloodtype
    }
    TriggerClientEvent("evidence:client:AddBlooddrop", -1, bloodId, citizenid, bloodtype, coords)
end)

RegisterNetEvent('evidence:server:CreateFingerDrop', function(coords)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local fingerId = CreateFingerId()
    FingerDrops[fingerId] = Player.PlayerData.metadata["fingerprint"]
    TriggerClientEvent("evidence:client:AddFingerPrint", -1, fingerId, Player.PlayerData.metadata["fingerprint"], coords)
end)

RegisterNetEvent('evidence:server:ClearBlooddrops', function(blooddropList)
    if blooddropList and next(blooddropList) then
        for k, v in pairs(blooddropList) do
            TriggerClientEvent("evidence:client:RemoveBlooddrop", -1, v)
            BloodDrops[v] = nil
        end
    end
end)

RegisterNetEvent('evidence:server:AddBlooddropToInventory', function(bloodId, bloodInfo)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.Functions.RemoveItem("empty_evidence_bag", 1) then
        if Player.Functions.AddItem("filled_evidence_bag", 1, false, bloodInfo) then
            TriggerClientEvent("inventory:client:ItemBox", src, "filled_evidence_bag", "add")
            TriggerClientEvent("evidence:client:RemoveBlooddrop", -1, bloodId)
            BloodDrops[bloodId] = nil
        end
    else
        TriggerClientEvent('DGCore:Notify', src, "You must have an empty evidence bag with you", "error")
    end
end)

RegisterNetEvent('evidence:server:AddFingerprintToInventory', function(fingerId, fingerInfo)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.Functions.RemoveItem("empty_evidence_bag", 1) then
        if Player.Functions.AddItem("filled_evidence_bag", 1, false, fingerInfo) then
            TriggerClientEvent("inventory:client:ItemBox", src, "filled_evidence_bag", "add")
            TriggerClientEvent("evidence:client:RemoveFingerprint", -1, fingerId)
            FingerDrops[fingerId] = nil
        end
    else
        TriggerClientEvent('DGCore:Notify', src, "You must have an empty evidence bag with you", "error")
    end
end)

RegisterNetEvent('evidence:server:CreateCasing', function(weapon, coords)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local casingId = CreateCasingId()
    local weaponInfo = exports["dg-inventory"]:GetItemData(weapon)
    local serieNumber = nil
    if weaponInfo then
        local weaponItem = Player.Functions.GetItemByName(weaponInfo["name"])
        if weaponItem then
            if weaponItem.info and weaponItem.info ~= "" then
                serieNumber = weaponItem.info.serie
            end
        end
    end
    TriggerClientEvent("evidence:client:AddCasing", -1, casingId, weapon, coords, serieNumber)
end)

RegisterNetEvent('police:server:UpdateCurrentCops', function()
    local amount = 0
    local players = DGCore.Functions.GetQBPlayers()
    for k, v in pairs(players) do
        if v.PlayerData.job.name == "police" and v.PlayerData.job.onduty then
            amount = amount + 1
        end
    end
    TriggerClientEvent("police:SetCopCount", -1, amount)
end)

RegisterNetEvent('evidence:server:ClearCasings', function(casingList)
    if casingList and next(casingList) then
        for k, v in pairs(casingList) do
            TriggerClientEvent("evidence:client:RemoveCasing", -1, v)
            Casings[v] = nil
        end
    end
end)

RegisterNetEvent('evidence:server:AddCasingToInventory', function(casingId, casingInfo)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    if Player.Functions.RemoveItem("empty_evidence_bag", 1) then
        if Player.Functions.AddItem("filled_evidence_bag", 1, false, casingInfo) then
            TriggerClientEvent("inventory:client:ItemBox", src, "filled_evidence_bag", "add")
            TriggerClientEvent("evidence:client:RemoveCasing", -1, casingId)
            Casings[casingId] = nil
        end
    else
        TriggerClientEvent('DGCore:Notify', src, "You must have an empty evidence bag with you", "error")
    end
end)

RegisterNetEvent('police:server:showFingerprint', function(playerId)
    local src = source
    TriggerClientEvent('police:client:showFingerprint', playerId, src)
    TriggerClientEvent('police:client:showFingerprint', src, playerId)
end)

RegisterNetEvent('police:server:showFingerprintId', function(sessionId)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    local fid = Player.PlayerData.metadata["fingerprint"]
    TriggerClientEvent('police:client:showFingerprintId', sessionId, fid)
    TriggerClientEvent('police:client:showFingerprintId', src, fid)
end)

RegisterNetEvent('police:server:SetTracker', function(targetId)
    local src = source
    local Target = DGCore.Functions.GetPlayer(targetId)
    local TrackerMeta = Target.PlayerData.metadata["tracker"]
    if TrackerMeta then
        Target.Functions.SetMetaData("tracker", false)
        TriggerClientEvent('DGCore:Notify', targetId, 'Your anklet is taken off.', 'error', 5000)
        TriggerClientEvent('DGCore:Notify', src, 'You took off an ankle bracelet from ' .. Target.PlayerData.charinfo.firstname .. " " .. Target.PlayerData.charinfo.lastname, 'error', 5000)
        TriggerClientEvent('police:client:SetTracker', targetId, false)
    else
        Target.Functions.SetMetaData("tracker", true)
        TriggerClientEvent('DGCore:Notify', targetId, 'You put on an ankle strap.', 'error', 5000)
        TriggerClientEvent('DGCore:Notify', src, 'You put on an ankle strap to ' .. Target.PlayerData.charinfo.firstname .. " " .. Target.PlayerData.charinfo.lastname, 'error', 5000)
        TriggerClientEvent('police:client:SetTracker', targetId, true)
    end
end)

RegisterNetEvent('police:server:SendTrackerLocation', function(coords, requestId)
    local Target = DGCore.Functions.GetPlayer(source)
    local msg = "The location of " .. Target.PlayerData.charinfo.firstname .. " " .. Target.PlayerData.charinfo.lastname .. " is marked on your map."
    local alertData = {
        title = "Anklet location",
        coords = {
            x = coords.x,
            y = coords.y,
            z = coords.z
        },
        description = msg
    }
    TriggerClientEvent("police:client:TrackerMessage", requestId, msg, coords)
		-- TODO add dispatch hook
end)

RegisterNetEvent('police:server:SyncSpikes', function(table)
    TriggerClientEvent('police:client:SyncSpikes', -1, table)
end)

-- Threads


Citizen.CreateThread(function()
    while true do
        Citizen.Wait(5000)
        UpdateBlips()
    end
end)

-- this NEEDS to be included when this script gets reworked, this is used in all other scripts to get current amount of cops on duty
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1000 * 60 * 10)
        local curCops = GetCurrentCops()
        TriggerClientEvent("police:SetCopCount", -1, curCops)
    end
end)

DGCore.Functions.CreateCallback('police:server:GetAmountOfCops', function()
    local amountOfCops = GetCurrentCops()
    cb(amountOfCops)
end)