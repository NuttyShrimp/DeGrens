<template>
	<div :style="{ 'background-position': `${xPerc}% ${yPerc}%` }" class="pinger-app">
		<div class="pinger-app--inner">
			<Input v-model="plyId" :min="1" label="Speler Id" type="number" @update:modelValue="checkInput">
				<template #prepend>
					<q-icon name="fas fa-id-card-alt" size="sm" />
				</template>
			</Input>
			<primary-button label="Ping" @click="sendPingRequest()" />
			<primary-button v-if="hasVPN" label="Anon Ping" @click="sendPingRequest(true)" />
		</div>
	</div>
</template>

<script lang="ts">
	import '@/styles/apps/pinger.scss';
	import { computed, defineComponent, onMounted, ref } from 'vue';
	import { nuiAction } from '../../../lib/nui';
	import { useStore } from '../../../lib/state';
	import Input from '../../os/Inputs.vue';
	import { PrimaryButton } from '../../os/Buttons.vue';

	export default defineComponent({
		name: 'PingerApp',
		components: { PrimaryButton, Input },
		setup() {
			const store = useStore();
			const hasVPN = computed(() => store.getters.getHasVPN());
			const plyId = ref('1');
			let xPerc = ref(0);
			let yPerc = ref(0);
			const checkInput = (value: any) => {
				if (value.toString().length == 0) return;
				if (isNaN(Number(value)) || Number(value) < 1) {
					plyId.value = '1';
				}
				plyId.value = String(value);
			};
			const sendPingRequest = (isAnon = false) => {
				nuiAction('pinger/request', { target: plyId.value.replace(/[^0-9]/g, ''), isAnon });
			};
			onMounted(() => {
				setTimeout(() => {
					xPerc.value = Math.random() * 100;
					yPerc.value = Math.random() * 100;
				}, 10);
				setInterval(() => {
					xPerc.value = Math.random() * 100;
					yPerc.value = Math.random() * 100;
				}, 5000);
			});
			return {
				sendPingRequest,
				plyId,
				checkInput,
				xPerc,
				yPerc,
				hasVPN,
			};
		},
	});
</script>
