<template>
	<transition name="slide">
		<div v-if="bottomMargin != '-65vh'" class="phone">
			<div>
				<div id="phone-screen" :style="phoneBackground">
					<TopBar />
					<div class="active-app">
						<Notifications />
						<div class="active-app--inner">
							<transition name="q-transition--fade">
								<component :is="activeApp"></component>
							</transition>
						</div>
					</div>
					<BottomBar />
					<Modal />
				</div>
				<div class="phone-shell">
					<img :src="shell" alt="Phone shell" />
				</div>
				<transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
					<div v-if="bigPicture" class="phone-big-picture">
						<img :src="bigPicture" alt="Big picture" />
					</div>
				</transition>
			</div>
		</div>
	</transition>
</template>

<script lang="ts">
	import shell from '@/assets/shell.png';
	import '@/styles/phone.scss';
	import TopBar from './os/TopBar.vue';
	import { getPhoneAppRenders } from '../lib/apps';
	import { store, useStore } from '../lib/state';
	import { computed, defineComponent, onMounted, ref, watch } from 'vue';
	import BottomBar from './os/BottomBar.vue';
	import { devDataEmulator } from '../lib/devdata';
	import Modal from './os/Modal.vue';
	import Notifications from './os/Notifications/Notifications.vue';
	import { nuiAction } from '../lib/nui';

	const listener = (event: MessageEvent) => {
		const item = event.data;
		if (item?.source?.match?.('vue-devtools')) return;
		if (!item?.app || !item?.action || !store.state.events[item.app]?.[item.action]) {
			if (process.env.NODE_ENV === 'development') {
				console.warn('Unknown event', item);
			}
			return;
		}
		store.state.events[item.app][item.action](item.data);
	};
	const escListener = (event: KeyboardEvent) => {
		if (event.key === 'Escape') {
			nuiAction('phone:close');
		}
	};

	export default defineComponent({
		name: 'Phone',
		components: {
			Notifications,
			Modal,
			BottomBar,
			TopBar,
			...getPhoneAppRenders(),
		},
		setup() {
			const store = useStore();
			const activeApp = computed(() => store.state.activeApp);
			const isOpen = computed(() => store.getters.getAppState('open'));
			const hasNotification = computed(() => store.getters.getAppState('hasNotification'));
			const bigPicture = computed(() => store.getters.getAppState('bigPicture'));
			const bottomMargin = ref('-65vh');

			watch(isOpen, newValue => {
				if (newValue) {
					store.commit('setBackground');
					bottomMargin.value = '0';
				} else {
					if (hasNotification.value) {
						bottomMargin.value = '-51vh';
					} else {
						bottomMargin.value = '-65vh';
					}
				}
			});

			watch(hasNotification, newValue => {
				if (isOpen.value) return;
				if (newValue) {
					store.commit('setBackground');
					bottomMargin.value = '-51vh';
				} else {
					bottomMargin.value = '-65vh';
				}
			});

			onMounted(() => {
				console.info('[DG-Phone] Mounted');
				store.commit('setBackground');
				nuiAction('phone:ready');
			});

			return {
				activeApp,
				shell,
				bottomMargin,
				phoneBackground: computed(() => store.getters.getAppState('background')),
				bigPicture,
			};
		},
		unmounted() {
			window.removeEventListener('message', listener);
			window.removeEventListener('keydown', escListener);
		},
		mounted() {
			window.addEventListener('keydown', escListener, true);
			window.addEventListener('message', listener, true);
			if (process.env.NODE_ENV === 'development') devDataEmulator();
		},
	});
</script>

<style lang="scss">
	.phone {
		bottom: v-bind('bottomMargin');
	}

	.slide {
		&-enter-active,
		&-leave-active {
			transition: all 0.5s ease;
		}

		&-enter-from,
		&-leave-to {
			bottom: -65vh;
		}

		&-enter-to,
		&-leave-from {
			bottom: v-bind('bottomMargin');
		}
	}
</style>
