import { Core, Events, Inventory, Jobs, Notifications, RPC, Taskbar, UI, Util } from '@dgx/server';
import { BLOCKED_CASINGS_WEAPONS } from './constants.evidence';
import { addBloodDrop, addEvidence, getAllEvidenceInArea, getCidOfDNA, takeEvidence } from './service.evidence';

global.exports('addBulletCasings', (plyId: number, itemState: Inventory.ItemState, shotFirePositions: Vec3[]) => {
  const vehicle = GetVehiclePedIsIn(GetPlayerPed(String(plyId)), false);
  const type = GetVehicleType(vehicle);
  if (vehicle !== 0 && type !== 'bike') return;
  if (BLOCKED_CASINGS_WEAPONS.has(GetHashKey(itemState.name) >>> 0)) return;

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

  // As police, can only use when no ambu on duty
  if (job === 'police' && Jobs.getAmountForJob('ambulance') > 0) {
    Notifications.add(src, 'Er is een ambulanier aanwezig die dit beter kan!', 'error');
    return;
  }

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

  const player = Core.getPlayer(target);
  if (!player) return;
  Inventory.addItemToPlayer(src, 'evidence_dna', 1, { dna: player.metadata.dna });
});

Inventory.registerUseable('evidence_dna', async (src, item) => {
  let charModule = Core.getModule('characters');
  UI.addToClipboard(src, item.metadata.dna);

  // TODO: Remove this as its a temporary solution
  // Currently police have NO way of getting a persons name if he doesnt have an ID

  const job = Jobs.getCurrentJob(src);
  if (job !== 'police') return;

  const cid = await getCidOfDNA(item.metadata.dna);
  if (!cid) return;

  const targetPlayer = await charModule.getOfflinePlayer(cid);
  if (!targetPlayer) return;

  Notifications.add(
    src,
    `DNA behoort tot ${targetPlayer.charinfo.firstname} ${targetPlayer.charinfo.lastname} (CID: ${targetPlayer.citizenid})`
  );
});
