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
    id = 'general',
    title = 'Acties',
    icon = 'list-alt',
    subMenu = 'general',
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
      return true
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
      if vehicle == 0 then
        return false
      end
      return true
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
  }
}
