sendMail = function(subject, sender, mail)
	SendAppEvent('phone', {
		appName="mail",
		action="newMail",
		data={
			subject=subject,
			sender=sender,
			message=mail
		}
	})
end
exports('sendMail', sendMail)

RegisterNetEvent('dg-phone:client:addNewMail', sendMail)