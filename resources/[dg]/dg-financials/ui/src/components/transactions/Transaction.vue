<template>
	<div class="transaction--entry">
		<div class="transaction--entry--icon">
			<Icon :icon="iconTypes[transaction.type]" />
		</div>
		<div class="transaction--entry--info--wrapper">
			<div class="transaction--entry--info--title">
				<div v-if="currentAccount === transaction.origin_account_id">
					{{ transaction.target_account_name }} / {{ transaction.target_account_id }}
				</div>
				<div v-else>{{ transaction.origin_account_name }} / {{ transaction.origin_account_id }}</div>
				<div class="transaction--entry--info--metadata">
					<div>{{ transaction.transaction_id }}</div>
					<div>{{ formatRelativeTime(transaction.date) }}</div>
				</div>
			</div>
			<div class="transaction--entry--info--body">
				<div
					:class="`transaction--entry--info--amount ${
						transaction.type === 'withdraw' || transaction.target_account_id !== currentAccount ? 'negative' : ''
					}`"
				>
					<span>{{ toEuroFormat(transaction.change) }}</span>
				</div>
				<div class="transaction--entry--info--misc">
					<div class="transaction--entry--info--persons">
						<span>{{ transaction.triggered_by }}</span>
						<i class="fas fa-long-arrow-alt-right"></i>
						<span>{{ transaction.accepted_by }}</span>
					</div>
					<div class="transaction--entry--info--comment">
						<div>Comment:</div>
						<div>{{ transaction.comment }}</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	import { computed, defineComponent, PropType, ref } from 'vue';
	import { ITransaction, TransactionIcon } from '../../types/transactions';
	import { Icon } from '@iconify/vue';
	import { useStore } from '../../lib/store';
	import { formatRelativeTime, toEuroFormat } from '../../lib/util';

	export default defineComponent({
		name: 'Transaction',
		components: { Icon },
		props: {
			transaction: {
				type: Object as PropType<ITransaction>,
				required: true,
			},
		},
		setup(props) {
			const store = useStore();
			const currentAccount = computed<string>(() => store.getters.getCurrentAccountId());
			const iconTypes = ref(TransactionIcon);
			return { iconTypes, currentAccount, formatRelativeTime, toEuroFormat };
		},
	});
</script>
