<template>
	<app-container :primary-actions="primaryActions" :emptylist="filterdListings.length === 0" :search="searchInfo">
		<div class="yp-app">
			<div v-for="entry in filterdListings" :key="entry.phone" class="yp-app--entry">
				<div class="yp-app--entry--header">
					{{ entry.name }}
				</div>
				<div class="yp-app--entry--text">
					<Text>
						{{ entry.text }}
					</Text>
				</div>
				<div class="yp-app--entry--btns">
					<div
						class="yp-app--entry--btns--phone"
						@click="callEntry(entry.phone)"
						@mouseenter.prevent="showNumber($event, entry.phone)"
						@mouseleave.prevent="hideNumber($event, 'Bel')"
					>
						<i class="fas fa-phone"></i>
						<span>Bel</span>
					</div>
					<div
						class="yp-app--entry--btns--msg"
						@click="msgEntry(entry.phone)"
						@mouseenter.prevent="showNumber($event, entry.phone)"
						@mouseleave.prevent="hideNumber($event, 'Bericht')"
					>
						<i class="fas fa-comments-alt"></i>
						<span>Bericht</span>
					</div>
				</div>
			</div>
		</div>
	</app-container>
</template>

<script lang="ts">
	import '@/styles/apps/pinger.scss';
	import { computed, defineComponent, onMounted, ref, watch } from 'vue';
	import AppContainer from '../../os/AppContainer.vue';
	import { State, useStore } from '../../../lib/state';
	import { Action, Search } from '../../../types/appcontainer';
	import '@/styles/apps/twitter.scss';
	import { YellowPageEntry } from '../../../types/apps';
	import { nuiAction } from '../../../lib/nui';
	import { devdata } from '../../../lib/devdata';
	import '@/styles/apps/yellowpages.scss';
	import { startPhoneCall } from '../../../lib/call';
	import { currentYPForm } from './components/YPModals.vue';
	import Text from '../../os/Text.vue';

	export default defineComponent({
		name: 'YellowPagesApp',
		components: { Text, AppContainer },
		setup() {
			const store = useStore();
			const appState = computed<State['yellowpages']>(() => store.getters.getAppState('yellowpages'));
			const filterdListings = ref<YellowPageEntry[]>(appState.value.list);
			const primaryActions: Action[] = [
				{
					icon: 'plus',
					label: 'Nieuwe advertentie',
					handler: () => {
						store.dispatch('openModal', {
							element: currentYPForm,
							props: {
								text: appState?.value?.current?.text ?? '',
								onAccept: fetchListings,
							},
						});
					},
				},
			];
			const searchInfo = ref<Search>({
				list: appState.value.list,
				filter: ['name', 'phone', 'text'],
				onChange: list => {
					filterdListings.value = list;
				},
			});

			const fetchListings = async () => {
				const listings = await nuiAction('yellowpages/getList', {}, devdata.yellowpages);
				store.commit('setAppState', { appName: 'yellowpages', data: { ...appState.value, list: listings } });
			};
			const callEntry = (phone: string) => {
				startPhoneCall(phone);
			};
			const msgEntry = (phone: string) => {
				store.dispatch('openMsgConvo', phone);
			};
			const showNumber = (e: MouseEvent, phone: string) => {
				// Search for the first span
				const span = (e.target as any).querySelector('span');
				if (span) {
					span.innerText = phone;
				}
			};
			const hideNumber = (e: MouseEvent, txt: string) => {
				const span = (e.target as any).querySelector('span');
				if (span) {
					span.innerText = txt;
				}
			};

			onMounted(fetchListings);
			watch(appState, state => {
				filterdListings.value = state?.list ?? [];
				searchInfo.value.list = filterdListings.value;
			});

			return {
				searchInfo,
				primaryActions,
				filterdListings,
				appState,
				callEntry,
				msgEntry,
				showNumber,
				hideNumber,
			};
		},
	});
</script>
