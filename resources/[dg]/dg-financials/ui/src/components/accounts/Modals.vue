<script lang="tsx">
	import { defineComponent, PropType } from 'vue';
	import { IAccount } from '../../types/accounts';
	import { FormInput } from '../../types/simpleform';
	import { nuiAction } from '../../lib/nui/action';
	import { useStore } from '../../lib/store';
	import SimpleForm from '../lib/simpleform.vue';

	export default defineComponent({
		name: 'Modals',
		setup() {
			return <div>Wrong import</div>;
		},
	});

	export const DepositModal = defineComponent({
		name: 'DepositModal',
		components: { SimpleForm },
		props: {
			account: {
				type: Object as PropType<IAccount>,
				required: true,
			},
		},
		setup(props) {
			const store = useStore();
			const inputs: FormInput[] = [
				{
					icon: 'dollar-sign',
					name: 'amount',
					placeholder: 'Amount',
					type: 'number',
				},
				{
					name: 'comment',
					placeholder: 'Comment',
					icon: 'comment-alt',
				},
			];
			const onAccept = async (vals: { amount: number; comment: string }) => {
				await nuiAction('account/deposit', {
					accountId: props.account.account_id,
					...vals,
				});
				store.dispatch('openCheckmarkModal', () => {
					store.dispatch('refreshAccount', props.account.account_id);
				});
			};
			return () => <simple-form header='Deposit Money' inputs={inputs} on-accept={onAccept} />;
		},
	});
	export const WithdrawModal = defineComponent({
		name: 'WithdrawModal',
		components: { SimpleForm },
		props: {
			account: {
				type: Object as PropType<IAccount>,
				required: true,
			},
		},
		setup(props) {
			const store = useStore();
			const inputs: FormInput[] = [
				{
					icon: 'dollar-sign',
					name: 'amount',
					placeholder: 'Amount',
					type: 'number',
				},
				{
					name: 'comment',
					placeholder: 'Comment',
					icon: 'comment-alt',
				},
			];
			const onAccept = async (vals: { amount: number; comment: string }) => {
				await nuiAction('account/withdraw', {
					accountId: props.account.account_id,
					...vals,
				});
				store.dispatch('openCheckmarkModal', () => {
					store.dispatch('refreshAccount', props.account.account_id);
				});
			};
			return () => <simple-form header='Withdraw Money' inputs={inputs} on-accept={onAccept} />;
		},
	});
	export const TransferModal = defineComponent({
		name: 'TransferModal',
		components: { SimpleForm },
		props: {
			account: {
				type: Object as PropType<IAccount>,
				required: true,
			},
		},
		setup(props) {
			const store = useStore();
			const inputs: FormInput[] = [
				{
					icon: 'dollar-sign',
					name: 'amount',
					placeholder: 'Amount',
					type: 'number',
				},
				{
					name: 'target',
					placeholder: 'Target (citizenid, accountid or businessid)',
					icon: 'user-circle',
				},
				{
					name: 'comment',
					placeholder: 'Comment',
					icon: 'comment-alt',
				},
			];
			const onAccept = async (vals: { amount: number; comment: string; target: string }) => {
				const res = await nuiAction('account/transfer', {
					accountId: props.account.account_id,
					...vals,
				});
				store.dispatch('openCheckmarkModal', () => {
					store.dispatch('refreshAccount', props.account.account_id);
				});
			};
			return () => <simple-form header='Transfer Money' inputs={inputs} on-accept={onAccept} />;
		},
	});
</script>
