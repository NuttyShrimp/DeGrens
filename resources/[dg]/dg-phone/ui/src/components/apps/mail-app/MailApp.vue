<template>
	<app-container :emptylist="appState.length === 0">
		<div class="mail-app">
			<mail-entry v-for="mail in appState" :key="mail.id" :mail="mail"></mail-entry>
		</div>
	</app-container>
</template>

<script lang="ts">
	import '@/styles/apps/pinger.scss';
	import { computed, defineComponent } from 'vue';
	import AppContainer from '../../os/AppContainer.vue';
	import { State, useStore } from '../../../lib/state';
	import '@/styles/apps/mail.scss';
	import MailEntry from './components/MailEntry.vue';

	export default defineComponent({
		name: 'MailApp',
		components: { MailEntry, AppContainer },
		setup() {
			const store = useStore();
			let appState = computed<State['mail']>(() => store.getters.getAppState('mail'));

			return {
				appState,
			};
		},
	});
</script>
