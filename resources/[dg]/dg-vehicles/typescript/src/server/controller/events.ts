import { Events, Util } from '@dgx/server';

Events.onNet('vehicles:modes:log', (src, data: Record<string, string>) => {
  Util.Log(
    'vehicles:modes:switch',
    {
      ...data,
    },
    `${Util.getName(src)} has switched to vehicle mode: ${data.mode}`,
    src
  );
});
