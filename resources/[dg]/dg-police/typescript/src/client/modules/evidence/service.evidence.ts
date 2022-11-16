import { Events, Inventory, Minigames, Notifications, PolyTarget, RayCast, RPC, Taskbar, Util } from '@dgx/client';
import { Vector3 } from '@dgx/shared';

let evidence: Police.Evidence.Evidence[] = [];
let evidenceThread: NodeJS.Timer | null = null;

export const startEvidenceThread = async () => {
  stopEvidenceThread();
  evidence = (await RPC.execute('police:evidence:getAllInArea')) ?? [];

  evidenceThread = setInterval(() => {
    const position = Util.ArrayToVector3(GetOffsetFromEntityInWorldCoords(PlayerPedId(), 0, 2, 0));
    evidence.forEach(e => {
      if (position.distance(e.coords) > 5) return;
      DrawMarker(
        27,
        e.coords.x,
        e.coords.y,
        e.coords.z,
        0,
        0,
        0,
        0,
        0,
        0,
        0.1,
        0.1,
        0.3,
        250,
        0,
        50,
        255,
        false,
        true,
        2,
        false,
        //@ts-ignore
        null,
        //@ts-ignore
        null,
        false
      );
      const text = e.type === 'blood' ? 'Bloed' : 'Kogelhuls';
      drawText(`[~g~E~w~] - ${text}`, { x: e.coords.x, y: e.coords.y, z: e.coords.z + 0.3 });
    });
  }, 1);
};

export const stopEvidenceThread = () => {
  if (evidenceThread === null) return;
  clearInterval(evidenceThread);
  evidenceThread = null;
};

const drawText = (text: string, coords: Vec3) => {
  SetTextScale(0.35, 0.35);
  SetTextFont(4);
  SetTextProportional(true);
  SetTextColour(255, 255, 255, 215);
  SetTextEntry('STRING');
  SetTextCentre(true);
  AddTextComponentString(text);
  SetDrawOrigin(coords.x, coords.y, coords.z, 0);
  DrawText(0.0, 0.0);
  const factor = text.length / 370;
  DrawRect(0.0, 0.0 + 0.0125, 0.017 + factor, 0.03, 0, 0, 0, 50);
  ClearDrawOrigin();
};

export const takeEvidence = async () => {
  if (evidenceThread === null) return;
  const coords = RayCast.getLastHitCoord();
  if (!coords) return;

  const coordsVector = Vector3.create(coords);
  const targetedEvidenceIdx = evidence.findIndex(e => coordsVector.distance(e.coords) < 0.3);
  if (targetedEvidenceIdx === -1) return;
  const evidenceId = evidence[targetedEvidenceIdx].id;
  evidence.splice(targetedEvidenceIdx, 1);
  Events.emitNet('police:evidence:take', evidenceId);
};

export const buildLabPeekZone = (coords: Vec3) => {
  PolyTarget.addCircleZone('police_evidence_lab', coords, 1, { useZ: true, data: {} });
};

export const researchBlood = async () => {
  const hasBlood = await Inventory.doesPlayerHaveItems('evidence_blood');
  if (!hasBlood) {
    Notifications.add('Je hebt niks om te onderzoeken', 'error');
    return;
  }

  const success = await Minigames.keygame(2, 8, 15);
  if (!success) return;

  const [canceled] = await Taskbar.create('microscope', 'Onderzoeken', 30000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disableInventory: true,
    disablePeek: true,
    disarm: true,
    animation: {
      animDict: 'anim@amb@clubhouse@tutorial@bkr_tut_ig3@',
      anim: 'machinic_loop_mechandplayer',
      flags: 16,
    },
  });
  if (canceled) return;

  Events.emitNet('police:evidence:researchBlood');
};
