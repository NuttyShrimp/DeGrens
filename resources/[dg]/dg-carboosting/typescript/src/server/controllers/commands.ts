import { Chat, Events, Notifications, Minigames } from '@dgx/server';
import { VEHICLE_CLASS_ORDER } from '../constants';
import { getClassConfig } from 'helpers/config';

Chat.registerCommand(
  'carboost:addLocation',
  '[DEV] Add carboosting location',
  [{ name: 'Klasses', description: 'Voertuigklasses voor deze locatie' }],
  'developer',
  (plyId, _, args) => {
    Events.emitNet('carboosting:dev:addLocation', plyId, args);
  }
);

Chat.registerCommand(
  'carboost:testHack',
  '[DEV] Test carboost hack',
  [{ name: 'Klasse', description: 'Voertuigklass' }],
  'developer',
  (plyId, _, args) => {
    const vehicleClass = args[0] as Vehicles.Class;
    if (VEHICLE_CLASS_ORDER.indexOf(vehicleClass) === -1) {
      Notifications.add(plyId, 'Not a valid vehicleclass', 'error');
      return;
    }

    const trackerConfig = getClassConfig(vehicleClass).tracker;
    Minigames.ordergame(
      plyId,
      trackerConfig.hack.gridSize,
      1,
      trackerConfig.hack.length,
      trackerConfig.hack.displayTime,
      trackerConfig.hack.inputTime
    );
  }
);
