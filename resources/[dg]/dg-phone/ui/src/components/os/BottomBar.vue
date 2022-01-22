<template>
	<div class="bottom-bar">
		<div v-for="entry in entries" :key="entry.name">
			<i
				:class="entry.icon"
				@mouseenter="setHoverIcon($event, entry.name)"
				@mouseleave="resetIcon($event, entry.name)"
				@click="entry.handler && entry.handler()"
			></i>
		</div>
	</div>
</template>

<script lang="ts">
	import { useStore } from '../../lib/state';
	import { computed, defineComponent, reactive, watch } from 'vue';
	import { nuiAction } from '../../lib/nui';

	export default defineComponent({
		name: 'BottomBar',
		setup() {
			const store = useStore();
			const isSilenced = computed(() => store.getters.getAppState('isSilenced'));
			const entries: { name: string; icon: string; hoverIcon?: string; handler?: () => void }[] = reactive([
				{
					name: 'silence',
					icon: isSilenced.value ? 'fas fa-bell-slash' : 'fas fa-bell',
					handler: () => {
						store.commit('setSilenced', !isSilenced.value);
					},
				},
				{
					name: 'home',
					icon: 'far fa-circle',
					hoverIcon: 'fas fa-circle',
					handler: () => {
						if (store.state.activeApp == 'home-screen') return;
						store.commit('setActiveApp', 'home-screen');
					},
				},
				{
					name: 'camera',
					icon: 'fas fa-camera',
					handler: () => {
						nuiAction('camera/open');
					},
				},
			]);
			const setHoverIcon = (evt: MouseEvent, entryName: string) => {
				const entry = entries.find(entry => entry.name === entryName);
				if (!entry?.hoverIcon) return;
				(evt?.target as HTMLElement).classList.value = entry.hoverIcon;
			};
			const resetIcon = (evt: MouseEvent, entryName: string) => {
				const entry = entries.find(entry => entry.name === entryName);
				if (!entry?.hoverIcon) return;
				(evt?.target as HTMLElement).classList.value = entry.icon;
			};

			watch(isSilenced, (newVal, oldVal) => {
				if (newVal === oldVal) return;
				const silenceEntry = entries.find(entry => entry.name === 'silence');
				if (!silenceEntry) return;
				silenceEntry.icon = newVal ? 'fas fa-bell-slash' : 'fas fa-bell';
			});

			return {
				setHoverIcon,
				resetIcon,
				entries,
			};
		},
	});
</script>

<style scoped></style>
