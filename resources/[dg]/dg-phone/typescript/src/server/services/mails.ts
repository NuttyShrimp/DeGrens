import { Events, SQL } from '@dgx/server';
import { charModule } from 'helpers/core';

const fetchEmails = (cid: number) => {
  return SQL.query<Mail[]>('SELECT subject, sender, message FROM phone_mails WHERE cid=? ORDER BY id DESC', [cid]);
};

const addOfflineMail = async (cid: number, subject: string, sender: string, message: string) => {
  const plySource = charModule.getServerIdFromCitizenId(cid);
  if (plySource) {
    emitNet('phone:mail:add', plySource, subject, sender, message);
  }
  await SQL.query('INSERT INTO phone_mails (cid, sender, subject, message) VALUES (?, ?, ?, ?)', [
    cid,
    sender,
    subject,
    message,
  ]);
};
asyncExports('addOfflineMail', addOfflineMail);

Events.onNet('dg-phone:load', async src => {
  const player = charModule.getPlayer(src);
  if (!player) return;

  const cid = player.citizenid;
  const mails = await fetchEmails(cid);
  mails.forEach(mail => {
    emitNet('phone:mail:add', src, mail.subject, mail.sender, mail.message);
  });
  await SQL.query('DELETE FROM phone_mails WHERE cid = ?', [cid]);
});
