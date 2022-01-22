<template>
	<app-container :backbutton="true" containerclass="message-app-list--outer" @back="back">
		<div class="message-app-convo">
			<div class="message-app-convo--header">
				<div>
					<i class="fas fa-user-circle"></i>
				</div>
				<div class="header-text">
					<div class="title">{{ contact?.label ?? convoNr }}</div>
					<div v-if="contact?.label" class="subheader">{{ convoNr }}</div>
				</div>
			</div>
			<div class="message-app-convo--list">
				<div v-if="canLoadMore" class="message-app-convo--more">
					<PrimaryButton label="Load More" no-wrap size="sm" @click="loadMore" />
				</div>
				<div
					v-for="message in messages"
					:key="message.id"
					:class="`message-app-convo--mes${message.isreceiver ? ' incoming' : ''}`"
				>
					<div class="message-app-convo--mes--text">
						<Text>
							{{ message.message }}
						</Text>
					</div>
					<div class="message-app-convo--mes--time">
						{{ formatRelativeTime(message.date) }}
					</div>
				</div>
			</div>
			<div class="message-app-convo--input">
				<Input v-model="inputStr" label="Type a message..." @keyup.enter="sendMessage" />
				<q-btn
					v-if="inputStr.trim() !== ''"
					color="primary"
					flat
					icon="mdi-send"
					round
					size="sm"
					@click="sendMessage"
				/>
			</div>
		</div>
	</app-container>
</template>
<script lang="ts">
	import { computed, defineComponent, onMounted, ref, watch } from 'vue';
	import AppContainer from '../../../os/AppContainer.vue';
	import { useStore } from '../../../../lib/state';
	import { Contact, Message } from '../../../../types/apps';
	import { getContact } from '../../contacts/lib';
	import { nuiAction } from '../../../../lib/nui';
	import { formatRelativeTime } from '../../../../lib/util';
	import Text from '../../../os/Text.vue';
	import Input from '../../../os/Inputs.vue';
	import { PrimaryButton } from '../../../os/Buttons.vue';

	export default defineComponent({
		name: 'MessageConvo',
		components: { PrimaryButton, Input, Text, AppContainer },
		setup() {
			const store = useStore();
			let messages = computed<Message[]>(() => store.getters.getMessages());
			let convoNr = computed(() => store.state.messages.currentView, {
				onTrigger(e) {
					contact.value = getContact(e.newValue?.currentView);
				},
			});
			let contact = ref<Contact | undefined>(getContact(convoNr.value));
			let inputStr = ref('');
			let canLoadMore = ref(true);
			const back = () =>
				store.commit('setCurrentView', {
					appName: 'messages',
					view: 'list',
				});
			const sendMessage = () => {
				nuiAction('messages/send', {
					msg: inputStr.value,
					target: convoNr.value,
					date: Date.now(),
				});
				inputStr.value = '';
			};
			const loadMore = async () => {
				const newMes = await nuiAction('messages/get', {
					target: convoNr.value,
					offset: messages.value.length,
				});
				if (typeof newMes !== 'object' || Array.isArray(newMes) || newMes[convoNr.value].length === 0) {
					console.log('could not load more messages');
					canLoadMore.value = false;
					return;
				}
				store.commit('addMessage', {
					id: convoNr.value,
					messages: newMes[convoNr.value],
					place: 'prepend',
				});
			};
			onMounted(() => {
				let objDiv = document.getElementsByClassName('message-app-convo--list')[0];
				objDiv.scrollTop = objDiv.scrollHeight;
			});
			watch(messages, (state, prevState) => {
				// set scrolltop to bottom if diff of length is 1
				if (state.length - prevState.length === 1) {
					setTimeout(() => {
						let objDiv = document.getElementsByClassName('message-app-convo--list')[0];
						objDiv.scrollTop = objDiv.scrollHeight;
					}, 10);
				}
			});

			return {
				messages,
				back,
				contact,
				convoNr,
				inputStr,
				sendMessage,
				loadMore,
				canLoadMore,
				formatRelativeTime,
			};
		},
	});
</script>
