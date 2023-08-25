import {Config} from '@dgx/server';

const CONFIG_KEY = 'event';

let configData: BOILERPLATE.Config | null = null;
const config = new Proxy(
	{},
	{
		get(_: any, prop: keyof BOILERPLATE.Config) {
			if (configData == null) {
				throw new Error('Config was not loaded yet...');
			}
			return configData[prop];
		},
	},
);

on('dg-config:moduleLoaded', (module: string, data: BOILERPLATE.Config) => {
	if (module !== CONFIG_KEY) return;
	configData = data;
});

export const loadConfig = async () => {
	await Config.awaitConfigLoad();
	configData = Config.getConfigValue<BOILERPLATE.Config>(CONFIG_KEY);
};

export default config as BOILERPLATE.Config;
