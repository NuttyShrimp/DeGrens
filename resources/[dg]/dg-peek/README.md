# DG-Peek

custom peek tool for the DeGrens

Each entry adder has a table as second argument name `parameters`
The structure of the table can be found in the [parameters](./PARAMETERS.md) docs The parameter is defined as a
typescript interface to make it easy to read.

Following exports are available:

## Miscellaneous

### setPeekEnabled

Enable or disable the ability to open the peek menu

```lua
exports['dg-peek']:setPeekEnabled(true)
```

## Adding a new entry

All these exports return a table with the unique ids given to the options Thats 1 id per entry in the options table

### addModelEntry

Add a peek options for a model. This model can be the string or the hash of the model. The first argument can also be an
array with the strings or hashes of the models.

```lua
exports['dg-peek']:addModelEntry('prop_test_bed_01', {
  options = {
    {
      icon = 'fas fa-home',
      label = 'Sleep',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = 'police',
      gang = 'ESB'
    },
    {
      icon = 'fas fa-home',
      label = 'Make bed',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = { 'police', 'ambulance' },
      gang = 'ESB'
    },
    {
      icon = 'fas fa-home',
      label = 'Slap pillow',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = { police = 2, ambulance = 1 },
      gang = 'ESB'
    },
  },
  distance = 2.0
})
```

### addEntityEntry
```lua
exports['dg-peek']:addEntityEntry({ 890, 2394 }, {
  options = {
    {
      icon = 'fas fa-home',
      label = 'Sleep',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = 'police',
      gang = 'ESB'
    },
    {
      icon = 'fas fa-home',
      label = 'Make bed',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = { 'police', 'ambulance' },
      gang = 'ESB'
    },
    {
      icon = 'fas fa-home',
      label = 'Slap pillow',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = { police = 2, ambulance = 1 },
      gang = 'ESB'
    },
  },
  distance = 2.0
})
```

### addBoneEntry

```lua
exports['dg-peek']:addBoneEntry('seat_dside_f', {
  options = {
    {
      icon = 'fas fa-home',
      label = 'Sleep',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = 'police',
      gang = 'ESB'
    },
    {
      icon = 'fas fa-home',
      label = 'Make bed',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = { 'police', 'ambulance' },
      gang = 'ESB'
    },
    {
      icon = 'fas fa-home',
      label = 'Slap pillow',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = { police = 2, ambulance = 1 },
      gang = 'ESB'
    },
  },
  distance = 2.0
})
```

### addFlagEntry

```lua
exports['dg-peek']:addFlagEntry('isButcher', {
  options = {
    {
      icon = 'fas fa-home',
      label = 'Sleep',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = 'police',
      gang = 'ESB'
    },
    {
      icon = 'fas fa-home',
      label = 'Make bed',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = { 'police', 'ambulance' },
      gang = 'ESB'
    },
    {
      icon = 'fas fa-home',
      label = 'Slap pillow',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = { police = 2, ambulance = 1 },
      gang = 'ESB'
    },
  },
  distance = 2.0
})
```

### addZoneEntry

```lua
exports['dg-polytarget']:addBoxZone('my-target-zone', vector3(0,0,0), 1.0, 1.0, {
  data = {
    id = 'my-uniq-id',
    -- Other data you may want to access when peek is used
  }
})
exports['dg-peek']:addZoneEntry('my-target-zone', {
  options = {
    {
      icon = 'fas fa-home',
      label = 'Sleep',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        -- entry.data has the data you set in addBoxZone
        return true
      end,
      job = 'police',
      gang = 'ESB'
    },
    {
      icon = 'fas fa-home',
      label = 'Make bed',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = { 'police', 'ambulance' },
      gang = 'ESB'
    },
    {
      icon = 'fas fa-home',
      label = 'Slap pillow',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        return true
      end,
      job = { police = 2, ambulance = 1 },
      gang = 'ESB'
    },
  },
  distance = 2.0
})
```

### addGlobalEntry

```lua
exports['dg-peek']:addGlobalEntry('ped', { -- available globaltypes are ped, player and vehicle
  options = {
    {
      icon = 'fas fa-home',
      label = 'Sleep',
      items = 'phone',
      canInteract = function(entity, distance, entry)
        -- do something
        -- entry.data has the data you set in addBoxZone
        return true
      end,
      job = 'police',
      gang = 'ESB'
    },
  },
  distance = 2.0
})
```

## Remove entries

### removeModelEntry

```lua
exports['dg-peek']:removeModelEntry(112)
-- or
exports['dg-peek']:removeModelEntry({ 112, 8495 })
```

### removeEntityEntry

```lua
exports['dg-peek']:removeEntityEntry(112)
-- or
exports['dg-peek']:removeModelEntry({ 112, 8495 })
```

### removeBoneEntry

```lua
exports['dg-peek']:removeBoneEntry(112)
-- or
exports['dg-peek']:removeBoneEntry({ 112, 8495 })
```

### removeFlagEntry

```lua
exports['dg-peek']:removeFlagEntry(112)
-- or
exports['dg-peek']:removeFlagEntry({ 112, 8495 })
```

### removeZoneEntry

```lua
exports['dg-peek']:removeZoneEntry(112)
-- or
exports['dg-peek']:removeZoneEntry({ 112, 8495 })
```

### removeGlobalEntry

```lua
exports['dg-peek']:removeGlobalEntry(112)
-- or
exports['dg-peek']:removeGlobalEntry({ 112, 8495 })
```

## Icons

We support following icon libraries:

- [Font Awesome](https://fontawesome.com/icons?d=gallery)
- [Material Design](https://material.io/resources/icons/?style=baseline)
- [Ionicons](https://ionic.io/ionicons/v4)
- [Eva Icons](https://akveo.github.io/eva-icons/#/)
- [Line Awesome Icons](https://icons8.com/line-awesome)
- [Boostrap](https://icons.getbootstrap.com/#icons)