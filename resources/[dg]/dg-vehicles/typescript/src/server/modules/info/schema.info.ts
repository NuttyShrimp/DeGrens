import { Schema, Validator } from 'jsonschema';

import { infoLogger } from './logger.info';

const v = new Validator();

const carSchema: Schema = {
  id: '/Car',
  type: 'object',
  properties: {
    name: { type: 'string', required: true },
    brand: { type: 'string', required: true },
    model: { type: 'string', required: true },
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
      required: true,
    },
    class: { type: 'string', required: true },
    price: { type: 'number', required: true },
    defaultStock: { type: 'number', required: true },
    restockTime: { type: 'number', required: true },
    shop: { type: 'string', enum: ['pdm', 'nfs'] satisfies Config.Shop[], required: true },
    type: {
      type: 'string',
      enum: ['land', 'air', 'sea'],
      required: true,
    },
    inCarboostPool: { type: 'boolean', required: true },
  },
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
