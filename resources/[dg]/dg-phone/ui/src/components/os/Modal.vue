<template>
	<div v-if="modalState.visible" class="phone-modal">
		<component :is="modalState.element" v-bind="modalState.props"></component>
	</div>
	<div v-if="modalState.checkmark" class="phone-modal">
		<!-- https://bbbootstrap.com/snippets/animated-checkmark-50934051 -->
		<div class="checkmark-wrapper">
			<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
				<circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
				<path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
			</svg>
		</div>
	</div>
</template>

<script lang="ts">
	import '@/styles/os/modal.scss';
	import { State, useStore } from '../../lib/state';
	import { computed, defineComponent } from 'vue';

	export default defineComponent({
		name: 'Modal',
		setup() {
			const store = useStore();
			let modalState = computed<State['modal']>(() => store.getters.getAppState('modal'));
			return {
				modalState: modalState,
			};
		},
	});
</script>
