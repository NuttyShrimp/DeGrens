<!-- eslint-disable-file vue/one-component-per-file -->
<script lang="tsx">
	import { defineComponent, PropType } from 'vue';
	import { Contact } from '../../../../types/apps';
	import SimpleForm from '../../../os/SimpleForm.vue';
	import { FormInput } from '../../../../types/simpleform';
	import { nuiAction } from '../../../../lib/nui';
	import { useStore } from '../../../../lib/state';
	import { fetchContacts } from '../lib';

	export default {};

	export const AddContactForm = defineComponent({
		name: 'AddContactForm',
		components: { SimpleForm },
		props: {
			label: {
				type: String,
				default: '',
			},
			phone: {
				type: String,
				default: '',
			},
		},
		setup(props) {
			const store = useStore();
			const inputs: FormInput[] = [
				{
					name: 'label',
					icon: 'tag',
					type: 'text',
					placeholder: 'Label',
					defaultValue: props.label ?? '',
				},
				{
					name: 'phone',
					icon: 'hashtag',
					type: 'text',
					placeholder: 'Phone Nr.',
					defaultValue: props.phone ?? '',
				},
			];
			const onAccept = (vals: Partial<Contact>) => {
				nuiAction('contacts:add', {
					...vals,
				});
				store.dispatch('openCheckmarkModal', () => {
					fetchContacts();
				});
			};
			return () => <simple-form inputs={inputs} on-accept={onAccept} />;
		},
	});

	export const EditContactForm = defineComponent({
		name: 'EditContactForm',
		components: { SimpleForm },
		props: {
			contact: {
				type: Object as PropType<Contact>,
				required: true,
			},
		},
		setup(props) {
			const store = useStore();
			const inputs: FormInput[] = [
				{
					name: 'label',
					icon: 'tag',
					type: 'text',
					placeholder: 'Label',
					defaultValue: props.contact.label,
				},
				{
					name: 'phone',
					icon: 'phone-alt',
					type: 'text',
					placeholder: 'Phone Nr.',
					defaultValue: props.contact.phone,
				},
			];
			const onAccept = (vals: Partial<Contact>) => {
				nuiAction('contacts:update', {
					id: props.contact.id,
					...vals,
				});
				store.dispatch('openCheckmarkModal', () => {
					fetchContacts();
				});
			};
			return () => <simple-form inputs={inputs} on-accept={onAccept} />;
		},
	});

	export const RemoveContactForm = defineComponent({
		name: 'RemoveContactForm',
		components: { SimpleForm },
		props: {
			contact: {
				type: Object as PropType<Contact>,
				required: true,
			},
		},
		setup(props) {
			const store = useStore();
			const onAccept = () => {
				nuiAction('contacts:remove', {
					id: props.contact.id,
				});
				store.dispatch('openCheckmarkModal', () => {
					fetchContacts();
				});
			};
			return () => <simple-form header={`Remove contact (${props.contact.label})`} inputs={[]} on-accept={onAccept} />;
		},
	});
</script>
