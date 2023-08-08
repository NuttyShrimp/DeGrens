import { SQL, Util } from '@dgx/server/classes';
import { FastifyRequest } from 'fastify';
import { mainLogger } from 'sv_logger';

class TokenManager extends Util.Singleton<TokenManager>() {
  private tokens = new Set<API.Token>();

  constructor() {
    super();
    this.seedTokens();
  }

  private seedTokens = async () => {
    const query = `SELECT token, comment FROM api_tokens`;
    const tokens = await SQL.query(query);
    tokens.forEach((token: API.Token) => {
      this.tokens.add(token);
    });
  };

  isTokenValid = (token: string): API.Token | undefined => {
    let tokenInfo: API.Token | undefined = undefined;
    this.tokens.forEach(info => {
      if (info.token === token) {
        tokenInfo = info;
      }
    });
    return tokenInfo;
  };

  getTokenId = (req: FastifyRequest) => {
    const token = req.headers.authorization?.replace(/Bearer /, '');
    if (!token) return;
    this.tokens.forEach(info => {
      if (info.token === token) {
        return `${info.token.substring(0, 6)} (${info.comment})`;
      }
    });
  };

  registeToken = async (token: string, comment: string) => {
    this.tokens.add({ token, comment });
    SQL.insertValues('api_tokens', [
      {
        token,
        comment,
      },
    ]);
    mainLogger.info(`Created API token: ${token} with comment: ${comment}`);
  };
}

export const tokenManager = new TokenManager();
