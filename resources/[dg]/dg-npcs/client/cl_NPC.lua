NPC  = {
	id,
	entity,
	model,
	hash,
	position,
	spawned,
	disabled,
	tasks,
	appearance,
	networked,
	settings,
	cores,
	animation,
	scenario,
}
NPC.__index = NPC

function NPC:Create(id, model, position, appearance, networked, distance, settings, flag, animation, scenario)
    local npc = {}
    setmetatable(npc, NPC)

    npc.id = id 
	npc.model = model 
	npc.hash = GetHashKey(model) 
    npc.entity = nil
    npc.position = position 
    npc.spawned = false 
    npc.disabled = false 
	npc.tasks = {} 
	npc.appearance = appearance 
	npc.networked = networked 
    npc.distance = distance
	npc.settings = settings 
	npc.flag = flag
	npc.scenario = scenario 
	npc.animation = animation 

    return npc
end

function NPC:Spawn()
    Citizen.CreateThread(function()
        if self.spawned then return end

        RequestModel(self.model)
        while not HasModelLoaded(self.model) do
            Citizen.Wait(10)
        end

		local ped = CreatePed(4, self.hash, self.position.x, self.position.y, self.position.z, self.position.w, self.networked, false)
        SetPedDefaultComponentVariation(ped) 

		if DoesEntityExist(ped) then
			self.entity = ped 
			self.spawned = true 

			Entity(self.entity).state:set('npcId', self.id, self.networked) 

			if self.settings then
                for i = 1, #self.settings do
                    self:SetSetting(self.settings[i].setting, self.settings[i].active) 
                end
            end

			if self.appearance then
				exports['dg-clothing'].setPedAppearance(self.entity, self.appearance) 
			end

			if self.flag then
                self:SetFlag(self.flag.name, self.flag.active) 
			end

			if self.scenario then
				self:SetScenario() 
			end
            
            if self.animation then
                self:SetAnimation()
			end
		end

		SetModelAsNoLongerNeeded(self.model) 
    end)
end

function NPC:Delete()
    if not self.spawned then return end

	self.spawned = false 

	if not DoesEntityExist(self.entity) then return end

	DeleteEntity(self.entity) 
	self.entity = nil 
end

function NPC:Enable()
    self.disabled = false
end

function NPC:Disable()
    self.disabled = true
end

function NPC:SetSetting(setting, active)
    if setting == "invincible" then
        SetEntityInvincible(self.entity, active) 
    elseif setting == "freeze" then
        FreezeEntityPosition(self.entity, active) 
    elseif setting == "ignore" then
        SetBlockingOfNonTemporaryEvents(self.entity, active) 
    elseif setting == "collision" then
        SetEntityCompletelyDisableCollision(self.entity, active, active) 
		SetEntityCoordsNoOffset(self.entity, self.position.x, self.position.y, self.position.z, false, false, false)
    end
end

function NPC:SetFlag(flag, state)
    Entity(self.entity).state:set(flag, state, self.networked)
end

function NPC:SetScenario()
    TaskStartScenarioInPlace(self.entity, self.scenario, 0, true)
end

function NPC:SetAnimation()
    RequestAnimDict(self.animation[1])
    while not HasAnimDictLoaded(self.animation[1]) do
        Citizen.Wait(10)
    end

    TaskPlayAnim(self.entity, self.animation[1], self.animation[2], 8.0, 0.0, -1, 1, 0, 0, 0, 0)
end

