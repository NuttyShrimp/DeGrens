# DG-contextmenu

Available exports:
- openMenu(menuObject, doNotFocus), menuObject is a table with menuEntries ,doNotFocus is optional
- closeMenu(),

Menu entry options:
```lua
local menuEntry = {
  title = "My Menu title",
  description = "My Menu description",
  isServer = false, -- if Action should trigger a server event
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