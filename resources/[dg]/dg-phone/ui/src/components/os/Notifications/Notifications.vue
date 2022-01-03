<template>
	<div class="notification-wrapper">
		<transition-group name="notilist" class="notilist" tag="div">
			<notification v-for="noti in notifications" :key="noti.id" :noti="noti" />
		</transition-group>
	</div>
</template>

<script lang="ts">
	import { computed, ComputedRef, defineComponent, onMounted, ref, watch } from 'vue';
	import '@/styles/os/notifications.scss';
	import { useStore } from '../../../lib/state';
	import { devdata } from '../../../lib/devdata';
	import { PhoneNotification, PhoneNotificationIcon } from '../../../types/notifications';
	import Notification from './Notification.vue';

	export default defineComponent({
		name: 'Notifications',
		components: { Notification },
		setup() {
			const store = useStore();
			const wrapperTop = ref('-10vh');
			const notifications = computed(() => store.getters.getAppState('notifications'), {});
			watch(notifications, newNoti => {
				wrapperTop.value = `${-((newNoti?.length ?? 1) * 10)}vh`;
			});

			return {
				notifications: notifications as ComputedRef<(PhoneNotification & { icon: PhoneNotificationIcon })[]>,
				wrapperTop,
			};
		},
	});
</script>

<style lang="scss">
	.notilist-enter-from,
	.notilist-leave-to {
		opacity: 0;
		margin-top: v-bind('wrapperTop');
	}
</style>
