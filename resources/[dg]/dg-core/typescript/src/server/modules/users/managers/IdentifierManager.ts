class IdentifierManager {
  private identifiers: Map<number, Record<string, string>> = new Map();

  loadIdentifiers(src: number) {
    const source = String(src);
    const identifierNum = GetNumPlayerIdentifiers(source);
    const identifiers: Record<string, string> = {};
    for (let i = 0; i < identifierNum; i++) {
      const id = GetPlayerIdentifier(source, i);
      const key = id.replace(/\:\w+/, "");
      identifiers[key] = id;
    }
    this.identifiers.set(src, identifiers);
  }

  // This will be called when a player finishes loading
  moveIdentifiers(src: number, newSrc: number) {
    this.identifiers.set(newSrc, this.identifiers.get(src) || {});
    this.identifiers.delete(src);
  }

  getIdentifiers(src: number) {
    let identifiers = this.identifiers.get(src);
    if (!identifiers) {
      this.loadIdentifiers(src);
      identifiers = this.identifiers.get(src);
    }
    return identifiers ?? {};
  }

  removeIdentifiers(src: number) {
    this.identifiers.delete(src);
  }

  getServerIdFromIdentifier(key: string, identifier: string) {
    for (const [src, identifiers] of this.identifiers) {
      if (identifiers[key] === identifier) {
        return src;
      }
    }
  }
}

export const identifierManager = new IdentifierManager();