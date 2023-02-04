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
	local result = DGX.UI.openInput({
		header = "Raid een appartement",
		inputs = {
			{
				label = "Appartementsnummer",
				name = "aid",
				type = "number",
			},
		},
	})
  if result.accepted and result.values.aid then 
    local apartmentId = tonumber(result.values.aid)
    TriggerServerEvent('dg-apartments:server:enterApartment', apartmentId)
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
				title = 'Uitnodigen',
				description = "Nodig iemand uit in je appartement",
				callbackURL = "dg-apartments:client:inviteApartment",
			},
			{
				title = "Uitgenodigden",
				description = "Lijst van uitgenodigden",
				submenu = inviteListMenu,
			},
			{
				title = 'Unlock/Lock',
				description = "Verander het slot op je appartement",
				callbackURL = "dg-apartments:client:toggleApartmentLock",
			},
		})
	end)
end)

RegisterUICallback('dg-apartments:client:inviteApartment', function(_, cb)
	local result = DGX.UI.openInput({
    header = "Nodig iemand uit in je appartement",
    inputs = {
      {
        label = "Speler ID",
        name = "pid",
        type = "number",
      },
    },
  })
  if result.accepted and result.values.pid then 
	  TriggerServerEvent('dg-apartments:server:inviteApartment', result.values.pid)
  end
  cb({ data = {}, meta = { ok = true } })
end)

RegisterUICallback('dg-apartments:client:removeInvite', function(data, cb)
	TriggerServerEvent('dg-apartments:server:removeInvite', data.id)
  cb({ data = {}, meta = { ok = true } })
end)

RegisterUICallback('dg-apartments:client:toggleApartmentLock', function(_, cb)
  TriggerServerEvent('dg-apartments:server:toggleApartmentLock')
  cb({ data = {}, meta = { ok = true } })
end)

AddEventHandler('dg-apartment:openStash', function()
	DGCore.Functions.TriggerCallback('dg-apartments:server:getCurrentApartment', function(CurrentApartment)
		if not CurrentApartment then
			return
		end
    local apartmentStashId = ('apartment_%s'):format(CurrentApartment)
    DGX.Inventory.openStash(apartmentStashId, Config.StashSize)
    DGX.Sounds.playLocalSound('StashOpen', 1);
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