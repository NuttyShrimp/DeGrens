import { getOptions } from '@dgx/tsup-config';
import { defineConfig } from 'tsup';

export default defineConfig(opts => ({
  ...getOptions(opts),
}));
