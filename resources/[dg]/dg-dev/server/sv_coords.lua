local i = 1

RegisterNetEvent('SaveCoords')
AddEventHandler( 'SaveCoords', function(user, x, y, z, w, str)
	file = io.open( user .. "-Coords.txt", "a")
	if file then
		file:write(("[%d] = {vector3(%s, %s, %s), vector4(%s, %s, %s, %s), {\"x\": %s, \"y\": %s, \"z\": %s, \"w\": %s}, info = '%s'},\n"):format(i, x, y, z, x, y, z, w, x, y, z, w, str))
	end
	file:close()
	i=i+1
end )

RegisterNetEvent('SaveCoordsOffset')
AddEventHandler('SaveCoordsOffset', function(user, x, y, z, w, str)
	file = io.open( user .. "-Coords.txt", "a")
	if file then
		file:write(("[%d] = {vector3(%s, %s, %s), vector4(%s, %s, %s, %s), {\"x\": %s, \"y\": %s, \"z\": %s, \"w\": %s}, info = 'offset %s'},\n"):format(i, x, y, z, x, y, z, w, x, y, z, w, str))
	end
	file:close()
	i=i+1
end )
