DGCore = exports['dg-core']:GetCoreObject()

currentApartmentName = nil

RegisterNetEvent('dg-apartments:client:doKeyAnim')
AddEventHandler('dg-apartments:client:doKeyAnim', function()
	openDoorAnim()
end)

RegisterNetEvent('dg-apartments:client:enterApartment')
AddEventHandler('dg-apartments:client:enterApartment', function(data)
	TriggerServerEvent('dg-apartments:server:enterApartment', data.id)
end)

RegisterNetEvent('dg-apartments:client:toggleLockDown')
AddEventHandler('dg-apartments:client:toggleLockDown', function()
	TriggerServerEvent('dg-apartments:server:toggleLockDown')
end)

RegisterNetEvent('dg-apartments:client:openRaidMenu')
AddEventHandler('dg-apartments:client:openRaidMenu', function()
	local dialog = exports['qb-input']:ShowInput({
		header = "Raid an apartment",
		submitText = "",
		inputs = {
			{
				text = "Apartment Id",
				name = "aid",
				type = "number",
				isRequired = true
			},
		},
	})

	if dialog ~= nil then
		if (dialog.aid) then
			TriggerServerEvent('dg-apartments:server:enterApartment', dialog.aid)
		end
	end
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
		exports["dg-contextmenu"]:openMenu({
			{
				title = 'Invite',
				description = "Invite someone to your apartment",
				action = "dg-apartments:client:inviteApartment",
			},
			{
				title = "List invites",
				description = "List all invited people",
				submenus = inviteListMenu,
			},
			{
				title = 'Unlock/Lock',
				description = "Toggle the lock of your apartment",
				action = "dg-apartments:client:toggleApartmentLock",
			},
		})
	end)
end)

RegisterNetEvent('dg-apartments:client:inviteApartment')
AddEventHandler('dg-apartments:client:inviteApartment', function()
	local dialog = exports['qb-input']:ShowInput({
    header = "Invite someone to your apartment",
    submitText = "",
    inputs = {
      {
        text = "Player Id",
        name = "pid",
        type = "number",
        isRequired = true
      },
    },
  })
	if (not dialog or not dialog.pid) then return end
	TriggerServerEvent('dg-apartments:server:inviteApartment', dialog.pid)
end)

RegisterNetEvent('dg-apartments:client:removeInvite')
AddEventHandler('dg-apartments:client:removeInvite', function(data)
	TriggerServerEvent('dg-apartments:server:removeInvite', data.id)
end)

RegisterNetEvent('dg-apartment:openStash', function()
	DGCore.Functions.TriggerCallback('dg-apartments:server:getCurrentApartment', function(CurrentApartment)
		TriggerServerEvent("inventory:server:OpenInventory", "stash", CurrentApartment)
		TriggerServerEvent("InteractSound_SV:PlayOnSource", "StashOpen", 0.4)
		TriggerEvent("inventory:client:SetCurrentStash", CurrentApartment)
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