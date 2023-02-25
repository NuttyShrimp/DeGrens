-- used to restore sticky notifs on reload
local stickyNotifCache = {} -- key: notifId, value: notifData

RegisterUICallback('phone/notifications/event', function(data, cb)
  local event = data.event
  local isAccept = data.isAccept
  local eventData = data.data
  -- check if events starts with server:
  if string.match(event, '^server:') ~= nil then
    event = event:sub(8)
    TriggerServerEvent(event, eventData, isAccept)
  else
    TriggerEvent(event, eventData, isAccept)
  end

  cb({ data = {}, meta = { ok = true, message = 'done' } })
end)

--- function addNotification
--- Adds notification to phone (normally stays for 8 seconds
--- if action is needed time will be extended to 30 seconds)
addNotification = function(notification)
  if not getState("hasPhone") then
    return
  end
  if notification.onAccept or notification.onDecline then
    PlaySound(-1, "Click_Fail", "WEB_NAVIGATION_SOUNDS_PHONE", 0, 0, 1)
  end
  if notification.sticky then
    stickyNotifCache[notification.id] = notification
  end
  SendAppEvent('phone', {
    appName = "home-screen",
    action = "addNotification",
    data = notification
  })
end
exports('addNotification', addNotification)
RegisterNetEvent('dg-phone:client:notification:add', addNotification)

removeNotification = function(id)
  stickyNotifCache[id] = nil

  SendAppEvent('phone', {
    appName = "home-screen",
    action = "removeNotification",
    data = id
  })
end
exports('removeNotification', removeNotification)
RegisterNetEvent('dg-phone:client:notification:remove', removeNotification)

--- Update a existing notification
--- @param id string
--- @param notification table
--- notification is same structure as above
--- The diff between them is that this each element of this table is optional
updateNotification = function(id, noti)
  if stickyNotifCache[id] then
    stickyNotifCache[id] = mergeObjects(stickyNotifCache[id], noti)
  end

  SendAppEvent('phone', {
    appName = "home-screen",
    action = "updateNotification",
    data = {
      id = id,
      notification = noti
    }
  })
end
exports('updateNotification', updateNotification)
RegisterNetEvent('dg-phone:client:notification:update', updateNotification)

if DGX.Util.isDevEnv() then
  RegisterCommand('testPNoti', function()
    addNotification({
      id = 'test-noti',
      title = 'New Contact',
      description = "Add Ya mom to contacts?",
      icon = "contacts",
      sticky = true,
      -- onAccept = 'dg-phone:server:contacts',
      -- onDecline = 'server:dg-phone:server',
      -- _data = {
      --   phone = 'YA MOM',
      -- },
      -- timer = 15,
    })
  end, false)
end

restoreStickyNotifs = function()
  for id, notif in pairs(stickyNotifCache) do
    print(('Restoring notif with id %s'):format(id))
    addNotification(notif)
  end
end

mergeObjects = function(x, y)
  local new = {}
  for k, v in pairs(x) do
    new[k] = v
  end
  for k, v in pairs(y) do
    new[k] = v
  end
  return new
end