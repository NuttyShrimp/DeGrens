fetchEmails = function(cid)
  local query = "SELECT * FROM phone_mails WHERE cid=? ORDER BY id DESC"
  return exports['dg-sql']:query(query, { cid })
end

addOfflineMail = function(cid, subject, sender, message)
  local Player = DGCore.Functions.GetPlayerByCitizenId(cid)
  if Player then
    TriggerClientEvent('dg-phone:client:addNewMail', Player.PlayerData.source, subject, sender, message)
    return
  end
  local query = "INSERT INTO phone_mails (cid, sender, subject, message) VALUES (?, ?, ?, ?)"
  exports['dg-sql']:query(query, { cid, sender, subject, message })
end
exports('addOfflineMail', addOfflineMail)

RegisterNetEvent('dg-phone:load', function()
  local src = source
  local Players = DGCore.Functions.GetPlayer(src)
  if not Players then cb({}) end
  local mails = fetchEmails(Players.PlayerData.citizenid)
  for _, mail in ipairs(mails) do
    TriggerClientEvent('dg-phone:client:addNewMail', src, mail.subject, mail.sender, mail.message)
  end
end )
