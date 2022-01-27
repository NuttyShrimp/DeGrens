<template>
	<div class="bank-form">
		<div v-if="header.trim() !== ''" class="bank-form-header">{{ header }}</div>
		<div class="bank-form-inputwrapper">
			<div v-for="input in inputs" :key="input.name" class="bank-form-input">
				<MDBInput
					v-model="values[input.name].value"
					:form-outline="false"
					:input-group="!!input.icon"
					:name="input.name"
					:placeholder="input.placeholder"
					:rows="{ minRows: 2 }"
					:type="input.type ?? 'text'"
					class="rounded"
					min="0"
					white
					wrapper-class="mb-3"
				>
					<template v-if="input.icon" #prepend>
						<span class="bank-form-prepend border-0">
							<i :class="`fas fa-${input.icon}`"></i>
						</span>
					</template>
				</MDBInput>
			</div>
		</div>
		<div class="bank-form-btnwrapper">
			<MDBBtn color="warning" @click="onRealCancel">Cancel</MDBBtn>
			<MDBBtn color="success" @click="onAccept(getValues(values))">Accept</MDBBtn>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType, Ref, ref } from 'vue';
	import { FormInput } from '../../types/simpleform';
	import '@/styles/os/simpleform.scss';
	import { useStore } from '../../lib/store';
	import { MDBBtn, MDBInput } from 'mdb-vue-ui-kit';

	export default defineComponent({
		name: 'SimpleForm',
		components: { MDBInput, MDBBtn },
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
