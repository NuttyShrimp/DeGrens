# Radialmenu

All the entries can be found in the entries folder on the client side.
Here are all submenus splitted in seperate files. This is not mandatory but its alot cleaner and easier to find something.
To create a new submenu you add a new table to the `entries` table with as key your **identifier** for the submenu that you use in another action to open that certain submenu
e.g.

```lua
-- cl_existing.lua
entries.xxx = {
  ...,
  {
    id = 'newSubMenu',
    title = 'Mijn submenu',
    icon = 'chevron-left', -- fas icon
    subMenu = 'MeSubMenu', -- identifier of submenu
    isEnabled = function(playerData, vehicle) -- A function that will be ran before setting the optional as available
      return true
    end
  },
  ...,
}
-- cl_newSubMenu
entries.MeSubMenu = {
  ...,
}
```