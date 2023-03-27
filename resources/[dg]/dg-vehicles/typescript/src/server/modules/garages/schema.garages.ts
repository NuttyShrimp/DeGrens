import { Schema, Validator } from 'jsonschema';

import { vector2Schema, vectorSchema } from '../../helpers/schema';

import { garageLogger } from './logger.garages';

const v = new Validator();

const BoxLocationSchema: Schema = {
  id: '/BoxLocation',
  type: 'object',
  properties: {
    vector: {
      $ref: '/Vector',
    },
    width: {
      type: 'number',
    },
    length: {
      type: 'number',
    },
    options: {
      type: 'object',
      properties: {
        heading: {
          type: 'number',
        },
        minZ: {
          type: 'number',
        },
        maxZ: {
          type: 'number',
        },
      },
      required: true,
    },
  },
  required: true,
};

const PolyLocationSchema: Schema = {
  id: '/PolyLocation',
  type: 'object',
  properties: {
    vector: {
      type: 'array',
      items: {
        $ref: '/Vector2',
      },
    },
    options: {
      type: 'object',
      properties: {
        minZ: {
          type: 'number',
        },
        maxZ: {
          type: 'number',
        },
      },
      required: true,
    },
  },
  required: true,
};

const ParkingSpotSchema: Schema = {
  id: '/ParkingSpot',
  type: 'object',
  properties: {
    type: {
      type: 'string',
      enum: ['land', 'air', 'sea'],
    },
    size: {
      type: 'number',
    },
    distance: {
      type: 'number',
    },
    heading: {
      type: 'number',
    },
    coords: {
      $ref: '/Vector',
    },
  },
  required: true,
};

v.addSchema(vectorSchema, '/Vector');
v.addSchema(vector2Schema, '/Vector2');
v.addSchema(BoxLocationSchema, '/BoxLocation');
v.addSchema(PolyLocationSchema, '/PolyLocation');
v.addSchema(ParkingSpotSchema, '/ParkingSpot');

const GarageSchema: Schema = {
  type: 'object',
  properties: {
    garage_id: {
      type: 'string',
    },
    name: {
      type: 'string',
    },
    // Type will be used to check if a person has access to the garage
    type: {
      type: 'string',
      enum: ['public', 'business', 'police', 'ambulance', 'gang'],
    },
    parking_limit: {
      type: 'number',
    },
    // If the garage has the ability to store shared vehicles
    shared: {
      type: 'boolean',
    },
    location: {
      oneOf: [{ $ref: '/BoxLocation' }, { $ref: '/PolyLocation' }],
    },
    vehicle_types: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['land', 'air', 'sea'],
      },
    },
    parking_spots: {
      type: 'array',
      items: {
        $ref: '/ParkingSpot',
      },
    },
  },
  required: ['garage_id', 'name', 'shared', 'location', 'vehicle_types', 'parking_spots'],
};

v.addSchema(GarageSchema, '/Garage');

export function isSchemaValid(schema: string): boolean {
  const storedSettings = JSON.parse(schema);
  const resp = v.validate(storedSettings, GarageSchema);
  if (!resp.valid) {
    garageLogger.error(`Invalid garage schema: ${resp.errors}`);
  }
  return resp.valid;
}
