import { Jobs, Keys, Peek } from '@dgx/client';
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
