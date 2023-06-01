import fs from 'fs';

import { garageLogger } from '../../../garages/logger.garages';

import { bennysLogger } from '../../logger.bennys';
import { isSchemaValid } from './schema';

const root = GetResourcePath(GetCurrentResourceName());
const bennyLocations: Map<string, Bennys.Location> = new Map();

export const loadZones = () => {
  try {
    const data = fs.readFileSync(`${root}/seeding/bennys.json`, 'utf8');
    if (!isSchemaValid(data)) {
      bennysLogger.error(`Bennys list is not valid`);
      return;
    }
    const locations: Bennys.Location[] = JSON.parse(data);
    locations.forEach(location => {
      if (bennyLocations.has(location.name)) {
        garageLogger.error(`Location ${location.name} already registered, overwriting`);
      }
      bennyLocations.set(location.name, location);
    });
    bennysLogger.info(`Loaded ${bennyLocations.size} locations`);
  } catch (e) {
    bennysLogger.error(`Error while reading the bennys list: ${e}`);
  }
};

export const getZones = () => [...bennyLocations.values()];
