DGCore.Players = {}
DGCore.Player = {}

-- On player login get their data or set defaults
-- Don't touch any of this unless you know what you are doing
-- Will cause major issues!

function DGCore.Player.Login(source, citizenid, newData)
    local src = source
    if src then
        if citizenid then
            local result = exports.oxmysql:executeSync('SELECT * FROM players WHERE citizenid = ?', { citizenid })
            local PlayerData = result[1]
            if PlayerData then
                PlayerData.money = json.decode(PlayerData.money)
                PlayerData.job = json.decode(PlayerData.job)
                PlayerData.position = json.decode(PlayerData.position)
                PlayerData.metadata = json.decode(PlayerData.metadata)
                --PlayerData.charinfo = json.decode(PlayerData.charinfo)

                PlayerData.charinfo = {}
                PlayerData.charinfo.firstname = PlayerData.firstname
                PlayerData.charinfo.lastname = PlayerData.lastname
                PlayerData.charinfo.birthdate = PlayerData.birthdate
                PlayerData.charinfo.gender = PlayerData.gender
                PlayerData.charinfo.backstory = PlayerData.backstory
                PlayerData.charinfo.nationality = PlayerData.nationality
                PlayerData.charinfo.phone = PlayerData.phone
                PlayerData.charinfo.account = PlayerData.account 


                if PlayerData.gang then
                    PlayerData.gang = json.decode(PlayerData.gang)
                else
                    PlayerData.gang = {}
                end
            end
            DGCore.Player.CheckPlayerData(src, PlayerData)
        else
            DGCore.Player.CheckPlayerData(src, newData)
        end
        return true
    else
        DGCore.ShowError(GetCurrentResourceName(), 'ERROR DGCORE.PLAYER.LOGIN - NO SOURCE GIVEN!')
        return false
    end
end


function DGCore.Player.CheckPlayerData(source, PlayerData)
    print('check toestand')
    local src = source
    PlayerData = PlayerData or {}
    PlayerData.source = src
    PlayerData.citizenid = PlayerData.citizenid or DGCore.Player.CreateCitizenId()
    PlayerData.license = PlayerData.license or DGCore.Functions.GetIdentifier(src, 'license')
    PlayerData.name = GetPlayerName(src)
    PlayerData.cid = PlayerData.cid or 1
    PlayerData.money = PlayerData.money or {}
    for moneytype, startamount in pairs(DGCore.Config.Money.MoneyTypes) do
        PlayerData.money[moneytype] = PlayerData.money[moneytype] or startamount
    end
    -- Charinfo
    PlayerData.charinfo = PlayerData.charinfo or {}
    PlayerData.charinfo.firstname = PlayerData.charinfo.firstname or 'Firstname'
    PlayerData.charinfo.lastname = PlayerData.charinfo.lastname or 'Lastname'
    PlayerData.charinfo.birthdate = PlayerData.charinfo.birthdate or '01-01-2000'
    PlayerData.charinfo.gender = PlayerData.charinfo.gender or 0
    PlayerData.charinfo.backstory = PlayerData.charinfo.backstory or 'Nietsnut in het leven'
    PlayerData.charinfo.nationality = PlayerData.charinfo.nationality or 'BELG'
    PlayerData.charinfo.phone = PlayerData.charinfo.phone ~= nil and PlayerData.charinfo.phone or '04' .. math.random(70, 99) .. math.random(11, 99) .. math.random(11, 99) .. math.random(11, 99)
    PlayerData.charinfo.account = PlayerData.charinfo.account ~= nil and PlayerData.charinfo.account or 'BE' .. math.random(11, 99) .. math.random(1111, 9999) .. math.random(1111, 9999) .. math.random(1111, 9999)
    -- Metadata
    PlayerData.metadata = PlayerData.metadata or {}
    PlayerData.metadata['hunger'] = PlayerData.metadata['hunger'] or 100
    PlayerData.metadata['thirst'] = PlayerData.metadata['thirst'] or 100
    PlayerData.metadata['stress'] = PlayerData.metadata['stress'] or 0
    PlayerData.metadata['isdead'] = PlayerData.metadata['isdead'] or false
    PlayerData.metadata['inlaststand'] = PlayerData.metadata['inlaststand'] or false
    PlayerData.metadata['armor'] = PlayerData.metadata['armor'] or 0
    PlayerData.metadata['ishandcuffed'] = PlayerData.metadata['ishandcuffed'] or false
    PlayerData.metadata['tracker'] = PlayerData.metadata['tracker'] or false
    PlayerData.metadata['injail'] = PlayerData.metadata['injail'] or 0
    PlayerData.metadata['jailitems'] = PlayerData.metadata['jailitems'] or {}
    PlayerData.metadata['status'] = PlayerData.metadata['status'] or {}
    PlayerData.metadata['phone'] = PlayerData.metadata['phone'] or {}
    PlayerData.metadata['fitbit'] = PlayerData.metadata['fitbit'] or {}
    PlayerData.metadata['commandbinds'] = PlayerData.metadata['commandbinds'] or {}
    PlayerData.metadata['bloodtype'] = PlayerData.metadata['bloodtype'] or DGCore.Config.Player.Bloodtypes[math.random(1, #DGCore.Config.Player.Bloodtypes)]
    PlayerData.metadata['dealerrep'] = PlayerData.metadata['dealerrep'] or 0
    PlayerData.metadata['craftingrep'] = PlayerData.metadata['craftingrep'] or 0
    PlayerData.metadata['attachmentcraftingrep'] = PlayerData.metadata['attachmentcraftingrep'] or 0
    PlayerData.metadata['currentapartment'] = PlayerData.metadata['currentapartment'] or nil
    PlayerData.metadata['jobrep'] = PlayerData.metadata['jobrep'] or {
        ['tow'] = 0,
        ['trucker'] = 0,
        ['taxi'] = 0,
        ['hotdog'] = 0,
    }
    PlayerData.metadata['callsign'] = PlayerData.metadata['callsign'] or 'NO CALLSIGN'
    PlayerData.metadata['fingerprint'] = PlayerData.metadata['fingerprint'] or DGCore.Player.CreateFingerId()
    PlayerData.metadata['walletid'] = PlayerData.metadata['walletid'] or DGCore.Player.CreateWalletId()
    PlayerData.metadata['criminalrecord'] = PlayerData.metadata['criminalrecord'] or {
        ['hasRecord'] = false,
        ['date'] = nil
    }
    PlayerData.metadata['licences'] = PlayerData.metadata['licences'] or {
        ['driver'] = true,
        ['business'] = false,
        ['weapon'] = false
    }
    PlayerData.metadata['inside'] = PlayerData.metadata['inside'] or {
        house = nil,
        apartment = {
            id = nil,
        }
    }
    PlayerData.metadata['phonedata'] = PlayerData.metadata['phonedata'] or {
        SerialNumber = DGCore.Player.CreateSerialNumber(),
        InstalledApps = {},
    }
    -- Job
    PlayerData.job = PlayerData.job or {}
    PlayerData.job.name = PlayerData.job.name or 'unemployed'
    PlayerData.job.label = PlayerData.job.label or 'Civilian'
    PlayerData.job.payment = PlayerData.job.payment or 10
    if DGCore.Shared.ForceJobDefaultDutyAtLogin or PlayerData.job.onduty == nil then
        PlayerData.job.onduty = DGCore.Shared.Jobs[PlayerData.job.name].defaultDuty
    end
    PlayerData.job.isboss = PlayerData.job.isboss or false
    PlayerData.job.grade = PlayerData.job.grade or {}
    PlayerData.job.grade.name = PlayerData.job.grade.name or 'Freelancer'
    PlayerData.job.grade.level = PlayerData.job.grade.level or 0
    -- Gang
    PlayerData.gang = PlayerData.gang or {}
    PlayerData.gang.name = PlayerData.gang.name or 'none'
    PlayerData.gang.label = PlayerData.gang.label or 'No Gang Affiliaton'
    PlayerData.gang.isboss = PlayerData.gang.isboss or false
    PlayerData.gang.grade = PlayerData.gang.grade or {}
    PlayerData.gang.grade.name = PlayerData.gang.grade.name or 'none'
    PlayerData.gang.grade.level = PlayerData.gang.grade.level or 0
    -- Other
    PlayerData.position = PlayerData.position or QBConfig.DefaultSpawn
    PlayerData.LoggedIn = true
    PlayerData = DGCore.Player.LoadInventory(PlayerData)
    DGCore.Player.CreatePlayer(PlayerData)
end

-- On player logout

function DGCore.Player.Logout(source)
    local src = source
    TriggerClientEvent('DGCore:Client:OnPlayerUnload', src)
		TriggerEvent('DGCore:Server:OnPlayerUnload', src)
    TriggerClientEvent('DGCore:Player:UpdatePlayerData', src)
    Citizen.Wait(200)
    DGCore.Players[src] = nil
end

-- Create a new character
-- Don't touch any of this unless you know what you are doing
-- Will cause major issues!

function DGCore.Player.CreatePlayer(PlayerData)
    local self = {}
    self.Functions = {}
    self.PlayerData = PlayerData

    self.Functions.UpdatePlayerData = function(dontUpdateChat)
		    if self.PlayerData.oldItems and type(self.PlayerData.oldItems) == 'table' and self.PlayerData.items and type(self.PlayerData.items) == 'table' then
	          local invDiff = DGCore.Shared.GetTableDiff(self.PlayerData.oldItems, self.PlayerData.items)
						if invDiff and invDiff.removed and invDiff.added and (#invDiff.removed > 0 or #invDiff.added > 0) then
					      TriggerEvent('DGCore:Server:OnInventoryUpdate', self.PlayerData.source, invDiff.removed, invDiff.added)
				    end
		    end
        TriggerClientEvent('DGCore:Player:SetPlayerData', self.PlayerData.source, self.PlayerData)
        if dontUpdateChat == nil then
            DGCore.Commands.Refresh(self.PlayerData.source)
        end
    end

    self.Functions.SetJob = function(job, grade)
        local job = job:lower()
        local grade = tostring(grade) or '0'

        if DGCore.Shared.Jobs[job] then
            self.PlayerData.job.name = job
            self.PlayerData.job.label = DGCore.Shared.Jobs[job].label
            self.PlayerData.job.onduty = DGCore.Shared.Jobs[job].defaultDuty

            if DGCore.Shared.Jobs[job].grades[grade] then
                local jobgrade = DGCore.Shared.Jobs[job].grades[grade]
                self.PlayerData.job.grade = {}
                self.PlayerData.job.grade.name = jobgrade.name
                self.PlayerData.job.grade.level = tonumber(grade)
                self.PlayerData.job.payment = jobgrade.payment or 30
                self.PlayerData.job.isboss = jobgrade.isboss or false
            else
                self.PlayerData.job.grade = {}
                self.PlayerData.job.grade.name = 'No Grades'
                self.PlayerData.job.grade.level = 0
                self.PlayerData.job.payment = 30
                self.PlayerData.job.isboss = false
            end

            self.Functions.UpdatePlayerData()
            TriggerClientEvent('DGCore:Client:OnJobUpdate', self.PlayerData.source, self.PlayerData.job)
            return true
        end

        return false
    end

    self.Functions.SetGang = function(gang, grade)
        local gang = gang:lower()
        local grade = tostring(grade) or '0'

        if DGCore.Shared.Gangs[gang] then
            self.PlayerData.gang.name = gang
            self.PlayerData.gang.label = DGCore.Shared.Gangs[gang].label
            if DGCore.Shared.Gangs[gang].grades[grade] then
                local ganggrade = DGCore.Shared.Gangs[gang].grades[grade]
                self.PlayerData.gang.grade = {}
                self.PlayerData.gang.grade.name = ganggrade.name
                self.PlayerData.gang.grade.level = tonumber(grade)
                self.PlayerData.gang.isboss = ganggrade.isboss or false
            else
                self.PlayerData.gang.grade = {}
                self.PlayerData.gang.grade.name = 'No Grades'
                self.PlayerData.gang.grade.level = 0
                self.PlayerData.gang.isboss = false
            end

            self.Functions.UpdatePlayerData()
            TriggerClientEvent('DGCore:Client:OnGangUpdate', self.PlayerData.source, self.PlayerData.gang)
            return true
        end
        return false
    end

    self.Functions.SetJobDuty = function(onDuty)
        self.PlayerData.job.onduty = onDuty
        self.Functions.UpdatePlayerData()
    end

    self.Functions.SetMetaData = function(meta, val)
        local meta = meta:lower()
        if val ~= nil then
            self.PlayerData.metadata[meta] = val
            self.Functions.UpdatePlayerData()
        end
    end

    self.Functions.AddJobReputation = function(amount)
        local amount = tonumber(amount)
        self.PlayerData.metadata['jobrep'][self.PlayerData.job.name] = self.PlayerData.metadata['jobrep'][self.PlayerData.job.name] + amount
        self.Functions.UpdatePlayerData()
    end

    self.Functions.AddMoney = function(moneytype, amount, reason)
        reason = reason or 'unknown'
        local moneytype = moneytype:lower()
        local amount = tonumber(amount)
        if amount < 0 then
            return
        end
        if self.PlayerData.money[moneytype] then
            self.PlayerData.money[moneytype] = self.PlayerData.money[moneytype] + amount
            self.Functions.UpdatePlayerData()
            if amount > 100000 then
                TriggerEvent('qb-log:server:CreateLog', 'playermoney', 'AddMoney', 'lightgreen', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** $' .. amount .. ' (' .. moneytype .. ') added, new ' .. moneytype .. ' balance: ' .. self.PlayerData.money[moneytype], true)
            else
                TriggerEvent('qb-log:server:CreateLog', 'playermoney', 'AddMoney', 'lightgreen', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** $' .. amount .. ' (' .. moneytype .. ') added, new ' .. moneytype .. ' balance: ' .. self.PlayerData.money[moneytype])
            end
            TriggerClientEvent('hud:client:OnMoneyChange', self.PlayerData.source, moneytype, amount, false)
            return true
        end
        return false
    end

    self.Functions.RemoveMoney = function(moneytype, amount, reason)
        reason = reason or 'unknown'
        local moneytype = moneytype:lower()
        local amount = tonumber(amount)
        if amount < 0 then
            return
        end
        if self.PlayerData.money[moneytype] then
            for _, mtype in pairs(DGCore.Config.Money.DontAllowMinus) do
                if mtype == moneytype then
                    if self.PlayerData.money[moneytype] - amount < 0 then
                        return false
                    end
                end
            end
            self.PlayerData.money[moneytype] = self.PlayerData.money[moneytype] - amount
            self.Functions.UpdatePlayerData()
            if amount > 100000 then
                TriggerEvent('qb-log:server:CreateLog', 'playermoney', 'RemoveMoney', 'red', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** $' .. amount .. ' (' .. moneytype .. ') removed, new ' .. moneytype .. ' balance: ' .. self.PlayerData.money[moneytype], true)
            else
                TriggerEvent('qb-log:server:CreateLog', 'playermoney', 'RemoveMoney', 'red', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** $' .. amount .. ' (' .. moneytype .. ') removed, new ' .. moneytype .. ' balance: ' .. self.PlayerData.money[moneytype])
            end
            TriggerClientEvent('hud:client:OnMoneyChange', self.PlayerData.source, moneytype, amount, true)
            return true
        end
        return false
    end 

    self.Functions.SetMoney = function(moneytype, amount, reason)
        reason = reason or 'unknown'
        local moneytype = moneytype:lower()
        local amount = tonumber(amount)
        if amount < 0 then
            return
        end
        if self.PlayerData.money[moneytype] then
            self.PlayerData.money[moneytype] = amount
            self.Functions.UpdatePlayerData()
            TriggerEvent('qb-log:server:CreateLog', 'playermoney', 'SetMoney', 'green', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** $' .. amount .. ' (' .. moneytype .. ') set, new ' .. moneytype .. ' balance: ' .. self.PlayerData.money[moneytype])
            return true
        end
        return false
    end

    self.Functions.GetMoney = function(moneytype)
        if moneytype then
            local moneytype = moneytype:lower()
            return self.PlayerData.money[moneytype]
        end
        return false
    end

    self.Functions.AddItem = function(item, amount, slot, info, quality, createtime)
        local totalWeight = DGCore.Player.GetTotalWeight(self.PlayerData.items)
        local itemInfo = exports["dg-inventory"]:GetItemData(item:lower())
        if itemInfo == nil then
            TriggerClientEvent('DGCore:Notify', self.PlayerData.source, 'Item Does Not Exist', 'error')
            return
        end

        local amount = tonumber(amount)
        local slot = tonumber(slot) or DGCore.Player.GetFirstSlotByItem(self.PlayerData.items, item)
        local quality = tonumber(quality) or 100

        local createtime = tonumber(createtime) or os.time()

        if itemInfo['type'] == 'weapon' and info == nil then
            info = {
                serie = tostring(DGCore.Shared.RandomInt(2) .. DGCore.Shared.RandomStr(3) .. DGCore.Shared.RandomInt(1) .. DGCore.Shared.RandomStr(2) .. DGCore.Shared.RandomInt(3) .. DGCore.Shared.RandomStr(4)),
            }
        end

        if (totalWeight + (itemInfo['weight'] * amount)) <= DGCore.Config.Player.MaxWeight then
            if (slot and self.PlayerData.items[slot]) and (self.PlayerData.items[slot].name:lower() == item:lower()) and (itemInfo['type'] == 'item' and itemInfo['stackable']) then
                self.PlayerData.items[slot].amount = self.PlayerData.items[slot].amount + amount
                self.Functions.UpdatePlayerData()
                TriggerEvent('qb-log:server:CreateLog', 'playerinventory', 'AddItem', 'green', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** got item: [slot:' .. slot .. '], itemname: ' .. self.PlayerData.items[slot].name .. ', added amount: ' .. amount .. ', new total amount: ' .. self.PlayerData.items[slot].amount)
                return true
            elseif (itemInfo['stackable'] and slot or slot and self.PlayerData.items[slot] == nil) then
                self.PlayerData.items[slot] = { 
                    name = itemInfo['name'], 
                    label = itemInfo['label'], 
                    weight = itemInfo['weight'], 
                    type = itemInfo['type'], 
                    ammotype = itemInfo['ammotype'], 
                    stackable = itemInfo['stackable'], 
                    useable = itemInfo['useable'], 
                    shouldClose = itemInfo['shouldClose'],
                    combinable = itemInfo['combinable'], 
                    decayrate = itemInfo["decayrate"], 
                    image = itemInfo['image'], 
                    description = itemInfo['description'] or '',
                    slot = slot,  
                    amount = amount, 
                    info = info or {}, 
                    quality = quality,
                    createtime = createtime,
                }
                self.Functions.UpdatePlayerData()
                TriggerEvent('qb-log:server:CreateLog', 'playerinventory', 'AddItem', 'green', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** got item: [slot:' .. slot .. '], itemname: ' .. self.PlayerData.items[slot].name .. ', added amount: ' .. amount .. ', new total amount: ' .. self.PlayerData.items[slot].amount)
                return true
            elseif (not itemInfo['stackable']) or (not slot or slot == nil) or (itemInfo['type'] == 'weapon') then
                for i = 1, QBConfig.Player.MaxInvSlots, 1 do
                    if self.PlayerData.items[i] == nil then
                        self.PlayerData.items[i] = { 
                            name = itemInfo['name'], 
                            label = itemInfo['label'], 
                            weight = itemInfo['weight'], 
                            type = itemInfo['type'], 
                            ammotype = itemInfo['ammotype'], 
                            stackable = itemInfo['stackable'], 
                            useable = itemInfo['useable'], 
                            shouldClose = itemInfo['shouldClose'], 
                            combinable = itemInfo['combinable'], 
                            decayrate = itemInfo["decayrate"], 
                            image = itemInfo['image'], 
                            description = itemInfo['description'] or '', 
                            slot = i, 
                            amount = amount, 
                            info = info or {}, 
                            quality = quality,
                            createtime = createtime,
                        }
                        self.Functions.UpdatePlayerData()
                        TriggerEvent('qb-log:server:CreateLog', 'playerinventory', 'AddItem', 'green', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** got item: [slot:' .. i .. '], itemname: ' .. self.PlayerData.items[i].name .. ', added amount: ' .. amount .. ', new total amount: ' .. self.PlayerData.items[i].amount)
                        --TriggerClientEvent('DGCore:Notify', self.PlayerData.source, itemInfo['label'].. ' toegevoegd!', 'success')
                        return true
                    end
                end
            end
        else
            TriggerClientEvent('DGCore:Notify', self.PlayerData.source, 'Your inventory is too heavy!', 'error')
        end
        return false
    end

    self.Functions.RemoveItem = function(item, amount, slot)
        local amount = tonumber(amount)
        local slot = tonumber(slot)
        if slot then
            if self.PlayerData.items[slot].amount > amount then
                self.PlayerData.items[slot].amount = self.PlayerData.items[slot].amount - amount
                self.Functions.UpdatePlayerData()
                TriggerEvent('qb-log:server:CreateLog', 'playerinventory', 'RemoveItem', 'red', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** lost item: [slot:' .. slot .. '], itemname: ' .. self.PlayerData.items[slot].name .. ', removed amount: ' .. amount .. ', new total amount: ' .. self.PlayerData.items[slot].amount)
                return true
            else
                self.PlayerData.items[slot] = nil
                self.Functions.UpdatePlayerData()
                TriggerEvent('qb-log:server:CreateLog', 'playerinventory', 'RemoveItem', 'red', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** lost item: [slot:' .. slot .. '], itemname: ' .. item .. ', removed amount: ' .. amount .. ', item removed')
                return true
            end
        else
            local slots = DGCore.Player.GetSlotsByItem(self.PlayerData.items, item)
            local amountToRemove = amount
            if slots then
                for _, slot in pairs(slots) do
                    if self.PlayerData.items[slot].amount > amountToRemove then
                        self.PlayerData.items[slot].amount = self.PlayerData.items[slot].amount - amountToRemove
                        self.Functions.UpdatePlayerData()
                        TriggerEvent('qb-log:server:CreateLog', 'playerinventory', 'RemoveItem', 'red', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** lost item: [slot:' .. slot .. '], itemname: ' .. self.PlayerData.items[slot].name .. ', removed amount: ' .. amount .. ', new total amount: ' .. self.PlayerData.items[slot].amount)
                        return true
                    elseif self.PlayerData.items[slot].amount == amountToRemove then
                        self.PlayerData.items[slot] = nil
                        self.Functions.UpdatePlayerData()
                        TriggerEvent('qb-log:server:CreateLog', 'playerinventory', 'RemoveItem', 'red', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** lost item: [slot:' .. slot .. '], itemname: ' .. item .. ', removed amount: ' .. amount .. ', item removed')
                        return true
                    end
                end
            end
        end
        return false
    end

    self.Functions.SetInventory = function(items, dontUpdateChat)
				self.PlayerData.oldItems = json.decode(json.encode(self.PlayerData.items))
        self.PlayerData.items = items
        self.Functions.UpdatePlayerData(dontUpdateChat)
        TriggerEvent('qb-log:server:CreateLog', 'playerinventory', 'SetInventory', 'blue', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** items set: ' .. json.encode(items))
    end

    self.Functions.ClearInventory = function()
		    self.PlayerData.oldItems = json.decode(json.encode(self.PlayerData.items))
				self.PlayerData.items = {}
		    self.Functions.UpdatePlayerData()
		    TriggerEvent('qb-log:server:CreateLog', 'playerinventory', 'ClearInventory', 'red', '**' .. GetPlayerName(self.PlayerData.source) .. ' (citizenid: ' .. self.PlayerData.citizenid .. ' | id: ' .. self.PlayerData.source .. ')** inventory cleared')
    end

    self.Functions.GetItemByName = function(item)
        local item = tostring(item):lower()
        local slot = DGCore.Player.GetFirstSlotByItem(self.PlayerData.items, item)
        if slot then
            return self.PlayerData.items[slot]
        end
        return nil
    end

    self.Functions.GetItemsByName = function(item)
        local item = tostring(item):lower()
        local items = {}
        local slots = DGCore.Player.GetSlotsByItem(self.PlayerData.items, item)
        for _, slot in pairs(slots) do
            if slot then
                table.insert(items, self.PlayerData.items[slot])
            end
        end
        return items
    end

    self.Functions.SetCreditCard = function(cardNumber)
        self.PlayerData.charinfo.card = cardNumber
        self.Functions.UpdatePlayerData()
    end

    self.Functions.GetCardSlot = function(cardNumber, cardType)
        local item = tostring(cardType):lower()
        local slots = DGCore.Player.GetSlotsByItem(self.PlayerData.items, item)
        for _, slot in pairs(slots) do
            if slot then
                if self.PlayerData.items[slot].info.cardNumber == cardNumber then
                    return slot
                end
            end
        end
        return nil
    end

    self.Functions.GetItemBySlot = function(slot)
        local slot = tonumber(slot)
        if self.PlayerData.items[slot] then
            return self.PlayerData.items[slot]
        end
        return nil
    end

    self.Functions.Save = function()
        DGCore.Player.Save(self.PlayerData.source)
    end

    DGCore.Players[self.PlayerData.source] = self
    DGCore.Player.Save(self.PlayerData.source)

    -- At this point we are safe to emit new instance to third party resource for load handling
    TriggerEvent('DGCore:Server:PlayerLoaded', self)
    self.Functions.UpdatePlayerData()
end

-- Save player info to database (make sure citizenid is the primary key in your database)

function DGCore.Player.Save(source)
    local src = source
    local ped = GetPlayerPed(src)
    local pcoords = GetEntityCoords(ped)
    local PlayerData = DGCore.Players[src].PlayerData
    if PlayerData then
        exports.oxmysql:insert('INSERT INTO players (citizenid, cid, license, name, money, firstname, lastname, birthdate, gender, backstory, nationality, phone, account, job, gang, position, metadata) VALUES (:citizenid, :cid, :license, :name, :money, :firstname, :lastname, :birthdate, :gender, :backstory, :nationality, :phone, :account, :job, :gang, :position, :metadata) ON DUPLICATE KEY UPDATE cid = :cid, name = :name, money = :money, firstname = :firstname, lastname = :lastname, birthdate = :birthdate, gender = :gender, backstory = :backstory, nationality = :nationality, phone = :phone, account = :account, job = :job, gang = :gang, position = :position, metadata = :metadata', {
            citizenid = PlayerData.citizenid,
            cid = tonumber(PlayerData.cid),
            license = PlayerData.license,
            name = PlayerData.name,
            money = json.encode(PlayerData.money),
            charinfo = json.encode(PlayerData.charinfo),
            job = json.encode(PlayerData.job),
            gang = json.encode(PlayerData.gang),
            position = json.encode(pcoords),
            metadata = json.encode(PlayerData.metadata),

            firstname = PlayerData.charinfo.firstname,
            lastname = PlayerData.charinfo.lastname,
            birthdate = PlayerData.charinfo.birthdate,
            gender = PlayerData.charinfo.gender,
            backstory = PlayerData.charinfo.backstory,
            nationality = PlayerData.charinfo.nationality,
            phone = PlayerData.charinfo.phone,
            account = PlayerData.charinfo.account,
        })
        DGCore.Player.SaveInventory(src)
        DGCore.ShowSuccess(GetCurrentResourceName(), PlayerData.name .. ' PLAYER SAVED!')
    else
        DGCore.ShowError(GetCurrentResourceName(), 'ERROR DGCore.PLAYER.SAVE - PLAYERDATA IS EMPTY!')
    end
end

-- Delete character

local playertables = { -- Add tables as needed
    { table = 'players' },
    { table = 'apartments' },
    { table = 'bank_accounts' },
    { table = 'crypto_transactions' },
    { table = 'phone_invoices' },
    { table = 'phone_messages' },
    { table = 'playerskins' },
    { table = 'player_boats' },
    { table = 'player_contacts' },
    { table = 'player_houses' },
    { table = 'player_mails' },
    { table = 'player_outfits' },
    { table = 'player_vehicles' }
}

function DGCore.Player.DeleteCharacter(source, citizenid)
    local src = source
    local license = DGCore.Functions.GetIdentifier(src, 'license')
    local result = exports.oxmysql:scalarSync('SELECT license FROM players where citizenid = ?', { citizenid })
    if license == result then
        for k, v in pairs(playertables) do
            exports.oxmysql:execute('DELETE FROM ' .. v.table .. ' WHERE citizenid = ?', { citizenid })
        end
        TriggerEvent('qb-log:server:CreateLog', 'joinleave', 'Character Deleted', 'red', '**' .. GetPlayerName(src) .. '** ' .. license .. ' deleted **' .. citizenid .. '**..')
    else
        DropPlayer(src, 'You Have Been Kicked For Exploitation')
        TriggerEvent('qb-log:server:CreateLog', 'anticheat', 'Anti-Cheat', 'white', GetPlayerName(src) .. ' Has Been Dropped For Character Deletion Exploit', false)
    end
end

-- Inventory

DGCore.Player.LoadInventory = function(PlayerData)
    PlayerData.items = {}
	local items = exports.oxmysql:executeSync(
        [[
        SELECT slot, name, info, amount, quality, createtime
        FROM inventoryitems 
        WHERE inventorytype = :inventorytype AND inventoryid = :inventoryid
        ]], {
        ["inventorytype"] = "player",
        ["inventoryid"] = PlayerData.citizenid,
    })

    if items then
        for _, item in pairs(items) do
            if item then
                local itemInfo = exports["dg-inventory"]:GetItemData(item.name:lower())
                if itemInfo then
                    PlayerData.items[item.slot] = {
                        name = itemInfo['name'],
                        label = itemInfo['label'],
                        weight = itemInfo['weight'],
                        type = itemInfo['type'],
                        ammotype = itemInfo['ammotype'],
                        stackable = itemInfo['stackable'],
                        useable = itemInfo['useable'],
                        shouldClose = itemInfo['shouldClose'],
                        combinable = itemInfo['combinable'],
                        decayrate = itemInfo['decayrate'],
                        image = itemInfo['image'],
                        description = itemInfo['description'] or '',
                        amount = tonumber(item.amount),
                        slot = tonumber(item.slot),
                        info = json.decode(item.info) or {},
                        quality = tonumber(item.quality),
                        createtime = tonumber(item.createtime),
                    }
                end
            end
        end
    end
		PlayerData.oldItems = json.decode(json.encode(PlayerData.items))
    return PlayerData
end

DGCore.Player.SaveInventory = function(source)
    local src = source
    if DGCore.Players[src] then
        local PlayerData = DGCore.Players[src].PlayerData
        local items = PlayerData.items
				local oldItems = PlayerData.oldItems
        if items and oldItems then
		        local diff = DGCore.Shared.GetTableDiff(oldItems, items)
	          if #diff.removed == 0 and #diff.added == 0 then return end
            exports.oxmysql:executeSync(
                [[
                DELETE FROM inventoryitems
                WHERE inventorytype = :inventorytype AND inventoryid = :inventoryid
                ]], {
                ["inventorytype"] = "player",
                ["inventoryid"] = PlayerData.citizenid,
            })  

            for slot, item in pairs(items) do
                if items[slot] then
                    exports.oxmysql:execute(
                        [[
                        INSERT INTO inventoryitems (inventorytype, inventoryid, slot, name, info, amount, quality, createtime) 
                        VALUES (:inventorytype, :inventoryid, :slot, :name, :info, :amount, :quality, :createtime) 
                        ]], {
                        ["inventorytype"] = "player",
                        ["inventoryid"] = PlayerData.citizenid,
                        ["slot"] = item.slot,
                        ["name"] = item.name,
                        ["info"] = json.encode(item.info) or {},
                        ["amount"] = item.amount,
                        ["quality"] = item.quality,
                        ["createtime"] = item.createtime,
                    })
                end
        	end
        end
	      DGCore.Players[src].PlayerData.oldItems = json.decode(json.encode(PlayerData.items))
    end
end

-- Util Functions

function DGCore.Player.GetTotalWeight(items)
    local weight = 0
    if items then
        for slot, item in pairs(items) do
            weight = weight + (item.weight * item.amount)
        end
    end
    return tonumber(weight)
end

function DGCore.Player.GetSlotsByItem(items, itemName)
    local slotsFound = {}
    if items then
        for slot, item in pairs(items) do
            if item.name:lower() == itemName:lower() then
                table.insert(slotsFound, slot)
            end
        end
    end
    return slotsFound
end

function DGCore.Player.GetFirstSlotByItem(items, itemName)
    if items then
        for slot, item in pairs(items) do
            if item.name:lower() == itemName:lower() then
                return tonumber(slot)
            end
        end
    end
    return nil
end

function DGCore.Player.CreateCitizenId()
    local UniqueFound = false
    local CitizenId = nil
    while not UniqueFound do
        CitizenId = tostring(DGCore.Shared.RandomStr(3) .. DGCore.Shared.RandomInt(5)):upper()
        local result = exports.oxmysql:executeSync('SELECT COUNT(*) as count FROM players WHERE citizenid = ?', { CitizenId })
        if result[1].count == 0 then
            UniqueFound = true
        end
    end
    return CitizenId
end

function DGCore.Player.CreateFingerId()
    local UniqueFound = false
    local FingerId = nil
    while not UniqueFound do
        FingerId = tostring(DGCore.Shared.RandomStr(2) .. DGCore.Shared.RandomInt(3) .. DGCore.Shared.RandomStr(1) .. DGCore.Shared.RandomInt(2) .. DGCore.Shared.RandomStr(3) .. DGCore.Shared.RandomInt(4))
        local query = '%' .. FingerId .. '%'
        local result = exports.oxmysql:executeSync('SELECT COUNT(*) as count FROM `players` WHERE `metadata` LIKE ?', { query })
        if result[1].count == 0 then
            UniqueFound = true
        end
    end
    return FingerId
end

function DGCore.Player.CreateWalletId()
    local UniqueFound = false
    local WalletId = nil
    while not UniqueFound do
        WalletId = 'DG-' .. math.random(11111111, 99999999)
        local query = '%' .. WalletId .. '%'
        local result = exports.oxmysql:executeSync('SELECT COUNT(*) as count FROM players WHERE metadata LIKE ?', { query })
        if result[1].count == 0 then
            UniqueFound = true
        end
    end
    return WalletId
end

function DGCore.Player.CreateSerialNumber()
    local UniqueFound = false
    local SerialNumber = nil
    while not UniqueFound do
        SerialNumber = math.random(11111111, 99999999)
        local query = '%' .. SerialNumber .. '%'
        local result = exports.oxmysql:executeSync('SELECT COUNT(*) as count FROM players WHERE metadata LIKE ?', { query })
        if result[1].count == 0 then
            UniqueFound = true
        end
    end
    return SerialNumber
end

PaycheckLoop() -- This just starts the paycheck system
