<script lang="tsx">
	import { defineComponent, markRaw } from 'vue';
	import SimpleForm from '../../../os/SimpleForm.vue';
	import { FormInput } from '../../../../types/simpleform';
	import { Contact } from '../../../../types/apps';
	import { nuiAction } from '../../../../lib/nui';
	import { useStore } from '../../../../lib/state';

	export default {};
	export const newTweetForm = markRaw(
		defineComponent({
			name: 'NewTweetForm',
			components: { SimpleForm },
			props: {
				tweet: {
					type: String,
					default: '',
				},
				onAccept: {
					type: Function,
					default: () => {
						return;
					},
				},
			},
			setup(props) {
				const store = useStore();
				const inputs: FormInput[] = [
					{
						name: 'tweet',
						icon: 'twitter',
						iconPrefix: 'fab fa-',
						type: 'textarea',
						label: "Tell us what's happening",
						defaultValue: props.tweet ?? '',
					},
				];
				const onAccept = (vals: Partial<Contact>) => {
					nuiAction('twitter/new', {
						...vals,
						date: Date.now(),
					});
					store.dispatch('openCheckmarkModal', () => {
						props?.onAccept?.();
					});
				};
				return () => <simple-form inputs={inputs} on-accept={onAccept} />;
			},
		})
	);
</script>
