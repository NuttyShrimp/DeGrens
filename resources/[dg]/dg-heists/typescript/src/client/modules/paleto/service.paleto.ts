import { PolyTarget } from '@dgx/client';

export const buildPaletoActions = (actions: Paleto.Config['actions']) => {
  for (const action of actions) {
    PolyTarget.addCircleZone('heist_paleto_action', action.coords, action.size, {
      useZ: true,
      data: {
        id: action.id,
      },
    });
  }
};
