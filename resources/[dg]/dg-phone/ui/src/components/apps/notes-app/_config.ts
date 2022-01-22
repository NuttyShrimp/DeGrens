import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './NotesApp.vue';
import { events } from './events';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'notes',
	label: 'Notities',
	icon: {
		name: 'folders',
		color: 'white',
		background: '#ec1aa4',
		backgroundGradient: '#9420c2',
	},
	position: 9,
	render: mainComponent,
	events,
});

export default config;
