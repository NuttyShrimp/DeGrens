import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './MessageApp.vue';
import { events } from './events';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'messages',
	label: 'Berichten',
	icon: {
		name: 'comments-alt',
		color: 'white',
		background: '#2eafdb',
	},
	render: mainComponent,
	position: 4,
	events,
});

export default config;
