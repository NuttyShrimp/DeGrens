import { Inventory, Util } from '@dgx/server';
import { Vector3 } from '@dgx/shared';

const evidence: Police.Evidence.Evidence[] = [];

export const getAllEvidenceInArea = (coords: Vector3) => evidence.filter(e => coords.distance(e.coords) < 25);

export const addEvidence = (coords: Vec3, type: Police.Evidence.Type, info: string) => {
  const vec = Vector3.create(coords);
  if (evidence.some(e => vec.distance(e.coords) < 0.25)) return;
  const id = Util.uuidv4();
  evidence.push({
    id,
    type,
    coords,
    info,
  });
};

export const takeEvidence = (plyId: number, evidenceId: string) => {
  const idx = evidence.findIndex(e => e.id === evidenceId);
  if (idx === -1) return;
  const data = evidence[idx];
  evidence.splice(idx, 1);
  switch (data.type) {
    case 'blood':
      Inventory.addItemToPlayer(plyId, 'evidence_blood', 1, { hiddenKeys: ['dna', 'hiddenKeys'], dna: data.info });
      break;
    case 'bullet':
      Inventory.addItemToPlayer(plyId, 'evidence_bullet', 1, { serialnumber: data.info });
      break;
  }
};
