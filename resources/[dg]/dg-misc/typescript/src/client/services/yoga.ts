import { Events, Notifications, Peek, Taskbar, Util } from '@dgx/client';

const yogaModels = [
  'prop_yoga_mat_01',
  'prop_yoga_mat_02',
  'prop_yoga_mat_03',
  'p_yoga_mat_01_sa',
  'p_yoga_mat_02_s',
  'p_yoga_mat_03_s',
  'v_61_bd2_mesh_yogamat',
];

const startYogaSes = async (data: Option, entity: number | undefined) => {
  if (!entity) return;
  const [isCancelled] = await Taskbar.create('brain', 'Adem in...', 30000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    animation: {
      task: 'WORLD_HUMAN_YOGA',
    },
  });
  if (isCancelled) {
    Notifications.add('Je hebt je rustige mindset doorbroken', 'info');
    return;
  }
  const entCoords = Util.getEntityCoords(entity);
  SetEntityCoords(PlayerPedId(), entCoords.x, entCoords.y, entCoords.z, true, false, false, false);
  Events.emitNet('hud:server:RelieveStress', 10);
};

Peek.addModelEntry(yogaModels, {
  distance: 2,
  options: [
    {
      icon: 'fas fa-circle',
      label: 'Doe yoga',
      action: startYogaSes,
    },
  ],
});
