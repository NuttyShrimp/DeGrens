<template>
	<MessageList v-if="state?.currentView === 'list'" />
	<MessageConvo v-else />
</template>
<script lang="ts">
	import { useStore } from '../../../lib/state';
	import { computed, defineComponent } from 'vue';
	import '../../../styles/apps/messages.scss';
	import MessageList from './components/MessageList.vue';
	import MessageConvo from './components/MessageConvo.vue';

	export default defineComponent({
		name: 'MessageApp',
		components: { MessageConvo, MessageList },
		setup() {
			const store = useStore();
			let state = computed(() => store.state.messages);
			return {
				state,
			};
		},
	});
</script>
