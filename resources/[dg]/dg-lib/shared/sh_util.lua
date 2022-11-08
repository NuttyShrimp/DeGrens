exports('vectorToTable', function(vector)
    return {vector.x, vector.y, vector.z}
end)

exports('tableToVector', function(tbl)
    return vector3(tbl[1], tbl[2], tbl[3])
end)