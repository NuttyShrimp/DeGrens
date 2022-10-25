import { Schema } from 'jsonschema';

export const vector2Schema: Schema = {
  id: '/Vector2',
  type: 'object',
  properties: {
    x: { type: 'number' },
    y: { type: 'number' },
  },
  required: true,
};

export const vectorSchema: Schema = {
  id: '/Vector',
  type: 'object',
  properties: {
    x: { type: 'number' },
    y: { type: 'number' },
    z: { type: 'number' },
  },
  required: true,
};
