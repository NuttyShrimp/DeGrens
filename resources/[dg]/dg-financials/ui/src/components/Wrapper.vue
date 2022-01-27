<template>
	<transition name="slide-open" @after-enter="toggleAnimationFinish(true)" @after-leave="toggleAnimationFinish(false)">
		<div v-if="base.open" class="wrapper">
			<div class="row-1">
				<div class="account-list-header">
					<div>
						<i class="fas fa-university" />
						<span>{{ base.bank }}</span>
					</div>
					<div>
						<span>cash: {{ toEuroFormat(base.cash) }}</span>
					</div>
				</div>
				<AccountsList v-if="animationState" />
			</div>
			<div class="row-2">
				<TransactionsList />
			</div>
			<Modal />
		</div>
	</transition>
</template>

<script lang="ts">
	import { computed, defineComponent } from 'vue';
	import '@/styles/wrapper.scss';
	import { useStore } from '../lib/store';
	import { baseState } from '../lib/store_modules/base';
	import AccountsList from './accounts/List.vue';
	import TransactionsList from './transactions/List.vue';
	import Modal from './lib/Modal.vue';
	import { toEuroFormat } from '../lib/util';

	export default defineComponent({
		name: 'Wrapper',
		components: { Modal, TransactionsList, AccountsList },
		setup() {
			const store = useStore();
			const animationState = computed(() => store.getters.getBaseValue('animationFinished'));

			const toggleAnimationFinish = (bool: boolean) => {
				store.commit('setBase', {
					animationFinished: bool,
				});
			};

			return {
				base: computed<baseState>(() => store.getters.getBaseInfo()),
				toggleAnimationFinish,
				animationState,
				toEuroFormat,
			};
		},
	});
</script>
