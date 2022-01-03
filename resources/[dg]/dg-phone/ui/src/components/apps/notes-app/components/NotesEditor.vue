<template>
	<app-container
		backbutton
		:primary-actions="primaryActions"
		:aux-actions="readonly ? auxActions : []"
		@back="openList"
	>
		<text-editor v-if="currentNote !== null" v-model="currentNote.note" :readonly="readonly" />
		<div v-else>There went something wrong while loading the text-editor please reload your phone</div>
	</app-container>
</template>
<script lang="ts">
	import AppContainer from '../../../os/AppContainer.vue';
	import { defineComponent, onMounted, ref, watch } from 'vue';
	import TextEditor from '../../../os/TextEditor.vue';
	import { useStore } from '../../../../lib/state';
	import { Note } from '../../../../types/apps';
	import { Action } from '../../../../types/appcontainer';
	import { nuiAction } from '../../../../lib/nui';
	import { ElMessage } from 'element-plus';

	export default defineComponent({
		name: 'NotesEditor',
		components: { TextEditor, AppContainer },
		setup() {
			const store = useStore();
			const currentNote = ref<Note | null>(store.getters.getAppState('notes').current);
			let readonly = ref(true);
			const primaryActions = ref<Action[]>([]);
			const auxActions = ref<Action[]>([]);

			const resetActions = () => {
				primaryActions.value = [
					{
						label: 'Edit',
						icon: 'pencil',
						handler: () => {
							readonly.value = false;
						},
					},
				];
				auxActions.value = [
					{
						label: 'Share (Local)',
						icon: 'share-alt',
						handler: () => {
							if (!currentNote.value) {
								ElMessage.error("Couldn't find note to share, restart phone & try again.");
								console.error("Couldn't find note to share, restart phone & try again");
								return;
							}
							nuiAction('notes/share', {
								type: 'local',
								id: currentNote.value.id,
								duration: 0,
							});
						},
					},
					{
						label: 'Share (Permanent)',
						icon: 'share',
						handler: () => {
							if (!currentNote.value) {
								ElMessage.error("Couldn't find note to share, restart phone & try again.");
								console.error("Couldn't find note to share, restart phone & try again");
								return;
							}
							nuiAction('notes/share', {
								type: 'permanent',
								id: currentNote.value.id,
								duration: 0,
							});
						},
					},
					{
						label: 'Delete',
						icon: 'trash',
						handler: () => {
							store.dispatch('deleteNote');
						},
					},
				];
			};

			const openList = () => {
				store.commit('setCurrentEntry', { appName: 'notes', entry: null });
			};

			watch(readonly, newValue => {
				if (primaryActions?.value?.[0] == undefined) return;
				primaryActions.value[0] = {
					label: newValue ? 'Edit' : 'Save',
					icon: newValue ? 'pencil' : 'save',
					handler: () => {
						readonly.value = !newValue;
					},
				};
				if (newValue) {
					nuiAction('notes/save', {
						id: currentNote.value?.id,
						note: currentNote.value?.note,
					});
				}
			});

			watch(currentNote, newValue => {
				if (newValue == null) return;
				if (newValue.readonly) {
					primaryActions.value = [];
					auxActions.value = [];
				} else {
					resetActions();
				}
			});

			resetActions();

			onMounted(() => {
				currentNote.value = store.getters.getAppState('notes').current;
			});
			return {
				primaryActions,
				currentNote,
				readonly,
				auxActions,
				openList,
			};
		},
	});
</script>
