import { Events, Peek, PolyZone } from '@dgx/client';
import { disablePower, enterTowerLocation, exitTowerLocation, spawnPeds, spawnSwarm } from './service.radiotowers';

PolyZone.onEnter<{ id: string }>('radiotower', (_, data) => {
  enterTowerLocation(data.id);
});

PolyZone.onLeave<{ id: string }>('radiotower', (_, data) => {
  exitTowerLocation(data.id);
});

Peek.addZoneEntry('radiotower_action', {
  options: [
    {
      label: 'Uitschakelen',
      icon: 'fas fa-screwdriver',
      items: 'screwdriver',
      action: option => {
        disablePower(option.data.towerId as string);
      },
      canInteract: (_, __, option) => {
        return (option.data.action as Materials.Radiotowers.Action) === 'disable';
      },
    },
    {
      label: 'Override',
      icon: 'fas fa-light-emergency',
      action: option => {
        Events.emitNet(
          'materials:radiotowers:override',
          option.data.towerId as string,
          option.data.action as Materials.Radiotowers.Action
        );
      },
      canInteract: (_, __, option) => {
        return option.data.action === 'overrideOne' || option.data.action === 'overrideTwo';
      },
    },
    {
      label: 'Onderdelen nemen',
      icon: 'fas fa-screwdriver',
      items: 'screwdriver',
      action: option => {
        Events.emitNet('materials:radiotowers:loot', option.data.towerId as string);
      },
      canInteract: (_, __, option) => {
        return (option.data.action as Materials.Radiotowers.Action) === 'loot';
      },
    },
  ],
  distance: 2.0,
});

Events.onNet('materials:radiotower:spawnPed', (towerId: string) => {
  spawnPeds(towerId);
});

Events.onNet('materials:radiotower:spawnSwarm', (towerId: string) => {
  spawnSwarm(towerId);
});
