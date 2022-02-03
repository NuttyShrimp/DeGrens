<template>
	<app-container>
		<phone-tabs :active-tab="activeApp" :tabs="tabs" @changetab="changeTab" />
		<call-history v-if="activeApp === 'history'" :history="history" />
		<dailpad v-else-if="activeApp === 'dailpad'" />
	</app-container>
</template>

<script lang="ts">
	import { computed, defineComponent, onMounted } from 'vue';
	import AppContainer from '../../os/AppContainer.vue';
	import '../../../styles/apps/phone.scss';
	import PhoneTabs from './components/Tabs.vue';
	import { useStore } from '../../../lib/state';
	import { TabEntry } from '../../../types/apps';
	import CallHistory from './components/CallHistory.vue';
	import Dailpad from './components/Dailpad.vue';
	import { setDevData } from '../../../lib/devdata';

	export default defineComponent({
		name: 'PhoneApp',
		components: { Dailpad, CallHistory, PhoneTabs, AppContainer },
		setup() {
			const store = useStore();
			const tabs: TabEntry[] = [
				{
					name: 'history',
					icon: 'history',
					label: 'History',
				},
				{
					name: 'dailpad',
					icon: 'phone-office',
					label: 'Dialpad',
				},
			];
			const changeTab = (name: string) => {
				store.commit('setCurrentView', {
					appName: 'phone',
					view: name,
				});
			};
			onMounted(() => {
				setDevData('phone');
			});
			const activeAppRef = computed(() => store.state.phone.currentView);
			const historyAppRef = computed(() => store.state.phone.history);
			return {
				activeApp: activeAppRef,
				history: historyAppRef,
				changeTab,
				tabs,
			};
		},
	});
</script>
