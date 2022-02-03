<script lang="tsx">
	import { defineComponent, markRaw } from 'vue';
	import SimpleForm from '../../../os/SimpleForm.vue';
	import { FormInput } from '../../../../types/simpleform';
	import { nuiAction } from '../../../../lib/nui';
	import { useStore } from '../../../../lib/state';

	export default {};
	export const currentYPForm = markRaw(
		defineComponent({
			name: 'NewTweetForm',
			components: { SimpleForm },
			props: {
				text: {
					type: String,
					default: '',
				},
				onAccept: {
					type: Function,
					default: () => {
						//
					},
				},
			},
			setup(props) {
				const store = useStore();
				const inputs: FormInput[] = [
					{
						name: 'text',
						type: 'textarea',
						label: 'Wat wil je adverteren?',
						defaultValue: props.text ?? '',
					},
				];
				const onAccept = (vals: { text: string }) => {
					if (vals.text.trim() === '') {
						nuiAction('yellowpages/remove', {});
					} else {
						nuiAction('yellowpages/new', {
							...vals,
						});
					}
					store.dispatch('openCheckmarkModal', () => {
						props?.onAccept?.();
					});
				};
				return () => <simple-form inputs={inputs} on-accept={onAccept} />;
			},
		})
	);
</script>
