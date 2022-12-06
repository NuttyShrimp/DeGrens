import { Events, Inventory, Jobs, Notifications, RPC, Taskbar, Util } from '@dgx/server';
import { BLOCKED_CASINGS_WEAPONS } from './constants.evidence';
import { addEvidence, getAllEvidenceInArea, takeEvidence } from './service.evidence';

global.exports('addBulletCasings', (plyId: number, itemState: Inventory.ItemState, shotFirePositions: Vec3[]) => {
  const vehicle = GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false);
  const type = GetVehicleType(vehicle);
  if (vehicle !== 0 && type !== 'bike') return;
  if (BLOCKED_CASINGS_WEAPONS.has(GetHashKey(itemState.name))) return;

  shotFirePositions.forEach(pos => {
    addEvidence({ x: pos.x, y: pos.y, z: pos.z - 0.95 }, 'bullet', itemState.metadata.serialnumber);
  });
});

// TODO: add to ambu resource when finished
Events.onNet('police:evidence:dropBloop', (src: number) => {
  const player = DGCore.Functions.GetPlayer(src);
  const plyCoords = Util.getPlyCoords(src);
  addEvidence({ x: plyCoords.x, y: plyCoords.y, z: plyCoords.z - 0.95 }, 'blood', player.PlayerData.metadata.dna);
});

// We limit to 75 other wise player will lagg the fuck out
RPC.register('police:evidence:getAllInArea', (src: number) => {
  const plyCoords = Util.getPlyCoords(src);
  const evidence = getAllEvidenceInArea(plyCoords);
  const limit = Math.min(evidence.length, 75);
  return evidence.slice(-1 * limit);
});

Events.onNet('police:evidence:take', (src: number, evidenceId: string) => {
  takeEvidence(src, evidenceId);
});

Events.onNet('police:evidence:researchBlood', async (src: number) => {
  const itemState = await Inventory.getFirstItemOfNameOfPlayer(src, 'evidence_blood');
  if (!itemState) return;
  Inventory.destroyItem(itemState.id);
  Inventory.addItemToPlayer(src, 'evidence_dna', 1, { dna: itemState.metadata.dna });
});

Inventory.registerUseable('dna_swab', async src => {
  if (Jobs.getCurrentJob(src) !== 'police') return;
  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (!target) {
    Notifications.add(src, 'Er is niemand in de buurt', 'error');
    return;
  }

  const [canceled] = await Taskbar.create(src, 'dna_swab_taking', 'dna', 'DNA Nemen', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });
  if (canceled) return;

  const player = DGCore.Functions.GetPlayer(target);
  if (!player) return;
  Inventory.addItemToPlayer(src, 'evidence_dna', 1, { dna: player.PlayerData.metadata.dna });
});
