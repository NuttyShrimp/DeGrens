import { mainLogger } from '../../sv_logger';

export const taxLogger = mainLogger.child({
	module: 'taxes',
	category: 'taxes',
});
