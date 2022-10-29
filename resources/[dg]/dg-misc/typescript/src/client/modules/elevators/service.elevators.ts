import { Business, Gangs, Jobs, PolyTarget, RPC, Taskbar, UI } from '@dgx/client';

let elevators: Elevators.Config;

// Prevent nui callback abuse or somethin
let elevatorMenuOpen = false;

export const loadElevators = (data: Elevators.Config) => {
  PolyTarget.removeZone('elevator');
  elevators = data;

  for (const [elevatorId, elevator] of Object.entries(elevators)) {
    for (const [levelId, level] of Object.entries(elevator.levels)) {
      PolyTarget.addCircleZone('elevator', level.interact, 0.4, {
        useZ: true,
        data: {
          id: `${elevatorId}_${levelId}`,
          elevatorId,
          levelId,
        },
      });
    }
  }
};

export const openElevatorMenu = (elevatorId: string, currentLevelId: string) => {
  const elevator = elevators[elevatorId];
  if (!elevator) return;

  const menu: ContextMenu.Entry[] = [
    {
      title: elevator.name,
      icon: 'elevator',
      description: 'Selecteer een verdieping',
      disabled: true,
    },
  ];

  const currentGang = Gangs.getCurrentGang();
  const currentJob = Jobs.getCurrentJob();

  for (const [levelId, level] of Object.entries(elevator.levels)) {
    if (currentLevelId === levelId) continue;

    if (level.business) {
      // Check if business employee
      const isBusinessEmployee = level.business.some(b => Business.isEmployee(b.name, b.permissions));
      if (!isBusinessEmployee) continue;
    }

    // Check if gang member
    if (level.gang) {
      if (!currentGang) continue;
      if (!level.gang.includes(currentGang)) continue;
    }

    // Check job
    if (level.job) {
      if (currentJob.name === null) continue;
      const hasJob = level.job.find(j => {
        const sameName = j.name === currentJob.name;
        if (!sameName) return false;
        if (j.rank === undefined) return true;
        if (currentJob.rank === null) return false;
        if (currentJob.rank >= j.rank) return true;
        return false;
      });
      if (hasJob === undefined) continue;
    }

    menu.push({
      title: level.name,
      icon: {
        name: 'circle-sort',
        position: 'right',
      },
      callbackURL: 'elevator/goToLevel',
      data: {
        elevatorId,
        levelId,
      },
    });
  }

  UI.openApplication('contextmenu', menu);
  elevatorMenuOpen = true;
};

export const goToLevel = async (elevatorId: string, levelId: string) => {
  if (!elevatorMenuOpen) return;
  elevatorMenuOpen = false;

  const [canceled] = await Taskbar.create('elevator', 'Lift roepen', 5000, {
    canCancel: true,
    cancelOnDeath: true,
    cancelOnMove: true,
    disarm: true,
    disableInventory: true,
    disablePeek: true,
    controlDisables: {
      movement: true,
      carMovement: true,
      combat: true,
    },
  });
  if (canceled) return;

  DoScreenFadeOut(500);
  setTimeout(() => {
    const ped = PlayerPedId();
    const spawn = elevators[elevatorId].levels[levelId].spawn;
    SetEntityCoords(ped, spawn.x, spawn.y, spawn.z - 0.95, false, false, false, false);
    SetEntityHeading(ped, spawn.w);
    DoScreenFadeIn(500);
  }, 500);
};
