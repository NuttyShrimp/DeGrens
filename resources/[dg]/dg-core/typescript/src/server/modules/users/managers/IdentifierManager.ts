import { mainLogger } from 'sv_logger';
import winston from 'winston';

class IdentifierManager {
  private readonly logger: winston.Logger;
  private readonly identifiers: Map<number, Record<string, string>> = new Map();

  constructor() {
    this.logger = mainLogger.child({ module: 'IdentifierManager' });
    RegisterCommand(
      'checkIdentifiers',
      () => {
        this.logger.info(this.identifiers);
      },
      true
    );
  }

  loadIdentifiers(src: number | string) {
    const strSrc = String(src);
    const identifierNum = GetNumPlayerIdentifiers(strSrc);
    const identifiers: Record<string, string> = {};
    for (let i = 0; i < identifierNum; i++) {
      const id = GetPlayerIdentifier(strSrc, i);
      const key = id.replace(/\:\w+/, '');
      identifiers[key] = id;
    }
    this.identifiers.set(+src, identifiers);
    return identifiers;
  }

  // This will be called when a player finishes loading
  moveIdentifiers(oldSrc: number, newSrc: number) {
    const identifiers = this.identifiers.get(oldSrc);
    this.identifiers.delete(oldSrc);
    if (!identifiers) {
      this.logger.error(`Player ${oldSrc} does not have any identifiers to move to ${newSrc}`);
      return;
    }
    this.identifiers.set(newSrc, identifiers);
  }

  getIdentifiers(src: number) {
    let identifiers = this.identifiers.get(src);
    if (!identifiers) {
      identifiers = this.loadIdentifiers(src);
    }
    if (!identifiers) {
      this.logger.error(`Player ${src} does not have any identifiers`);
    }
    return identifiers ?? {};
  }

  removeIdentifiers(src: number) {
    this.identifiers.delete(src);
  }

  getServerIdFromIdentifier(key: string, identifier: string) {
    for (const [src, identifiers] of this.identifiers) {
      if (identifiers[key] === identifier && src < 65535) {
        return +src;
      }
    }
  }
}

export const identifierManager = new IdentifierManager();
