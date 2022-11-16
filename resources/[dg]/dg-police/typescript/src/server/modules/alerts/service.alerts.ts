import { Util, Police } from '@dgx/server';

export const doEmergencyButton = (plyId: number) => {
  const plyCoords = Util.getPlyCoords(plyId);
  Police.createDispatchCall({
    title: 'Noodknop',
    description: `Een collega heeft zijn noodknop ingedrukt`,
    important: true,
    coords: plyCoords,
    officer: plyId,
    tag: '10-78',
    blip: {
      sprite: 280,
      color: 2,
    },
  });
};
