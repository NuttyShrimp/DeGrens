import { Events, Inventory, Jobs, Notifications, RPC, Taskbar, Util } from '@dgx/server';
import { BLOCKED_CASINGS_WEAPONS } from './constants.evidence';
import { addBloodDrop, addEvidence, getAllEvidenceInArea, takeEvidence } from './service.evidence';

global.exports('addBulletCasings', (plyId: number, itemState: Inventory.ItemState, shotFirePositions: Vec3[]) => {
  const vehicle = GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false);
  const type = GetVehicleType(vehicle);
  if (vehicle !== 0 && type !== 'bike') return;
  if (BLOCKED_CASINGS_WEAPONS.has(Util.getHash(itemState.name))) return;

  shotFirePositions.forEach(pos => {
    addEvidence({ x: pos.x, y: pos.y, z: pos.z - 0.95 }, 'bullet', itemState.metadata.serialnumber);
  });
});

global.exports('addBloodDrop', addBloodDrop);
Events.onNet('police:evidence:addBloodDrop', addBloodDrop);

Events.onNet('police:evidence:dropVehicleDamage', (src: number, color: string, coords: Vec3) => {
  addEvidence(coords, 'vehicleDamage', color);
});

// We limit to 75 other wise player will lagg the fuck out
RPC.register('police:evidence:getAllInArea', (src: number) => {
  const plyCoords = Util.getPlyCoords(src);
  const evidence = getAllEvidenceInArea(plyCoords);
  if (evidence.length <= 75) return evidence;
  return evidence.slice(-75);
});

Events.onNet('police:evidence:take', (src: number, evidenceId: string) => {
  takeEvidence(src, evidenceId);
});

Events.onNet('police:evidence:researchBlood', async (src: number) => {
  if (Jobs.getCurrentJob(src) !== 'ambulance') return;
  const itemState = await Inventory.getFirstItemOfNameOfPlayer(src, 'evidence_blood');
  if (!itemState) return;
  Inventory.destroyItem(itemState.id);
  Inventory.addItemToPlayer(src, 'evidence_dna', 1, { dna: itemState.metadata.dna });
});

Inventory.registerUseable('dna_swab', async src => {
  const job = Jobs.getCurrentJob(src);
  if (!job || !['police', 'ambulance'].includes(job)) return;

  const target = Util.getClosestPlayerOutsideVehicle(src);
  if (!target) {
    Notifications.add(src, 'Er is niemand in de buurt', 'error');
    return;
  }

  Notifications.add(target, 'Je dna wordt genomen, mondje open');
  const [canceled] = await Taskbar.create(src, 'dna', 'DNA Nemen', 5000, {
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
