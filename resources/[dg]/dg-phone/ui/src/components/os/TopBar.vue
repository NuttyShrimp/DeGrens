<template>
	<div class="phone-top-bar">
		<div>{{ time }} #{{ characterData.server_id }}</div>
		<div>
			<i v-if="characterData.hasVPN" class="fad fa-shield-alt"></i>
			<i class="fas fa-wifi-slash"></i>
			<i class="fas fa-signal-4"></i>
		</div>
	</div>
</template>

<script lang="ts">
	import { computed, defineComponent } from 'vue';
	import { State, useStore } from '../../lib/state';

	export default defineComponent({
		name: 'TopBar',
		setup() {
			const store = useStore();
			const characterData = computed<State['character']>(() => store.getters.getAppState('character'));
			return {
				time: computed(() => store.state.time),
				characterData,
			};
		},
	});
</script>

<style scoped></style>
