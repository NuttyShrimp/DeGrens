Handler = {
    npcs = {},
    active = false,
}

Handler.NpcExists = function(id) 
    return Handler.npcs[id] ~= nil
end

Handler.GetNpcById = function(id)
    if Handler.NpcExists(id) then
        return Handler.npcs[id]
    end

    return nil
end

Handler.AddNpc = function(npc)
    if not npc or not npc.id or Handler.NpcExists(npc.id) then return end
    Handler.npcs[npc.id] = npc
end

Handler.RemoveNpc = function(id)
    if not Handler.NpcExists(id) then return end
    Handler.npcs[id]:Delete()
end

Handler.EnableNpc = function(id) 
    if not Handler.NpcExists(id) then return end
    Handler.npcs[id]:Enable()
end

Handler.DisableNpc = function(id)
    if not Handler.NpcExists(id) then return end
    Handler.npcs[id]:Disable()
end

Handler.StartThread = function()
    Handler.active = true
    
    Citizen.CreateThread(function()
        while Handler.active do
            local ped = PlayerPedId()
            local pos = GetEntityCoords(ped)

            for id, _ in pairs(Handler.npcs) do
                local npc = Handler.npcs[id]
                local spawnDistance = npc.distance
                local distance = #(pos - vector3(npc.position.x, npc.position.y, npc.position.z))

                if distance <= spawnDistance and not npc.spawned and not npc.disabled then
                    npc:Spawn()
                end

                if npc.spawned and (distance > spawnDistance or npc.disabled) then
                    npc:Delete()
                end     
            end

            Citizen.Wait(500)
        end
    end)
end

Handler.StopThread = function()
    Citizen.CreateThread(function()
        Handler.active = false
        Citizen.Wait(500)

        for id, _ in pairs(Handler.npcs) do
            Handler.npcs[id]:Delete()
        end
    end)
end