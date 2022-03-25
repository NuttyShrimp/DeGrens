# DG-Phone
All the events & exports are clientsided if not said otherwise.

## NUI messages
To send events to the UI use the following table structure to make sure your event gets executed:
```lua
SendNUIMessage({
  app="contacts",
  action="setContacts",
  data={
    -- Insert the data you want to send with the event here
  }
})
```

## Info
It's possible to add an entry to the info app by using the following export
```lua
---@function registerInfoEntry
---@param name string
---@param getter function returns string
---@param icon string
---@param color string || nil
---@param prefix string || nil
exports["dg-phone"]:registerInfoEntry(name, getter, icon, color, prefix)
```

## Mail
Send a mail to a player by using the following export or event:
```lua
-- Client sided
exports["dg-phone"]:sendMail(subject, sender, mail)

-- Server sided
TriggerClientEvent('dg-phone:client:addNewMail', target, subject, sender, mail)
```
Sending an email to a player to save if they are not online
```lua 
-- Server Sided
exports["dg-phone"]:sendOfflineMail(cid, subject, sender, mail)
```

## Notifications
Sendout a new notifications
```lua
local notification = {
  -- This id must be unique or your notifications could be overwritten
  id = "my-unique-id",
  title = "My notification",
  -- This can be the name of an icon or following table
  icon = {
    name = "house",
    color = "white",
    background = "#000000",
    -- (optional) sets library for icon (useful when using something else then fas)
    lib = "fas"
  },
  -- (OPTIONIAL)
  description = "This is a notification",
  -- (OPTIONIAL) This make sure the notification shows until it's manually removed
  sticky = false,
  -- (OPTIONIAL) Shows notification until CD is reached even when accepting/declining
  actionWithRemove = true,
  -- (OPTIONIAL) name of client events. If prefixed with server it will trigger a server event
  onAccept = "my-accept-event",
  onDecline = "server:my-decline-event",
  -- (OPTIONIAL) The data that is passed to the event
  _data = {
    myData = "my-data"
  },
  -- (OPTIONAL) A timer, if set to 0, it will count down otherwise it will count down and dispatch the decline event of given
  timer = 20,
  -- (OPTIONAL) To open a specific app when the notification is clicked set the name here
  app = 'contacts'
}
exports["dg-phone"]:addNotification(notification)

-- Removing a notification
exports["dg-phone"]:removeNotification("my-unique-id")

-- Updating a notification when it's already shown
exports["dg-phone"]:updateNotification("my-unique-id", {
  -- Notification data same as notifications table BUT everything is optional this you do only need to set the needed data
})
```