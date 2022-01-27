import { QInputProps } from 'quasar';

export type InputType = QInputProps['type'] | 'contacts';

export interface FormInput {
	defaultValue?: string;
	label?: string;
	type?: InputType;
	name: string;
	icon?: string;
	iconPrefix?: string;
	min?: number;
	max?: number;
}
