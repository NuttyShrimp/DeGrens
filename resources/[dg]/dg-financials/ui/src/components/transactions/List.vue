<template>
	<div v-if="currentAccount !== null" class="transaction-wrapper">
		<FadeLoader :loading="!isLoaded" color="#767FCF" height="1.5em" width=".5em" />
		<div v-if="isLoaded && canSeeTransactions" class="transaction-list">
			<Transaction v-for="transaction in transactions" :key="transaction.transaction_id" :transaction="transaction" />
			<button v-if="canLoadMore" @click="loadMore()">Load more</button>
		</div>
		<div v-else-if="!canSeeTransactions" class="transaction--missing-perm">
			<i class="fas fa-frown"></i>
			<div>You do not have the permissions to view this history</div>
		</div>
	</div>
</template>

<script lang="ts">
	import { computed, defineComponent, watch } from 'vue';
	import { useStore } from '../../lib/store';
	import '@/styles/components/transaction.scss';
	import { ITransaction } from '../../types/transactions';
	import Transaction from './Transaction.vue';
	import FadeLoader from 'vue-spinner/src/FadeLoader.vue';

	export default defineComponent({
		name: 'TransactionsList',
		components: { Transaction, FadeLoader },
		setup() {
			const store = useStore();
			const currentAccount = computed<number>(() => store.getters.getCurrentAccountId());
			const isLoaded = computed<boolean>(() => store.getters.isLoaded());
			const canLoadMore = computed<boolean>(() => store.getters.canLoadMore());
			const canSeeTransactions = computed<boolean>(() => store.getters.canSeeTransactions());
			const transactions = computed<ITransaction[]>(() => store.getters.getTransactionList());

			const loadMore = () => {
				store.dispatch('fetchList');
			};

			watch(currentAccount, newVal => {
				if (!newVal || !canSeeTransactions.value) {
					store.commit('setList', []);
					return;
				}
				store.dispatch('fetchList', true);
			});
			return {
				currentAccount,
				transactions,
				isLoaded,
				canLoadMore,
				loadMore,
				canSeeTransactions,
			};
		},
	});
</script>
