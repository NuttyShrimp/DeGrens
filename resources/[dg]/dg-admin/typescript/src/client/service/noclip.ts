import { Keys, PropAttach, Util } from '@dgx/client';
import { getCmdState, setCmdState } from 'modules/commands/state.commands';

let noclipThread: NodeJS.Timer | null = null;
let noclipCam: number | null = null;
let noclipEnt: number | null = null;
let noclipPed: number | null = null;
let noclipSpeed = 1;
const noclipMovingTicks: Record<string, NodeJS.Timer | null> = {
  forward: null,
  backward: null,
  left: null,
  right: null,
  up: null,
  down: null,
};

export const toggleNoclip = (toggle: boolean) => {
  const isEnabled = getCmdState('noclip');
  if (isEnabled === toggle) return;

  if (isEnabled) {
    setCmdState('noclip', false);
    cleanupNoclip();
    return;
  }

  setCmdState('noclip', true);
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
  if (!noclipCam) return;
  AttachCamToEntity(noclipCam, noclipEnt, 0.0, 0.0, 0.0, true);
  RenderScriptCams(true, false, 1, true, false);

  FreezeEntityPosition(noclipEnt, true);
  SetEntityCollision(noclipEnt, false, false);
  SetEntityAlpha(noclipEnt, 0, false);
  SetEntityVisible(noclipEnt, false, false);
  SetPedCanRagdoll(ped, false);

  PropAttach.toggleProps(false);
  DisplayRadar(true);

  const plyId = PlayerId();
  noclipThread = setInterval(() => {
    if (!noclipCam || !noclipEnt) return;
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
  }, 1);
};

export const printDebugInfo = () => {
  if (!getCmdState('noclip') || !noclipCam) {
    console.log('Must be in noclip to do this');
    return;
  }
  const camCoords = Util.ArrayToVector3(GetCamCoord(noclipCam));
  const camRot = Util.ArrayToVector3(GetCamRot(noclipCam, 2));
  console.log(camCoords);
  console.log(camRot);
};

// get noclip data for entityselector
export const getNoclipCamData = () => {
  if (!noclipCam) return;
  const coords = Util.ArrayToVector3(GetCamCoord(noclipCam));
  const rotation = Util.ArrayToVector3(GetCamRot(noclipCam, 0));
  return { coords, rotation };
};

const cleanupNoclip = () => {
  if (noclipThread) {
    clearInterval(noclipThread);
    noclipThread = null;
  }

  if (noclipCam) {
    DestroyCam(noclipCam, false);
  }
  noclipCam = null;
  RenderScriptCams(false, false, 3000, true, false);
  if (noclipEnt) {
    FreezeEntityPosition(noclipEnt, false);
    SetEntityCollision(noclipEnt, true, true);
    SetPedCanRagdoll(noclipEnt, true);
    if (!getCmdState('cloak') || GetEntityType(noclipEnt) !== 1) {
      SetEntityAlpha(noclipEnt, 255, false);
      SetEntityVisible(noclipEnt, true, true);
    }
    ClearPedTasksImmediately(noclipEnt);
  }
  if (noclipPed) {
    FreezeEntityPosition(noclipPed, false);
    SetEntityCollision(noclipPed, true, true);
    SetPedCanRagdoll(noclipPed, true);
    if (!getCmdState('cloak')) {
      SetEntityAlpha(noclipPed, 255, false);
      SetEntityVisible(noclipPed, true, true);
    }
    if (noclipEnt) {
      SetPedIntoVehicle(noclipPed, noclipEnt, -1);
    }
  }
  noclipEnt = null;
  noclipPed = null;
  noclipSpeed = 1;
  for (const key in noclipMovingTicks) {
    let thread = noclipMovingTicks[key as keyof typeof noclipMovingTicks];
    if (!thread) continue;
    clearInterval(thread);
    noclipMovingTicks[key as keyof typeof noclipMovingTicks] = null;
  }

  if (!getCmdState('cloak')) {
    PropAttach.toggleProps(true);
  }

  // disable radar if not in a vehicle
  if (!IsPedInAnyVehicle(PlayerPedId(), true)) {
    DisplayRadar(false);
  }
};

const getMultiplier = (): number => {
  // LSHIFT
  if (IsControlPressed(2, 209) || IsDisabledControlPressed(2, 209)) {
    return 2;
  }
  // LALT
  if (IsControlPressed(2, 19) || IsDisabledControlPressed(2, 19)) {
    return 4;
  }
  // LCTRL
  if (IsControlPressed(2, 36) || IsDisabledControlPressed(2, 36)) {
    return 0.25;
  }
  return 1;
};

const moveX = (dir = 1) => {
  if (!noclipCam) return;
  const fv = GetCamMatrix(noclipCam)[1];
  const fVector = Util.ArrayToVector3(fv).multiply(dir * noclipSpeed * getMultiplier());
  if (!noclipEnt) return;
  const pos = Util.getEntityCoords(noclipEnt).add(fVector);
  SetEntityCoordsNoOffset(noclipEnt, pos.x, pos.y, pos.z, true, true, true);
};

const moveY = (dir = 1) => {
  if (!noclipEnt) return;
  const pos = Util.ArrayToVector3(
    GetOffsetFromEntityInWorldCoords(noclipEnt, dir * noclipSpeed * getMultiplier(), 0, 0)
  );
  pos.z = Util.getEntityCoords(noclipEnt).z;
  SetEntityCoordsNoOffset(noclipEnt, pos.x, pos.y, pos.z, true, true, true);
};

const moveZ = (dir = 1) => {
  if (!noclipEnt) return;
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
  if (IsControlPressed(2, 209) || IsDisabledControlPressed(2, 209)) {
    return 1;
  }
  // LALT
  if (IsControlPressed(2, 19) || IsDisabledControlPressed(2, 19)) {
    return 5;
  }
  // LCTRL
  if (IsControlPressed(2, 36) || IsDisabledControlPressed(2, 36)) {
    return 0.1;
  }
  return 0.5;
};

Keys.onPressDown('admin-noclip-spd-up', () => {
  if (!getCmdState('noclip')) return;
  noclipSpeed = Math.min(noclipSpeed + getSpeedMultiplier(), 32.0);
});
Keys.onPressDown('admin-noclip-spd-down', () => {
  if (!getCmdState('noclip')) return;
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
  if (!getCmdState('noclip')) return;
  if (!isDown) {
    if (noclipMovingTicks.forward) {
      clearInterval(noclipMovingTicks.forward);
      noclipMovingTicks.forward = null;
    }
    return;
  }
  noclipMovingTicks.forward = setInterval(() => {
    moveX(1);
  }, 1);
});

Keys.onPress('admin-noclip-mv-backward', isDown => {
  if (!getCmdState('noclip')) return;
  if (!isDown) {
    if (noclipMovingTicks.backward) {
      clearInterval(noclipMovingTicks.backward);
      noclipMovingTicks.backward = null;
    }
    return;
  }
  noclipMovingTicks.backward = setInterval(() => {
    moveX(-1);
  }, 1);
});

Keys.onPress('admin-noclip-mv-left', isDown => {
  if (!getCmdState('noclip')) return;
  if (!isDown) {
    if (noclipMovingTicks.left) {
      clearInterval(noclipMovingTicks.left);
      noclipMovingTicks.left = null;
    }
    return;
  }
  noclipMovingTicks.left = setInterval(() => {
    moveY(-1);
  }, 1);
});

Keys.onPress('admin-noclip-mv-right', isDown => {
  if (!getCmdState('noclip')) return;
  if (!isDown) {
    if (noclipMovingTicks.right) {
      clearInterval(noclipMovingTicks.right);
      noclipMovingTicks.right = null;
    }
    return;
  }
  noclipMovingTicks.right = setInterval(() => {
    moveY(1);
  }, 1);
});

Keys.onPress('admin-noclip-mv-up', isDown => {
  if (!getCmdState('noclip')) return;
  if (!isDown) {
    if (noclipMovingTicks.up) {
      clearInterval(noclipMovingTicks.up);
      noclipMovingTicks.up = null;
    }
    return;
  }
  noclipMovingTicks.up = setInterval(() => {
    moveZ(1);
  }, 1);
});

Keys.onPress('admin-noclip-mv-down', isDown => {
  if (!getCmdState('noclip')) return;
  if (!isDown) {
    if (noclipMovingTicks.down) {
      clearInterval(noclipMovingTicks.down);
      noclipMovingTicks.down = null;
    }
    return;
  }
  noclipMovingTicks.down = setInterval(() => {
    moveZ(-1);
  }, 1);
});
// endregion
