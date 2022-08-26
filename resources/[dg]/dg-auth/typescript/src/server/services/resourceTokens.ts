const usedTokens = new Set<string>();

const createToken = () => {
  let uuid = '';
  for (let ii = 0; ii < 32; ii += 1) {
    switch (ii) {
      case 8:
      case 20:
        uuid += '-';
        uuid += ((Math.random() * 16) | 0).toString(16);
        break;
      case 12:
        uuid += '-';
        uuid += '4';
        break;
      case 16:
        uuid += '-';
        uuid += ((Math.random() * 4) | 8).toString(16);
        break;
      default:
        uuid += ((Math.random() * 16) | 0).toString(16);
    }
  }
  return uuid;
};

const createResourceToken = () => {
  let token = createToken();
  while (usedTokens.has(token)) {
    token = createToken();
  }
  return token;
};

const deleteResourceToken = (token: string) => {
  usedTokens.delete(token);
};

global.exports('createResourceToken', createResourceToken);
global.exports('deleteResourceToken', deleteResourceToken);
