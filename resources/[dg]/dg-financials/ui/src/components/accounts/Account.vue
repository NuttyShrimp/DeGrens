<template>
	<paper
		:actions="actions"
		:handler-arg="[account]"
		:paper-class="`account ${curAccId === account.account_id ? 'selected' : ''}`"
		@click="selectAccount"
	>
		<template #image>
			<i :class="`fas fa-${iconTypes[account?.type ?? 'standard']}`"></i>
		</template>
		<template #flex>
			<div class="account--info--name">{{ account.name }}</div>
			<div class="account--info--id">{{ account.account_id }}</div>
			<div class="account--info--balance">
				{{ toEuroFormat(account.balance) }}
			</div>
		</template>
	</paper>
</template>

<script lang="ts">
	import { computed, defineComponent, PropType, ref, watch } from 'vue';
	import { useStore } from '../../lib/store';
	import Paper from '../lib/Paper.vue';
	import { Action } from '../../types/os';
	import { AccountIcon, IAccount } from '../../types/accounts';
	import { DepositModal, TransferModal, WithdrawModal } from './Modals.vue';
	import { toEuroFormat } from '../../lib/util';

	export default defineComponent({
		name: 'Account',
		components: { Paper },
		props: {
			account: {
				type: Object as PropType<IAccount>,
				required: true,
			},
		},
		setup(props) {
			const store = useStore();
			const iconTypes = ref(AccountIcon);
			const curAccId = computed<string>(() => store.getters.getCurrentAccountId());
			const isAtm = computed<boolean>(() => store.getters.getBaseValue('isAtm'));
			const selectAccount = () => {
				store.commit('setCurrentAccount', props.account);
			};
			const actions = ref<Action<IAccount>[]>([]);

			watch<string>(curAccId, newVal => {
				actions.value = [];
				if (!props.account.account_id || props.account.account_id !== newVal) return;
				if (props.account.permissions.withdraw) {
					actions.value.push({
						label: 'Withdraw',
						icon: 'vaadin:money-withdraw',
						handler: account => {
							store.commit('setModalState', {
								visible: true,
								element: WithdrawModal,
								props: {
									account,
								},
							});
						},
					});
				}
				if (props.account.permissions.transfer) {
					actions.value.push({
						label: 'Transfer',
						icon: 'vaadin:money-exchange',
						handler: account => {
							store.commit('setModalState', {
								visible: true,
								element: TransferModal,
								props: {
									account,
								},
							});
						},
					});
				}
				if (props.account.permissions.deposit && !isAtm.value) {
					actions.value.push({
						label: 'Deposit',
						icon: 'vaadin:money-deposit',
						handler: account => {
							store.commit('setModalState', {
								visible: true,
								element: DepositModal,
								props: {
									account,
								},
							});
						},
					});
				}
			});

			return {
				iconTypes,
				selectAccount,
				curAccId,
				actions,
				toEuroFormat,
			};
		},
	});
</script>
