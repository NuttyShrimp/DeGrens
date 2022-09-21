local PlayerInjuries = {}
local PlayerWeaponWounds = {}
local DGCore = exports['dg-core']:GetCoreObject()
-- Events

-- Compatibility with txAdmin Menu's heal options.
-- This is a admin only server side event that will pass the target player id.
-- (This can also contain -1)
AddEventHandler('txAdmin:healedPlayer', function(targetId)
	TriggerClientEvent('hospital:client:Revive', targetId)
	TriggerClientEvent("hospital:client:HealInjuries", targetId, "full")
end)

RegisterNetEvent('hospital:server:SendToBed', function(bedId, isRevive)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local citizenid = Player.PlayerData.citizenid
	TriggerClientEvent('hospital:client:SendToBed', src, bedId, Config.Locations["beds"][bedId], isRevive)
	TriggerClientEvent('hospital:client:SetBed', -1, bedId, true)
	local accountId = exports['dg-financials']:getDefaultAccountId(citizenid)
	exports['dg-financials']:transfer(accountId, 'BE3', citizenid, citizenid, price, 'AZDG: Hospitaalkosten')
	TriggerEvent('qb-bossmenu:server:addAccountMoney', "ambulance", Config.BillCost)
	TriggerClientEvent('hospital:client:SendBillEmail', src, Config.BillCost)
end)

RegisterNetEvent('hospital:server:RespawnAtHospital', function()
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local citizenid = Player.PlayerData.citizenid
	for k, v in pairs(Config.Locations["beds"]) do
		TriggerClientEvent('hospital:client:SendToBed', src, k, v, true)
		TriggerClientEvent('hospital:client:SetBed', -1, k, true)
		if Config.WipeInventoryOnRespawn then
      -- TODO: clear inventory
			TriggerClientEvent('DGCore:Notify', src, 'All your possessions have been taken..', 'error')
		end
		local accountId = exports['dg-financials']:getDefaultAccountId(citizenid)
		exports['dg-financials']:transfer(accountId, 'BE3', citizenid, citizenid, price, 'AZDG: Hospitaalkosten')
		TriggerEvent('qb-bossmenu:server:addAccountMoney', "ambulance", Config.BillCost)
		TriggerClientEvent('hospital:client:SendBillEmail', src, Config.BillCost)
		return
	end
end)

RegisterNetEvent('hospital:server:ambulanceAlert', function(text)
    local src = source
    local ped = GetPlayerPed(src)
    local coords = GetEntityCoords(ped)
    local players = DGCore.Functions.GetQBPlayers()
    for k,v in pairs(players) do
        if v.PlayerData.job.name == 'ambulance' and v.PlayerData.job.onduty then
            TriggerClientEvent('hospital:client:ambulanceAlert', v.PlayerData.source, coords, text)
        end
    end
end)

RegisterNetEvent('hospital:server:LeaveBed', function(id)
    TriggerClientEvent('hospital:client:SetBed', -1, id, false)
end)

RegisterNetEvent('hospital:server:SyncInjuries', function(data)
    local src = source
    PlayerInjuries[src] = data
end)


RegisterNetEvent('hospital:server:SetWeaponDamage', function(data)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	if Player then
		PlayerWeaponWounds[Player.PlayerData.source] = data
	end
end)

RegisterNetEvent('hospital:server:RestoreWeaponDamage', function()
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	PlayerWeaponWounds[Player.PlayerData.source] = nil
end)

RegisterNetEvent('hospital:server:SetDeathStatus', function(isDead)
	local src = source
	local player = DGCore.Functions.GetPlayer(src)
	if player then
		player.Functions.SetMetaData("isdead", isDead)
    Player(src).state:set('isDead', isDead, true)
	end
end)

RegisterNetEvent('hospital:server:SetLaststandStatus', function(bool)
	local src = source
	local player = DGCore.Functions.GetPlayer(src)
	if player then
		player.Functions.SetMetaData("inlaststand", bool)
    Player(src).state:set('inLaststand', bool, true)
	end
end)

RegisterNetEvent('hospital:server:SetArmor', function(amount)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	if Player then
		Player.Functions.SetMetaData("armor", amount)
	end
end)

RegisterNetEvent('hospital:server:TreatWounds', function(playerId)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local Patient = DGCore.Functions.GetPlayer(playerId)
	if Patient then
		if Player.PlayerData.job.name =="ambulance" then
			Player.Functions.RemoveItem('bandage', 1)
			TriggerClientEvent("hospital:client:HealInjuries", Patient.PlayerData.source, "full")
		end
	end
end)

RegisterNetEvent('hospital:server:SetDoctor', function()
	local amount = 0
    local players = DGCore.Functions.GetQBPlayers()
    for k,v in pairs(players) do
        if v.PlayerData.job.name == 'ambulance' and v.PlayerData.job.onduty then
            amount = amount + 1
        end
	end
	TriggerClientEvent("hospital:client:SetDoctorCount", -1, amount)
end)

RegisterNetEvent('hospital:server:RevivePlayer', function(playerId, isOldMan)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	local Patient = DGCore.Functions.GetPlayer(playerId)
	local oldMan = isOldMan or false
	if Patient then
		if oldMan then
			if exports['dg-financials']:removeCash(src, 5000, 'Revived player at old man') then
				Player.Functions.RemoveItem('firstaid', 1)
				TriggerClientEvent('hospital:client:Revive', Patient.PlayerData.source)
			else
				TriggerClientEvent('DGCore:Notify', src, "You don\'t have enough money on you..", "error")
			end
		else
			Player.Functions.RemoveItem('firstaid', 1)
			TriggerClientEvent('hospital:client:Revive', Patient.PlayerData.source)
		end
	end
end)

RegisterNetEvent('hospital:server:SendDoctorAlert', function()
    local players = DGCore.Functions.GetQBPlayers()
    for k,v in pairs(players) do
        if v.PlayerData.job.name == 'ambulance' and v.PlayerData.job.onduty then
			TriggerClientEvent('DGCore:Notify', v.PlayerData.source, 'A doctor is needed at Pillbox Hospital', 'ambulance')
		end
	end
end)

RegisterNetEvent('hospital:server:UseFirstAid', function(targetId)
	local src = source
	local Target = DGCore.Functions.GetPlayer(targetId)
	if Target then
		TriggerClientEvent('hospital:client:CanHelp', targetId, src)
	end
end)

RegisterNetEvent('hospital:server:CanHelp', function(helperId, canHelp)
	local src = source
	if canHelp then
		TriggerClientEvent('hospital:client:HelpPerson', helperId, src)
	else
		TriggerClientEvent('DGCore:Notify', helperId, "You can\'t help this person..", "error")
	end
end)

-- Callbacks

DGCore.Functions.CreateCallback('hospital:GetDoctors', function(source, cb)
	local amount = 0
    local players = DGCore.Functions.GetQBPlayers()
    for k,v in pairs(players) do
        if v.PlayerData.job.name == 'ambulance' and v.PlayerData.job.onduty then
			amount = amount + 1
		end
	end
	cb(amount)
end)

DGCore.Functions.CreateCallback('hospital:GetPlayerStatus', function(source, cb, playerId)
	local Player = DGCore.Functions.GetPlayer(playerId)
	local injuries = {}
	injuries["WEAPONWOUNDS"] = {}
	if Player then
		if PlayerInjuries[Player.PlayerData.source] then
			if (PlayerInjuries[Player.PlayerData.source].isBleeding > 0) then
				injuries["BLEED"] = PlayerInjuries[Player.PlayerData.source].isBleeding
			end
			for k, v in pairs(PlayerInjuries[Player.PlayerData.source].limbs) do
				if PlayerInjuries[Player.PlayerData.source].limbs[k].isDamaged then
					injuries[k] = PlayerInjuries[Player.PlayerData.source].limbs[k]
				end
			end
		end
		if PlayerWeaponWounds[Player.PlayerData.source] then
			for k, v in pairs(PlayerWeaponWounds[Player.PlayerData.source]) do
				injuries["WEAPONWOUNDS"][k] = v
			end
		end
	end
    cb(injuries)
end)

DGCore.Functions.CreateCallback('hospital:GetPlayerBleeding', function(source, cb)
	local src = source
	if PlayerInjuries[src] and PlayerInjuries[src].isBleeding then
		cb(PlayerInjuries[src].isBleeding)
	else
		cb(nil)
	end
end)

DGCore.Functions.CreateCallback('hospital:server:HasBandage', function(source, cb)
	local src = source
    local player = DGCore.Functions.GetPlayer(src)
    local bandage = player.Functions.GetItemByName("bandage")
    if bandage ~= nil then cb(true) else cb(false) end
end)

DGCore.Functions.CreateCallback('hospital:server:HasFirstAid', function(source, cb)
	local src = source
    local player = DGCore.Functions.GetPlayer(src)
    local firstaid = player.Functions.GetItemByName("firstaid")
    if firstaid ~= nil then cb(true) else cb(false) end
end)

-- Commands

DGCore.Commands.Add('911e', 'EMS Report', {{name='message', help='Message to be sent'}}, false, function(source, args)
	local src = source
	if args[1] then message = table.concat(args, " ") else message = 'Civilian Call' end
    local ped = GetPlayerPed(src)
    local coords = GetEntityCoords(ped)
    local players = DGCore.Functions.GetQBPlayers()
    for k,v in pairs(players) do
        if v.PlayerData.job.name == 'ambulance' and v.PlayerData.job.onduty then
            TriggerClientEvent('hospital:client:ambulanceAlert', v.PlayerData.source, coords, message)
        end
    end
end)

DGCore.Commands.Add("status", "Check A Players Health", {}, false, function(source, args)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	if Player.PlayerData.job.name == "ambulance" then
		TriggerClientEvent("hospital:client:CheckStatus", src)
	else
		TriggerClientEvent('DGCore:Notify', src, "You Are Not EMS", "error")
	end
end)

DGCore.Commands.Add("heal", "Heal A Player", {}, false, function(source, args)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	if Player.PlayerData.job.name == "ambulance" then
		TriggerClientEvent("hospital:client:TreatWounds", src)
	else
		TriggerClientEvent('DGCore:Notify', src, "You Are Not EMS", "error")
	end
end)

DGCore.Commands.Add("revivep", "Revive A Player", {}, false, function(source, args)
	local src = source
	local Player = DGCore.Functions.GetPlayer(src)
	if Player.PlayerData.job.name == "ambulance" then
		TriggerClientEvent("hospital:client:RevivePlayer", src)
	else
		TriggerClientEvent('DGCore:Notify', src, "You Are Not EMS", "error")
	end
end)

DGCore.Commands.Add("setpain", "Set Yours or A Players Pain Level (Admin Only)", {{name="id", help="Player ID (may be empty)"}}, false, function(source, args)
	local src = source
	if args[1] then
		local Player = DGCore.Functions.GetPlayer(tonumber(args[1]))
		if Player then
			TriggerClientEvent('hospital:client:SetPain', Player.PlayerData.source)
		else
			TriggerClientEvent('DGCore:Notify', src, "Player Not Online", "error")
		end
	else
		TriggerClientEvent('hospital:client:SetPain', src)
	end
end, "staff")

DGCore.Commands.Add('aheal', 'Heal A Player or Yourself (Admin Only)', {{name='id', help='Player ID (may be empty)'}}, false, function(source, args)
	local src = source
	if args[1] then
		local Player = DGCore.Functions.GetPlayer(tonumber(args[1]))
		if Player then
			TriggerClientEvent('hospital:client:adminHeal', Player.PlayerData.source)
		else
			TriggerClientEvent('DGCore:Notify', src, "Player Not Online", "error")
		end
	else
		TriggerClientEvent('hospital:client:adminHeal', src)
	end
end, 'staff')

-- Items

DGX.Inventory.registerUseable("bandage", function(src)
    TriggerClientEvent("hospital:client:UseBandage", src)
end)

DGX.Inventory.registerUseable("painkillers", function(src)
    TriggerClientEvent("hospital:client:UsePainkillers", src)
end)

DGX.Inventory.registerUseable("firstaid", function(src)
    TriggerClientEvent("hospital:client:UseFirstAid", src)
end)
