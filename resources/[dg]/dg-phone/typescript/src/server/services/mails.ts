import { Events, SQL, Util } from '@dgx/server';
import { charModule } from 'helpers/core';

const mailsPerCid = new Map<number, Phone.Mails.Mail[]>();

const registerMailToCid = (cid: number, mail: Phone.Mails.Mail) => {
  const mails = mailsPerCid.get(cid) ?? [];
  mails.push(mail);
  mailsPerCid.set(cid, mails);
};

const loadOfflineMails = async (cid: number) => {
  const dbMails = await SQL.query<Phone.Mails.DBMail[]>(
    'SELECT subject, sender, message, coords, date FROM phone_mails WHERE cid = ?',
    [cid]
  );
  console.log(dbMails);
  if (!dbMails) return;

  for (const dbMail of dbMails) {
    registerMailToCid(cid, {
      ...dbMail,
      id: Util.uuidv4(),
      coords: dbMail.coords ? JSON.parse(dbMail.coords) : undefined,
    });
  }

  await SQL.query('DELETE FROM phone_mails WHERE cid = ?', [cid]);
};

const addOfflineMail = async (cid: number, mailData: Phone.Mails.MailData) => {
  const plyId = charModule.getServerIdFromCitizenId(cid);
  if (plyId) {
    addMail(plyId, mailData);
    return;
  }

  await SQL.query('INSERT INTO phone_mails (cid, sender, subject, message, coords, date) VALUES (?, ?, ?, ?, ?, ?)', [
    cid,
    mailData.sender,
    mailData.subject,
    mailData.message,
    mailData.coords ? JSON.stringify(mailData.coords) : null,
    Date.now(),
  ]);
};

const addMail = (plyId: number, mailData: Phone.Mails.MailData) => {
  const mail: Phone.Mails.Mail = {
    ...mailData,
    id: Util.uuidv4(),
    date: Date.now(),
  };

  const cid = Util.getCID(plyId);
  registerMailToCid(cid, mail);

  Events.emitNet('phone:mails:add', plyId, mail);
};

const removeMail = (plyId: number, mailId: string) => {
  const cid = Util.getCID(plyId);
  const mails = mailsPerCid.get(cid);
  if (!mails) return;

  mailsPerCid.set(
    cid,
    mails.filter(mail => mail.id !== mailId)
  );
};

Events.onNet('dg-phone:load', async plyId => {
  const cid = Util.getCID(plyId);
  if (!cid) return;

  await loadOfflineMails(cid);

  const mails = mailsPerCid.get(cid);
  if (!mails) return;

  Events.emitNet('phone:mails:add', plyId, mails, true);
});

Events.onNet('phone:mails:add', addMail);
Events.onNet('phone:mails:remove', removeMail);

global.asyncExports('addOfflineMail', addOfflineMail);
global.asyncExports('addMail', addMail);
