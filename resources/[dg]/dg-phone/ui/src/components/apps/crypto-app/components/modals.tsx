import { defineComponent, PropType } from 'vue';
import { CoinEntry } from '../../../../types/apps';
import SimpleForm from '@/components/os/SimpleForm.vue';
import { FormInput } from '../../../../types/simpleform';
import { nuiAction } from '../../../../lib/nui';
import { useStore } from '../../../../lib/state';

export const ExchangeModal = defineComponent({
	name: 'ExchangeModal',
	components: {
		SimpleForm,
	},
	props: {
		coin: {
			type: Object as PropType<CoinEntry>,
			required: true,
		},
	},
	setup(props) {
		const store = useStore();
		const inputs: FormInput[] = [
			{
				type: 'contacts',
				name: 'target',
			},
			{
				type: 'number',
				name: 'amount',
				label: 'Amount',
				min: 0,
				max: props.coin.wallet.amount,
			},
		];
		const onSubmit = async (data: { amount: string | number; target: string }) => {
			data.amount = parseInt(data.amount as string);
			if (data.amount == 0 || isNaN(data.amount)) return;
			await nuiAction('crypto/transfer', { ...data, coin: props.coin.crypto_name });
			store.dispatch('openCheckmarkModal', () => {
				store.dispatch('refreshCoins');
			});
		};
		return () => <SimpleForm inputs={inputs} onAccept={onSubmit} />;
	},
});

export const PurchaseModal = defineComponent({
	name: 'PurchaseModal',
	components: {
		SimpleForm,
	},
	props: {
		coin: {
			type: Object as PropType<CoinEntry>,
			required: true,
		},
	},
	setup(props) {
		const store = useStore();
		const inputs: FormInput[] = [
			{
				type: 'number',
				name: 'amount',
				label: 'Amount',
				min: 0,
			},
		];
		const onSubmit = async (data: { amount: string | number }) => {
			data.amount = parseInt(data.amount as string);
			if (data.amount == 0 || isNaN(data.amount)) return;
			await nuiAction('crypto/purchase', { ...data, coin: props.coin.crypto_name });
			store.dispatch('openCheckmarkModal', () => {
				store.dispatch('refreshCoins');
			});
		};
		return () => <SimpleForm inputs={inputs} onAccept={onSubmit} />;
	},
});
