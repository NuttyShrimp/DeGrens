<template>
	<div class="phone-form">
		<div v-if="header.trim() !== ''" class="phone-form-header">{{ header }}</div>
		<div class="phone-form-inputwrapper">
			<div v-for="input in inputs" :key="input.name" class="phone-form-input">
				<Input
					v-model="values[input.name].value"
					:name="input.name"
					:type="input.type ?? 'text'"
					:label="input.label"
					autogrow
				>
					<template v-if="input.icon" #prepend>
						<q-icon :name="`${input.iconPrefix ?? 'fas fa-'}${input.icon}`" size="xs" />
					</template>
				</Input>
			</div>
		</div>
		<div class="phone-form-btnwrapper">
			<SecondaryButton label="Cancel" size="sm" @click="onRealCancel" />
			<PrimaryButton label="Accept" size="sm" @click="onAccept(getValues(values))" />
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType, Ref, ref } from 'vue';
	import { FormInput } from '../../types/simpleform';
	import '@/styles/os/simpleform.scss';
	import { useStore } from '../../lib/state';
	import Input from './Inputs.vue';
	import { PrimaryButton, SecondaryButton } from './Buttons.vue';

	export default defineComponent({
		name: 'SimpleForm',
		components: { PrimaryButton, SecondaryButton, Input },
		props: {
			header: {
				type: String,
				default: '',
			},
			inputs: {
				type: Array as PropType<FormInput[]>,
				required: true,
			},
			onAccept: {
				type: Function,
				required: true,
			},
			onCancel: {
				type: Function,
				default: () => {
					return () => undefined;
				},
			},
		},
		setup(props) {
			let store = useStore();
			const values: Record<string, Ref> = {};
			props.inputs.forEach(i => {
				values[i.name] = ref(i.defaultValue ?? '');
			});

			const getValues = (values: { [k: string]: Ref }) => {
				const valuesCopy: Record<string, string> = {};
				for (const key in values) {
					valuesCopy[key] = values[key].value;
				}
				return valuesCopy;
			};

			const onRealCancel = () => {
				store.dispatch('closeModal');
				props?.onCancel?.();
			};

			return {
				onRealCancel,
				getValues,
				values,
			};
		},
	});
</script>
