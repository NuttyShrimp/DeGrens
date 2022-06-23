import { Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

export const GetOffsets = (num: number, multi: number, multiplier: number) => {
  if (num !== 0) {
    if (multi !== 0) {
      return num + multi * multiplier;
    }
    return num;
  }
};

export const OffsetsModulo = (vect: Vector3, pModulo: Buildplan['modulo'], multi: number) => {
  let modulo = multi % pModulo.xLimit;

  const yOffset = Math.ceil(multi / pModulo.xLimit);
  const zOffset = Math.ceil(multi / (pModulo.yLimit * pModulo.xLimit));

  if (modulo == 0) {
    modulo = multi / yOffset;
  }
  const yModulo = (yOffset % pModulo.yLimit) + 1;

  const x = vect.x + modulo * pModulo.multi.x;
  const y = vect.y + yModulo * pModulo.multi.y;
  const z = vect.z + zOffset * pModulo.multi.z;
  return new Vector3(x, y, z);
};

export const getGeneratorFromRoom = (plan: Buildplan, multi: number) => {
  let generator = new Vector3(100.0, 100.0, -100.0);

  if (plan.generator) {
    generator = new Vector3(plan.generator.x, plan.generator.y, plan.generator.z);
    if (plan.offsetX) {
      const x = GetOffsets(plan.offsetX.num, plan.offsetX.multi, multi);
      const y = GetOffsets(plan.offsetY.num, plan.offsetY.multi, multi);
      const z = GetOffsets(plan.offsetZ.num, plan.offsetZ.multi, multi);
      return new Vector3(x, y, z);
    }
    if (plan.modulo) {
      return OffsetsModulo(generator, plan.modulo, multi);
    }
  }
};

export const setCorrectZ = (obj: number, offsetZ: number) => {
  const [d1] = GetModelDimensions(GetEntityModel(obj));
  const pos = Util.getEntityCoords(obj);
  const bot = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(obj, 0.0, 0.0, d1[2]));
  SetEntityCoords(obj, pos.x, pos.y, pos.subtract(bot).add(offsetZ).x, false, false, false, false);
};

export const FloatTilSafe = async (model: string) => {
  let ped = PlayerPedId();
  const objModel = GetHashKey(model);
  RequestModel(objModel);
  SetEntityInvincible(ped, true);
  FreezeEntityPosition(ped, true);
  let timeout = 40;
  while (timeout > 0) {
    ped = PlayerPedId();
    await Util.Delay(250);
    const pedCol = HasCollisionLoadedAroundEntity(ped);
    const modelCol = HasCollisionForModelLoaded(objModel);
    const modelLoaded = HasModelLoaded(objModel);
    if (pedCol && modelCol && modelLoaded) {
      timeout = -2;
    }
    if (Util.isDevEnv()) {
      console.log(
        `Waiting for collision to load... ${timeout} | PedCol: ${pedCol} | ModelCol: ${modelCol} | ModelLoaded: ${modelLoaded}`
      );
    }

    timeout--;
  }
  return timeout <= -2;
};
