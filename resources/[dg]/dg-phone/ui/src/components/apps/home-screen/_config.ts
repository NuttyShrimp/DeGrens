import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import HomeScreen from './HomeScreen.vue';
import { events } from './events';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	background: 'transparent',
	name: 'home-screen',
	label: 'Home Screen',
	render: HomeScreen,
	hidden: () => true,
	events,
});

export default config;
