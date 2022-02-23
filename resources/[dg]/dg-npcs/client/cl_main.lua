DGCore = exports['dg-core']:GetCoreObject()

Citizen.CreateThread(function()
    local NPCS = DGCore.Functions.TriggerCallback("dg-npcs:server:FetchNPCs")
    for _, npc in pairs(NPCS) do
        AddNpc(npc)
        EnableNpc(npc.id)
    end 

    Handler.StartThread()
end)

-- events

AddEventHandler("onResourceStop", function(resourceName)
	if resourceName ~= GetCurrentResourceName() then
        return
    end

    for _, pNpc in pairs(Handler.npcs) do
        pNpc:Delete()
    end
end)

-- functions

function GetNpc(npcId)
	if not Handler.NpcExists(npcId) then
        return nil
    end
	return Handler.npcs[npcId]
end

function AddNpc(pNpc)
	if Handler.NpcExists(pNpc.id) then
	    Handler.npcs[pNpc.id].position = pNpc.position
		return Handler.npcs[pNpc.id]
    end

	local npc = NPC:Create(
        pNpc.id,
		pNpc.model,
		pNpc.position,
		pNpc.appearance,
		pNpc.networked,
        pNpc.distance,
		pNpc.settings,
		pNpc.flag,
        pNpc.animation,
		pNpc.scenario
    )  
		
	Handler.AddNpc(npc)
	return npc
end

function RemoveNpc(npcId)
	if not Handler.NpcExists(npcId) then
        return
    end
	Handler.RemoveNpc(npcId)
end

function DisableNpc(npcId)
    if not Handler.NpcExists(npcId) then
        return
    end
	Handler.DisableNpc(npcId)
end

function EnableNpc(npcId)
    if not Handler.NpcExists(npcId) then
        return
    end
	Handler.EnableNpc(npcId)
end

function UpdateNpc(npcId, key, value)
    if not Handler.NpcExists(npcId) then
        return
    end
	Handler.npcs[npcId][key] = value
end
