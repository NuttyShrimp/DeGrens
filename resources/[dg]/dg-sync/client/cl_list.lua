syncActions = {}

function requestSyncedAction(native, entity, ...)
	if (DoesEntityExist(entity)) then
		TriggerServerEvent('sync:request', native, GetPlayerServerId(NetworkGetEntityOwner(entity)), NetworkGetNetworkIdFromEntity(entity), ...)
	end
end

syncActions.DeleteVehicle = function(vehicle)
	if NetworkHasControlOfEntity(vehicle) then
		DeleteVehicle(vehicle)
	else
		requestSyncedAction('DeleteVehicle', vehicle)
	end
end

syncActions.DeleteEntity = function(entity)
	if NetworkHasControlOfEntity(entity) then
		DeleteEntity(entity)
	else
		requestSyncedAction('DeleteEntity', entity)
	end
end

syncActions.DeleteObject = function(object)
	if NetworkHasControlOfEntity(object) then
		DeleteObject(object)
	else
		requestSyncedAction("DeleteObject", object)
	end
end

syncActions.DetachEntity = function(entity, p1, collision)
	if NetworkHasControlOfEntity(entity) then
		DetachEntity(entity, p1, collision)
	else
		requestSyncedAction("DetachEntity", entity, p1, collision)
	end
end

syncActions.DecorSetBool = function(entity, propertyName, value)
	if NetworkHasControlOfEntity(entity) then
		DecorSetBool(entity, propertyName, value)
	else
		requestSyncedAction("DecorSetBool", entity, propertyName, value)
	end
end

syncActions.DecorSetFloat = function(entity, propertyName, value)
	if NetworkHasControlOfEntity(entity) then
		DecorSetFloat(entity, propertyName, value)
	else
		requestSyncedAction("DecorSetFloat", entity, propertyName, value)
	end
end

syncActions.DecorSetInt = function(entity, propertyName, value)
	if NetworkHasControlOfEntity(entity) then
		DecorSetInt(entity, propertyName, value)
	else
		requestSyncedAction("DecorSetInt", entity, propertyName, value)
	end
end

syncActions.SetVehicleOnGroundProperly = function(vehicle)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleOnGroundProperly(vehicle)
	else
		requestSyncedAction("SetVehicleOnGroundProperly", vehicle)
	end
end

syncActions.SetVehicleNumberPlateText = function(vehicle, plate)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleNumberPlateText(vehicle, plate)
	else
		requestSyncedAction("SetVehicleNumberPlateText", vehicle, plate)
	end
end

syncActions.SetVehicleFuelLevel = function(vehicle, level)
	if NetworkHasControlOfEntity(vehicle) then
		SetVehicleFuelLevel(vehicle, level)
	else
		requestSyncedAction("SetVehicleFuelLevel", vehicle, level)
	end
end

syncActions.NetworkExplodeVehicle = function(vehicle, isAudible, isInvisible, p3)
	if NetworkHasControlOfEntity(vehicle) then
		NetworkExplodeVehicle(vehicle, isAudible, isInvisible, p3)
	else
		requestSyncedAction("NetworkExplodeVehicle", vehicle, isAudible, isInvisible, p3)
	end
end