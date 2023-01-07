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

DGX.RPC.register('dg-phone:server:photo:get', function(src)
  local cid = DGX.Util.getCID(src)
	return getImages(cid)
end)

DGX.RPC.register('dg-phone:server:photo:delete', function(src, imageId)
  local cid = DGX.Util.getCID(src)
	deleteImage(cid, imageId)
end)

DGX.RPC.register('dg-phone:server:photo:take', function(src)
  local cid = DGX.Util.getCID(src)
	local link = exports['screenshot-basic']:requestClientImgurScreenshot(src)
	if not link then
		return false
	end
  
	local id = addImage(cid, link)
	if not id then 
    return false
  end

  return true
end)
