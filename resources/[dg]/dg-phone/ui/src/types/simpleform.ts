import { QInputProps } from 'quasar';

export interface FormInput {
	defaultValue?: string;
	label?: string;
	type?: QInputProps['type'];
	name: string;
	icon?: string;
	iconPrefix?: string;
}
