import { mainLogger } from 'sv_logger';

class IdentifierManager {
  private identifiers: Map<number, Record<string, string>> = new Map();

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
  moveIdentifiers(oldStrSrc: number | string, newStrSrc: number | string) {
    const oldSrc = +oldStrSrc;
    const newSrc = +newStrSrc;
    this.identifiers.set(newSrc, this.identifiers.get(oldSrc) ?? this.getIdentifiers(newSrc));
    this.identifiers.delete(oldSrc);
  }

  getIdentifiers(strSrc: number | string) {
    const src = +strSrc;
    let identifiers = this.identifiers.get(src);
    if (!identifiers) {
      identifiers = this.loadIdentifiers(src);
    }
    if (!identifiers) {
      mainLogger.error(`Failed to load identifiers for ${src}`);
    }
    return identifiers ?? {};
  }

  removeIdentifiers(src: number) {
    this.identifiers.delete(+src);
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
