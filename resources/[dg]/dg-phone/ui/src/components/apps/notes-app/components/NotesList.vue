<template>
	<app-container :emptylist="filteredList.length === 0" :search="searchInfo" :primary-actions="primaryActions">
		<div class="notes-list">
			<paper v-for="note in filteredList" :key="note.id" @onClick="openNote(note)">
				<template #title>
					{{ note.title }}
				</template>
			</paper>
		</div>
	</app-container>
</template>
<script lang="ts">
	import AppContainer from '../../../os/AppContainer.vue';
	import { computed, defineComponent, onMounted, ref, watch } from 'vue';
	import { State, useStore } from '../../../../lib/state';
	import Paper from '../../../os/Paper.vue';
	import { Note } from '../../../../types/apps';
	import { nuiAction } from '../../../../lib/nui';
	import { devdata } from '../../../../lib/devdata';
	import { Action, Search } from '../../../../types/appcontainer';

	export default defineComponent({
		name: 'NotesList',
		components: { Paper, AppContainer },
		setup() {
			const store = useStore();
			let appState = computed<State['notes']>(() => store.getters.getAppState('notes'));
			let filteredList = ref<Note[]>(appState.value.list);
			const openNote = (note: Note) => {
				store.commit('setCurrentEntry', { appName: 'notes', entry: note });
			};
			const fetchNotes = async () => {
				const _notes = await nuiAction('notes/get', {}, devdata.notes);
				store.commit('setAppState', { appName: 'notes', data: { ...appState.value, list: _notes } });
			};
			const searchInfo = ref<Search>({
				list: appState.value.list,
				filter: ['title'],
				onChange: (list: Note[]) => {
					filteredList.value = list;
				},
			});
			const primaryActions: Action[] = [
				{
					label: 'New Note',
					icon: 'plus',
					handler: () => {
						store.dispatch('createNote');
					},
				},
			];
			watch(appState, () => {
				searchInfo.value.list = appState.value.list;
				filteredList.value = appState.value.list;
			});
			onMounted(fetchNotes);
			return {
				primaryActions,
				searchInfo,
				filteredList,
				openNote,
			};
		},
	});
</script>
