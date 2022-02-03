<template>
	<app-container>
		<div class="info-app">
			<div v-for="entry in info" :key="entry.name" class="info-app-entry">
				<div class="info-app-icon">
					<i :class="`fas fa-${entry.icon ?? 'info'}`" :style="{ color: entry.color }"></i>
				</div>
				<p>{{ entry.prefix ?? '' }}{{ entry.value }}</p>
			</div>
		</div>
	</app-container>
</template>

<script lang="ts">
	import AppContainer from '../../os/AppContainer.vue';
	import { State, useStore } from '../../../lib/state';
	import { computed, defineComponent } from 'vue';
	import '@/styles/apps/info.scss';
	import { nuiAction } from '../../../lib/nui';
	import { infoAppEntry } from '../../../types/apps';

	export default defineComponent({
		name: 'InfoApp',
		components: { AppContainer },
		setup() {
			const store = useStore();
			const state = computed(() => store.getters.getAppState('info'));
			return {
				info: state,
			};
		},
		async mounted() {
			const store = useStore();
			const info = await nuiAction('fetchInfo', {}, {});
			const newState: State['info'] = store.getters.getAppState('info').map((entry: infoAppEntry) => {
				if (info[entry.name]) {
					entry.value = info[entry.name];
				}
				return entry;
			});
			store.commit('setAppState', { appName: 'info', data: newState });
		},
	});
</script>

<style scoped></style>
