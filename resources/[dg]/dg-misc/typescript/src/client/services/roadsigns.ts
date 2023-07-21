import { Animations, Events, Peek, PropAttach, Taskbar, Util, Weapons } from '@dgx/client';

const ROAD_SIGN_MODELS = ['prop_sign_road_01a'].map(GetHashKey);

let activeRoadSign: { animLoopId: number; propId: number } | null = null;

Peek.addModelEntry(ROAD_SIGN_MODELS, {
  options: [
    {
      label: 'Bord Meenemen',
      icon: 'fas fa-sign-hanging',
      action: (_, ent) => {
        if (!ent || !DoesEntityExist(ent)) return;
        takeRoadSign(ent);
      },
    },
  ],
});

const takeRoadSign = async (entity: number) => {
  const [canceled] = await Taskbar.create('sign-hanging', 'Bord Meenemen', 10000, {
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
    animation: {
      animDict: 'missexile3',
      anim: 'ex03_dingy_search_case_a_michael',
      flags: 1,
    },
  });

  if (canceled) return;

  if (!DoesEntityExist(entity)) return;

  Events.emitNet('misc:roadsigns:take', GetEntityModel(entity), Util.getEntityCoords(entity));
};

Events.onNet('misc:roadsigns:toggle', (model?: number) => {
  if (!model) {
    if (!activeRoadSign) return;

    Animations.stopAnimLoop(activeRoadSign.animLoopId);
    PropAttach.remove(activeRoadSign.propId);

    return;
  }

  const propId = PropAttach.add('road_sign', undefined, model);
  const animLoopId = Animations.startAnimLoop({
    animation: {
      dict: 'random@hitch_lift',
      name: 'idle_f',
      flag: 49,
    },
    weight: 10,
    disableFiring: true,
    disabledControls: [23, 25, 44], // 23: enter veh, 25: aim, 44: take cover
  });

  Weapons.removeWeapon(undefined, true);

  activeRoadSign = { animLoopId, propId };
});
