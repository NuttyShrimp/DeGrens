import { Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

const activeLoopedParticles = new Map<string, Misc.Particles.Data & { ptfx?: number }>();
const entityToPtfxIds = new Map<number, Set<string>>();

export const createParticle = async (id: string, data: Misc.Particles.Data) => {
  // check if looped ptfx with id already exists, but make sure entity is valid (ptfx does not stop when entity does not exist anymore)
  if (data.looped) {
    const active = activeLoopedParticles.get(id);
    if (active?.ptfx && 'netId' in active) {
      if (NetworkDoesEntityExistWithNetworkId(active.netId) && DoesParticleFxLoopedExist(active.ptfx)) return;
    }
  }

  await Util.loadPtfx(data.dict);
  UseParticleFxAsset(data.dict);

  const offset = data.offset ?? Vector3.create(0);
  const rotation = data.rotation ?? Vector3.create(0);
  const scale = data.scale ?? 1;

  let ptfx: number | undefined = undefined;
  if ('coords' in data) {
    // COORDS
    const coords = Vector3.create(data.coords).add(offset);
    if (data.looped) {
      ptfx = StartParticleFxLoopedAtCoord(
        data.name,
        coords.x,
        coords.y,
        coords.z,
        rotation.x,
        rotation.y,
        rotation.z,
        scale,
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
        rotation.x,
        rotation.y,
        rotation.z,
        scale,
        false,
        false,
        false
      );
    }
  } else if ('netId' in data) {
    if (!NetworkDoesEntityExistWithNetworkId(data.netId)) return;
    const entity = NetworkGetEntityFromNetworkId(data.netId);
    if (!entity || !DoesEntityExist(entity)) return;

    if ('boneName' in data || 'boneIndex' in data) {
      let boneIndex: number;
      if ('boneName' in data) {
        boneIndex = GetEntityBoneIndexByName(entity, data.boneName);
      } else {
        boneIndex = GetPedBoneIndex(entity, data.boneIndex);
      }

      const bonePos = Util.ArrayToVector3(GetWorldPositionOfEntityBone(entity, boneIndex));
      const boneOffset = Util.ArrayToVector3(
        GetOffsetFromEntityGivenWorldCoords(entity, bonePos.x, bonePos.y, bonePos.z)
      );
      const finalOffset = boneOffset.add(offset);

      let finalRotation = rotation;
      if (data.ignoreBoneRotation !== true) {
        const boneRot = Util.ArrayToVector3(GetEntityBoneRotationLocal(entity, boneIndex));
        finalRotation = boneRot.add(finalRotation);
      }

      // we dont use the onBone version of the function to make it easier to ignore rotation of bone
      if (data.looped) {
        ptfx = StartParticleFxLoopedOnEntity(
          data.name,
          entity,
          finalOffset.x,
          finalOffset.y,
          finalOffset.z,
          finalRotation.x,
          finalRotation.y,
          finalRotation.z,
          scale,
          false,
          false,
          false
        );
      } else {
        StartNetworkedParticleFxNonLoopedOnEntity(
          data.name,
          entity,
          finalOffset.x,
          finalOffset.y,
          finalOffset.z,
          finalRotation.x,
          finalRotation.y,
          finalRotation.z,
          scale,
          false,
          false,
          false
        );
      }
    } else {
      if (data.looped) {
        ptfx = StartParticleFxLoopedOnEntity(
          data.name,
          entity,
          offset.x,
          offset.y,
          offset.z,
          rotation.x,
          rotation.y,
          rotation.z,
          scale,
          false,
          false,
          false
        );
      } else {
        StartNetworkedParticleFxNonLoopedOnEntity(
          data.name,
          entity,
          offset.x,
          offset.y,
          offset.z,
          rotation.x,
          rotation.y,
          rotation.z,
          scale,
          false,
          false,
          false
        );
      }
    }
  } else {
    throw new Error('Invalid particle data, must have coords or netId defined');
  }

  RemoveNamedPtfxAsset(data.dict);
  if (data.looped) {
    activeLoopedParticles.set(id, { ...data, ptfx });
  }
};

export const removeParticle = (id: string) => {
  const data = activeLoopedParticles.get(id);
  if (!data || !data.ptfx || !DoesParticleFxLoopedExist(data.ptfx)) return;
  StopParticleFxLooped(data.ptfx, false);
  RemoveParticleFx(data.ptfx, true);
  activeLoopedParticles.delete(id);
};

export const handleEntityPtfxStateChange = (entity: number, newPtfx: Record<string, Misc.Particles.Data>) => {
  // first remove active ptfx that is no longer in new state
  let existingPtfx = entityToPtfxIds.get(entity);
  if (existingPtfx) {
    for (const id of existingPtfx) {
      if (newPtfx[id]) continue;
      removeParticle(id);
      existingPtfx.delete(id);
    }
  } else {
    existingPtfx = new Set<string>();
    entityToPtfxIds.set(entity, existingPtfx);
  }

  // add new ptfx that is not in old state
  for (const id of Object.keys(newPtfx)) {
    if (existingPtfx?.has(id)) continue;
    createParticle(id, newPtfx[id]);
    existingPtfx.add(id);
  }
};

export const startEntityParticleCleanThread = () => {
  setInterval(() => {
    for (const [entity, ptfxIds] of entityToPtfxIds) {
      if (!DoesEntityExist(entity)) {
        for (const id of ptfxIds) {
          removeParticle(id);
        }
        entityToPtfxIds.delete(entity);
      }
    }
  }, 1000);
};
