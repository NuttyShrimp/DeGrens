-- Entries visible in the main circle of radialmenu
entries.main = {
  {
    id = 'citizen',
    title = 'Burger',
    icon = 'user',
    subMenu = 'citizen',
    isEnabled = function()
      return true
    end
  },
  {
    id = 'jobinteractions',
    title = 'Werk',
    icon = 'briefcase',
    subMenu = 'job',
    isEnabled = function()
      return DGX.Jobs.getCurrentJob().name ~= nil
    end
  },
  {
    id = 'share-vehicle-keys',
    title = 'Deel sleutels',
    icon = 'key',
    event = 'vehicles:keys:share',
    shouldClose = true,
    isEnabled = function(_, vehicle)
      if vehicle == 0 then
        return false
      end
      return exports['dg-vehicles']:hasVehicleKeys()
    end
  },
  {
    id = 'park-vehicle-here',
    title = 'Parkeer voertuig',
    icon = 'square-parking',
    event = 'dg-vehicles:garages:park',
    shouldClose = true,
    isEnabled = function(_, vehicle, entity)
      if vehicle ~= 0 then
        return false
      end
      if not exports['dg-vehicles']:hasVehicleKeys(entity) then
        return false
      end
      return exports['dg-vehicles']:isOnParkingSpot(entity)
    end
  },
  {
    id = 'open-garage-list',
    title = 'Open garage',
    icon = 'garage-open',
    type = 'server',
    event = 'dg-vehicles:garages:open',
    shouldClose = true,
    isEnabled = function(_, vehicle)
      if vehicle ~= 0 then
        return false
      end
      return exports['dg-vehicles']:isOnParkingSpot()
    end
  },
  {
    id = 'vehicle',
    title = 'Voertuig',
    icon = 'car',
    subMenu = 'vehicle',
    isEnabled = function(_, vehicle)
      return vehicle ~= 0
    end
  },
  {
    id = "vehicles:depot:openSelectionMenu",
    title = 'Voertuig inbeslagnemen',
    icon = "truck-pickup",
    dgx = true,
    event = 'vehicles:depot:client:openSelectionMenu',
    shouldClose = true,
    isEnabled = function(_, vehicle, ent)
      if vehicle ~= 0 or not ent or not IsEntityAVehicle(ent) then
        return false
      end
      return true
    end
  },
  {
    id = "police-rob",
    title = 'Beroven',
    icon = "people-robbery",
    event = 'police:robPlayer',
    shouldClose = true,
    isEnabled = function(_, vehicle)
      if vehicle ~= 0 then return false end
      return DGX.Police.getPlayerToRob() ~= nil
    end
  },
  {
    id = "police-escort",
    title = 'Escorteren',
    icon = "person",
    event = 'police:startEscorting',
    shouldClose = true,
    isEnabled = function(_, vehicle)
      if vehicle ~= 0 then return false end
      return DGX.Police.getPlayerToEscort() ~= nil
    end
  },
  {
    id = "police-escort-release",
    title = 'Loslaten',
    icon = "person",
    event = 'police:stopEscorting',
    shouldClose = true,
    isEnabled = function(_, vehicle)
      if vehicle ~= 0 then return false end
      return DGX.Police.isEscorting()
    end
  },
  {
    id = "police-cuff",
    title = 'Handboeien',
    icon = "handcuffs",
    event = 'police:tryToCuff',
    shouldClose = true,
    isEnabled = function(plyData, vehicle)
      if vehicle ~= 0 then return false end
      if not DGX.Util.isAnyPlayerCloseAndOutsideVehicle(1) then return false end
      return plyData.job.name == 'police' or DGX.Inventory.doesPlayerHaveItems('hand_cuffs')
    end
  },
}
