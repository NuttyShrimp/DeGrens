<template>
	<div class="notes-app">
		<notes-editor v-if="appState.current" />
		<notes-list v-else />
	</div>
</template>

<script lang="ts">
	import '@/styles/apps/pinger.scss';
	import { computed, defineComponent } from 'vue';
	import { State, useStore } from '../../../lib/state';
	import NotesEditor from './components/NotesEditor.vue';
	import NotesList from './components/NotesList.vue';
	import '@/styles/apps/notes.scss';

	export default defineComponent({
		name: 'NotesApp',
		components: { NotesList, NotesEditor },
		setup() {
			const store = useStore();
			let appState = computed<State['notes']>(() => store.getters.getAppState('notes'));
			return {
				appState,
			};
		},
	});
</script>
