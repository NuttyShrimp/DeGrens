import { Schema, Validator } from 'jsonschema';

import { vectorSchema } from '../../../../helpers/schema';
import { garageLogger } from '../../../garages/logger.garages';

const v = new Validator();

const bennysSchema: Schema = {
  type: 'object',
  properties: {
    vector: {
      $ref: '/Vector',
    },
    name: {
      type: 'string',
    },
    width: {
      type: 'number',
    },
    length: {
      type: 'number',
    },
    heading: {
      type: 'number',
    },
    vehicleType: {
      type: 'string',
      enum: ['land', 'air', 'sea'],
    },
    data: {
      type: 'object',
      properties: {
        minZ: {
          type: 'number',
        },
        maxZ: {
          type: 'number',
        },
      },
    },
    hideBlip: {
      type: 'boolean',
    },
  },
};

v.addSchema(vectorSchema, '/Vector');
v.addSchema(bennysSchema, '/Bennys');

export function isSchemaValid(schema: string): boolean {
  const storedSettings = JSON.parse(schema);
  const resp = v.validate(storedSettings, {
    type: 'array',
    items: {
      $ref: '/Bennys',
    },
  });
  if (!resp.valid) {
    garageLogger.error(`Invalid garage schema: ${resp.errors}`);
  }
  return resp.valid;
}
