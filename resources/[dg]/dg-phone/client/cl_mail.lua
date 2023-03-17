local cachedMails = {}

sendMail = function(subject, sender, message, dontCache)
  local mailData = {
    subject=subject,
    sender=sender,
    message=message
  }

  if not dontCache then
    cachedMails[#cachedMails + 1] = mailData
  end

	SendAppEvent('phone', {
		appName="mail",
		action="newMail",
		data=mailData
	})
end
exports('sendMail', sendMail)

RegisterNetEvent('dg-phone:client:addNewMail', sendMail)

restoreCachedMails = function()
  for _, mail in pairs(cachedMails) do
    sendMail(mail.subject, mail.sender, mail.message, true)
  end
end