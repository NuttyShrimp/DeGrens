<template>
	<app-container :primary-actions="primActions" :search="searchInfo">
		<div class="contact-wrapper">
			<paper v-for="contact in filteredList" :key="contact.id" :actions="paperActions" :handler-arg="[contact]">
				<template #image>
					<i class="fas fa-user-circle"></i>
				</template>
				<template #title>{{ contact.label }}</template>
				<template #description>{{ contact.phone }}</template>
			</paper>
		</div>
	</app-container>
</template>

<script lang="ts">
	import AppContainer from '../../os/AppContainer.vue';
	import { Action, Search } from '../../../types/appcontainer';
	import { useStore } from '../../../lib/state';
	import Paper from '../../os/Paper.vue';
	import { Contact } from '../../../types/apps';
	import { AddContactForm, EditContactForm, RemoveContactForm } from './components/ContactForm.vue';
	import { startPhoneCall } from '../../../lib/call';
	import { computed, defineComponent, onMounted, onRenderTriggered, ref } from 'vue';
	import { fetchContacts } from './lib';
	import { copyToClipboard } from '../../../lib/nui';
	import '@/styles/apps/contacts.scss';

	export default defineComponent({
		components: { Paper, AppContainer },
		setup() {
			const primActions: Action[] = [
				{
					icon: 'plus',
					label: 'New contact',
					handler: () => {
						store.dispatch('openModal', {
							element: AddContactForm,
							props: {},
						});
					},
				},
			];
			const paperActions: Action<Contact>[] = [
				{
					icon: 'phone-alt',
					label: 'Call',
					handler: c => {
						startPhoneCall(c.phone);
					},
				},
				{
					icon: 'comment-alt',
					label: 'Messsage',
					handler: c => {
						store.dispatch('openMsgConvo', c.phone);
					},
				},
				{
					icon: 'pencil',
					label: 'Edit',
					handler: c => {
						store.dispatch('openModal', {
							element: EditContactForm,
							props: {
								contact: c,
							},
						});
					},
				},
				{
					icon: 'trash-alt',
					label: 'Remove',
					handler: c => {
						store.dispatch('openModal', {
							element: RemoveContactForm,
							props: {
								contact: c,
							},
						});
					},
				},
				{
					icon: 'clipboard',
					label: 'Copy',
					handler: c => {
						copyToClipboard(c.phone);
					},
				},
			];
			const store = useStore();
			const contacts = computed<Contact[]>(() => {
				return store.state.contacts;
			});
			const filteredList = ref<Contact[]>(contacts.value);
			const searchInfo = ref<Search>({
				list: contacts.value,
				filter: ['label'],
				onChange: contacts => {
					filteredList.value = contacts;
				},
			});
			const fetchContactsInternal = async () => {
				filteredList.value = await fetchContacts();
			};
			onMounted(fetchContactsInternal);
			onRenderTriggered(fetchContactsInternal);
			return {
				primActions,
				searchInfo,
				paperActions,
				filteredList,
			};
		},
	});
</script>
