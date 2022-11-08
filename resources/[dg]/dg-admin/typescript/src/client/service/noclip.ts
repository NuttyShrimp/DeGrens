import { Keys, Util } from '@dgx/client';

let noclipEnabled = false;
let noclipTick: number | null = null;
let noclipCam: number | null = null;
let noclipEnt: number | null = null;
let noclipPed: number | null = null;
let noclipSpeed = 1;
const noclipMovingTicks = {
  forward: 0,
  backward: 0,
  left: 0,
  right: 0,
  up: 0,
  down: 0,
};

export const isNoclipEnabled = () => {
  return noclipEnabled;
};

export const toggleNoclip = () => {
  noclipEnabled = !noclipEnabled;
  cleanupNoclip();
  if (!noclipEnabled) return;
  // Noclip logic
  const ped = PlayerPedId();
  const veh = GetVehiclePedIsIn(ped, false);
  if (veh) {
    noclipEnt = veh;
    noclipPed = ped;
  } else {
    noclipEnt = ped;
    noclipPed = null;
  }

  const pos = Util.getEntityCoords(noclipEnt);
  const rot = Util.getEntityRotation(noclipEnt);
  noclipCam = CreateCamWithParams('DEFAULT_SCRIPTED_CAMERA', pos.x, pos.y, pos.z, 0, 0, rot.z, 75.0, true, 2);
  AttachCamToEntity(noclipCam, noclipEnt, 0.0, 0.0, 0.0, true);
  RenderScriptCams(true, false, 1, true, false);

  FreezeEntityPosition(noclipEnt, true);
  SetEntityCollision(noclipEnt, false, false);
  SetEntityAlpha(noclipEnt, 0, false);
  SetEntityVisible(noclipEnt, false, false);
  SetPedCanRagdoll(ped, false);

  const plyId = PlayerId();
  noclipTick = setTick(() => {
    const camRot = GetCamRot(noclipCam, 2);
    SetEntityHeading(noclipEnt, (360 + camRot[2]) % 360);
    DisablePlayerFiring(plyId, true);

    const rightAxisX = GetDisabledControlNormal(0, 220);
    const rightAxisY = GetDisabledControlNormal(0, 221);

    if (Math.abs(rightAxisX) > 0 && Math.abs(rightAxisY) > 0) {
      const rotX = camRot[0];
      const yValue = rightAxisY * -5;
      const rotZ = camRot[2] + rightAxisX * -10;
      const rotXY = rotX + yValue;
      if (rotXY > -89 && rotXY < 89) {
        SetCamRot(noclipCam, rotXY, camRot[1], rotZ, 2);
      } else {
        SetCamRot(noclipCam, rotX, camRot[1], rotZ, 2);
      }
    }
  });
};

export const printDebugInfo = () => {
  if (!noclipEnabled) {
    console.log('Must be in noclip to do this');
  }
  const camCoords = Util.ArrayToVector3(GetCamCoord(noclipCam));
  const camRot = Util.ArrayToVector3(GetCamRot(noclipCam, 2));
  console.log(camCoords);
  console.log(camRot);
};

const cleanupNoclip = () => {
  if (noclipTick) {
    clearTick(noclipTick);
    noclipTick = null;
  }
  DestroyCam(noclipCam, false);
  noclipCam = null;
  RenderScriptCams(false, false, 3000, true, false);
  FreezeEntityPosition(noclipEnt, false);
  SetEntityCollision(noclipEnt, true, true);
  SetEntityAlpha(noclipEnt, 255, false);
  SetPedCanRagdoll(noclipEnt, true);
  SetEntityVisible(noclipEnt, true, true);
  ClearPedTasksImmediately(noclipEnt);
  if (noclipPed) {
    FreezeEntityPosition(noclipPed, false);
    SetEntityCollision(noclipPed, true, true);
    SetEntityAlpha(noclipPed, 255, false);
    SetEntityVisible(noclipPed, true, true);
    SetPedCanRagdoll(noclipPed, true);
    SetPedIntoVehicle(noclipPed, noclipEnt, -1);
  }
  noclipEnt = null;
  noclipPed = null;
  noclipSpeed = 1;
  for (const key in noclipMovingTicks) {
    clearTick(noclipMovingTicks[key as keyof typeof noclipMovingTicks]);
    noclipMovingTicks[key as keyof typeof noclipMovingTicks] = 0;
  }
};

const getMultiplier = (): number => {
  // LSHIFT
  if (IsControlPressed(2, 209)) {
    return 2;
  }
  // LALT
  if (IsControlPressed(2, 19)) {
    return 4;
  }
  // LCTRL
  if (IsControlPressed(2, 36)) {
    return 0.25;
  }
  return 1;
};

const moveX = (dir = 1) => {
  const fv = GetCamMatrix(noclipCam)[1];
  const fVector = Util.ArrayToVector3(fv).multiply(dir * noclipSpeed * getMultiplier());
  const pos = Util.getEntityCoords(noclipEnt).add(fVector);
  SetEntityCoordsNoOffset(noclipEnt, pos.x, pos.y, pos.z, true, true, true);
};

const moveY = (dir = 1) => {
  const pos = Util.ArrayToVector3(
    GetOffsetFromEntityInWorldCoords(noclipEnt, dir * noclipSpeed * getMultiplier(), 0, 0)
  );
  pos.z = Util.getEntityCoords(noclipEnt).z;
  SetEntityCoordsNoOffset(noclipEnt, pos.x, pos.y, pos.z, true, true, true);
};

const moveZ = (dir = 1) => {
  const pos = Util.ArrayToVector3(
    GetOffsetFromEntityInWorldCoords(noclipEnt, 0, 0, (dir * noclipSpeed * getMultiplier()) / 2)
  );
  SetEntityCoordsNoOffset(noclipEnt, pos.x, pos.y, pos.z, true, true, true);
};

// region Speed
Keys.register('admin-noclip-spd-up', '(zAdmin) Noclip speed up', 'IOM_WHEEL_UP', 'MOUSE_WHEEL');
Keys.register('admin-noclip-spd-down', '(zAdmin) Noclip speed down', 'IOM_WHEEL_DOWN', 'MOUSE_WHEEL');

const getSpeedMultiplier = (): number => {
  // LSHIFT
  if (IsControlPressed(2, 209)) {
    return 1;
  }
  // LALT
  if (IsControlPressed(2, 19)) {
    return 5;
  }
  // LCTRL
  if (IsControlPressed(2, 36)) {
    return 0.1;
  }
  return 0.5;
};

Keys.onPressDown('admin-noclip-spd-up', () => {
  noclipSpeed = Math.min(noclipSpeed + getSpeedMultiplier(), 32.0);
});
Keys.onPressDown('admin-noclip-spd-down', () => {
  noclipSpeed = Math.max(noclipSpeed - getSpeedMultiplier(), 0.1);
});
// endregion

// region Movement
Keys.register('admin-noclip-mv-forward', '(zAdmin) Noclip forward', 'W');
Keys.register('admin-noclip-mv-backward', '(zAdmin) Noclip backward', 'S');
Keys.register('admin-noclip-mv-left', '(zAdmin) Noclip move left', 'A');
Keys.register('admin-noclip-mv-right', '(zAdmin) Noclip move right', 'D');
Keys.register('admin-noclip-mv-up', '(zAdmin) Noclip move up', 'Q');
Keys.register('admin-noclip-mv-down', '(zAdmin) Noclip move down', 'E');

Keys.onPress('admin-noclip-mv-forward', isDown => {
  if (!noclipEnabled) return;
  if (!isDown) {
    if (noclipMovingTicks.forward > 0) {
      clearTick(noclipMovingTicks.forward);
      noclipMovingTicks.forward = 0;
    }
    return;
  }
  noclipMovingTicks.forward = setTick(() => {
    moveX(1);
  });
});

Keys.onPress('admin-noclip-mv-backward', isDown => {
  if (!noclipEnabled) return;
  if (!isDown) {
    if (noclipMovingTicks.backward > 0) {
      clearTick(noclipMovingTicks.backward);
      noclipMovingTicks.backward = 0;
    }
    return;
  }
  noclipMovingTicks.backward = setTick(() => {
    moveX(-1);
  });
});

Keys.onPress('admin-noclip-mv-left', isDown => {
  if (!noclipEnabled) return;
  if (!isDown) {
    if (noclipMovingTicks.left > 0) {
      clearTick(noclipMovingTicks.left);
      noclipMovingTicks.left = 0;
    }
    return;
  }
  noclipMovingTicks.left = setTick(() => {
    moveY(-1);
  });
});

Keys.onPress('admin-noclip-mv-right', isDown => {
  if (!noclipEnabled) return;
  if (!isDown) {
    if (noclipMovingTicks.right > 0) {
      clearTick(noclipMovingTicks.right);
      noclipMovingTicks.right = 0;
    }
    return;
  }
  noclipMovingTicks.right = setTick(() => {
    moveY(1);
  });
});

Keys.onPress('admin-noclip-mv-up', isDown => {
  if (!noclipEnabled) return;
  if (!isDown) {
    if (noclipMovingTicks.up > 0) {
      clearTick(noclipMovingTicks.up);
      noclipMovingTicks.up = 0;
    }
    return;
  }
  noclipMovingTicks.up = setTick(() => {
    moveZ(1);
  });
});

Keys.onPress('admin-noclip-mv-down', isDown => {
  if (!noclipEnabled) return;
  if (!isDown) {
    if (noclipMovingTicks.down > 0) {
      clearTick(noclipMovingTicks.down);
      noclipMovingTicks.down = 0;
    }
    return;
  }
  noclipMovingTicks.down = setTick(() => {
    moveZ(-1);
  });
});
// endregion
