<template>
	<div v-if="modalState.visible" class="bank-modal">
		<component :is="modalState.element" v-bind="modalState.props"></component>
	</div>
	<div v-if="modalState.checkmark" class="bank-modal">
		<!-- https://bbbootstrap.com/snippets/animated-checkmark-50934051 -->
		<div class="checkmark-wrapper">
			<svg class="checkmark" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg">
				<circle class="checkmark__circle" cx="26" cy="26" fill="none" r="25" />
				<path class="checkmark__check" d="M14.1 27.2l7.1 7.2 16.7-16.8" fill="none" />
			</svg>
		</div>
	</div>
	<div v-if="modalState.visible || modalState.checkmark" class="bank-modal-backdrop"></div>
</template>

<script lang="ts">
	import '@/styles/os/modal.scss';
	import { computed, defineComponent } from 'vue';
	import { ModalState } from '../../lib/store_modules/modal';
	import { useStore } from '../../lib/store';

	export default defineComponent({
		name: 'Modal',
		setup() {
			const store = useStore();
			let modalState = computed<ModalState>(() => store.getters.getModalState());
			return {
				modalState: modalState,
			};
		},
	});
</script>
