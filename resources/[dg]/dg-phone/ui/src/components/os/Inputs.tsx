import { computed, DefineComponent, defineComponent, PropType, ref } from 'vue';
import { nuiAction } from '../../lib/nui';
import { QInput, QSelect } from 'quasar';
import { InputType } from '../../types/simpleform';
import { useStore } from '../../lib/state';
import { Contact } from '../../types/apps';

const inputProps = {
	modelValue: {
		type: String as PropType<string>,
		required: true,
	},
	label: {
		type: String as PropType<string>,
		default: '',
	},
	type: {
		type: String as PropType<InputType>,
		default: 'text',
	},
	name: {
		type: String as PropType<string>,
		default: '',
	},
	inputClass: {
		type: String as PropType<string>,
		default: '',
	},
	disabled: {
		type: Boolean as PropType<boolean>,
		default: false,
	},
	min: {
		type: Number as PropType<number>,
		default: 0,
	},
	max: {
		type: Number as PropType<number>,
		default: 0,
	},
};

export const Input: Record<string, DefineComponent<any, any, any, any, any, any, any, any, any, any, any, any>> = {};

export default defineComponent({
	name: 'Input',
	components: { QInput, QSelect },
	props: inputProps,
	emits: ['update:model-value', 'update:prepend', 'input'],
	setup(props, context) {
		const inputValue = ref<string>(props.modelValue ?? '');
		const onUpdate = (value: string) => {
			inputValue.value = value;
			context.emit('update:model-value', value);
			context.emit('input', value);
		};
		switch (props.type) {
			case 'contacts': {
				return () => (
					<Input.Contact {...props} modelValue={inputValue.value} onUpdate:modelValue={onUpdate}>
						{{
							prepend: () => context?.slots?.prepend?.() ?? null,
						}}
					</Input.Contact>
				);
			}
			case 'number': {
				return () => (
					<Input.Number {...props} modelValue={inputValue.value} onUpdate:modelValue={onUpdate}>
						{{
							prepend: () => context?.slots?.prepend?.() ?? null,
						}}
					</Input.Number>
				);
			}
			default: {
				return () => (
					<Input.Text {...props} modelValue={inputValue.value} onUpdate:modelValue={onUpdate}>
						{{
							prepend: () => context?.slots?.prepend?.() ?? null,
						}}
					</Input.Text>
				);
			}
		}
	},
});

Input.Text = defineComponent({
	name: 'InputText',
	components: { QInput },
	props: inputProps,
	emits: ['update:model-value', 'update:prepend', 'input'],
	setup(props, context) {
		const changeInput = (value: any) => {
			context.emit('update:model-value', value);
			context.emit('input', value);
		};
		const focusInput = (e: MouseEvent) => {
			e.preventDefault();
			nuiAction('controls/setFocus', {
				state: true,
			});
		};
		const blurInput = () => {
			nuiAction('controls/setFocus', {
				state: false,
			});
		};
		return () => (
			<q-input {...props} dense onFocus={focusInput} onBlur={blurInput} onUpdate:modelValue={changeInput}>
				{{
					prepend: () => context?.slots?.prepend?.() ?? null,
				}}
			</q-input>
		);
	},
});

Input.Number = defineComponent({
	name: 'InputNumber',
	components: {},
	props: inputProps,
	emits: ['update:model-value', 'update:prepend', 'input'],
	setup(props, context) {
		const changeInput = (value: any) => {
			try {
				value = parseInt(value);
				if (props.max && value > props.max) {
					value = props.max.toString();
				}
				if (props.min && value < props.min) {
					value = props.min.toString();
				}
				// remove leading zeros
				value = value.toString().replace(/^0+(?=[1-9])/, '');
			} catch (e) {
				value = '0';
			} finally {
				context.emit('update:model-value', value);
				context.emit('input', value);
			}
		};
		return () => (
			<Input.Text {...props} onUpdate:modelValue={changeInput}>
				{{
					prepend: () => context?.slots?.prepend?.() ?? null,
				}}
			</Input.Text>
		);
	},
});

Input.Select = defineComponent({
	name: 'InputSelect',
	components: { QSelect },
	props: inputProps,
	emits: ['update:model-value', 'update:prepend', 'input'],
	setup(props, context) {
		const changeInput = (value: any) => {
			if (!parseInt(value)) {
				value = value.substring(0, value.length - 1);
			}
			context.emit('update:model-value', value);
			context.emit('input', value);
		};
		const focusInput = (e: MouseEvent) => {
			e.preventDefault();
			nuiAction('controls/setFocus', {
				state: true,
			});
		};
		const blurInput = () => {
			nuiAction('controls/setFocus', {
				state: false,
			});
		};
		return () => (
			<q-select
				{...props}
				dense
				use-input
				fill-input
				hide-selected
				emit-value
				input-debounce='0'
				onFocus={focusInput}
				onBlur={blurInput}
				onUpdate:modelValue={changeInput}
				onInputValue={changeInput}
			>
				{{
					prepend: () => context?.slots?.prepend?.() ?? null,
				}}
			</q-select>
		);
	},
});

Input.Contact = defineComponent({
	name: 'InputContact',
	components: {},
	props: inputProps,
	emits: ['update:model-value', 'update:prepend', 'input'],
	setup(props, context) {
		const store = useStore();
		const contacts = computed<Contact[]>(() => store.getters.getAppState('contacts'));
		const options = contacts.value.map<Contact & { value: any }>((contact: Contact) => {
			return {
				...contact,
				value: contact.phone,
			};
		});
		const filteredOptions = ref(options);
		const filterFn = (val: string, update: Function) => {
			if (val === '') {
				update(() => {
					filteredOptions.value = options;

					// here you have access to "ref" which
					// is the Vue reference of the QSelect
				});
				return;
			}

			update(() => {
				const needle = val.toLowerCase();
				filteredOptions.value = options.filter(v => v.label.toLowerCase().indexOf(needle) > -1);
			});
		};
		const inputFunc = (val: string) => {
			context.emit('update:model-value', val);
			context.emit('input', val);
		};
		return () => (
			<Input.Select
				{...props}
				label='Contact'
				options={filteredOptions.value}
				onFilter={filterFn}
				onUpdate:modelValue={inputFunc}
			>
				{{
					prepend: () => context?.slots?.prepend?.() ?? null,
				}}
			</Input.Select>
		);
	},
});
