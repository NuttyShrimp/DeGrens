import { Events, RPC, SQL } from '@dgx/server';
import { charModule } from 'helpers/core';
import { phone_messages } from 'db';
import { mainLogger } from 'sv_logger';

const fetchMessages = async (phone: string, offset: number, target: string): Promise<phone_messages[]> => {
  const query = target
    ? `
			SELECT *
			FROM phone_messages
			WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?)
			ORDER BY id ASC LIMIT ? OFFSET ?;
		`
    : `
		SELECT *
		FROM phone_messages
		WHERE sender = ? OR receiver = ?
		ORDER BY id ASC LIMIT ? OFFSET ?;
	`;
  const params = target ? [phone, target, target, phone, 20, offset] : [phone, phone, 20, offset];
  return await SQL.query(query, params);
};

const addMessage = (phone: string, target: string, msg: string, date: number) => {
  return SQL.insert(
    `
  INSERT INTO phone_messages (sender, receiver, message, date, isread)
		VALUES (?, ?, ?, ?, 0);
	`,
    [phone, target, msg, date]
  );
};

const setRead = (phone: string, target: string) => {
  return SQL.query(
    `
		UPDATE phone_messages
		SET isread = 1
		WHERE (sender = ? AND receiver = ?) OR (sender = ? AND receiver = ?);
	`,
    [phone, target, target, phone]
  );
};

RPC.register('phone:messages:get', async (src, data) => {
  const player = charModule.getPlayer(src);
  if (!player) return [];
  const _messages = await fetchMessages(player.charinfo.phone, data.offset ?? 0, data.target);
  // Key, value pairs of messages, key is phone number that differs from the player's phone number
  const messages: Record<string, Message[]> = {};
  _messages.forEach(message => {
    const key = message.sender === player.charinfo.phone ? message.receiver : message.sender;
    if (!messages[key]) {
      messages[key] = [];
    }
    messages[key].push({
      id: message.id,
      message: message.message,
      isread: message.isread,
      isreceiver: message.receiver == player.charinfo.phone,
      date: Number(message.date),
    });
  });
  return messages;
});

Events.onNet('phone:messages:send', async (src, data) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  const insertId = await addMessage(player.charinfo.phone, data.target, data.msg, data.date);
  if (!insertId) {
    mainLogger.error(`Failed to insert message for ${player.charinfo.phone} to ${data.target}`, { data });
    return;
  }
  const msg: Message = {
    id: insertId,
    message: data.msg,
    isread: false,
    isreceiver: false,
    date: data.date,
  };
  emitNet('phone:messages:receive', src, msg, data.target);
  const target = charModule.getPlayerByPhone(data.target);
  if (!target) return;
  msg.isreceiver = true;
  emitNet('phone:messages:receive', target.serverId, msg, player.charinfo.phone);
});

Events.onNet('phone:messages:setRead', (src, data) => {
  const player = charModule.getPlayer(src);
  if (!player) return;
  setRead(player.charinfo.phone, data.target);
});
