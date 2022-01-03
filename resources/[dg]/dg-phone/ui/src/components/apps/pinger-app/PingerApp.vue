<template>
	<div class="pinger-app" :style="{ 'background-image': `url(${map})`, 'background-position': `${xPerc}% ${yPerc}%` }">
		<div class="pinger-app--inner">
			<Input v-model="plyId" type="number" placeholder="Speler Id" :min="1" @update:modelValue="checkInput">
				<template #prefix>
					<i class="fas fa-id-card-alt"></i>
				</template>
			</Input>
			<el-button plain type="primary" @click="sendPingRequest()">Ping</el-button>
			<el-button v-if="hasVPN" plain type="primary" @click="sendPingRequest(true)">Anon Ping</el-button>
		</div>
	</div>
</template>

<script lang="ts">
	import '@/styles/apps/pinger.scss';
	import { computed, defineComponent, onMounted, ref } from 'vue';
	import { nuiAction } from '../../../lib/nui';
	import map from '@/assets/map.png';
	import { useStore } from '../../../lib/state';
	import Input from '../../os/Inputs.vue';

	export default defineComponent({
		name: 'PingerApp',
		components: { Input },
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
				map,
				xPerc,
				yPerc,
				hasVPN,
			};
		},
	});
</script>
