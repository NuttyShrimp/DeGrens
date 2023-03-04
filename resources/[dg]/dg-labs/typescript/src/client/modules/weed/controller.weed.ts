import { Events, Peek } from '@dgx/client';
import {
  takeWeedFertilizer,
  hasWeedFertilizer,
  removeWeedFertilizer,
  fertilizeWeedPlant,
  harvestWeedPlant,
  searchHarvestedWeed,
} from 'modules/weed/service.weed';

Peek.addZoneEntry('lab_action', {
  options: [
    {
      icon: 'fas fa-oil-can',
      label: 'Voeding nemen',
      action: () => {
        takeWeedFertilizer();
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'weed') return false;
        if (option.data.action !== 'fertilizer') return false;
        return !hasWeedFertilizer();
      },
    },
    {
      icon: 'fas fa-oil-can',
      label: 'Voeding wegleggen',
      action: () => {
        removeWeedFertilizer();
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'weed') return false;
        if (option.data.action !== 'fertilizer') return false;
        return hasWeedFertilizer();
      },
    },
    {
      icon: 'fas fa-oil-can',
      label: 'Voeden',
      action: option => {
        fertilizeWeedPlant(option.data.labId, option.data.plantId);
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'weed') return false;
        if (option.data.action !== 'plant') return false;
        return hasWeedFertilizer();
      },
    },
    {
      icon: 'fas fa-cut',
      label: 'Knip',
      action: option => {
        harvestWeedPlant(option.data.labId, option.data.plantId);
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'weed') return false;
        if (option.data.action !== 'plant') return false;
        return true;
      },
    },
    {
      icon: 'fas fa-cannabis',
      label: 'Doorzoek',
      action: option => {
        searchHarvestedWeed(option.data.labId);
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'weed') return false;
        if (option.data.action !== 'search') return false;
        return true;
      },
    },
    {
      icon: 'fas fa-hands-holding-diamond',
      label: 'Verpakken',
      items: ['weed_bud', 'empty_bags'],
      action: option => {
        Events.emitNet('labs:weed:package', option.data.labId);
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'weed') return false;
        if (option.data.action !== 'package') return false;
        return true;
      },
    },
    {
      icon: 'fas fa-joint',
      label: 'Rollen',
      items: ['weed_bag'],
      action: option => {
        Events.emitNet('labs:weed:roll', option.data.labId);
      },
      canInteract: (_, __, option) => {
        if (option.data.type !== 'weed') return false;
        if (option.data.action !== 'roll') return false;
        return true;
      },
    },
  ],
  distance: 1.5,
});
