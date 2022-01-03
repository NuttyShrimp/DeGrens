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
		background: '#FFD662',
	},
	position: 9,
	render: mainComponent,
	events,
});

export default config;
