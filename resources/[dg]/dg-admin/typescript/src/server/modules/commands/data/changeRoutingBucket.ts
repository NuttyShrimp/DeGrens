import { Notifications } from '@dgx/server';
import { Inputs } from 'enums/inputs';

declare interface RoutingBucketData {
  Target?: UI.Player;
  Instance?: UI.RoutingBucket;
  bucketId?: string;
}

export const changeRoutingBucket: CommandData = {
  name: 'changeRoutingBucket',
  role: 'developer',
  target: false,
  isClientCommand: false,
  log: 'changed his routingbucket',
  handler: (caller, data: RoutingBucketData) => {
    if (!data.Instance && (data?.bucketId === undefined || data.bucketId === '')) return;
    try {
      const id = data.bucketId !== null && data.bucketId !== '' ? parseInt(data.bucketId!) : data.Instance!.id;
      global.exports['dg-lib'].setInstance(data?.Target?.serverId ?? caller.source, id);
      Notifications.add(
        caller.source,
        `Successfully changed ${data?.Target?.name ?? 'your'} routing bucket to ${
          data.bucketId !== undefined && data.bucketId !== '' ? id : `${data.Instance!.name}(${data.Instance!.id})`
        })`,
        'success'
      );
    } catch (e) {
      console.error(e);
      Notifications.add(caller.source, `Failed to change routing bucket`, 'error');
    }
  },
  UI: {
    title: 'Change routing bucket',
    info: {
      inputs: [Inputs.Player, Inputs.RoutingBucket],
      overrideFields: ['bucketId'],
    },
  },
};
