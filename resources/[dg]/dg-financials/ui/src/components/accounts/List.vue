<template>
	<div class="accounts-list">
		<FadeLoader :loading="!loaded" color="#767FCF" height="1.5em" width=".5em" />
		<div v-if="loaded" class="inner-list">
			<Account v-for="account in accounts" :key="account.account_id" :account="account" />
		</div>
	</div>
</template>

<script lang="ts">
	import { computed, defineComponent, onMounted, onUnmounted, ref } from 'vue';
	import '@/styles/components/accounts.scss';
	import { useStore } from '@/lib/store';
	import { nuiAction } from '@/lib/nui/action';
	import { devdata } from '@/lib/devdata';
	import FadeLoader from 'vue-spinner/src/FadeLoader.vue';
	import Account from './Account.vue';
	import { IAccount } from '../../types/accounts';

	export default defineComponent({
		name: 'AccountsList',
		components: {
			Account,
			FadeLoader,
		},
		setup() {
			const store = useStore();
			const accounts = computed<IAccount[]>(() => store.getters.getAccounts());
			const loaded = ref(false);

			onMounted(async () => {
				const _accs = await nuiAction('accounts/get', {}, devdata.accounts);
				store.commit('setAccounts', _accs);
				loaded.value = true;
			});
			onUnmounted(() => {
				loaded.value = false;
			});

			return {
				loaded,
				accounts,
			};
		},
	});
</script>
