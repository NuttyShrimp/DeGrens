import { Phone, Chat, Util } from '@dgx/server';
import { GUARD_MODELS, GUARD_WEAPONS } from './constants.methrun';
import { methrunLogger } from './logger.methrun';

export const sendMethRunMail = (cids: number | number[], message: string, coords?: Vec3) => {
  for (const cid of new Set(Array.isArray(cids) ? cids : [cids])) {
    Phone.addOfflineMail(cid, { subject: 'Unknown', sender: 'Jason K.', message, coords });
  }
};

export const sendErrorToClient = (plyId: number) => {
  Chat.sendMessage(plyId, {
    prefix: 'System: ',
    message: 'Er is iets misgegaan met de methrun, contacteer een developer',
    type: 'system',
  });
};

export const generateMethRunDefaultState = (): Criminal.Methrun.ActiveRun['state'] => ({
  vehicleZoneBuilt: false,
  vehicleLockpicked: false,
  vehicleSpawned: false,
  dropOffFinished: false,
  trackerRemoved: false,
});

export const chooseGuardData = (): Pick<NPCs.Guard, 'weapon' | 'model'> => ({
  model: GUARD_MODELS[Math.floor(Math.random() * GUARD_MODELS.length)],
  weapon: GUARD_WEAPONS[Math.floor(Math.random() * GUARD_WEAPONS.length)],
});

export const methrunLoggerWrapper = (
  plyId: number | undefined,
  type: 'info' | 'warn' | 'debug' | 'silly' | 'error',
  logType: string,
  message: string,
  data: Record<string, any> = {}
) => {
  const logMsg = `${plyId ? `${Util.getName(plyId)}(${plyId}) ` : ''}${message}`;
  methrunLogger[type](logMsg);
  Util.Log(`criminal:methrun:${logType}`, data, logMsg, plyId);
};
