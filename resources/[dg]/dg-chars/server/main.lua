local DGCore = exports['dg-core']:GetCoreObject()

-- Functions

local function GiveStarterItems(source)
    local src = source
    local Player = DGCore.Functions.GetPlayer(src)
    
    for k, v in pairs(DGCore.Shared.StarterItems) do
        local info = {}
        if v.item == "id_card" then
            info.citizenid = Player.PlayerData.citizenid
            info.firstname = Player.PlayerData.charinfo.firstname
            info.lastname = Player.PlayerData.charinfo.lastname
            info.birthdate = Player.PlayerData.charinfo.birthdate
            info.gender = Player.PlayerData.charinfo.gender
            info.nationality = Player.PlayerData.charinfo.nationality
        elseif v.item == "driver_license" then
            info.firstname = Player.PlayerData.charinfo.firstname
            info.lastname = Player.PlayerData.charinfo.lastname
            info.birthdate = Player.PlayerData.charinfo.birthdate
            info.type = "Categorie: B"
        end
        Player.Functions.AddItem(v.item, v.amount, false, info)
    end
end

local function loadHouseData()
    local HouseGarages = {}
    local Houses = {}
    local result = exports.oxmysql:executeSync('SELECT * FROM houselocations', {})
    if result[1] ~= nil then
        for k, v in pairs(result) do
            local owned = false
            if tonumber(v.owned) == 1 then
                owned = true
            end
            local garage = v.garage ~= nil and json.decode(v.garage) or {}
            Houses[v.name] = {
                coords = json.decode(v.coords),
                owned = v.owned,
                price = v.price,
                locked = true,
                adress = v.label, 
                tier = v.tier,
                garage = garage,
                decorations = {},
            }
            HouseGarages[v.name] = {
                label = v.label,
                takeVehicle = garage,
            }
        end
    end
    TriggerClientEvent("qb-garages:client:houseGarageConfig", -1, HouseGarages)
    TriggerClientEvent("qb-houses:client:setHouseConfig", -1, Houses)
end

-- Events

RegisterNetEvent('dg-char:server:disconnect', function()
    local src = source
    DropPlayer(src, "Disconnected van De Grens")
end)

RegisterNetEvent('dg-chars:server:loadUserData', function(citizenid)
    local src = source
    if DGCore.Player.Login(src, citizenid) then
        print('^2[dg-core]^7 '..GetPlayerName(src)..' (Citizen ID: '..citizenid..') has succesfully loaded!')
        DGCore.Commands.Refresh(src)
        loadHouseData()
				TriggerClientEvent('dg-spawn:client:setupSpawns', src, citizenid, false, nil)
				TriggerClientEvent('dg-spawn:client:openUI', src, true)
        TriggerEvent("qb-log:server:CreateLog", "joinleave", "Loaded", "green", "**".. GetPlayerName(src) .. "** ("..citizenid.." | "..src..") loaded..")
	end
end)

RegisterNetEvent('dg-chars:server:createCharacter', function(data)
    local src = source
    local newData = {}
    newData.cid = data.cid
    newData.charinfo = data
    print("Source:", src)
    if DGCore.Player.Login(src, false, newData) then
            local randbucket = (GetPlayerPed(src) .. math.random(1,999))
            SetPlayerRoutingBucket(src, randbucket)
            print('^2[qb-core]^7 '..GetPlayerName(src)..' has succesfully loaded!')
            DGCore.Commands.Refresh(src) 
            TriggerClientEvent('qb-clothes:client:CreateFirstCharacter', src)
            -- GiveStarterItems(src) 
	end



end)

RegisterNetEvent('dg-chars:server:readyToSpawn', function()
    local src = source
    TriggerClientEvent("dg-chars:client:closeNUI", src)
    GiveStarterItems(src)
    --TriggerEvent('dg-apartments:server:enterApartment', src)
    exports['dg-apartments']:enterApartment(src)
    
end)

RegisterNetEvent('dg-chars:server:deleteCharacter', function(citizenid)
    local src = source
    DGCore.Player.DeleteCharacter(src, citizenid)
end)

-- Callbacks

DGCore.Functions.CreateCallback("dg-chars:server:setupCharacters", function(source, cb)
    local license = DGCore.Functions.GetIdentifier(source, 'license')
    local plyChars = {}
    exports.oxmysql:execute('SELECT p.citizenid, p.cid, p.firstname, p.lastname, p.gender, p.job, p.birthdate, ps.model, ps.skin FROM players p JOIN playerskins ps ON p.citizenid = ps.citizenid WHERE license = ?', {license}, function(dbResult)
    --exports.oxmysql:execute('SELECT p.firstname, p.lastname FROM players p JOIN playerskins ps ON P.citizenid = ps.citizenid WHERE license = ?', {license}, function(dbResult)
        for i = 1, (#dbResult), 1 do
            plyChars[i] = {}
            plyChars[i].citizenid = dbResult[i].citizenid
            plyChars[i].cid = dbResult[i].cid
            plyChars[i].firstname = dbResult[i].firstname
            plyChars[i].lastname = dbResult[i].lastname
            plyChars[i].gender = dbResult[i].gender
            plyChars[i].birthdate = dbResult[i].birthdate
            plyChars[i].job = dbResult[i].job
            plyChars[i].model = dbResult[i].model
            plyChars[i].skin = dbResult[i].skin
        end
        cb(plyChars)
    end)
end)