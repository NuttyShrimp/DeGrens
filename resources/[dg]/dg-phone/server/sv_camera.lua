getImages = function(cid)
	local query = "SELECT id, link FROM phone_images WHERE cid = ? ORDER BY id DESC"
	return exports['dg-sql']:query(query, {cid})
end

addImage = function(cid, link)
	local query = [[
		INSERT INTO phone_images (cid, link)
		VALUES (?, ?)
	]]
	return exports['dg-sql']:insert(query, { cid, link })
end

deleteImage = function(cid, id)
	local query = [[
		DELETE FROM phone_images WHERE cid = ? AND id = ?
	]]
	return exports['dg-sql']:query(query, { cid, id })
end

DGCore.Functions.CreateCallback('dg-phone:server:photo:get', function(src, cb)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then cb({}) return end
	cb(getImages(Player.PlayerData.citizenid))
end)

DGCore.Functions.CreateCallback('dg-phone:server:photo:delete', function(src, cb, data)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then cb({}) return end
	deleteImage(Player.PlayerData.citizenid, data.id)
	cb()
end)

DGCore.Functions.CreateCallback('dg-phone:server:photo:take', function(src, cb)
	local Player = DGCore.Functions.GetPlayer(src)
	if not Player then cb() return end
	local link = exports['screenshot-basic']:requestClientImgurScreenshot(src)
	cb()
	if not link then
    DGX.Notifications.add(src, 'Photo capture failed :(', 'error')
		return
	end
	local id = addImage(Player.PlayerData.citizenid, link)
	if id then return end
  DGX.Notifications.add(src, 'Photo capture failed :(', 'error')
end)
