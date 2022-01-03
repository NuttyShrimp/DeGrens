<template class="image-container">
	<span v-if="isClicked" class="image-container--span" @click.prevent="toggleImage(false)">Click here to hide</span>
	<div class="image-container--wrapper">
		<div
			v-if="isClicked"
			@mouseenter.prevent="toggleBigImage(true)"
			@mouseleave.prevent="toggleBigImage(false)"
			@click.prevent="copyToClipboard(imageUrl)"
		>
			<img :src="imageUrl" alt="an image" />
		</div>
		<div v-else class="image-container--hidden" @click="toggleImage(true)">
			<i class="fas fa-eye-slash"></i>
			<p>Click to view this image</p>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, ref } from 'vue';
	import '@/styles/os/ImageContainer.scss';
	import { copyToClipboard } from '../../lib/nui';
	import { useStore } from '../../lib/state';

	export default defineComponent({
		props: {
			imageUrl: {
				type: String,
				required: true,
			},
		},
		setup(props) {
			const store = useStore();
			const isClicked = ref(false);
			const toggleImage = (toggle: boolean) => {
				isClicked.value = toggle;
			};
			const toggleBigImage = (toggle: boolean) => {
				if (!isClicked.value) return;
				store.commit('setAppState', {
					appName: 'bigPicture',
					data: toggle ? props.imageUrl : undefined,
				});
			};
			return {
				toggleImage,
				isClicked,
				toggleBigImage,
				copyToClipboard,
			};
		},
	});
</script>
