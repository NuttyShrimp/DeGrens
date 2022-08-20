-- origin https://forum.cfx.re/t/devtool-attach-object-to-ped-with-preview/4758930/11

bones = {
	["SKEL_ROOT"] = 0,
	["FB_R_Brow_Out_000"] = 1356,
	["SKEL_L_Toe0"] = 2108,
	["MH_R_Elbow"] = 2992,
	["SKEL_L_Finger01"] = 4089,
	["SKEL_L_Finger02"] = 4090,
	["SKEL_L_Finger31"] = 4137,
	["SKEL_L_Finger32"] = 4138,
	["SKEL_L_Finger41"] = 4153,
	["SKEL_L_Finger42"] = 4154,
	["SKEL_L_Finger11"] = 4169,
	["SKEL_L_Finger12"] = 4170,
	["SKEL_L_Finger21"] = 4185,
	["SKEL_L_Finger22"] = 4186,
	["RB_L_ArmRoll"] = 5232,
	["IK_R_Hand"] = 6286,
	["RB_R_ThighRoll"] = 6442,
	["SKEL_R_Clavicle"] = 10706,
	["FB_R_Lip_Corner_000"] = 11174,
	["SKEL_Pelvis"] = 11816,
	["IK_Head"] = 12844,
	["SKEL_L_Foot"] = 14201,
	["MH_R_Knee"] = 16335,
	["FB_LowerLipRoot_000"] = 17188,
	["FB_R_Lip_Top_000"] = 17719,
	["SKEL_L_Hand"] = 18905,
	["FB_R_CheekBone_000"] = 19336,
	["FB_UpperLipRoot_000"] = 20178,
	["FB_L_Lip_Top_000"] = 20279,
	["FB_LowerLip_000"] = 20623,
	["SKEL_R_Toe0"] = 20781,
	["FB_L_CheekBone_000"] = 21550,
	["MH_L_Elbow"] = 22711,
	["SKEL_Spine0"] = 23553,
	["RB_L_ThighRoll"] = 23639,
	["PH_R_Foot"] = 24806,
	["SKEL_Spine1"] = 24816,
	["SKEL_Spine2"] = 24817,
	["SKEL_Spine3"] = 24818,
	["FB_L_Eye_000"] = 25260,
	["SKEL_L_Finger00"] = 26610,
	["SKEL_L_Finger10"] = 26611,
	["SKEL_L_Finger20"] = 26612,
	["SKEL_L_Finger30"] = 26613,
	["SKEL_L_Finger40"] = 26614,
	["FB_R_Eye_000"] = 27474,
	["SKEL_R_Forearm"] = 28252,
	["PH_R_Hand"] = 28422,
	["FB_L_Lip_Corner_000"] = 29868,
	["SKEL_Head"] = 31086,
	["IK_R_Foot"] = 35502,
	["RB_Neck_1"] = 35731,
	["IK_L_Hand"] = 36029,
	["SKEL_R_Calf"] = 36864,
	["RB_R_ArmRoll"] = 37119,
	["FB_Brow_Centre_000"] = 37193,
	["SKEL_Neck_1"] = 39317,
	["SKEL_R_UpperArm"] = 40269,
	["FB_R_Lid_Upper_000"] = 43536,
	["RB_R_ForeArmRoll"] = 43810,
	["SKEL_L_UpperArm"] = 45509,
	["FB_L_Lid_Upper_000"] = 45750,
	["MH_L_Knee"] = 46078,
	["FB_Jaw_000"] = 46240,
	["FB_L_Lip_Bot_000"] = 47419,
	["FB_Tongue_000"] = 47495,
	["FB_R_Lip_Bot_000"] = 49979,
	["SKEL_R_Thigh"] = 51826,
	["SKEL_R_Foot"] = 52301,
	["IK_Root"] = 56604,
	["SKEL_R_Hand"] = 57005,
	["SKEL_Spine_Root"] = 57597,
	["PH_L_Foot"] = 57717,
	["SKEL_L_Thigh"] = 58271,
	["FB_L_Brow_Out_000"] = 58331,
	["SKEL_R_Finger00"] = 58866,
	["SKEL_R_Finger10"] = 58867,
	["SKEL_R_Finger20"] = 58868,
	["SKEL_R_Finger30"] = 58869,
	["SKEL_R_Finger40"] = 58870,
	["PH_L_Hand"] = 60309,
	["RB_L_ForeArmRoll"] = 61007,
	["SKEL_L_Forearm"] = 61163,
	["FB_UpperLip_000"] = 61839,
	["SKEL_L_Calf"] = 63931,
	["SKEL_R_Finger01"] = 64016,
	["SKEL_R_Finger02"] = 64017,
	["SKEL_R_Finger31"] = 64064,
	["SKEL_R_Finger32"] = 64065,
	["SKEL_R_Finger41"] = 64080,
	["SKEL_R_Finger42"] = 64081,
	["SKEL_R_Finger11"] = 64096,
	["SKEL_R_Finger12"] = 64097,
	["SKEL_R_Finger21"] = 64112,
	["SKEL_R_Finger22"] = 64113,
	["SKEL_L_Clavicle"] = 64729,
	["FACIAL_facialRoot"] = 65068,
	["IK_L_Foot"] = 65245
}

object = nil;
editMode = false;

x = 0.0;
y = -0.18;
z = 0.08;
px = 0.0;
py = 0.0;
pz = 0.0;

bone = nil;

tol = 0.05;

RegisterCommand("co", function(source, args, rawCommand)
  if not args then return end
  local splitArgs = {}
  for match in string.gmatch(args[1], "([^, ]+)") do
    table.insert(splitArgs, match);
  end
  local objectName = splitArgs[1];
  bone = bones[splitArgs[2]];

  local ped = PlayerPedId();
  local hash = GetHashKey(objectName)

  RequestModel(hash)
  while not HasModelLoaded(hash) do
      Citizen.Wait(100)
  end

  object = CreateObject(hash, 1.0, 1.0, 1.0, true, true, false)
  AttachEntityToEntity(object, ped, GetPedBoneIndex(ped, bone), x, y, z, px, py, pz, 1, 1, 0, 0, 2, 1);

  editMode = true;
end, false)

RegisterCommand("cb", function(source, args, rawCommand)
	bone = bones[args[1]];

	DetachEntity(object, true, false);
	AttachEntityToEntity(object, ped, GetPedBoneIndex(ped, bone), x, y, z, px, py, pz, 1, 1, 0, 0, 2, 1);
end)

RegisterCommand("cout", function(source, args, rawCommand)
	print("--------------------------------------------------------");
	print("X: " .. x .. " Y: " .. y .. " Z: " .. z);
	print("PX: " .. px .. " PY: " .. py .. " PZ: " .. pz);
	print("Bone: " .. bone);
	print("--------------------------------------------------------");
	TriggerServerEvent('dg-propattach:tools:writeJson', {
		x = x,
		y = y,
		z = z,
		rx = px,
		ry = py,
		rz = pz,
		bone = bone,
	})
end)

RegisterCommand("cd", function(source, args, rawCommand)

	x = 0.0;
	y = -0.18;
	z = 0.8;
	px = 0.0;
	py = 0.0;
	pz = 0.0;

	DeleteObject(object)
end)

RegisterCommand("cst", function(source, args, rawCommand)
	tol = tonumber(args[1]);
end)

-- position
RegisterCommand("plusz", function(source, args, rawCommand)
	z = z + tol;
	changeCoords();
end, false)
RegisterKeyMapping('plusz', '+ Z', 'keyboard', 'up')

RegisterCommand("minusz", function(source, args, rawCommand)
	z = z - tol;
	changeCoords();
end, false)
RegisterKeyMapping('minusz', '- Z', 'keyboard', 'down')

RegisterCommand("plusy", function(source, args, rawCommand)
	y = y + tol;
	changeCoords();
end, false)
RegisterKeyMapping('plusy', '+ Y', 'keyboard', 'left')

RegisterCommand("minusy", function(source, args, rawCommand)
	y = y - tol;
	changeCoords();
end, false)
RegisterKeyMapping('minusy', '- Y', 'keyboard', 'right')

RegisterCommand("plusx", function(source, args, rawCommand)
	x = x + tol;
	changeCoords();
end, false)
RegisterKeyMapping('plusx', '+ X', 'keyboard', 'numpad5')

RegisterCommand("minusx", function(source, args, rawCommand)
	x = x - tol;
	changeCoords();
end, false)
RegisterKeyMapping('minusx', '- X', 'keyboard', 'numpad8')

-- Rotation
RegisterCommand("pluspz", function(source, args, rawCommand)
	pz = pz + tol * 10;
	changeCoords();
end, false)
RegisterKeyMapping('pluspz', '+ PZ', 'keyboard', 'numpad9')

RegisterCommand("minuspz", function(source, args, rawCommand)
	pz = pz - tol * 10;
	changeCoords();
end, false)
RegisterKeyMapping('minuspz', '- PZ', 'keyboard', 'numpad7')

RegisterCommand("pluspy", function(source, args, rawCommand)
	py = py + tol * 10;
	changeCoords();
end, false)
RegisterKeyMapping('pluspy', '+ PY', 'keyboard', 'numpad6')

RegisterCommand("minuspy", function(source, args, rawCommand)
	py = py - tol * 10;
	changeCoords();
end, false)
RegisterKeyMapping('minuspy', '- PY', 'keyboard', 'numpad4')

RegisterCommand("pluspx", function(source, args, rawCommand)
	px = px + tol * 10;
	changeCoords();
end, false)
RegisterKeyMapping('pluspx', '+ PX', 'keyboard', 'numpad3')

RegisterCommand("minuspx", function(source, args, rawCommand)
	px = px - tol * 10;
	changeCoords();
end, false)
RegisterKeyMapping('minuspx', '- PX', 'keyboard', 'numpad1')

-- amount
RegisterCommand("plustol", function(source, args, rawCommand)
	tol = tol + 0.02;
  if tol < 0 then tol = 0 end
end, false)
RegisterKeyMapping('plustol', '+ TOL', 'keyboard', 'add')

RegisterCommand("minustol", function(source, args, rawCommand)
	tol = tol - 0.02;
  if tol < 0 then tol = 0 end
end, false)
RegisterKeyMapping('minustol', '- TOL', 'keyboard', 'subtract')

function changeCoords()
	DetachEntity(object, true, false);
	local playerPed = PlayerPedId();
	AttachEntityToEntity(object, playerPed, GetPedBoneIndex(playerPed, bone), x, y, z, px, py, pz, 1, 1, 0, 0, 2, 1);
end