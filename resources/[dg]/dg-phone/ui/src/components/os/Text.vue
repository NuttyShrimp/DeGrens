<template>
	<div :style="photoLinks && photoLinks?.length > 0 ? { 'min-width': '21vh' } : {}" class="phone-text--wrapper">
		<span>{{ strippedText }}</span>
		<div v-if="photoLinks && photoLinks?.length > 0" class="phone-text--attach">
			<div v-for="(link, idx) in photoLinks" :key="idx">
				<image-container v-if="!link.loading" :image-url="link.url"></image-container>
				<div v-else class="loading image-container--wrapper">
					<q-spinner :thickness="2" color="grey-5" size="3em" />
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, onMounted, ref } from 'vue';
	import { checkImageValidity, extractLinks } from '../../lib/util';
	import ImageContainer from './ImageContainer.vue';

	export default defineComponent({
		name: 'Text',
		components: { ImageContainer },
		setup(_, { slots }) {
			const strippedText = ref('');
			const photoLinks = ref<
				{
					url: string;
					visible: boolean;
					loading: boolean;
				}[]
			>([]);
			const doLogic = () => {
				if (!slots?.default?.()?.[0]?.children) return;
				const slotStr = String(slots?.default?.()?.[0]?.children);
				const { text, links } = extractLinks(slotStr);
				strippedText.value = text;
				if (links.length > 0) {
					links.forEach(l => {
						photoLinks.value.push({
							url: l,
							visible: false,
							loading: true,
						});
						checkImageValidity(l).then(valid => {
							if (valid) {
								const idx = photoLinks.value.findIndex(p => p.url === l);
								if (idx < 0) {
									return;
								}
								photoLinks.value[idx].loading = false;
								return;
							}
							photoLinks.value = photoLinks.value.filter(p => p.url !== l);
							// Check for string position of l in text
							const txtIdx = String(slotStr).indexOf(l);
							if (txtIdx > -1) {
								// Put l at txtIdx position in string
								strippedText.value = strippedText.value.slice(0, txtIdx) + l + strippedText.value.slice(txtIdx);
							}
						});
					});
				}
			};
			onMounted(() => {
				doLogic();
			});
			return {
				strippedText,
				photoLinks,
			};
		},
	});
</script>
