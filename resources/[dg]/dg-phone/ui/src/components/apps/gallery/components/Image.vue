<template>
	<img
		:src="src"
		alt="A photo"
		@load="setLoaded"
		@mouseenter.prevent="toggleBig(true)"
		@mouseleave.prevent="toggleBig(false)"
	/>
	<div v-if="!isLoaded" class="loading">
		<q-spinner :thickness="2" color="grey-5" size="3em" />
	</div>
</template>

<script lang="ts">
	import { defineComponent, ref, watch } from 'vue';
	import { useStore } from '../../../../lib/state';

	export default defineComponent({
		name: 'Image',
		props: {
			src: {
				type: String,
				required: true,
			},
			big: {
				type: Boolean,
				default: false,
			},
		},
		setup(props) {
			const store = useStore();
			const isLoaded = ref(false);
			const setLoaded = () => {
				isLoaded.value = true;
			};
			const toggleBig = (toggle: boolean) => {
				if (!isLoaded.value) return;
				store.commit('setAppState', {
					appName: 'bigPicture',
					data: toggle ? props.src : undefined,
				});
			};
			toggleBig(props.big);

			watch(
				() => props.big,
				newValue => {
					toggleBig(newValue);
				}
			);

			return {
				isLoaded,
				setLoaded,
				toggleBig,
			};
		},
	});
</script>
