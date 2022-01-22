<template>
	<app-container>
		<div class="home-screen">
			<div v-for="app in apps" :key="app">
				<div
					v-if="!app.empty"
					v-tooltip="app.label"
					class="home-screen-app"
					:style="
						(!app?.empty && {
							color: app?.icon?.color ?? 'white',
							background: `linear-gradient(transparent, ${app?.icon?.backgroundGradient ?? 'rgba(0, 0, 0, 0.3)'})`,
							'background-color': app?.icon?.background ?? '#000',
						}) || {
							background: 'none',
						}
					"
					@click="!app?.empty && selectApp(app.name)"
				>
					<i :class="`${app?.icon?.lib ?? 'fas'} fa-${app?.icon?.name ?? 'house'}`"></i>
				</div>
			</div>
		</div>
	</app-container>
</template>

<script>
	import '@/styles/home-screen.scss';
	import { defineComponent } from 'vue';
	import AppContainer from '@/components/os/AppContainer.vue';
	import { phoneApps } from '../../../lib/apps';
	import { useStore } from '../../../lib/state';

	export default defineComponent({
		name: 'HomeScreen',
		components: { AppContainer },
		setup() {
			const store = useStore();
			const filteredApps = Object.values(phoneApps)
				.filter(app => !!app.icon && (app.hidden ? !app.hidden() : true))
				.sort((a, b) => (a.position < b.position ? -1 : 1));
			const missing = 4 - (filteredApps.length % 4);
			const emptyApps = new Array(missing).fill({ empty: true });
			filteredApps.push(...emptyApps);

			const selectApp = app => {
				store.commit('setActiveApp', app);
			};
			return {
				apps: filteredApps,
				selectApp,
			};
		},
	});
</script>

<style scoped></style>
