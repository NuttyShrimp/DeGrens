<template>
	<app-container>
		<div class="gallery-app">
			<Paper
				v-for="entry in appState"
				:key="entry.id"
				paper-class="gallery-app--entry"
				:actions="actions"
				:handler-arg="[entry]"
				@mouseenter.prevent="toggleBig(entry, true)"
				@mouseleave="toggleBig(entry, false)"
			>
				<template #image>
					<Image :src="entry.link" :big="entry.big" />
				</template>
			</Paper>
		</div>
	</app-container>
</template>

<script lang="ts">
	import { computed, defineComponent, onMounted } from 'vue';
	import '@/styles/apps/gallery.scss';
	import { copyToClipboard, nuiAction } from '../../../lib/nui';
	import { State, useStore } from '../../../lib/state';
	import Image from './components/Image.vue';
	import { devdata } from '../../../lib/devdata';
	import AppContainer from '../../os/AppContainer.vue';
	import Paper from '../../os/Paper.vue';
	import { Action } from '../../../types/appcontainer';
	import { GalleryEntry } from '../../../types/apps';

	export default defineComponent({
		name: 'GalleryApp',
		components: { Paper, AppContainer, Image },
		setup() {
			const store = useStore();
			const appState = computed<State['gallery']>(() => store.getters.getAppState('gallery'));

			const actions: Action<GalleryEntry>[] = [
				{
					icon: 'trash',
					label: 'Delete',
					handler: entry => {
						nuiAction('photo/delete', { id: entry.id });
						fetchState();
					},
				},
				{
					icon: 'clipboard',
					label: 'Copy',
					handler: entry => {
						copyToClipboard(entry.link);
					},
				},
			];

			const toggleBig = (entry: GalleryEntry, toggle: boolean) => {
				const _state = appState.value.map(e => {
					if (e.id === entry.id) {
						e.big = toggle;
					}
					return e;
				});
				store.commit('setAppState', { appName: 'gallery', data: _state });
			};

			const fetchState = async () => {
				const imgs = await nuiAction('images/get', {}, devdata.gallery);
				store.commit('setAppState', {
					appName: 'gallery',
					data: imgs,
				});
			};

			onMounted(fetchState);

			return {
				appState,
				actions,
				toggleBig,
			};
		},
	});
</script>
