<template>
	<q-input
		v-bind="$props"
		:ref="undefined"
		dense
		@focus.prevent="focusInput"
		@blur.prevent="blurInput"
		@update:model-value="changeInput"
	>
		<template v-if="$slots.prepend" #prepend>
			<slot name="prepend"></slot>
		</template>
	</q-input>
</template>

<script lang="ts">
	import { defineComponent, PropType } from 'vue';
	import { nuiAction } from '../../lib/nui';
	import { QInputProps } from 'quasar';

	export default defineComponent({
		name: 'Input',
		props: {
			modelValue: {
				type: String as PropType<string>,
				required: true,
			},
			label: {
				type: String as PropType<string>,
				default: '',
			},
			type: {
				type: String as PropType<QInputProps['type']>,
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
		},
		emits: ['update:model-value', 'update:prepend', 'input'],
		setup(props, context) {
			const changeInput = (value: any) => {
				context.emit('update:model-value', value);
				context.emit('input', value);
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
