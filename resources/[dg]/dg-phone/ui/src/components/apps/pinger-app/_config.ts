import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './PingerApp.vue';
import { events } from './events';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'pinger',
	label: 'Pinger',
	icon: {
		name: 'map-pin',
		color: 'white',
		background: '#db3f0a',
	},
	position: 5,
	render: mainComponent,
	events,
});

export default config;
