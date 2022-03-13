local heatmap = {}
local SIZE = 25

generateHeatmap = function(coordsList)
    for _, coords in ipairs(coordsList) do  
        addToHeatmap(coords)
        Citizen.Wait(0)
    end
end

addToHeatmap = function(coords)
    local index = getHeatmapIndexFromCoord(coords)
    heatmap[index] = heatmap[index] == nil and 0.1 or heatmap[index] + 0.1
end

getIntensityFromHeatmap = function(coords)
    local index = getHeatmapIndexFromCoord(coords)
    return heatmap[index] or 0.1
end

getHeatmapIndexFromCoord = function(coord)
    coord = coord / SIZE
    return vector2(coord.x >= 0 and math.floor(coord.x) or math.ceil(coord.x), coord.y >= 0 and math.floor(coord.y) or math.ceil(coord.y))
end