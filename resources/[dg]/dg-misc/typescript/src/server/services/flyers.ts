import { Events, Inventory, Jobs, Notifications, SQL, UI, Util } from '@dgx/server';
import { charModule } from 'helpers/core';

const blocked_cids: number[] = [];

Inventory.registerUseable('flyer', (src, item) => {
  // NOTE: we can set a check here to prevent the animation from playing with generic flyers
  Events.emitNet('misc:flyers:animation', src);
  setTimeout(() => {
    Events.emitNet('misc:flyers:showFlyer', src, item.metadata);
    Util.getAllPlayersInRange(src, 3).forEach(id => {
      Events.emitNet('misc:flyers:showFlyer', id, item.metadata);
    });
  }, 1500);
});

Events.onNet('misc:flyers:requestFlyer', async (src, link: string) => {
  const cid = Util.getCID(src);
  if (blocked_cids.includes(cid)) {
    Notifications.add(src, 'De printer werkt niet meer voor jou!', 'error');
    return;
  }
  await SQL.query('INSERT INTO flyer_request (cid, link) VALUES (?,?)', [cid, link]);
  Notifications.add(src, 'Flyer requested!');
});

Events.onNet('misc:flyers:openRequestMenu', async src => {
  const cid = Util.getCID(src);
  const requestedFlyers = await SQL.query<Flyers.Flyer[]>('SELECT * FROM flyer_request WHERE cid = ?', [cid]);

  if (!requestedFlyers || requestedFlyers.length === 0) {
    Notifications.add(src, 'Je hebt geen pending of approved flyers', 'error');
    return;
  }

  const menu: ContextMenu.Entry[] = [
    {
      title: 'Approved',
      disabled: true,
    },
    ...requestedFlyers
      .filter(f => f.approved === 1)
      .map(f => ({
        title: f.link,
        callbackURL: 'misc/flyers/create',
        data: {
          id: f.id,
        },
      })),
    {
      title: 'Awaiting approval',
      disabled: true,
    },
    ...requestedFlyers
      .filter(f => f.approved === 0)
      .map(f => ({
        title: f.link,
        data: {
          id: f.id,
        },
      })),
  ];

  UI.openContextMenu(src, menu);
});

Events.onNet('misc:flyers:createItem', async (src, id: number) => {
  const cid = Util.getCID(src);
  const flyers = await SQL.query<Flyers.Flyer[]>('SELECT * FROM flyer_request WHERE id = ? AND cid = ?', [id, cid]);
  if (!flyers || flyers.length === 0) {
    return;
  }

  await Inventory.addItemToPlayer(src, 'flyer', 1, {
    link: flyers[0].link,
  });

  await SQL.query('DELETE FROM flyer_request WHERE id = ?', [id]);

  Util.Log(
    'misc:flyers:create',
    {
      type: 'generic',
      link: flyers[0].link,
    },
    `${Util.getName(src)}(${cid}) has created a new flyer`,
    src
  );
});

Events.onNet('misc:flyers:createPoliceBadge', async src => {
  const job = Jobs.getCurrentJob(src);
  if (job !== 'police') return;

  const char = charModule.getPlayer(src);
  if (!char) return;

  await Inventory.addItemToPlayer(src, 'flyer', 1, {
    type: 'police',
    name: `${char.charinfo.firstname} ${char.charinfo.lastname}`,
  });

  // TODO: Delete the old one (if possible)

  Util.Log(
    'misc:flyers:create',
    {
      type: 'policeBadge',
    },
    `${Util.getName(src)}(${char.citizenid}) has created a new police badge`,
    src
  );
});
