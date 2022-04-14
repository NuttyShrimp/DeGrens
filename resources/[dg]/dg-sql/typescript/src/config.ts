import { NpmConfigSetLevels } from 'winston/lib/winston/config';

declare interface Serverconfig {
	logger: {
		level: keyof NpmConfigSetLevels;
	};
}

export const clientConfig = {};

export const serverConfig: Serverconfig = {
	logger: {
		// Change this to debug or silly if you want to see all the queries
		level: GetConvar('is_production', 'true') === 'true' ? 'info' : 'info',
	},
};
