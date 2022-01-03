<template>
	<quill-editor
		v-if="!readonly"
		:content="modelValue"
		content-type="html"
		:options="options"
		theme="bubble"
		@input="changeTxt($event)"
	></quill-editor>
	<div v-else class="ql-container"><div class="ql-editor" v-html="sanitizeText(modelValue)"></div></div>
</template>
<script lang="ts">
	import { defineComponent } from 'vue';
	import { QuillEditor } from '@vueup/vue-quill';
	import { sanitizeText } from '../../lib/util';

	/**
	 * The text editor component.
	 * example <text-editor v-model="<p>My Text :)</p>>" ></text-editor>
	 */

	export default defineComponent({
		name: 'TextEditor',
		components: {
			QuillEditor,
		},
		props: {
			modelValue: {
				type: String,
				default: '',
			},
			readonly: {
				type: Boolean,
				default: false,
			},
		},
		emits: ['update:modelValue'],
		setup(props, { emit }) {
			const changeTxt = (e: Event) => {
				emit('update:modelValue', (e.target as any).innerHTML);
			};
			const options = {
				bounds: '.appcontainer',
			};
			return { changeTxt, options, sanitizeText };
		},
	});
</script>
