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
    category: { type: 'string' },
    class: { type: 'string' },
    price: { type: 'number' },
    defaultStock: { type: 'number' },
    restockTime: { type: 'number' },
    shop: { type: 'string', enum: ['pdm', 'nfs', 'air', 'boats'] },
    type: {
      type: 'string',
      enum: ['land', 'air', 'sea'],
    },
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
