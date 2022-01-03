<template>
	<el-input
		v-bind="$props"
		:model-value="modelValue"
		@focus.prevent="focusInput"
		@blur.prevent="blurInput"
		@input="changeInput"
	>
		<template v-if="$slots.prefix" #prefix><slot name="prefix"></slot></template>
	</el-input>
</template>

<script lang="tsx">
	import { defineComponent } from 'vue';
	import { nuiAction } from '../../lib/nui';

	export default defineComponent({
		name: 'Input',
		props: {
			modelValue: {
				type: String,
				default: '',
			},
			placeholder: {
				type: String,
				default: '',
			},
			type: {
				type: String,
				default: 'text',
			},
			name: {
				type: String,
				default: '',
			},
			id: {
				type: String,
				default: '',
			},
			class: {
				type: String,
				default: '',
			},
			size: {
				type: String,
				default: '',
			},
			min: {
				type: Number,
				default: 0,
			},
		},
		emits: ['update:modelValue', 'update:prefix'],
		setup(props, context) {
			const changeInput = (value: string | number) => {
				context.emit('update:modelValue', value);
			};
			const focusInput = () => {
				nuiAction('controls/setFocus', {
					state: true,
				});
			};
			const blurInput = () => {
				nuiAction('controls/setFocus', {
					state: false,
				});
			};
			return {
				changeInput,
				focusInput,
				blurInput,
			};
		},
	});
</script>
