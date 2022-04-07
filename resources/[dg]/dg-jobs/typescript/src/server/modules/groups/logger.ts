import { mainLogger } from "../../sv_logger";

export const groupLogger = mainLogger.child({ module: 'groups', category: 'groups' });
