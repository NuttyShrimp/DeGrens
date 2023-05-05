fetchEmails = function(cid)
  local query = "SELECT * FROM phone_mails WHERE cid=? ORDER BY id DESC"
  return exports['dg-sql']:query(query, { cid })
end

addOfflineMail = function(cid, subject, sender, message)
  local plySource = charModule.getServerIdFromCitizenId(cid)
  if plySource then
    TriggerClientEvent('dg-phone:client:addNewMail', plySource, subject, sender, message)
    return
  end
  local query = "INSERT INTO phone_mails (cid, sender, subject, message) VALUES (?, ?, ?, ?)"
  exports['dg-sql']:query(query, { cid, sender, subject, message })
end
exports('addOfflineMail', addOfflineMail)

RegisterNetEvent('dg-phone:load', function()
  local src = source
  local Player = charModule.getPlayer(src)
  if not Player then return end

  local cid = Player.citizenid
  local mails = fetchEmails(cid)
  for _, mail in ipairs(mails) do
    TriggerClientEvent('dg-phone:client:addNewMail', src, mail.subject, mail.sender, mail.message)
  end
  exports['dg-sql']:query("DELETE FROM phone_mails WHERE cid = ?", { cid })
end)