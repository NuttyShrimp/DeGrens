import { Events, Jobs, Keys, Peek, Util } from '@dgx/client';
import { getNearestColorFromHex } from '@dgx/shared/helpers/colorNames';
import { getDataOfGTAColorById } from '@dgx/shared/helpers/gtacolors';
import { researchBlood, startEvidenceThread, stopEvidenceThread, takeEvidence } from './service.evidence';

on('weapons:startedFreeAiming', (itemState: Inventory.ItemState) => {
  if (itemState.name !== 'weapon_flashlight') return;
  if (Jobs.getCurrentJob().name !== 'police') return;
  startEvidenceThread();
});

on('weapons:stoppedFreeAiming', () => {
  stopEvidenceThread();
});

Keys.onPressDown('GeneralUse', () => {
  takeEvidence();
});

Peek.addZoneEntry('police_evidence_lab', {
  options: [
    {
      label: 'Onderzoek bloed',
      icon: 'fas fa-dna',
      job: 'police',
      action: () => {
        researchBlood();
      },
    },
  ],
  distance: 1.5,
});

// Handles vehicle damage evidence when entity gets damaged
const vehicleColorCache = new Map<number, string>();
on('entityDamaged', (entity: number, origin: number, weaponHash: number) => {
  if (origin !== PlayerPedId()) return; // only damage inflicted by self
  if (GetEntityType(entity) !== 2) return; // only damage inflicted on vehicles
  if (!NetworkGetEntityIsNetworked(entity)) return;

  // First we get color of vehicle
  let color = vehicleColorCache.get(entity);
  if (color === undefined) {
    if (GetIsVehiclePrimaryColourCustom(entity)) {
      const [r, g, b] = GetVehicleCustomPrimaryColour(entity);
      color = getNearestColorFromHex({ r, g, b }) as string;
    } else {
      const colorId = GetVehicleColours(entity)[0];
      color = getDataOfGTAColorById(colorId)?.name ?? 'Unknown Color';
    }
    vehicleColorCache.set(entity, color);
  }

  // Estimate ground pos of veh
  const [x, y, z] = GetEntityCoords(entity, false);
  const [min, max] = GetModelDimensions(GetEntityModel(entity));
  const zOffset = (max[2] - min[2]) / 2 - 0.4;

  Events.emitNet('police:evidence:dropVehicleDamage', color, { x, y, z: z - zOffset });
});
