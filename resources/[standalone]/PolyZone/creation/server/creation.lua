RegisterNetEvent("polyzone:printPoly")
AddEventHandler("polyzone:printPoly", function(zone)
  file = io.open('polyzone_created_zones.txt', "a")
  io.output(file)
  local output = parsePoly(zone)
  io.write(output)
  io.close(file)
end)

RegisterNetEvent("polyzone:printCircle")
AddEventHandler("polyzone:printCircle", function(zone)
  file = io.open('polyzone_created_zones.txt', "a")
  io.output(file)
  local output = parseCircle(zone)
  io.write(output)
  io.close(file)
end)

RegisterNetEvent("polyzone:printBox")
AddEventHandler("polyzone:printBox", function(zone)
  file = io.open('polyzone_created_zones.txt', "a")
  io.output(file)
  local output = parseBox(zone)
  io.write(output)
  io.close(file)
end)

function round(num, numDecimalPlaces)
  local mult = 10 ^ (numDecimalPlaces or 0)
  return math.floor(num * mult + 0.5) / mult
end

function printoutHeader(name)
  return "--Name: " .. name .. " | " .. os.date("!%Y-%m-%dT%H:%M:%SZ\n")
end

function parsePoly(zone)
  local printout = printoutHeader(zone.name)

  local jsonObj = {
    vectors = {},
    options = {
      minZ = zone.minZ and round(zone.minZ, 2) or nil,
      maxZ = zone.maxZ and round(zone.maxZ, 2) or nil,
    }
  }

  for i = 1, #zone.points do
    jsonObj.vectors[#jsonObj.vectors+1] = {
      x = round(zone.points[i].x, 2),
      y = round(zone.points[i].y, 2)
    }
  end

  printout = printout .. json.encode(jsonObj, { 
    indent = true, 
    keyorder = {
      "vectors",
      "options",
      "x",
      "y",
      "z",
      "minZ",
      "maxZ"
    } 
  })

  if zone.houseOffset then
    for _, zone in pairs(zone.points) do
      zone.points = zone.points - zone.houseOffset
    end
    zone.minZ = zone.minZ - zone.houseOffset.z
    zone.maxZ = zone.maxZ - zone.houseOffset.z
    zone.houseOffset = nil
    printout = printout .. "\n// Instanced PolyZone\n" .. parsePoly(zone)
  end
  return printout .. "\n\n"
end

function parseCircle(zone)
  local printout = printoutHeader(zone.name)

  local jsonObj = {
    center = {
      x = round(zone.center.x, 2),
      y = round(zone.center.y, 2),
      z = round(zone.center.z, 2),
    },
    radius = round(zone.radius, 2),
    options = {
      useZ = zone.useZ,
    }
  }

  printout = printout .. json.encode(jsonObj, { 
    indent = true, 
    keyorder = {
      "center",
      "radius",
      "options",
      "x",
      "y",
      "z"
    } 
  })

  if zone.houseOffset then
    zone.center = zone.center - zone.houseOffset
    zone.houseOffset = nil
    printout = printout .. "\n// Instanced CircleZone\n" .. parseCircle(zone)
  end
  return printout .. "\n\n"
end

function parseBox(zone)
  local printout = printoutHeader(zone.name)

  local jsonObj = {
    center = {
      x = round(zone.center.x, 2),
      y = round(zone.center.y, 2),
      z = round(zone.center.z, 2),
    },
    width = round(zone.length, 2), -- WE SOMEHWERE SWAPPED THESE TWO WTF
    length = round(zone.width, 2),
    options = {
      heading = zone.heading,
      minZ = zone.minZ and round(zone.minZ, 2) or nil,
      maxZ = zone.maxZ and round(zone.maxZ, 2) or nil,
    }
  }

  printout = printout .. json.encode(jsonObj, { 
    indent = true, 
    keyorder = {
      "center",
      "width",
      "length",
      "options",
      "x",
      "y",
      "z",
      "heading",
      "minZ",
      "maxZ"
    } 
  })

  if zone.houseOffset then
    zone.center = zone.center - zone.houseOffset
    zone.minZ = zone.minZ - zone.houseOffset.z
    zone.maxZ = zone.maxZ - zone.houseOffset.z
    zone.houseOffset = nil
    printout = printout .. "\n// Instanced BoxZone\n" .. parseBox(zone)
  end
  return printout .. "\n\n"
end