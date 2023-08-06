import { atPropertyDoor, atPropertyGarage } from '../services/zones';

global.exports('atPropertyDoor', () => {
  return atPropertyDoor();
});

global.exports('atPropertyGarage', () => {
  return atPropertyGarage();
});
