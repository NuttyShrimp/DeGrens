import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './Contacts.vue';
import { fetchContacts } from './lib';
import { events } from './events';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'contacts',
	label: 'Contacten',
	icon: {
		name: 'address-book',
		color: 'white',
		background: '#f5771d',
	},
	position: 2,
	render: mainComponent,
	init: () => fetchContacts(),
	events,
});

export default config;
