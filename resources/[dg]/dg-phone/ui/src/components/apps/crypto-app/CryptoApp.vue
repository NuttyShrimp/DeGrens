<template>
	<app-container :emptylist="state.length === 0">
		<div class="crypto-app">
			<Paper v-for="coin in state" :key="coin.crypto_name">
				<template #image>
					<q-icon :name="coin.icon" size="lg" />
				</template>
				<template #title>{{ coin.crypto_name }}</template>
				<template #description>{{ coin.wallet.amount }}</template>
				<template #extdescription>
					<List :items="getCoinInfo(coin)"></List>
					<div class="row justify-between q-mt-sm">
						<PrimaryButton v-if="coin.value !== 0" label="PURCHASE" size="sm" @click.stop="purchaseModel(coin)" />
						<SecondaryButton label="EXCHANGE" size="sm" @click.stop="exchangeModel(coin)" />
					</div>
				</template>
			</Paper>
		</div>
	</app-container>
</template>

<script lang="ts">
	import AppContainer from '../../os/AppContainer.vue';
	import { State, useStore } from '../../../lib/state';
	import { computed, defineComponent, onMounted } from 'vue';
	import { CoinEntry } from '../../../types/apps';
	import Paper from '../../os/Paper.vue';
	import '@/styles/apps/crypto.scss';
	import List from '../../os/List.vue';
	import { ListEntry } from '../../../types/list';
	import { PrimaryButton, SecondaryButton } from '../../os/Buttons';
	import { ExchangeModal, PurchaseModal } from './components/modals';

	export default defineComponent({
		name: 'CryptoApp',
		components: { PrimaryButton, SecondaryButton, List, Paper, AppContainer },
		setup() {
			const store = useStore();
			const state = computed<State['crypto']>(() => store.getters.getAppState('crypto'));

			const getCoinInfo = (coin: CoinEntry): ListEntry[] =>
				[
					{
						icon: 'fas fa-tag',
						label: coin.crypto_name,
					},
					{
						icon: 'fas fa-money-check-alt',
						label: coin.wallet.amount,
					},
					{
						icon: 'assessment',
						label: `€${coin.value}`,
						size: '1.3rem',
					},
				] as ListEntry[];

			const exchangeModel = (coin: CoinEntry) => {
				store.dispatch('openModal', {
					element: ExchangeModal,
					props: {
						coin,
					},
				});
			};

			const purchaseModel = (coin: CoinEntry) => {
				store.dispatch('openModal', {
					element: PurchaseModal,
					props: {
						coin,
					},
				});
			};

			onMounted(async () => {
				store.dispatch('refreshCoins');
			});

			return {
				state: state,
				getCoinInfo,
				exchangeModel,
				purchaseModel,
			};
		},
	});
</script>

<style scoped></style>
