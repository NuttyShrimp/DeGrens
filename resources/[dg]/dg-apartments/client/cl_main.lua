currentApartment = nil

RegisterNetEvent('dg-apartments:client:doKeyAnim')
AddEventHandler('dg-apartments:client:doKeyAnim', function()
	openDoorAnim()
end)

RegisterUICallback('dg-apartments:client:enterApartment', function(data, cb)
	TriggerServerEvent('dg-apartments:server:enterApartment', data.id)
	cb({data={}, meta={ok=true}})
end)

RegisterUICallback('dg-apartments:client:toggleLockDown', function(_, cb)
	TriggerServerEvent('dg-apartments:server:toggleLockDown')
	cb({data={}, meta={ok=true}})
end)

RegisterUICallback('dg-apartments:client:openRaidMenu', function(_, cb)
	local dialog = exports['dg-ui']:openInput({
		header = "Raid an apartment",
		inputs = {
			{
				label = "Apartment Id",
				name = "aid",
				type = "number",
			},
		},
	})

	if dialog ~= nil then
		if (dialog.aid) then
			TriggerServerEvent('dg-apartments:server:enterApartment', dialog.aid)
		end
	end
	cb({data={}, meta={ok=true}})
end)

RegisterNetEvent('dg-apartments:client:fadeScreen')
AddEventHandler('dg-apartments:client:fadeScreen', function(isFadeOut)
	if (isFadeOut) then
		DoScreenFadeOut(500)
  else
    DoScreenFadeIn(500)
	end
end)

RegisterNetEvent('dg-apartment:inviteMenu', function()
	DGCore.Functions.TriggerCallback('dg-apartments:server:getApartmentInvites', function(inviteListMenu)
		exports["dg-ui"]:openApplication('contextmenu',{
			{
				title = 'Invite',
				description = "Invite someone to your apartment",
				callbackURL = "dg-apartments:client:inviteApartment",
			},
			{
				title = "List invites",
				description = "List all invited people",
				submenu = inviteListMenu,
			},
			{
				title = 'Unlock/Lock',
				description = "Toggle the lock of your apartment",
				callbackURL = "dg-apartments:client:toggleApartmentLock",
			},
		})
	end)
end)

RegisterUICallback('dg-apartments:client:inviteApartment', function()
	local dialog = exports['dg-ui']:openInput({
    header = "Invite someone to your apartment",
    inputs = {
      {
        label = "Player Id",
        name = "pid",
        type = "number",
      },
    },
  })
	if (not dialog or not dialog.pid) then return end
	TriggerServerEvent('dg-apartments:server:inviteApartment', dialog.pid)
end)

RegisterUICallback('dg-apartments:client:removeInvite', function(data)
	TriggerServerEvent('dg-apartments:server:removeInvite', data.id)
end)

RegisterNetEvent('dg-apartment:openStash', function()
	DGCore.Functions.TriggerCallback('dg-apartments:server:getCurrentApartment', function(CurrentApartment)
		if not CurrentApartment then
			return
		end
		TriggerServerEvent("inventory:server:OpenInventory", "stash", CurrentApartment)
		TriggerServerEvent("InteractSound_SV:PlayOnSource", "StashOpen", 0.4)
	end)
end)

function loadAnimDict(dict)
	while (not HasAnimDictLoaded(dict)) do
		RequestAnimDict(dict)
		Citizen.Wait(5)
	end
end

function openDoorAnim()
	loadAnimDict("anim@heists@keycard@")
	TaskPlayAnim( PlayerPedId(), "anim@heists@keycard@", "exit", 5.0, 1.0, -1, 16, 0, 0, 0, 0 )
	Citizen.Wait(400)
	ClearPedTasks(PlayerPedId())
end

exports('getEnterCoords', function()
	return Config.Locations[1].enter.center
end)
exports('isInApartment', function()
	return currentApartment ~= nil
end)