<template>
	<app-container
		:empty-list="Object.keys(messages ?? {}).length === 0"
		:search="searchInfo"
		:primary-actions="primaryActions"
	>
		<div class="message-app-list">
			<paper v-for="num in Object.keys(filteredMessages)" :key="num" @on-click="openConversation(num)">
				<template #title>{{ contacts.find(c => c.phone === num)?.label ?? num }}</template>
				<template #description>{{ messages[num][messages[num].length - 1].message }}</template>
			</paper>
		</div>
	</app-container>
</template>
<script lang="ts">
	import { computed, defineComponent, onMounted, ref, watch } from 'vue';
	import AppContainer from '../../../os/AppContainer.vue';
	import Paper from '../../../os/Paper.vue';
	import { useStore } from '../../../../lib/state';
	import { Action, Search } from '../../../../types/appcontainer';
	import { nuiAction } from '../../../../lib/nui';
	import { devdata } from '../../../../lib/devdata';
	import { Contact, MessageObject } from '../../../../types/apps';
	import { newConvoModal } from './MessageModal.vue';

	export default defineComponent({
		name: 'MessageList',
		components: { AppContainer, Paper },
		setup() {
			const store = useStore();
			let state = computed<MessageObject>(() => store.getters.getAllMessages());

			let filteredMessages = ref(state.value);
			let contacts = computed<Contact[]>(() => store.getters.getAppState('contacts'));
			const numFilter = (num: string) => {
				// gets phone nummer as input, check if contact exists if so concat name and phone number
				const contact = contacts.value.find(c => c.phone === num);
				return contact ? `${contact.label} (${num})` : num;
			};
			const searchInfo = ref<Search>({
				list: Object.keys(state.value),
				filter: [numFilter],
				onChange: mes => {
					const _mes: Record<string, any> = {};
					mes.forEach(m => {
						_mes[m] = state.value[m];
					});
					filteredMessages.value = _mes;
				},
			});
			const primaryActions: Action[] = [
				{
					label: 'New Message',
					icon: 'comment',
					handler: () => {
						store.dispatch('openModal', { element: newConvoModal });
					},
				},
			];
			const openConversation = (num: string) => {
				store.commit('setAppState', { appName: 'messages', data: { currentView: num, messages: state } });
			};
			watch(state, newState => {
				filteredMessages.value = newState;
			});
			onMounted(async () => {
				const mainState = computed(() => store.getters.getAppState('messages'));
				const _mes = await nuiAction('messages/get', {}, devdata.messages);
				store.commit('setAppState', {
					appName: 'messages',
					data: { ...mainState.value, messages: _mes },
				});
			});
			return {
				messages: state,
				searchInfo,
				contacts,
				openConversation,
				filteredMessages,
				primaryActions,
			};
		},
	});
</script>
