<template>
	<app-container :primary-actions="primaryActions">
		<state-list title="Advocaten" :entries="appState.lawyer ?? []" />
		<state-list title="Rechters" :entries="appState.judge ?? []" />
	</app-container>
</template>

<script lang="ts">
	import { computed, defineComponent, onMounted, ref } from 'vue';
	import AppContainer from '../../os/AppContainer.vue';
	import { State, useStore } from '../../../lib/state';
	import { nuiAction } from '../../../lib/nui';
	import { devdata } from '../../../lib/devdata';
	import '@/styles/apps/state.scss';
	import StateList from './components/StateList.vue';
	import { Action } from '../../../types/appcontainer';

	export default defineComponent({
		name: 'StateApp',
		components: { StateList, AppContainer },
		setup() {
			const store = useStore();
			const appState = computed<State['justice']>(() => store.getters.getAppState('justice'));
			const charState = computed<State['character']>(() => store.getters.getAppState('character'));
			const isAvailable = ref<boolean>(false);
			const primaryActions = ref<Action[]>([]);

			const fetchData = async () => {
				const registered = await nuiAction('justice/get', {}, devdata.justice);
				store.commit('setAppState', {
					appName: 'justice',
					data: registered,
				});
			};

			const getAvailability = () => {
				isAvailable.value = Object.keys(appState.value).includes(charState.value.job)
					? appState.value[charState.value.job].find(p => p.phone === charState.value.phone)?.available ?? false
					: false;
			};

			const setActions = () => {
				if (!Object.keys(appState.value).includes(charState.value.job)) {
					primaryActions.value = [];
					return;
				}
				primaryActions.value =
					isAvailable.value === true
						? [
								{
									label: 'Zet onbeschikbaar',
									icon: 'handshake-slash',
									handler: async () => {
										await nuiAction('justice/setAvailable', {
											available: false,
										});
										await fetchData();
										getAvailability();
										setActions();
									},
								},
						  ]
						: [
								{
									label: 'Zet beschikbaar',
									icon: 'handshake',
									handler: async () => {
										await nuiAction('justice/setAvailable', {
											available: true,
										});
										await fetchData();
										getAvailability();
										setActions();
									},
								},
						  ];
			};

			onMounted(async () => {
				await fetchData();
				getAvailability();
				setActions();
			});
			return {
				appState,
				primaryActions,
			};
		},
	});
</script>
