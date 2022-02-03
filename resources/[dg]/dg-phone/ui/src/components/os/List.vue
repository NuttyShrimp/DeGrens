<template>
	<div class="phone-list">
		<div v-for="(entry, i) in items" :key="i" class="phone-list--entry">
			<div v-if="entry.icon" class="phone-list--entry--icon">
				<q-icon :name="entry.icon" :size="entry?.size ?? '1rem'"></q-icon>
			</div>
			<div class="phone-list--entry--text">
				{{ entry.label }}
			</div>
		</div>
	</div>
</template>

<script lang="ts">
	import { defineComponent, PropType } from 'vue';
	import { ListEntry } from '../../types/list';
	import '@/styles/os/list.scss';

	export default defineComponent({
		name: 'List',
		props: {
			items: {
				type: Array as PropType<ListEntry[]>,
				required: true,
			},
		},
		setup() {
			return {};
		},
	});
</script>
