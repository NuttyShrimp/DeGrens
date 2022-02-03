import { ConfigObject, defaultConfigObject } from '../../../lib/apps';
import mainComponent from './MailApp.vue';
import { events } from './events';

const config = (): ConfigObject => ({
	...defaultConfigObject,
	name: 'mail',
	label: 'Mails',
	icon: {
		name: 'mail-bulk',
		color: 'white',
		background: '#59b3a9',
		backgroundGradient: '#82DED5',
	},
	position: 6,
	render: mainComponent,
	events,
});

export default config;
