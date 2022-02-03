import { defineComponent } from 'vue';
import { QBtn } from 'quasar';

export const PrimaryButton = defineComponent({
	name: 'PrimaryButton',
	components: { QBtn },
	setup(props) {
		return () => <q-btn {...props} no-wrap color='primary' text-color='black' />;
	},
});
export const SecondaryButton = defineComponent({
	name: 'SecondaryButton',
	// eslint-disable-next-line vue/no-unused-components
	components: { QBtn },
	setup(props) {
		return () => <q-btn {...props} no-wrap color='secondary' text-color='black' />;
	},
});
