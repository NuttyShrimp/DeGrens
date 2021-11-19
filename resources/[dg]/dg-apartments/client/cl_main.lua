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

RegisterNetEvent('dg-apartments:client:fadeScreen')
AddEventHandler('dg-apartments:client:fadeScreen', function(isFadeOut)
	if (isFadeOut) then
		DoScreenFadeOut(500)
  else
    DoScreenFadeIn(500)
	end
end)

RegisterNetEvent('dg-apartment:inviteMenu', function()
	-- TODO add menu with options to invite & list all invites
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