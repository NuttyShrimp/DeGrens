syncActions = {}

-- Only natives that dont have a server side equivalent
-- (ex: Numberplate native also exists for server)

syncActions.DetachEntity = function(entity, p1, collision)
  DetachEntity(entity, p1, collision)
end

syncActions.DecorSetBool = function(entity, propertyName, value)
	DecorSetBool(entity, propertyName, value)
end

syncActions.DecorSetFloat = function(entity, propertyName, value)
  DecorSetFloat(entity, propertyName, value)
end

syncActions.DecorSetInt = function(entity, propertyName, value)
	DecorSetInt(entity, propertyName, value)
end

syncActions.SetVehicleOnGroundProperly = function(vehicle)
	SetVehicleOnGroundProperly(vehicle)
end

syncActions.SetVehicleFuelLevel = function(vehicle, level)
	SetVehicleFuelLevel(vehicle, level)
end

syncActions.NetworkExplodeVehicle = function(vehicle, isAudible, isInvisible, p3)
	NetworkExplodeVehicle(vehicle, isAudible, isInvisible, p3)
end

syncActions.SetEntityVisible = function(ped, isVisible)
	SetEntityVisible(ped, isVisible)
end