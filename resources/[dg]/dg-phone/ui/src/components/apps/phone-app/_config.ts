import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './PhoneApp.vue';
import { events } from './events';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'dialer',
	label: 'Telefoon',
	icon: {
		name: 'phone-alt',
		color: 'white',
		background: '#34ad2b',
	},
	render: mainComponent,
	position: 3,
	events,
});

export default config;
