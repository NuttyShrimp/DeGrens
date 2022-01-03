<template>
	<div class="phoneapp-dialpad">
		<div class="phoneapp-dialpad-input">
			<Input v-model="dialpadStr" size="small" />
		</div>
		<div class="phoneapp-dialpad-rows">
			<div>
				<div class="phoneapp-dialpad-btn" @click="handlePress">7</div>
				<div class="phoneapp-dialpad-btn" @click="handlePress">8</div>
				<div class="phoneapp-dialpad-btn" @click="handlePress">9</div>
			</div>
			<div>
				<div class="phoneapp-dialpad-btn" @click="handlePress">4</div>
				<div class="phoneapp-dialpad-btn" @click="handlePress">5</div>
				<div class="phoneapp-dialpad-btn" @click="handlePress">6</div>
			</div>
			<div>
				<div class="phoneapp-dialpad-btn" @click="handlePress">1</div>
				<div class="phoneapp-dialpad-btn" @click="handlePress">2</div>
				<div class="phoneapp-dialpad-btn" @click="handlePress">3</div>
			</div>
			<div>
				<div class="phoneapp-dialpad-btn success" @click="callNumber"><i class="fas fa-phone-alt"></i></div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, ref } from 'vue';
	import { startPhoneCall } from '../../../../lib/call';
	import Input from '../../../os/Inputs.vue';

	export default defineComponent({
		name: 'Dailpad',
		components: { Input },
		setup() {
			const dialpadStr = ref('');
			const handlePress = (e: MouseEvent) => {
				dialpadStr.value += (e.target as HTMLDivElement).innerText;
			};
			const callNumber = () => {
				startPhoneCall(dialpadStr.value);
			};
			return {
				dialpadStr,
				handlePress,
				callNumber,
			};
		},
	});
</script>
