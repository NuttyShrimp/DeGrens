<script lang="tsx">
	import { defineComponent, markRaw } from 'vue';
	import SimpleForm from '../../../os/SimpleForm.vue';
	import { FormInput } from '../../../../types/simpleform';
	import { nuiAction } from '../../../../lib/nui';
	import { useStore } from '../../../../lib/state';

	export default {};
	export const newConvoModal = markRaw(
		defineComponent({
			name: 'NewConvoModal',
			components: { SimpleForm },
			setup() {
				const store = useStore();
				const inputs: FormInput[] = [
					{
						name: 'number',
						icon: 'hashtag',
						placeholder: 'Phone number',
						defaultValue: '',
					},
					{
						name: 'message',
						icon: 'comment',
						placeholder: 'Message',
						defaultValue: '',
					},
				];
				const onAccept = (vals: { number: string; message: string }) => {
					nuiAction('messages/send', {
						msg: vals.message,
						target: vals.number,
						date: Date.now(),
					});
					store.dispatch('openCheckmarkModal', () => {
						store.commit('setCurrentView', {
							appName: 'messages',
							view: vals.number,
						});
					});
				};
				return () => <simple-form inputs={inputs} on-accept={onAccept} />;
			},
		})
	);
</script>
