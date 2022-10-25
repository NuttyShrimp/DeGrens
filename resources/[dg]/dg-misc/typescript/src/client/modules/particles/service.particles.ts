import { Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

const activeParticles: Map<string, Particles.Data> = new Map();

export const getIsLooped = (id: string) => activeParticles.get(id)?.looped ?? false;

export const addParticle = async (id: string, data: Required<Particles.Particle>) => {
  if (activeParticles.has(id)) return;

  await loadPtfx(data.dict);
  UseParticleFxAsset(data.dict);

  let ptfx: number | undefined = undefined;
  if ('coords' in data) {
    // COORDS
    const coords = Vector3.create(data.coords).add(data.offset);
    if (data.looped) {
      ptfx = StartParticleFxLoopedAtCoord(
        data.name,
        coords.x,
        coords.y,
        coords.z,
        data.rotation.x,
        data.rotation.y,
        data.rotation.z,
        data.scale,
        false,
        false,
        false,
        false
      );
    } else {
      StartNetworkedParticleFxNonLoopedAtCoord(
        data.name,
        coords.x,
        coords.y,
        coords.z,
        data.rotation.x,
        data.rotation.y,
        data.rotation.z,
        data.scale,
        false,
        false,
        false
      );
    }
  } else if ('boneName' in data) {
    // // BONE
    const entity = NetworkGetEntityFromNetworkId(data.netId);
    const boneIndex = GetEntityBoneIndexByName(entity, data.boneName);
    const bonePos = Util.ArrayToVector3(GetWorldPositionOfEntityBone(entity, boneIndex));
    const boneOffset = Util.ArrayToVector3(
      GetOffsetFromEntityGivenWorldCoords(entity, bonePos.x, bonePos.y, bonePos.z)
    );
    data.offset = boneOffset.add(data.offset);
    if (data.ignoreBoneRotation !== true) {
      const boneRot = Util.ArrayToVector3(GetEntityBoneRotationLocal(entity, boneIndex));
      data.rotation = boneRot.add(data.rotation);
    }
    if (data.looped) {
      ptfx = StartParticleFxLoopedOnEntity(
        data.name,
        entity,
        data.offset.x,
        data.offset.y,
        data.offset.z,
        data.rotation.x,
        data.rotation.y,
        data.rotation.z,
        data.scale,
        false,
        false,
        false
      );
    } else {
      StartNetworkedParticleFxNonLoopedOnEntity(
        data.name,
        entity,
        data.offset.x,
        data.offset.y,
        data.offset.z,
        data.rotation.x,
        data.rotation.y,
        data.rotation.z,
        data.scale,
        false,
        false,
        false
      );
    }
  } else {
    // ENTITY
    const entity = NetworkGetEntityFromNetworkId(data.netId);
    if (data.looped) {
      ptfx = StartParticleFxLoopedOnEntity(
        data.name,
        entity,
        data.offset.x,
        data.offset.y,
        data.offset.z,
        data.rotation.x,
        data.rotation.y,
        data.rotation.z,
        data.scale,
        false,
        false,
        false
      );
    } else {
      StartNetworkedParticleFxNonLoopedOnEntity(
        data.name,
        entity,
        data.offset.x,
        data.offset.y,
        data.offset.z,
        data.rotation.x,
        data.rotation.y,
        data.rotation.z,
        data.scale,
        false,
        false,
        false
      );
    }
  }

  RemoveNamedPtfxAsset(data.dict);
  activeParticles.set(id, { ...data, ptfx });
};

export const removeParticle = (id: string) => {
  const data = activeParticles.get(id)!;
  if (!data) return;
  if (!data.ptfx) return;
  if (!DoesParticleFxLoopedExist(data.ptfx)) return;
  StopParticleFxLooped(data.ptfx, false);
  RemoveParticleFx(data.ptfx, true);
};

const loadPtfx = (ptfx: string) => {
  RequestNamedPtfxAsset(ptfx);
  return Util.awaitCondition(() => HasNamedPtfxAssetLoaded(ptfx));
};
