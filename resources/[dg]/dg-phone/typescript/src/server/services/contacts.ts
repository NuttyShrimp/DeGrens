import { Events, Phone, RPC, SQL, Util } from '@dgx/server';
import { charModule } from 'helpers/core';

RPC.register('phone:contacts:get', async src => {
  const player = charModule.getPlayer(src);
  if (!player) {
    return {
      error: true,
      message: 'Player not found',
    };
  }
  const result = await SQL.query('SELECT id, label, phone FROM phone_contacts WHERE cid = ?', [player.citizenid]);
  return result ?? [];
});

RPC.register('phone:contacts:update', async (src, contact) => {
  const player = charModule.getPlayer(src);
  if (!player) {
    return {
      error: true,
      message: 'Player not found',
    };
  }
  await SQL.query('UPDATE phone_contacts SET label = ?, phone = ? WHERE id = ? AND cid = ?', [
    contact.label,
    contact.phone,
    contact.id,
    player.citizenid,
  ]);
});

RPC.register('phone:contacts:add', async (src, contact) => {
  const player = charModule.getPlayer(src);
  if (!player) {
    return {
      error: true,
      message: 'Player not found',
    };
  }
  await SQL.query('INSERT INTO phone_contacts (cid, label, phone) VALUES (?, ?, ?)', [
    player.citizenid,
    contact.label,
    contact.phone,
  ]);
});

RPC.register('phone:contacts:delete', async (src, data) => {
  const player = charModule.getPlayer(src);
  if (!player) {
    return {
      error: true,
      message: 'Player not found',
    };
  }
  SQL.query('DELETE FROM phone_contacts WHERE id = ? AND cid = ?', [data.id, player.citizenid]);
});

Events.onNet('phone:contacts:shareNumber', async src => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  const closePlayers = Util.getAllPlayersInRange(src);
  const notification = {
    id: `contacts-share-${player.charinfo.phone}`,
    title: 'New Contact',
    description: `Add ${player.charinfo.phone} to contacts?`,
    icon: 'contacts',
    onAccept: 'phone:contacts:shareNumber:accept',
    onDecline: 'phone:contacts:shareNumber:decline',
    _data: {
      phone: player.charinfo.phone,
    },
    timer: 15,
  };
  closePlayers.forEach(id => {
    const target = charModule.getPlayer(id);
    if (!target) return;
    Phone.showNotification(id, notification);
  });
});
