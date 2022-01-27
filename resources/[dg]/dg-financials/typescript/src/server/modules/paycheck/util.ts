import { mainLogger } from '../../sv_logger';

export const paycheckLogger = mainLogger.child({
	module: 'paycheck',
	category: 'paycheck',
});
