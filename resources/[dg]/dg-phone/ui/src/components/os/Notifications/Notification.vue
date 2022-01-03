<template>
	<div class="notification-box" @click="!noti.onAccept && !noti.onDecline && onDeclineCapture()">
		<div>
			<div class="notification-info">
				<div
					class="notification-icon"
					:style="{
						background: noti.icon.background,
						color: noti.icon.color,
					}"
				>
					<i :class="`${noti.icon.lib ?? 'fas'} fa-${noti.icon.name}`"></i>
				</div>
				<div class="notification-text-box">
					<div class="notification-title">
						{{ noti.title.toUpperCase() }}
					</div>
					<div v-if="noti.description" class="notification-description">
						{{ timer ? `${formatTime(timer)} - ${noti.description}` : noti.description }}
					</div>
				</div>
			</div>
			<div class="notification-btns">
				<div v-if="noti.onAccept">
					<el-button size="mini" round @click="onAcceptCapture()">Accept</el-button>
				</div>
				<div v-if="noti.onAccept && noti.onDecline">|</div>
				<div v-if="noti.onDecline">
					<el-button size="mini" round @click="onDeclineCapture()">Decline</el-button>
				</div>
			</div>
		</div>
	</div>
</template>
<script lang="ts">
	import { defineComponent, onBeforeUnmount, PropType, ref, watch } from 'vue';
	import { PhoneNotification, PhoneNotificationIcon } from '../../../types/notifications';
	import { useStore } from '../../../lib/state';
	import { formatTime } from '../../../lib/call';

	export default defineComponent({
		name: 'Notification',
		props: {
			noti: {
				type: Object as PropType<PhoneNotification & { icon: PhoneNotificationIcon }>,
				required: true,
			},
		},
		setup: props => {
			const store = useStore();
			let timer = ref(props.noti?.timer);
			// eslint-disable-next-line no-undef
			let timerInterval = ref(
				setInterval(() => {
					// placeholder
				}, 1000)
			);

			const doesNotiExist = () =>
				(store.getters.getAppState('notifications') as PhoneNotification[]).find(noti => noti.id === props.noti.id);

			const onAcceptCapture = () => {
				if (!doesNotiExist()) return;
				store.commit('acceptNotification', props.noti.id);
			};
			const onDeclineCapture = () => {
				if (!doesNotiExist()) return;
				store.commit('declineNotification', props.noti.id);
			};

			const setTimerInterval = () => {
				if (timer.value !== undefined) {
					if (timer.value > 0) {
						// count down
						timerInterval.value = setInterval(() => {
							if (timer.value === undefined) return;
							timer.value--;
							if (timer.value <= 0) {
								clearInterval(timerInterval.value);
								onDeclineCapture();
							}
						}, 1000);
					} else {
						// count up
						timerInterval.value = setInterval(() => {
							if (timer.value === undefined) return;
							timer.value++;
						}, 1000);
					}
				} else {
					clearInterval(timerInterval.value);
				}
			};

			onBeforeUnmount(() => {
				clearInterval(timerInterval.value);
			});

			watch(
				() => props.noti.timer,
				newVal => {
					timer.value = newVal;
					setTimerInterval();
				}
			);
			setTimerInterval();
			return {
				onAcceptCapture,
				onDeclineCapture,
				timer,
				formatTime,
			};
		},
	});
</script>
