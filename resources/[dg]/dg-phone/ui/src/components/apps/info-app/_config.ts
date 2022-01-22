import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import InfoApp from './InfoApp.vue';
import { events } from './events';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'info',
	label: 'Info',
	icon: {
		name: 'info-circle',
		color: 'white',
		background: '#67a4bd',
	},
	render: InfoApp,
	position: 1,
	events,
});

export default config;
