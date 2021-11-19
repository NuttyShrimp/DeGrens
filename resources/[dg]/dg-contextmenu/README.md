# DG-contextmenu

Menu options:
```lua
local menu = {
  title = "My Menu title",
  description = "My Menu description",
  action = "eventName", -- Triggered when the menu is selected even if it has submenus'
  data = {}, -- Data to be passed to the event
  submenus = {
    {
      title = "Submenu 1",
      description = "Submenu 1 description",
      ... -- See above
    }
  },
  back = true -- If true, the menu will act as a back/close button
}
```