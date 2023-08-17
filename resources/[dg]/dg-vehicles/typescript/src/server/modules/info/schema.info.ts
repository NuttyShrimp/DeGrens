import { Schema, Validator } from 'jsonschema';

import { infoLogger } from './logger.info';

const v = new Validator();

const carSchema: Schema = {
  id: '/Car',
  type: 'object',
  properties: {
    name: { type: 'string' },
    brand: { type: 'string' },
    model: { type: 'string' },
    category: {
      type: 'string',
      enum: [
        'compacts',
        'sedans',
        'suvs',
        'coupes',
        'muscle',
        'sportsclassics',
        'sports',
        'super',
        'motorcycles',
        'offroad',
        'industrial',
        'utility',
        'vans',
        'cycles',
        'boats',
        'helicopters',
        'planes',
        'service',
        'emergency',
        'military',
        'commercial',
        'trains',
        'openwheel',
      ] satisfies Vehicles.Category[],
    },
    class: { type: 'string' },
    price: { type: 'number' },
    defaultStock: { type: 'number' },
    restockTime: { type: 'number' },
    shop: { type: 'string', enum: ['pdm', 'nfs'] satisfies Config.Shop[] },
    type: {
      type: 'string',
      enum: ['land', 'air', 'sea'],
    },
    inCarboostPool: { type: 'boolean', required: true },
  },
  required: true,
};

v.addSchema(carSchema, '/Car');

const carArraySchema: Schema = {
  id: '/CarArray',
  type: 'array',
  items: {
    $ref: '/Car',
  },
};

v.addSchema(carArraySchema, '/CarArray');

export function isSchemaValid(schema: string): boolean {
  const storedSchema = JSON.parse(schema);
  const resp = v.validate(storedSchema, carArraySchema);
  if (!resp.valid) {
    infoLogger.error(`Invalid vehicle info file: ${resp.errors}`);
  }
  return resp.valid;
}
