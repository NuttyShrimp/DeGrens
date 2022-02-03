<script lang="ts">
	import Wrapper from './components/Wrapper.vue';
	import { defineComponent, onBeforeUnmount, onMounted } from 'vue';
	import { keyListener, listener } from './lib/util';
	import { devDataEmulator } from './lib/devdata';

	export default defineComponent({
		name: 'App',
		components: {
			Wrapper,
		},
		setup() {
			onMounted(() => {
				window.addEventListener('message', listener);
				window.addEventListener('keydown', keyListener);
				if (process.env.NODE_ENV === 'development') setTimeout(() => devDataEmulator(), 1000);
			});
			onBeforeUnmount(() => {
				window.removeEventListener('message', listener);
				window.removeEventListener('keydown', keyListener);
			});
			return {};
		},
	});
</script>

<template>
	<Wrapper />
</template>
