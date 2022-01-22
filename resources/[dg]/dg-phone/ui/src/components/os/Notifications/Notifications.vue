<template>
	<div class="notification-wrapper">
		<transition-group name="notilist" class="notilist" tag="div">
			<notification v-for="noti in notifications" :key="noti.id" :noti="noti" @click="declineCapture" />
		</transition-group>
	</div>
</template>

<script lang="ts">
	import { computed, ComputedRef, defineComponent, ref } from 'vue';
	import '@/styles/os/notifications.scss';
	import { State, useStore } from '../../../lib/state';
	import { PhoneNotification, PhoneNotificationIcon } from '../../../types/notifications';
	import Notification from './Notification.vue';

	export default defineComponent({
		name: 'Notifications',
		components: { Notification },
		setup() {
			const store = useStore();
			const hiddenMargin = ref('-5.15vh');
			const notifications = computed<State['notifications']>(() => store.getters.getAppState('notifications'), {});

			const declineCapture = (e: MouseEvent) => {
				hiddenMargin.value = `-${(e.target as HTMLDivElement).offsetHeight}px`;
			};

			return {
				notifications: notifications as ComputedRef<(PhoneNotification & { icon: PhoneNotificationIcon })[]>,
				hiddenMargin,
				declineCapture,
			};
		},
	});
</script>

<style lang="scss">
	.notilist-enter-from,
	.notilist-leave-to {
		opacity: 0;
		margin-top: v-bind('hiddenMargin');
	}
</style>
