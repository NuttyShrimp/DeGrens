<template>
	<div class="phone-form">
		<div v-if="header.trim() !== ''" class="phone-form-header">{{ header }}</div>
		<div class="phone-form-inputwrapper">
			<div v-for="input in inputs" :key="input.name" class="phone-form-input">
				<Input
					v-model="values[input.name].value"
					:name="input.name"
					:type="input.type ?? 'text'"
					:autosize="{ minRows: 2 }"
					:placeholder="input.placeholder"
				>
					<template v-if="input.icon" #prefix>
						<i :class="`fas fa-${input.icon}`"></i>
					</template>
				</Input>
			</div>
		</div>
		<div class="phone-form-btnwrapper">
			<el-button type="danger" @click="onRealCancel">Cancel</el-button>
			<el-button type="success" @click="onAccept(getValues(values))">Accept</el-button>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType, Ref, ref } from 'vue';
	import { FormInput } from '../../types/simpleform';
	import '@/styles/os/simpleform.scss';
	import { useStore } from '../../lib/state';
	import Input from './Inputs.vue';

	export default defineComponent({
		name: 'SimpleForm',
		components: { Input },
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
