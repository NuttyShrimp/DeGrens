class Storage {
  setValue(key: string, value: any): void {
    if (typeof value === 'number') {
      SetResourceKvpFloat(key, value);
      SetResourceKvp(`${key}type`, 'float');
      return;
    }
    if (typeof value === 'string') {
      SetResourceKvp(key, value);
      SetResourceKvp(`${key}type`, 'string');
      return;
    }
    if (typeof value === 'boolean') {
      SetResourceKvpInt(key, Number(value));
      SetResourceKvp(`${key}type`, 'boolean');
      return;
    }
    if (typeof value === 'object') {
      SetResourceKvp(key, JSON.stringify(value));
      SetResourceKvp(`${key}type`, 'object');
      return;
    }
    console.error(`[DGX] [Storage] ${typeof value} is not implemented`);
  }
  getValue(key: string): any {
    const type = GetResourceKvpString(`${key}type`);
    if (!type) return null;
    if (type === 'number') return GetResourceKvpFloat(key);
    if (type === 'string') return GetResourceKvpString(key);
    if (type === 'boolean') return GetResourceKvpInt(key) === 1;
    if (type === 'object') return JSON.parse(GetResourceKvpString(key));
    console.error(`[DGX] [Storage] ${type} is not implemented`);
    return null;
  }
}

export default {
  Storage: new Storage(),
};
